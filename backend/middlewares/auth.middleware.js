import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  let token = req.headers["authorization"];

  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  if (!token && req.cookies) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "failed to authenticate token",
      });
    }

    req.user = decoded;
    next();
  });
};
export default authMiddleware;
