import {Router} from "express"
import UserController from "../controllers/userController"
import authMiddleware from "../middleware/authMiddleware"
const router = Router()

const userController = new UserController()
router.post("/registration", userController.registration.bind(userController))
router.post("/login", userController.login.bind(userController))
router.get("/auth", authMiddleware, userController.check.bind(userController))

export default router