import { Router } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { createUser, getUserByHandle } from "../store.js";
import { generateToken } from "../middleware/auth.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { handle, password } = req.body;

    if (!handle || handle.length < 2) {
      return res
        .status(400)
        .json({ message: "Handle must be at least 2 characters" });
    }

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const existing = getUserByHandle(handle);
    if (existing) {
      return res.status(409).json({ message: "Handle already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = createUser({
      id: uuidv4(),
      handle,
      password: hashedPassword,
      modes: [],
      niches: [],
      tone: null,
      chains: [],
      timezone: "",
      streak: 0,
      xp: 0,
      completedMissions: [],
      farmProgress: {},
      dualToday: false,
      lastActiveDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const token = generateToken(user.id);
    res.status(201).json({
      token,
      user: {
        id: user.id,
        handle: user.handle,
        xp: user.xp,
        streak: user.streak,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { handle, password } = req.body;

    if (!handle || !password) {
      return res
        .status(400)
        .json({ message: "Handle and password are required" });
    }

    const user = getUserByHandle(handle);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user.id);
    res.json({
      token,
      user: {
        id: user.id,
        handle: user.handle,
        xp: user.xp,
        streak: user.streak,
        modes: user.modes,
        niches: user.niches,
        tone: user.tone,
        chains: user.chains,
        timezone: user.timezone,
        completedMissions: user.completedMissions,
        farmProgress: user.farmProgress,
        dualToday: user.dualToday,
        lastActiveDate: user.lastActiveDate,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
