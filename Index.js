import express from 'express';
import dotenv from 'dotenv';
import connectDB from './DB.js';
import userRoutes from './routes/userRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import articlesRoutes from './routes/articles.js';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
    },
});

app.use(cors({
    origin: '*', // or specify the frontend URL
}));
app.use(express.json());

app.use('/api/users', userRoutes); // Use userRoutes directly
app.use('/api/articles', articlesRoutes); // Corrected this line
app.use('/api/vendors', vendorRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is connected successfully!' });
});

io.on('connection', (socket) => {
    console.log('A user connected');
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });

    socket.on('updateVendorLocation', (data) => {
        socket.broadcast.emit('vendorLocationUpdated', data);
    });
});

httpServer.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
