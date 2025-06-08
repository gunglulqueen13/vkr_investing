import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    console.warn('Нет заголовка Authorization');
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.warn('Заголовок Authorization без токена:', authHeader);
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  console.log('JWT_SECRET=', process.env.JWT_SECRET?.slice(0,5) + '…');  
  console.log('Verify token:', token.slice(0,10) + '…');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded payload:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('JWT verification error:', err.name, err.message);

    return res
    .status(401)
    .set('X-Logout', '1')
    .json({ error: 'token expired' });
  }
};
