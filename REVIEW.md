# Repository Review: AlphaSignal

## What It Is

A **crypto community engagement app** (subtitled "Your Crypto Copilot") built as a single React component. It has two modes:
1. **Content Creator Mode** — AI-generated tweet missions optimized for Crypto Twitter engagement
2. **Airdrop Farmer Mode** — step-by-step protocol farming tasks with deadline tracking

It includes a gamification layer (XP, streaks, levels) and a multi-step onboarding wizard.

## Structure

The entire application is a **single 809-line JSX file** (`alpha_signal_v2 (1).jsx`) with one git commit. There is no `package.json`, no build configuration, no tests, no README, and no other source files.

---

## Strengths

1. **Complete UI/UX flow** — The onboarding wizard (6 screens), dashboard, mission detail, farm task detail, recap, and profile screens are all implemented and functional.
2. **Well-structured data model** — `NICHES`, `TONES`, `CHAINS`, `CONTENT_MISSIONS`, `FARM_TASKS`, `FEED`, and `LEVELS` are cleanly defined as constants at the top of the file.
3. **Gamification design** — XP system, 6-tier level progression, daily streaks, and a "Dual Mode" 1.5x XP bonus provide user motivation.
4. **Responsible disclosure** — The airdrop farming section includes a legal disclaimer, per-task disclaimers, and source attribution links.
5. **Smooth micro-interactions** — Fade transitions via `nav()`, XP popup animation, celebration overlay on streak milestones, and progress bars with cubic-bezier easing.

---

## Issues and Concerns

### Critical

| # | Issue | Location | Details |
|---|-------|----------|---------|
| 1 | **No persistence** | Entire component | All state (XP, streak, completed tasks, user preferences) is lost on page refresh. `useState` with no `localStorage`, IndexedDB, or backend. |
| 2 | **Hardcoded "today"** | Line 125 | `TODAY_IDX = 2` (Wednesday) is a constant. The app doesn't know what day it actually is. The day selector and streak logic are non-functional in production. |
| 3 | **No project scaffolding** | Root directory | No `package.json`, no bundler config, no dependency management. This file can't be run standalone — it must be manually imported into an existing React project. |

### High

| # | Issue | Location | Details |
|---|-------|----------|---------|
| 4 | **Monolithic 809-line component** | `alpha_signal_v2 (1).jsx:129-809` | 13 `useState` hooks, 11 screen states, and all UI in one function. This is unmaintainable at scale and impossible to unit test. |
| 5 | **Filename contains spaces and parentheses** | `alpha_signal_v2 (1).jsx` | Problematic for imports, CLI tools, and build systems. Should be renamed to something like `AlphaSignal.jsx`. |
| 6 | **Variable naming obscures intent** | Lines 127, 130, 194, 217 | Screen state enum `S` uses cryptic 1-2 char values. State variable `sc` for "screen", `p` for palette, `r` for border radius, `ct` for container style. Readability suffers. |
| 7 | **Components defined inside render** | Lines 197-215 | `Pill`, `Btn`, and `PB` are declared inside `AlphaSignal()`, meaning they are **recreated every render**. This breaks React's reconciliation, prevents memoization, and can cause unexpected behavior. |
| 8 | **Stale closure in streak logic** | Lines 174, 184 | `completeContent` and `completeFarmStep` reference `anyDone` from the render closure, but the state may have changed by the time the `setTimeout` fires. This could double-increment the streak. |

### Medium

| # | Issue | Location | Details |
|---|-------|----------|---------|
| 9 | **No error boundaries** | Entire component | Any render error crashes the whole app with no recovery. |
| 10 | **Inline styles everywhere** | Lines 197-808 | Hundreds of `style={{...}}` objects are created on every render. No CSS classes, no theme system, no responsive breakpoints. |
| 11 | **Single alt tweet** | Lines 57, 65, 73 | `m.alts?.[0]` — only one alternative per mission. The "re-roll" button always returns the same result. |
| 12 | **Clipboard API not awaited** | Line 515 | `navigator.clipboard?.writeText?.(text)` returns a Promise that isn't awaited. Success feedback shown regardless of outcome. |
| 13 | **Accessibility** | Entire component | No ARIA labels, no keyboard navigation support, no focus management, no semantic HTML (divs with onClick instead of buttons). Fails WCAG compliance. |
| 14 | **No responsive design beyond max-width** | Line 217 | `maxWidth: 440` is the only responsive constraint. No media queries, no tablet/desktop layout. |
| 15 | **Hardcoded timezone** | Line 434 | "Africa/Lagos (UTC+1)" is hardcoded. The onboarding step doesn't let users change it. |

### Low

| # | Issue | Location | Details |
|---|-------|----------|---------|
| 16 | **Example/placeholder URLs** | Lines 53, 61, 69 | Sources link to fake URLs like `https://theblock.co/example`. |
| 17 | **Magic numbers** | Throughout | `4000`, `120`, `1800`, `2200`, `3000` — none are named constants. |
| 18 | **XP starts at 520** | Line 138 | `useState(520)` — unclear why a new user begins with 520 XP (already at "Contributor" level). |
| 19 | **Return null at end** | Line 808 | If no screen state matches, the component returns `null` silently. |

---

## Architectural Recommendations

1. **Add persistence** — At minimum, use `localStorage` to save state on change and restore on mount. Ideally, add a backend.
2. **Extract components** — Split into separate files: `Onboarding/`, `Dashboard/`, `MissionDetail/`, `FarmDetail/`, `Recap/`, `Profile/`, and shared UI (`Pill`, `Btn`, `PB`).
3. **Use a router** — Replace the manual `sc`/`nav` system with React Router or a similar solution.
4. **Add a build system** — Set up a `package.json` with Vite or Next.js, add ESLint, add Prettier.
5. **Use real dates** — Replace `TODAY_IDX = 2` with `new Date()` logic.
6. **Move components out of render** — `Pill`, `Btn`, and `PB` should be top-level components (or in separate files).
7. **Add tests** — Component tests for each screen, unit tests for `getLevel`/`getNext`/`addXp` logic.
8. **Rename the file** — `alpha_signal_v2 (1).jsx` → `AlphaSignal.jsx`.

---

## Summary

This is a **well-designed prototype/demo** with solid UX thinking (gamification, progressive onboarding, source transparency for farming tasks). However, it is not production-ready due to the lack of persistence, project scaffolding, testing, accessibility, and the monolithic single-file architecture. The code quality is functional but trades readability for compactness throughout.
