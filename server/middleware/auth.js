const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    let token = req.header('Authorization');
    
    if (!token) {
      return res.status(401).json({ error: "Access denied. No wristband provided." });
    }

    if (token.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = verified;
    
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

module.exports = protect;