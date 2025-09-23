import { Request, Response, NextFunction } from "express";
import ApiError from "../error/ApiError";
import bcrypt from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import {User, Basket} from "../models/models";

const JWT_SECRET = process.env.SECRET_KEY as string;
const generateJWT = (id: number, email: string, role: string) => {
  return sign({ id, email, role }, JWT_SECRET, {
    expiresIn: "24h",
  });
};

class UserController {
  async registration(req: Request, res: Response, next: NextFunction) {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return next(ApiError.badRequest("Не правильний email або пароль"));
    }
    const candidate = await User.findOne({ where: { email } });
    if (candidate) {
      return next(ApiError.badRequest("Користувач з таким email вже існує"));
    }
    const hashPassword = await bcrypt.hash(password, 5);
    const user = await User.create({ email, role, password: hashPassword });
    const basket = await Basket.create({ userId: user.id });
    const token = generateJWT(user.id, user.email, user.role);
    return res.json({ token });
  }

  async login(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return next(ApiError.internal("Користувача не знайдено"));
    }
    let comparePassword = bcrypt.compareSync(password, user.password);
    if (!comparePassword) {
      return next(ApiError.internal("Не правильний пароль"));
    }
    const token = generateJWT(user.id, user.email, user.role);
    return res.json({ token });
  }

  async check(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
      return next(ApiError.internal("Не авторизований"));
    }
    const token = generateJWT(req.user.id, req.user.email, req.user.role);
    return res.json({ token });
  }
}

export default new UserController();
