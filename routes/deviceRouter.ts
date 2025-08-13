import {Router} from "express"
import DeviceController from "../controllers/deviceController"

const router = Router()
const deviceController = new DeviceController()
router.post("/", deviceController.create.bind(deviceController))
router.get("/", deviceController.getAll.bind(deviceController))
router.get("/:id", deviceController.getOne.bind(deviceController))


export default router