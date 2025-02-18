import { Router } from "express";
import {getAllRooms,createRoom,getRoom} from "../controllers/room";

const router:Router=Router();

router.get("/",getAllRooms);
router.post("/create-room",createRoom)
router.get("/:slug",getRoom)

export default router;