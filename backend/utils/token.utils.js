import jwt from 'jsonwebtoken';

export const createToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: process.env.JWT_EXPIRATION || '1h' }
  );
};

export const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : false,
    maxAge: 3600000, // 1 hour
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    message: "Token cookie set successfully",
  });
};
