import { Router } from "express";
import { getUser, updateUser } from "../store.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.get("/", (req, res) => {
  try {
    const user = getUser(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/", (req, res) => {
  try {
    const allowedFields = [
      "modes",
      "niches",
      "tone",
      "chains",
      "handle",
      "timezone",
      "streak",
      "xp",
      "completedMissions",
      "farmProgress",
      "dualToday",
      "lastActiveDate",
    ];

    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = updateUser(req.userId, updates);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/complete-mission", (req, res) => {
  try {
    const { missionId } = req.body;
    if (!missionId) {
      return res.status(400).json({ message: "missionId is required" });
    }

    const user = getUser(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.completedMissions?.includes(missionId)) {
      return res.status(400).json({ message: "Mission already completed" });
    }

    const completedMissions = [...(user.completedMissions || []), missionId];
    const updated = updateUser(req.userId, { completedMissions });

    const { password, ...safeUser } = updated;
    res.json(safeUser);
  } catch (error) {
    console.error("Complete mission error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/complete-farm-step", (req, res) => {
  try {
    const { taskId, stepIndex } = req.body;
    if (!taskId || stepIndex === undefined) {
      return res
        .status(400)
        .json({ message: "taskId and stepIndex are required" });
    }

    const user = getUser(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const farmProgress = { ...(user.farmProgress || {}) };
    const currentSteps = farmProgress[taskId] || [];
    if (currentSteps.includes(stepIndex)) {
      return res.status(400).json({ message: "Step already completed" });
    }

    farmProgress[taskId] = [...currentSteps, stepIndex];
    const updated = updateUser(req.userId, { farmProgress });

    const { password, ...safeUser } = updated;
    res.json(safeUser);
  } catch (error) {
    console.error("Complete farm step error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
