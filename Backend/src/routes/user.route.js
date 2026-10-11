import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  dismissNotification,
  getFriendRequests,
  getMyFriends,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  rejectFriendRequest,
  sendFriendRequest,
  unfriend,
} from "../controllers/user.controller.js";

const router = express.Router();

// apply auth middleware to all routes
router.use(protectRoute);

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);
router.delete("/friends/:id", unfriend);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);
router.put("/friend-request/:id/reject", rejectFriendRequest);
router.delete("/friend-request/:id", cancelFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.put("/friend-requests/:id/dismiss", dismissNotification);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);

export default router;