import { Router } from "express";
import { getAllRooms, createRoom, getRoom, deleteRoom } from "../controllers/room";

const router: Router = Router();

router.get("/", getAllRooms);
router.post("/create-room", createRoom);
router.get("/:slug", getRoom);
router.post("/delete-room",deleteRoom);

export default router;