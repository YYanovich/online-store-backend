import { Request, Response, NextFunction } from "express";
import fileUpload, { UploadedFile } from "express-fileupload";
import path from "path";
import { Device, DeviceInfo } from "../models/models";
import ApiError from "../error/ApiError";
import { v4 as uuidv4 } from "uuid";
import { sequelize } from "../db";

class DeviceController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await sequelize.transaction(async (t) => {
        const { name, price, brandId, typeId, rating, info } = req.body;

        if (!name || !price || !brandId || !typeId) {
          throw ApiError.badRequest(
            "Name, price, brandId and typeId are required"
          );
        }

        const files = req.files as fileUpload.FileArray | undefined;
        if (!files || !files.img) {
          throw ApiError.badRequest("Image file is required");
        }

        const img = files.img as UploadedFile;
        const fileName = uuidv4() + ".jpg";
        await img.mv(path.resolve(__dirname, "..", "static", fileName));

        const device = await Device.create(
          {
            name,
            price: Number(price),
            brandId: Number(brandId),
            typeId: Number(typeId),
            rating: Number(rating) || 0, 
            img: fileName,
          },
          { transaction: t }
        );

        if (info) {
          await DeviceInfo.create(
            {
              name: "Description", 
              description: info,
              deviceId: device.id,
            },
            { transaction: t }
          );
        }

        return device;
      });

      return res.json(result);
    } catch (e) {
      return next(e);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        brandId,
        typeId,
        limit = "9",
        page = "1",
      } = req.query as Record<string, string>;
      const limitNum = Math.max(1, Number(limit));
      const pageNum = Math.max(1, Number(page));
      const where: any = {};

      if (brandId && !isNaN(Number(brandId))) where.brandId = Number(brandId);
      if (typeId && !isNaN(Number(typeId))) where.typeId = Number(typeId);

      const devices = await Device.findAndCountAll({
        where,
        limit: limitNum,
        offset: (pageNum - 1) * limitNum,
      });

      return res.json(devices);
    } catch (e: any) {
      return next(ApiError.badRequest(e?.message || String(e)));
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const device = await Device.findOne({
        where: { id: Number(id) },
        include: [{ model: DeviceInfo, as: "device_infos" }],
      });
      if (!device) return res.status(404).json({ message: "Device not found" });
      return res.json(device);
    } catch (e: any) {
      return next(ApiError.badRequest(e?.message || String(e)));
    }
  }
}

export default DeviceController;
