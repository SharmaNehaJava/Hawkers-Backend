import express from 'express'
import dotenv from 'dotenv'
import connectDB from 'DB'
import authRoutes from './routes/authRoutes'
import userRoutes from './routes/userRoutes'
import vendorRoutes from './routes/vendorRoutes'
import cors from 'cors'

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vendors', vendorRoutes);

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});