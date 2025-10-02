import {Router} from "express"
import brandRouter from "./brandRouter"
import deviceRouter from "./deviceRouter"
import typeRouter from "./typeRouter"
import userRouter from "./userRouter"
import basketRouter from "./basketRouter"

const router = Router()

router.use("/user", userRouter)
router.use("/type", typeRouter)
router.use("/brand", brandRouter)
router.use("/device", deviceRouter)
router.use("/basket", basketRouter)

export default router