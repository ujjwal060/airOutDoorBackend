const jwt = require('jsonwebtoken');

const verifyToken =async(req,res,next)=>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (token == null) return res.status(401).json({ message: 'No token provided' });
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid token' });
  
      res.status(200).json({ message: 'Token is valid',user });
      next();
    });
}

module.exports = {verifyToken };