const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password });

    res.status(201).json({
      user: {                     // ✅ FIXED
        _id: user._id,
        name: user.name,
        email: user.email,
        resumeText: user.resumeText || ''
      },
      token: generateToken(user._id)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({
      user: {                    // ✅ FIXED
        _id: user._id,
        name: user.name,
        email: user.email,
        resumeText: user.resumeText || ''
      },
      token: generateToken(user._id)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ user: req.user }); // ✅ CONSISTENT FORMAT
});

// PUT /api/auth/resume
router.put('/resume', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { resumeText: req.body.resumeText },
      { new: true }
    ).select('-password');

    res.json({ user }); // ✅ 🔥 THIS IS THE MAIN FIX

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;