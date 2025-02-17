import Vendor from '../models/Vendor.js';

export default function socketConfig(io) {
    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);
  
      socket.on('updateVendorLocation', async ({ vendorId, coordinates }) => {
        console.log(`Received updateVendorLocation event for vendor ${vendorId} with coordinates ${coordinates}`);
        try {
          await Vendor.findByIdAndUpdate(vendorId, {
            $set: { 'location.coordinates': coordinates },
          });
          console.log(`Updated location for vendor ${vendorId}`);
          io.emit('vendorLocationUpdated', { vendorId, coordinates });
        } catch (error) {
          console.error('Error updating vendor location:', error);
        }
      });
  
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }