import { Router } from "express";
import { login, register, addToActivity, getAllActivity ,validateMeeting} from "../controllers/user.controllers.js";
import { authenticate } from "../middlewares/auth.middleware.js"; 

const router = Router();

router.post("/login",           login);
router.post("/register",        register);
router.post("/add_to_activity", authenticate, addToActivity);
router.get("/get_all_activity", authenticate, getAllActivity);
router.get("/validate_meeting/:code", authenticate, validateMeeting);
export default router;