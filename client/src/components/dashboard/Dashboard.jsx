import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { palette, fonts, cardStyle } from "../../theme";
import { CONTENT_MISSIONS, FARM_TASKS, FEED, DAYS } from "../../constants";
import { useApp } from "../../context/AppContext";
import {
  getLevel,
  getNextLevel,
  getTodayIndex,
  getWeekDates,
  getGreeting,
} from "../../utils";
import BottomNav from "../layout/BottomNav";
import ProgressBar from "../ui/ProgressBar";
import Pill from "../ui/Pill";

const STREAK_WARN_DELAY = 4000;
const URGENCY_COLORS = {
  active: palette.cyan,
  urgent: palette.orange,
  critical: palette.red,
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { state, hasContent, hasFarm, hasContentDone, hasFarmDone, isDualMode } = useApp();
  const { streak, xp, completedMissions, farmProgress, handle } = state;

  const [tab, setTab] = useState(hasContent ? "missions" : hasFarm ? "farm" : "feed");
  const [showWarn, setShowWarn] = useState(false);

  const anyDone = hasContentDone || hasFarmDone;
  const level = getLevel(xp);
  const nextLvl = getNextLevel(xp);
  const todayIdx = getTodayIndex();
  const weekDates = getWeekDates();
  const critTask = FARM_TASKS.find((t) => t.urgency === "critical");

  useEffect(() => {
    if (!anyDone) {
      const timer = setTimeout(() => setShowWarn(true), STREAK_WARN_DELAY);
      return () => clearTimeout(timer);
    }
    setShowWarn(false);
  }, [anyDone]);

  const tabs = [];
  if (hasContent) tabs.push({ id: "missions", label: "\u270D\uFE0F Missions" });
  if (hasFarm) tabs.push({ id: "farm", label: "\u{1FA82} Farm" });
  tabs.push({ id: "feed", label: "\u{1F4F0} Feed" });
  const activeTab = tabs.find((t) => t.id === tab) ? tab : tabs[0]?.id;

  const getFarmProgress = (taskId) => farmProgress[taskId]?.length || 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: palette.bg,
        color: palette.text,
        fontFamily: fonts.body,
        fontSize: 14,
      }}
    >
      {/* Streak warning */}
      {showWarn && !anyDone && (
        <div
          role="alert"
          style={{
            position: "fixed",
            top: 12,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 80,
            maxWidth: 400,
            width: "90%",
            ...cardStyle,
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: `2px solid ${palette.red}33`,
            animation: "fadeIn .3s ease",
          }}
        >
          <span style={{ fontSize: 22 }}>{"\u{1F525}"}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: palette.red }}>
              {streak}-day streak at risk!
            </div>
            <div style={{ fontSize: 11, color: palette.sub }}>
              Complete 1 task to keep it alive.
            </div>
          </div>
          <button
            onClick={() => setShowWarn(false)}
            aria-label="Dismiss warning"
            style={{
              background: "none",
              border: "none",
              color: palette.sub,
              cursor: "pointer",
              fontSize: 16,
            }}
          >
            {"\u2715"}
          </button>
        </div>
      )}

      <div
        className="page-enter"
        style={{ maxWidth: 440, margin: "0 auto", padding: "18px 20px 100px" }}
      >
        {/* Greeting */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: palette.sub }}>
              {getGreeting()},
            </div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 900,
                fontFamily: fonts.display,
                margin: 0,
              }}
            >
              {handle || "Anon"} {"\u26A1"}
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 28 }}>{"\u{1F525}"}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: palette.orange }}>
              {streak}
            </div>
          </div>
        </div>

        {/* Day selector */}
        <div
          role="group"
          aria-label="Week view"
          style={{ display: "flex", gap: 6, marginBottom: 16 }}
        >
          {DAYS.map((d, i) => (
            <div
              key={d}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "8px 0",
                borderRadius: 14,
                background: i === todayIdx ? palette.blue : palette.card,
                color: i === todayIdx ? "#FFF" : palette.sub,
                boxShadow:
                  i === todayIdx ? "none" : "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 900 }}>
                {weekDates[i]}
              </div>
              <div style={{ fontSize: 10, fontWeight: 600 }}>{d}</div>
            </div>
          ))}
        </div>

        {/* Level bar */}
        {nextLvl && (
          <div style={{ ...cardStyle, padding: 14, marginBottom: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 16 }}>{level.icon}</span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: level.color,
                  }}
                >
                  {level.name}
                </span>
                <span style={{ fontSize: 12, color: palette.sub }}>
                  {xp} XP
                </span>
              </div>
              <span style={{ fontSize: 11, color: palette.sub }}>
                {nextLvl.min - xp} {"\u2192"} {nextLvl.name}
              </span>
            </div>
            <ProgressBar
              value={xp - level.min}
              max={nextLvl.min - level.min}
              color={level.color}
              height={6}
            />
            {isDualMode && (
              <div
                style={{
                  marginTop: 8,
                  padding: "6px 12px",
                  background: `${palette.purple}10`,
                  borderRadius: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: palette.purple,
                    fontWeight: 700,
                  }}
                >
                  {"\u26A1"} Dual Mode Day — 1.5x XP active!
                </span>
              </div>
            )}
            {hasFarm && critTask && !isDualMode && (
              <div
                style={{
                  marginTop: 8,
                  padding: "6px 12px",
                  background: `${palette.red}08`,
                  borderRadius: 10,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    color: palette.red,
                    fontWeight: 700,
                  }}
                >
                  {"\u26A0\uFE0F"} {critTask.protocol}: {critTask.deadline}{" "}
                  left!
                </span>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div
          role="tablist"
          style={{
            display: "flex",
            gap: 0,
            marginBottom: 16,
            background: palette.muted,
            borderRadius: 14,
            padding: 3,
          }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={activeTab === t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                padding: "9px 0",
                borderRadius: 12,
                border: "none",
                background: activeTab === t.id ? palette.card : "transparent",
                boxShadow:
                  activeTab === t.id
                    ? "0 1px 3px rgba(0,0,0,0.06)"
                    : "none",
                color: activeTab === t.id ? palette.text : palette.sub,
                fontWeight: 700,
                fontSize: 12,
                fontFamily: fonts.body,
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content missions */}
        {activeTab === "missions" &&
          hasContent &&
          CONTENT_MISSIONS.map((m) => {
            const isDone = completedMissions.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => !isDone && navigate(`/mission/${m.id}`)}
                disabled={isDone}
                aria-label={`${m.type}: ${m.tweet.split("\n")[0]}${isDone ? " (completed)" : ""}`}
                style={{
                  ...cardStyle,
                  width: "100%",
                  padding: 16,
                  marginBottom: 10,
                  cursor: isDone ? "default" : "pointer",
                  opacity: isDone ? 0.55 : 1,
                  border: `2px solid ${isDone ? palette.green + "44" : "transparent"}`,
                  background: isDone ? `${palette.green}05` : palette.card,
                  textAlign: "left",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      background: `${m.color}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    {m.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        marginBottom: 4,
                        alignItems: "center",
                      }}
                    >
                      <Pill text={m.type} color={m.color} filled />
                      <span style={{ fontSize: 11, color: palette.sub }}>
                        {"\u{1F550}"} {m.time}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: palette.text,
                        lineHeight: 1.3,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {m.tweet.split("\n")[0]}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    {isDone ? (
                      <span style={{ fontSize: 20, color: palette.green }}>
                        {"\u2713"}
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: palette.orange,
                        }}
                      >
                        +{m.xp}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

        {/* Farm tasks */}
        {activeTab === "farm" &&
          hasFarm &&
          FARM_TASKS.map((t) => {
            const progress = getFarmProgress(t.id);
            const allDone = progress >= t.steps.length;
            return (
              <button
                key={t.id}
                onClick={() => navigate(`/farm/${t.id}`)}
                aria-label={`${t.protocol} farming task${allDone ? " (completed)" : ""}`}
                style={{
                  ...cardStyle,
                  width: "100%",
                  padding: 16,
                  marginBottom: 10,
                  cursor: "pointer",
                  border:
                    t.urgency === "critical"
                      ? `2px solid ${palette.red}44`
                      : "2px solid transparent",
                  opacity: allDone ? 0.55 : 1,
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 16,
                      background: `${t.color}18`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 22,
                      flexShrink: 0,
                    }}
                  >
                    {t.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 800 }}>
                      {t.protocol}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                      <Pill text={t.chain} color={palette.cyan} />
                      <Pill
                        text={t.deadline}
                        color={URGENCY_COLORS[t.urgency] || palette.cyan}
                        filled
                      />
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {allDone ? (
                      <span style={{ fontSize: 20, color: palette.green }}>
                        {"\u2713"}
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 900,
                          color: palette.orange,
                        }}
                      >
                        +{t.xp}
                      </span>
                    )}
                  </div>
                </div>
                <ProgressBar
                  value={progress}
                  max={t.steps.length}
                  color={allDone ? palette.green : palette.blue}
                  height={5}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 6,
                  }}
                >
                  <span style={{ fontSize: 11, color: palette.sub }}>
                    {progress}/{t.steps.length} steps {"\u00B7"} ~
                    {t.steps.reduce(
                      (acc, s) => acc + parseInt(s.time),
                      0
                    )}{" "}
                    min
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: palette.sub,
                      fontStyle: "italic",
                    }}
                  >
                    Source: {t.protocol} official docs
                  </span>
                </div>
              </button>
            );
          })}

        {/* Feed */}
        {activeTab === "feed" &&
          FEED.map((f) => (
            <article
              key={f.id}
              style={{ ...cardStyle, padding: 16, marginBottom: 10 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 6,
                }}
              >
                <Pill text={f.niche} color={f.color} />
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    color: palette.sub,
                  }}
                >
                  {f.time} ago
                </span>
              </div>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  lineHeight: 1.3,
                  marginBottom: 4,
                }}
              >
                {f.headline}
              </h3>
              <p
                style={{
                  fontSize: 12,
                  color: palette.sub,
                  marginBottom: 8,
                }}
              >
                {f.summary}
              </p>
              <div
                style={{
                  padding: "8px 12px",
                  background: `${f.color}08`,
                  borderRadius: 10,
                }}
              >
                <span
                  style={{ fontSize: 11, fontWeight: 600, color: f.color }}
                >
                  {"\u{1F4A1}"} {f.angle}
                </span>
              </div>
            </article>
          ))}
      </div>

      <BottomNav />
    </div>
  );
}
