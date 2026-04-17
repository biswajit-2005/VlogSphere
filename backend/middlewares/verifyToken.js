import jwt from "jsonwebtoken";

export const verifyAccessToken = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: "You are not authenticated!" });
  }

  jwt.verify(token, process.env.JWT_ACCESS_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Token is not valid!" });
    req.user = user;
    next();
  });
};
