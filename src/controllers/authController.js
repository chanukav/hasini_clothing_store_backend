const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { registerSchema, loginSchema } = require('../validators/authValidator');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d'
  });
};

const register = async (req, res, next) => {
  try {
    // 1. Zod Validation
    const validatedData = registerSchema.parse(req.body);

    // 2. Check if user exists
    const userExists = await User.findOne({ email: validatedData.email });
    if (userExists) {
      return res.status(400).json({ status: 'error', message: 'Email already registered' });
    }

    // 3. Create user
    const user = await User.create({
      name: validatedData.name,
      email: validatedData.email,
      password: validatedData.password,
      phone: validatedData.phone
    });

    // 4. Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      status: 'success',
      token,
      data: { user }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ status: 'error', message: error.errors[0].message, errors: error.errors });
    }
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    // 1. Zod Validation
    const validatedData = loginSchema.parse(req.body);

    // 2. Check if user exists & select password
    const user = await User.findOne({ email: validatedData.email }).select('+password');
    
    if (!user || !(await user.comparePassword(validatedData.password))) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ status: 'error', message: 'Your account has been deactivated' });
    }

    // 3. Generate token
    const token = generateToken(user._id);

    // Create a copy of user to remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      status: 'success',
      token,
      data: { user: userResponse }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ status: 'error', message: error.errors[0].message, errors: error.errors });
    }
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      status: 'success',
      data: { user: req.user }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
