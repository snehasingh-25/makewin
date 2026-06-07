import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

const JWT_SECRET = process.env.JWT_SECRET;

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL)
  .replace(/^["']|["']$/g, "")
  .trim();
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD)
  .replace(/^["']|["']$/g, "")
  .trim();


export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.email !== ADMIN_EMAIL) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    
    req.userId = decoded.userId || 1;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export { ADMIN_EMAIL, ADMIN_PASSWORD };
