import express from 'express';
const router = express.Router();
import Article from '../models/Articles.js';

// GET /api/articles - Get all articles
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find().sort({ date: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/articles - Create a new article
router.post('/', async (req, res) => {
  const article = new Article({
    title: req.body.title,
    author: req.body.author,
    date: req.body.date,
    image: req.body.image,
    summary: req.body.summary,
  });

  try {
    const newArticle = await article.save();
    res.status(201).json(newArticle);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
