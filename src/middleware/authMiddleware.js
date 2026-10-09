const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ status: 'error', message: 'Not authorized to access this route' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({ status: 'error', message: 'User belonging to this token no longer exists' });
    }
    
    if (!req.user.isActive) {
      return res.status(401).json({ status: 'error', message: 'User account has been deactivated' });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Not authorized to access this route' });
  }
};

const restrictToAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ status: 'error', message: 'You do not have permission to perform this action' });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await User.findById(decoded.id);
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (err) {
        // Token invalid or expired - proceed as unauthenticated/guest
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = { protect, restrictToAdmin, optionalAuth };
