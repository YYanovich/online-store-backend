import { Request, Response, NextFunction } from "express";
import fileUpload, { UploadedFile } from "express-fileupload";
import path from "path";
import {Device, DeviceInfo} from "../models/models";
import ApiError from "../error/ApiError";
import { v4 as uuidv4 } from "uuid";

class DeviceController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, price, brandId, typeId, info } = req.body;

      const numericBrandId = Number(brandId);
      const numericTypeId = Number(typeId);
      const numericPrice = Number(price);

      if (!name) {
        return res.status(400).json({ message: "name є обовʼязковим" });
      }
      if (isNaN(numericPrice)) {
        return res.status(400).json({ message: "price має бути числом" });
      }
      if (isNaN(numericBrandId) || isNaN(numericTypeId)) {
        return res
          .status(400)
          .json({ message: "brandId і typeId мають бути числами" });
      }

      const files = req.files as fileUpload.FileArray | undefined;
      if (!files || !files.img) {
        return res.status(400).json({ message: "Image file is required" });
      }

      const img = files.img as UploadedFile;
      const fileName = uuidv4() + ".jpg";
      const filePath = path.resolve(__dirname, "..", "static", fileName);

      await new Promise<void>((resolve, reject) => {
        img.mv(filePath, (err) => (err ? reject(err) : resolve()));
      });

      const device = await Device.create({
        name,
        price: numericPrice,
        brandId: numericBrandId,
        typeId: numericTypeId,
        img: fileName,
      });

      const deviceId = device.getDataValue("id") as number;

      if (info) {
        try {
          const parsed = typeof info === "string" ? JSON.parse(info) : info;
          if (Array.isArray(parsed)) {
            for (const i of parsed) {
              await DeviceInfo.create({
                title: i.title,
                description: i.description,
                deviceId: deviceId,
              });
            }
          }
        } catch (err) {
          return res
            .status(400)
            .json({ message: "info має бути валідним JSON масивом" });
        }
      }

      return res.json(device);
    } catch (e: any) {
      console.error("Device create error:", e);

      if (
        e?.name === "SequelizeUniqueConstraintError" ||
        e?.name === "SequelizeValidationError"
      ) {
        const details = (e.errors || [])
          .map((er: any) => er.message)
          .join("; ");
        return res.status(400).json({ message: "Validation error", details });
      }
      return next(ApiError.badRequest(e?.message || String(e)));
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
