import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { palette, fonts, cardStyle } from "../../theme";
import { FARM_TASKS } from "../../constants";
import { useApp } from "../../context/AppContext";
import Pill from "../ui/Pill";
import ProgressBar from "../ui/ProgressBar";
import ScreenWrapper from "../layout/ScreenWrapper";

const URGENCY_COLORS = {
  active: palette.cyan,
  urgent: palette.orange,
  critical: palette.red,
};

export default function FarmDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const task = FARM_TASKS.find((t) => t.id === id);
  const [xpPop, setXpPop] = useState(0);

  if (!task) {
    navigate("/", { replace: true });
    return null;
  }

  const progress = state.farmProgress[task.id]?.length || 0;
  const total = task.steps.length;
  const allDone = progress >= total;

  const handleStepComplete = (stepIndex) => {
    if (state.farmProgress[task.id]?.includes(stepIndex)) return;
    if (stepIndex !== progress) return;

    dispatch({
      type: "COMPLETE_FARM_STEP",
      payload: {
        taskId: task.id,
        stepIndex,
        totalSteps: total,
        xpAmount: task.xp,
      },
    });

    const isLastStep = progress + 1 >= total;
    setXpPop(isLastStep ? task.xp : 3);
    setTimeout(() => setXpPop(0), 1800);
  };

  return (
    <ScreenWrapper xpPop={xpPop}>
      <div
        className="page-enter"
        style={{
          maxWidth: 440,
          margin: "0 auto",
          padding: "16px 20px 40px",
        }}
      >
        <button
          onClick={() => navigate("/")}
          style={{
            background: "none",
            border: "none",
            color: palette.sub,
            cursor: "pointer",
            fontSize: 13,
            fontFamily: fonts.body,
            padding: "8px 0",
            marginBottom: 10,
            fontWeight: 600,
          }}
        >
          {"\u2190"} Back
        </button>

        {/* Header card */}
        <div
          style={{
            ...cardStyle,
            padding: 18,
            marginBottom: 12,
            background: `linear-gradient(135deg,${task.color}10,${palette.card})`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background: `${task.color}20`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                {task.emoji}
              </div>
              <div>
                <h2
                  style={{
                    fontSize: 18,
                    fontWeight: 900,
                    fontFamily: fonts.display,
                    margin: 0,
                  }}
                >
                  {task.protocol}
                </h2>
                <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                  <Pill text={task.chain} color={palette.cyan} />
                  <Pill
                    text={task.deadline}
                    color={URGENCY_COLORS[task.urgency] || palette.cyan}
                    filled
                  />
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: palette.orange,
                }}
              >
                +{task.xp}
              </div>
              <div style={{ fontSize: 11, color: palette.sub }}>
                {progress}/{total} steps
              </div>
            </div>
          </div>
          <ProgressBar
            value={progress}
            max={total}
            color={allDone ? palette.green : palette.blue}
            height={6}
          />
        </div>

        {/* Disclaimer */}
        <div
          style={{
            padding: "8px 14px",
            background: `${palette.yellow}12`,
            borderRadius: 12,
            marginBottom: 12,
          }}
        >
          <span
            style={{ fontSize: 11, color: "#8B7A3D", lineHeight: 1.5 }}
          >
            {"\u2139\uFE0F"} {task.disclaimer}{" "}
          </span>
          <a
            href={task.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 11, color: palette.blue, fontWeight: 600 }}
          >
            Source {"\u2197"}
          </a>
        </div>

        {/* Steps */}
        {task.steps.map((step, i) => {
          const stepDone = state.farmProgress[task.id]?.includes(i);
          const isCurrent = i === progress && !allDone;

          return (
            <div
              key={i}
              style={{
                ...cardStyle,
                padding: "14px 16px",
                marginBottom: 8,
                border: isCurrent
                  ? `2px solid ${palette.blue}`
                  : stepDone
                    ? `2px solid ${palette.green}44`
                    : "2px solid transparent",
                background: isCurrent ? `${palette.blue}05` : palette.card,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <button
                  onClick={() => isCurrent && handleStepComplete(i)}
                  disabled={!isCurrent}
                  aria-label={`Step ${i + 1}: ${step.text}${stepDone ? " (completed)" : isCurrent ? " (mark complete)" : ""}`}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 10,
                    flexShrink: 0,
                    border: stepDone
                      ? `2px solid ${palette.green}`
                      : isCurrent
                        ? `2px solid ${palette.blue}`
                        : `2px solid ${palette.muted}`,
                    background: stepDone ? `${palette.green}15` : "#FFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isCurrent ? "pointer" : "default",
                    transition: "all .2s",
                    padding: 0,
                  }}
                >
                  {stepDone ? (
                    <span
                      style={{
                        fontSize: 14,
                        color: palette.green,
                        fontWeight: 700,
                      }}
                    >
                      {"\u2713"}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 12,
                        color: isCurrent ? palette.blue : palette.sub,
                        fontWeight: 700,
                      }}
                    >
                      {i + 1}
                    </span>
                  )}
                </button>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      color: stepDone ? palette.sub : palette.text,
                      fontWeight: isCurrent ? 700 : 500,
                      textDecoration: stepDone ? "line-through" : "none",
                    }}
                  >
                    {step.text}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: palette.sub,
                      marginTop: 2,
                    }}
                  >
                    {"\u23F1"} ~{step.time}
                  </div>
                  {isCurrent && step.tip && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: "8px 12px",
                        background: `${palette.orange}08`,
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          color: palette.orange,
                          fontWeight: 700,
                          marginBottom: 2,
                        }}
                      >
                        {"\u{1F4A1}"} Pro tip
                      </div>
                      <div style={{ fontSize: 12, color: "#8B6A2F" }}>
                        {step.tip}
                      </div>
                    </div>
                  )}
                </div>
                <a
                  href={step.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Open ${step.text} in new tab`}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 10,
                    textDecoration: "none",
                    background: isCurrent ? palette.blue : palette.bg,
                    color: isCurrent ? "#FFF" : palette.sub,
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  Open {"\u2197"}
                </a>
              </div>
            </div>
          );
        })}

        {/* Completion */}
        {allDone && (
          <div
            role="alert"
            style={{
              textAlign: "center",
              padding: 24,
              ...cardStyle,
              background: `${palette.green}08`,
              marginTop: 8,
            }}
          >
            <div style={{ fontSize: 40 }}>{"\u2705"}</div>
            <div
              style={{ fontSize: 18, fontWeight: 900, color: palette.green }}
            >
              All steps complete!
            </div>
            <div style={{ fontSize: 12, color: palette.sub, marginTop: 4 }}>
              You're in the eligible pool for {task.protocol}.
            </div>
          </div>
        )}
      </div>
    </ScreenWrapper>
  );
}
