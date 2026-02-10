import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from "react";
import { api } from "../api";
import { getTodayDateString } from "../utils";

const STORAGE_KEY = "alphasignal_state";

const initialState = {
  onboarded: false,
  modes: [],
  niches: [],
  tone: null,
  chains: [],
  handle: "",
  timezone: "",
  disclaimAccepted: false,
  streak: 0,
  xp: 0,
  completedMissions: [],
  farmProgress: {},
  dualToday: false,
  lastActiveDate: null,
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return validateAndFixStreak({ ...initialState, ...parsed });
    }
  } catch (e) {
    console.warn("Failed to load saved state:", e);
  }
  return initialState;
}

function validateAndFixStreak(state) {
  if (!state.lastActiveDate) return state;
  const today = getTodayDateString();
  if (state.lastActiveDate === today) return state;

  const last = new Date(state.lastActiveDate + "T00:00:00");
  const now = new Date(today + "T00:00:00");
  const diffDays = Math.round((now - last) / (1000 * 60 * 60 * 24));

  if (diffDays > 1) {
    return { ...state, streak: 0, dualToday: false };
  }
  return { ...state, dualToday: false };
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save state:", e);
  }
}

function computeXpGain(baseXp, isDualMode, dualToday) {
  const bonus = isDualMode && !dualToday ? 1.5 : 1;
  return Math.round(baseXp * bonus);
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_MODES":
      return { ...state, modes: action.payload };
    case "TOGGLE_MODE": {
      const id = action.payload;
      const modes = state.modes.includes(id)
        ? state.modes.filter((m) => m !== id)
        : [...state.modes, id];
      return { ...state, modes };
    }
    case "TOGGLE_NICHE": {
      const id = action.payload;
      const niches = state.niches.includes(id)
        ? state.niches.filter((n) => n !== id)
        : state.niches.length < 3
          ? [...state.niches, id]
          : state.niches;
      return { ...state, niches };
    }
    case "SET_TONE":
      return { ...state, tone: action.payload };
    case "TOGGLE_CHAIN": {
      const id = action.payload;
      const chains = state.chains.includes(id)
        ? state.chains.filter((c) => c !== id)
        : [...state.chains, id];
      return { ...state, chains };
    }
    case "SET_HANDLE":
      return { ...state, handle: action.payload };
    case "SET_TIMEZONE":
      return { ...state, timezone: action.payload };
    case "ACCEPT_DISCLAIMER":
      return { ...state, disclaimAccepted: true };
    case "COMPLETE_ONBOARDING":
      return { ...state, onboarded: true };

    case "COMPLETE_MISSION": {
      const { missionId, xpAmount } = action.payload;
      if (state.completedMissions.includes(missionId)) return state;

      const newCompleted = [...state.completedMissions, missionId];
      const today = getTodayDateString();
      const hasContentDone = newCompleted.some((id) => id.startsWith("c"));
      const hasFarmDone = Object.values(state.farmProgress).some(
        (steps) => steps && steps.length > 0
      );
      const isDual = hasContentDone && hasFarmDone;
      const xpGain = computeXpGain(xpAmount, isDual, state.dualToday);
      const hadNoActivity =
        state.lastActiveDate !== today &&
        state.completedMissions.length === 0 &&
        !Object.values(state.farmProgress).some((s) => s && s.length > 0);

      return {
        ...state,
        completedMissions: newCompleted,
        xp: state.xp + xpGain,
        streak: hadNoActivity ? state.streak + 1 : state.streak,
        lastActiveDate: today,
        dualToday: isDual || state.dualToday,
      };
    }

    case "COMPLETE_FARM_STEP": {
      const { taskId, stepIndex, totalSteps, xpAmount } = action.payload;
      const currentSteps = state.farmProgress[taskId] || [];
      if (currentSteps.includes(stepIndex)) return state;

      const newSteps = [...currentSteps, stepIndex];
      const newProgress = { ...state.farmProgress, [taskId]: newSteps };
      const isComplete = newSteps.length >= totalSteps;
      const baseXp = isComplete ? xpAmount : 3;

      const today = getTodayDateString();
      const hasContentDone = state.completedMissions.some((id) =>
        id.startsWith("c")
      );
      const isDual = hasContentDone && newSteps.length > 0;
      const xpGain = computeXpGain(baseXp, isDual, state.dualToday);
      const hadNoActivity =
        state.lastActiveDate !== today &&
        state.completedMissions.length === 0 &&
        !Object.values(state.farmProgress).some((s) => s && s.length > 0);

      return {
        ...state,
        farmProgress: newProgress,
        xp: state.xp + xpGain,
        streak: hadNoActivity ? state.streak + 1 : state.streak,
        lastActiveDate: today,
        dualToday: isDual || state.dualToday,
      };
    }

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState);
  const syncTimer = useRef(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const token = localStorage.getItem("alphasignal_token");
    if (!token || !state.onboarded) return;

    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(async () => {
      try {
        await api.updateUser({
          modes: state.modes,
          niches: state.niches,
          tone: state.tone,
          chains: state.chains,
          handle: state.handle,
          timezone: state.timezone,
          streak: state.streak,
          xp: state.xp,
          completedMissions: state.completedMissions,
          farmProgress: state.farmProgress,
          dualToday: state.dualToday,
          lastActiveDate: state.lastActiveDate,
        });
      } catch {
        // Silently fail — localStorage is the primary store
      }
    }, 2000);

    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [state]);

  const hasContentDone = state.completedMissions.some((id) =>
    id.startsWith("c")
  );
  const hasFarmDone = Object.values(state.farmProgress).some(
    (s) => s && s.length > 0
  );
  const isDualMode = hasContentDone && hasFarmDone;
  const hasContent = state.modes.includes("content");
  const hasFarm = state.modes.includes("farm");

  const value = {
    state,
    dispatch,
    hasContent,
    hasFarm,
    hasContentDone,
    hasFarmDone,
    isDualMode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
