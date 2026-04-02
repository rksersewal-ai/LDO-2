import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";

const router: IRouter = Router();

router.use("/auth", authRouter);
router.use(healthRouter);

export default router;
