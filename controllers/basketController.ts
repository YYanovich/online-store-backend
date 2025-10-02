import { Request, Response, NextFunction } from "express";
import { BasketDevice, Basket, Device } from "../models/models";
import ApiError from "../error/ApiError";
import { Model } from "sequelize";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

interface BasketModel extends Model {
  id: number;
  userId: number;
}

class BasketController {
  async addDevice(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { deviceId } = req.body;

      if (!req.user) {
        return next(ApiError.unauthorized("User is not authenticated"));
      }

      const basket = (await Basket.findOne({
        where: { userId: req.user.id },
      })) as BasketModel | null;

      if (!basket) {
        return next(ApiError.internal("Basket not found for this user"));
      }

      const basketDevice = await BasketDevice.create({
        basketId: basket.id,
        deviceId: deviceId,
      });

      return res.json(basketDevice);
    } catch (e) {
      return next(
        ApiError.internal(
          "An error occurred while adding the device to the basket"
        )
      );
    }
  }
  async getDevices(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        return ApiError.unauthorized("User is not aunthenticated");
      }
      const basket = (await Basket.findOne({
        where: { userId: req.user.id },
      })) as BasketModel | null;
      if (!basket) {
        return next(ApiError.internal("Basket not found for this user"));
      }
      const basketDevice = await BasketDevice.findAll({
        where: { basketId: basket.id },
        include: [Device],
      });
      return res.json(basketDevice);
    } catch (e: any) {
      return next(
        ApiError.internal(
          "An error occurred while getting device from the basket"
        )
      );
    }
  }
  async removeDevice(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { deviceId } = req.body;
      if (!req.user) {
        return ApiError.unauthorized("User is not aunthenticated");
      }
      const basket = (await Basket.findOne({
        where: { userId: req.user.id },
      })) as BasketModel | null;
      if (!basket) {
        return ApiError.internal("Basket not found for this user");
      }
      const removeBasketDevice = await BasketDevice.destroy({
        where: { basketId: basket.id, deviceId: deviceId },
      });
      return res.json({ success: true, message: "Device removed from basket" });
    } catch (e: any) {
      return next(
        ApiError.internal(
          "An error occurred while removing device from the basket"
        )
      );
    }
  }
  async clearBasket(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        return ApiError.unauthorized("Please log in.");
      }
      const basket = (await Basket.findOne({
        where: { userId: req.user.id },
      })) as BasketModel | null;
      if (!basket) {
        return ApiError.internal("Basket not found for this user.");
      }
      const clearBasketDevices = await BasketDevice.destroy({
        where: { basketId: basket.id },
      });
      return res.json({
        success: true,
        message: "Basket cleared successfully",
      });
    } catch (e: any) {
      return next(
        ApiError.internal(
          "An error occurred while clearing devices from the basket"
        )
      );
    }
  }
}

export default new BasketController();
