import { Router } from "express";
import * as c from "../controllers/customerController.js";
const router = Router();
router.get("/", c.list);
router.post("/", c.create);
export default router;
