import express from 'express';
import multer from 'multer';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Article from '../models/Articles.js';

const router = express.Router();

// Set up multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const getObjectURL = async (Key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: Key,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return url;
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    throw error;
  }
};

// GET /api/articles - Get all articles
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find().sort({ date: -1 });

    // Generate pre-signed URLs for each article image
    const articlesWithUrls = await Promise.all(articles.map(async (article) => {
        const image = await getObjectURL(article.image);
        return { ...article._doc, image};  // ✅ Replace "image" with pre-signed URL
    }));

    res.json(articlesWithUrls);
  } catch (err) {
    console.error('Error fetching articles:', err);
    res.status(500).json({ message: err.message });
  }
});



// POST /api/articles - Create a new article
router.post('/', upload.single('image'), async (req, res) => {
  const { title, author, summary } = req.body;
  const image = req.file;

  if (!image) {
    return res.status(400).json({ message: 'Image file is required' });
  }

  try {
    // Upload image to AWS S3
    const key = `blog-images/${Date.now()}-${image.originalname}`;
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: image.buffer,
      ContentType: image.mimetype,
    });

    await s3Client.send(command);

    const article = new Article({
      title,
      author,
      date: new Date(), // Automatically set the current date
      image: key, // Store the key instead of the full URL
      summary,
    });

    const newArticle = await article.save();
    res.status(201).json(newArticle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;