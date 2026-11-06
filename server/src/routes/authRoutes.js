import { Router } from "express";
import * as c from "../controllers/authController.js";
const router = Router();
router.post("/login", c.login);
export default router;
