// controllers/cartController.js
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity, price } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      const newCart = new Cart({
        user: req.user._id,
        cartItems: [{ product: productId, quantity, price }]
      });
      await newCart.save();
    } else {
      const itemIndex = cart.cartItems.findIndex(item => item.product.toString() === productId);
      if (itemIndex > -1) {
        cart.cartItems[itemIndex].quantity += quantity;
      } else {
        cart.cartItems.push({ product: productId, quantity, price });
      }
      await cart.save();
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate('cartItems.product');
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      cart.cartItems = cart.cartItems.filter(item => item.product.toString() !== productId);
      await cart.save();
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
