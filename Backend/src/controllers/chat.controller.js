import { generateStreamToken } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    const token = generateStreamToken(req.user.id);

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function verifyChatAccess(req, res) {
  try {
    const { targetUserId } = req.params;
    const currentUser = req.user;

    if (currentUser.id === targetUserId) {
      return res.status(400).json({ allowed: false, message: "Cannot chat with yourself" });
    }

    const isFriend = currentUser.friends.some(
      (friendId) => friendId.toString() === targetUserId
    );

    if (!isFriend) {
      return res.status(403).json({
        allowed: false,
        message: "You must be friends with this user to start a conversation",
      });
    }

    res.status(200).json({ allowed: true });
  } catch (error) {
    console.error("Error in verifyChatAccess controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function verifyCallAccess(req, res) {
  try {
    const { callId } = req.params;
    const currentUserId = req.user.id;

    const userIds = callId.split("-");
    if (userIds.length === 2) {
      if (!userIds.includes(currentUserId)) {
        return res
          .status(403)
          .json({ allowed: false, message: "Not an authorized participant of this call" });
      }
      const otherUserId = userIds.find((id) => id !== currentUserId);
      const isFriend = req.user.friends.some((friendId) => friendId.toString() === otherUserId);
      if (!isFriend) {
        return res
          .status(403)
          .json({ allowed: false, message: "Participants must be connected as friends" });
      }
    }

    res.status(200).json({ allowed: true });
  } catch (error) {
    console.error("Error in verifyCallAccess controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}