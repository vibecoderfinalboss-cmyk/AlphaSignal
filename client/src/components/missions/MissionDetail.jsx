import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { palette, fonts, cardStyle } from "../../theme";
import { CONTENT_MISSIONS } from "../../constants";
import { useApp } from "../../context/AppContext";
import { copyToClipboard } from "../../utils";
import Pill from "../ui/Pill";
import Button from "../ui/Button";
import ProgressBar from "../ui/ProgressBar";
import ScreenWrapper from "../layout/ScreenWrapper";

export default function MissionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();

  const mission = CONTENT_MISSIONS.find((m) => m.id === id);
  const [editText, setEditText] = useState(mission?.tweet || "");
  const [copied, setCopied] = useState(false);
  const [srcOpen, setSrcOpen] = useState(false);
  const [altIdx, setAltIdx] = useState(0);
  const [xpPop, setXpPop] = useState(0);
  const [celebration, setCelebration] = useState(null);

  if (!mission) {
    navigate("/", { replace: true });
    return null;
  }

  const source = mission.source;
  const charCount = editText.length;
  const isDone = state.completedMissions.includes(mission.id);

  const handleComplete = () => {
    if (isDone) return;
    dispatch({
      type: "COMPLETE_MISSION",
      payload: { missionId: mission.id, xpAmount: mission.xp },
    });
    setXpPop(mission.xp);
    setTimeout(() => setXpPop(0), 1800);

    const hadNoActivity =
      state.completedMissions.length === 0 &&
      !Object.values(state.farmProgress).some((s) => s && s.length > 0);
    if (hadNoActivity) {
      setTimeout(() => {
        setCelebration({ streak: state.streak + 1 });
        setTimeout(() => setCelebration(null), 3000);
      }, 600);
    }
    setTimeout(() => navigate("/"), 1200);
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(editText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReroll = () => {
    const alts = mission.alts || [];
    if (alts.length === 0) return;
    const nextIdx = (altIdx + 1) % (alts.length + 1);
    setAltIdx(nextIdx);
    setEditText(nextIdx === 0 ? mission.tweet : alts[nextIdx - 1]);
  };

  return (
    <ScreenWrapper xpPop={xpPop} celebration={celebration}>
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

        {/* Tags */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 14,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Pill text={mission.type} color={mission.color} filled />
          <Pill text={mission.niche} color="#9CA3AF" />
          <Pill
            text={mission.difficulty}
            color={mission.difficulty === "easy" ? palette.green : palette.orange}
          />
          <span
            style={{ marginLeft: "auto", fontSize: 12, color: palette.sub }}
          >
            {"\u{1F550}"} {mission.time}
          </span>
        </div>

        {/* Source panel */}
        <div
          style={{
            ...cardStyle,
            marginBottom: 12,
            overflow: "hidden",
            border: srcOpen
              ? `2px solid ${palette.orange}44`
              : "2px solid transparent",
          }}
        >
          <button
            onClick={() => setSrcOpen(!srcOpen)}
            aria-expanded={srcOpen}
            aria-label="Toggle source details"
            style={{
              width: "100%",
              padding: "14px 16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: srcOpen ? `${palette.orange}05` : "transparent",
              border: "none",
              textAlign: "left",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: `${palette.orange}12`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              {"\u{1F4F0}"}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 10,
                  color: palette.sub,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                Source
              </div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  lineHeight: 1.3,
                  marginTop: 1,
                  color: palette.text,
                }}
              >
                {source.headline}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: palette.orange,
                  marginTop: 2,
                  fontWeight: 600,
                }}
              >
                {source.publisher} {"\u00B7"} {source.time}
              </div>
            </div>
            <span
              style={{
                fontSize: 16,
                color: palette.sub,
                transition: "transform .2s",
                transform: srcOpen ? "rotate(180deg)" : "none",
              }}
            >
              {"\u25BE"}
            </span>
          </button>

          {srcOpen && (
            <div
              style={{
                padding: "0 16px 16px",
                animation: "fadeIn .2s ease",
              }}
            >
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  background: `${palette.orange}08`,
                  borderRadius: 12,
                  textDecoration: "none",
                  marginBottom: 12,
                }}
              >
                <span>{"\u{1F517}"}</span>
                <span
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: palette.orange,
                    fontWeight: 600,
                  }}
                >
                  Read on {source.publisher}
                </span>
                <span style={{ color: palette.orange }}>{"\u2197"}</span>
              </a>

              <p
                style={{
                  fontSize: 13,
                  color: palette.sub,
                  lineHeight: 1.65,
                  margin: "0 0 12px",
                }}
              >
                {source.summary}
              </p>

              <div
                style={{
                  fontSize: 10,
                  color: palette.orange,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {"\u{1F4CA}"} Key Data
              </div>
              <div
                style={{
                  background: palette.bg,
                  borderRadius: 12,
                  marginBottom: 12,
                }}
              >
                {source.dataPoints.map((d, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 8,
                      padding: "8px 12px",
                      borderBottom:
                        i < source.dataPoints.length - 1
                          ? `1px solid ${palette.muted}`
                          : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: palette.orange,
                        marginTop: 6,
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 12 }}>{d}</span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  fontSize: 10,
                  color: palette.purple,
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {"\u{1F48E}"} Tweetable Nuggets
              </div>
              {source.nuggets.map((nugget, i) => (
                <button
                  key={i}
                  onClick={() => setEditText(nugget)}
                  style={{
                    ...cardStyle,
                    width: "100%",
                    padding: "10px 14px",
                    marginBottom: 6,
                    cursor: "pointer",
                    border: "1px solid transparent",
                    transition: "border .15s",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: palette.text,
                      lineHeight: 1.5,
                    }}
                  >
                    "{nugget}"
                  </div>
                  <div
                    style={{
                      fontSize: 10,
                      color: palette.purple,
                      marginTop: 4,
                      fontWeight: 600,
                    }}
                  >
                    Tap to use {"\u2191"}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tweet editor */}
        <div style={{ ...cardStyle, marginBottom: 12, overflow: "hidden" }}>
          <div
            style={{
              padding: "12px 16px",
              borderBottom: `1px solid ${palette.muted}`,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: `linear-gradient(135deg,${palette.orange},${palette.yellow})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                fontWeight: 900,
                color: "#FFF",
              }}
            >
              {(state.handle || "A")[0].toUpperCase()}
            </div>
            <div style={{ fontWeight: 700 }}>@{state.handle || "you"}</div>
            <div
              style={{
                marginLeft: "auto",
                color: palette.orange,
                fontWeight: 800,
              }}
            >
              +{mission.xp} XP
            </div>
          </div>
          <label htmlFor="tweet-editor" className="skip-link">
            Edit tweet
          </label>
          <textarea
            id="tweet-editor"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            aria-label="Tweet editor"
            maxLength={280}
            style={{
              width: "100%",
              minHeight: 120,
              padding: 16,
              background: "none",
              border: "none",
              color: palette.text,
              fontSize: 14,
              lineHeight: 1.6,
              fontFamily: "-apple-system, sans-serif",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "8px 16px",
              borderTop: `1px solid ${palette.muted}`,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: charCount > 270 ? palette.red : palette.sub,
                fontWeight: 600,
              }}
              aria-live="polite"
            >
              {charCount}/280
            </span>
            <div style={{ width: 80 }}>
              <ProgressBar
                value={charCount}
                max={280}
                color={charCount > 260 ? palette.red : palette.blue}
                height={3}
              />
            </div>
          </div>
        </div>

        {/* Re-roll */}
        <button
          onClick={handleReroll}
          style={{
            width: "100%",
            padding: 12,
            ...cardStyle,
            border: "none",
            color: palette.sub,
            fontSize: 13,
            fontFamily: fonts.body,
            cursor: "pointer",
            fontWeight: 600,
            marginBottom: 12,
          }}
        >
          {"\u{1F504}"} Re-roll — different version
        </button>

        {/* Rationale */}
        <div style={{ ...cardStyle, padding: 14, marginBottom: 16 }}>
          <div
            style={{
              fontSize: 10,
              color: palette.orange,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 4,
            }}
          >
            {"\u{1F4A1}"} Why this works
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: palette.sub,
              lineHeight: 1.5,
            }}
          >
            {mission.rationale}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8 }}>
          <Button ghost fullWidth onClick={handleCopy}>
            {copied ? "\u2713 Copied!" : "\u{1F4CB} Copy"}
          </Button>
          <Button
            fullWidth
            disabled={isDone}
            onClick={handleComplete}
            color={palette.green}
          >
            {isDone ? "\u2713 Done" : "\u2705 Posted it"}
          </Button>
        </div>
      </div>
    </ScreenWrapper>
  );
}
