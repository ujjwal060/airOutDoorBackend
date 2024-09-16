const jwt = require('jsonwebtoken');

const verufyToken=async(req,res)=>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    if (token == null) return res.status(401).json({ message: 'No token provided' });
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid token' });
  
      res.json({ message: 'Token is valid', user });
    });
}

module.exports = {verufyToken};