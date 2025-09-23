import { Request, Response, NextFunction } from "express";
import { Type } from "../models/models";
import ApiError from "../error/ApiError";

class TypeController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;
      if (!name) {
        return next(ApiError.badRequest("Не вказано назву типу"));
      }
      const type = await Type.create({ name });
      return res.json(type);
    } catch (e: any) {
      return next(ApiError.internal(e.message));
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const types = await Type.findAll();
      return res.json(types);
    } catch (e: any) {
      return next(ApiError.internal(e.message));
    }
  }
}

export default new TypeController();
