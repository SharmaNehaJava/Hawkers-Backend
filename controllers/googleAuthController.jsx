const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Make sure the User model is properly defined
const client = new OAuth2Client(process.env.GOOGLE_SIGNIN_CLIENT_ID);

const googleAuth = async (req, res) => {
  const { token } = req.body;

  try {
    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_SIGNIN_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    // Check if the user exists in your database
    let user = await User.findOne({ googleId: sub });
    if (!user) {
      // Create a new user
      user = new User({ googleId: sub, email, name, picture });
      await user.save();
    }

    // Generate a JWT token for the user
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token: jwtToken, user });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { googleAuth };
