import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
const authHeader = req.headers.authorization;

if (!authHeader || !authHeader.startsWith("Bearer ")) {
  return res.status(401).json({ message: "No token provided" });
}

const token = authHeader.split(" ")[1];

const decoded = jwt.verify(token, process.env.JWT_SECRET);


    req.user = decoded;

    next();
  } catch (error) {
  if (error.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expired" });
  }

  return res.status(401).json({ message: "Invalid token" });
}

};


// Role-Based Authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};