import { Router } from "express";
import * as c from "../controllers/transactionController.js";
const router = Router();
router.get("/", c.list);
router.get("/:id", c.detail);
router.post("/", c.create);
export default router;
