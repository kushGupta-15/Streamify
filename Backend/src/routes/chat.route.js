import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getStreamToken,
  verifyCallAccess,
  verifyChatAccess,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);
router.get("/verify/:targetUserId", protectRoute, verifyChatAccess);
router.get("/verify-call/:callId", protectRoute, verifyCallAccess);

export default router;