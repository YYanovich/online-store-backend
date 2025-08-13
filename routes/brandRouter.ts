import {Router} from "express"
import BrandController from "../controllers/brandController"

const router = Router()

const brandController = new BrandController()
router.post("/", brandController.create.bind(brandController))
router.get("/", brandController.getAll.bind(brandController))


export default router