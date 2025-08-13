import { Router } from "express";
import TypeController from "../controllers/typeController";

const router = Router();
const typeController = new TypeController();

router.post("/", typeController.create.bind(typeController));
router.get("/", typeController.getAll.bind(typeController));

export default router;
