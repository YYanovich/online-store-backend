import { Router } from "express";
import basketController from "../controllers/basketController";
import authMiddleware from "../middleware/authMiddleware";

const router = Router();

router.post("/", authMiddleware, basketController.addDevice);
router.get("/", authMiddleware, basketController.getDevices);
router.delete("/:deviceId", authMiddleware, basketController.removeDevice);
router.delete("/", authMiddleware, basketController.clearBasket);

export default router;
