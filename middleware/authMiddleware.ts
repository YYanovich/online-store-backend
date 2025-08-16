import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";


export default function (req: Request, res: Response, next: NextFunction) {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Не авторизований" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Не авторизований" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY as string) as {
      id: number;
      email: string;
      role: string;
    };

    req.user = decoded;

    next();
  } catch (e) {
    return res.status(403).json({ message: "Користувач не авторизований" });
  }
}
