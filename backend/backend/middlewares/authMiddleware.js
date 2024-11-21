const jwt = require('jsonwebtoken');

exports.authMiddleware = (req, res, next) => {
  console.log( req.headers.authorization.split(' ')[1])
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decodedToken.id;
    req.userRole = decodedToken.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

exports.adminMiddleware = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  next();
};