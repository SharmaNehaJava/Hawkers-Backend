// In your routes file (e.g., routes/user.js)
const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Adjust the path according to your project structure
const authMiddleware = require('../middleware/authMiddleware'); // Authentication middleware

// Delete account route
router.delete('/delete-account', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming authMiddleware adds the user ID to req.user

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
