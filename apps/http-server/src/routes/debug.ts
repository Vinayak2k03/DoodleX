import { Router } from "express";
const router: Router = Router();

router.get("/ping", (req, res) => {
  console.log("Debug endpoint hit!");
  res.status(200).json({ message: "API is reachable" });
});

export default router;
