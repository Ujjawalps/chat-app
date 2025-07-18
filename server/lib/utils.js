import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
  return jwt.sign({ user: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};
