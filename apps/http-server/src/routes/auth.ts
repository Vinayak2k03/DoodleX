import { Router } from "express";
import authMiddleware from "../middlewares/authMiddleware";
import { getUser, signin, signup } from "../controllers/auth";

const router:Router=Router();

router.post("/signup",signup);
router.post("/signin",signin);
router.get("/me",authMiddleware,getUser);

export default router;