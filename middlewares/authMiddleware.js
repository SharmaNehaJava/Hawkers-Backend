import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Vendor from "../models/Vendor.js";

export const protect = async (req, res, next) => {
  // Extract token from header
  let token = req.headers.authorization?.split(" ")[1]; 

  console.log("Token received:", token);
  
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    // Verify token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // First check if the user exists in the User model
    const user = await User.findById(decoded.id).select("-password");
    if (user) {
      req.user = user; // Attach user to request object
      return next(); // Proceed to the next middleware or route
    }

    // If not found in User model, check Vendor model
    const vendor = await Vendor.findById(decoded.id).select("-password");
    if (vendor) {
      req.vendor = vendor; // Attach vendor to request object
      return next(); // Proceed to the next middleware or route
    }

    // If neither user nor vendor found
    return res.status(401).json({ message: "User not found" });

  } catch (error) {
    // Handle invalid or expired token error
    res.status(401).json({ message: "Invalid token" });
  }
};
