import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  aiLanguageAssistant,
  getStreamToken,
  verifyCallAccess,
  verifyChatAccess,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);
router.get("/verify/:targetUserId", protectRoute, verifyChatAccess);
router.get("/verify-call/:callId", protectRoute, verifyCallAccess);
router.post("/ai-assistant", protectRoute, aiLanguageAssistant);

export default router;