import express from 'express';
import dotenv from 'dotenv';

import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import connectDB from './DB.js';
import userRoutes from './routes/userRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import articlesRoutes from './routes/articles.js';
import productRoutes from './routes/productRoutes.js';
// import paymentRoutes from './routes/paymentRoutes.js';

import socketConfig from './socket/socketConfig.js';



dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: '*',
    },
});
socketConfig(io);

app.use(cors({
    origin: '*', 
}));

app.use(express.json());

app.use('/api/users', userRoutes); 
app.use('/api/articles', articlesRoutes); 
app.use('/api/vendors', vendorRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes); 

// io.on('connection', (socket) => {
//     console.log('A user connected');
    
//     socket.on('disconnect', () => {
//         console.log('A user disconnected');
//     });

//     socket.on('updateVendorLocation', (data) => {
//         socket.broadcast.emit('vendorLocationUpdated', data);
//     });
// });

httpServer.listen(process.env.PORT || 5174, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
