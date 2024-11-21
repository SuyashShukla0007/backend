const jwt = require('jsonwebtoken');

// src/middleware/authMiddleware.js
exports.authMiddleware = (req, res, next) => {
  console.log('Auth middleware reached'); // Check if this logs
  try {
    if (!req.headers.authorization) {
      console.error('Authorization header missing');
      return res.status(401).json({ message: 'Authentication failed: Missing Authorization header' });
    }
    
    const token = req.headers.authorization.split(' ')[1];
    console.log('Token received:', token);
    const decodedToken = jwt.verify(token , process.env.JWT_SECRET);

    console.log('Decoded Token:', decodedToken);
    req.userId = decodedToken.id;
    req.userRole = decodedToken.role;
    next();
  } catch (error) {
    console.error('Authentication Error:', error.message);
    res.status(401).json({ message: 'Authentication failed' });
  }
};



exports.adminMiddleware = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
}; 