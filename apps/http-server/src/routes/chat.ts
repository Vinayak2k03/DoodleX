import { Router } from "express";
import { getChat } from "../controllers/chat";

const router:Router=Router();

router.get("/:roomId",getChat);

export default router;