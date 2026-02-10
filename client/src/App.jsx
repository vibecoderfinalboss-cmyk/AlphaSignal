import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import ScreenWrapper from "./components/layout/ScreenWrapper";

import Welcome from "./components/onboarding/Welcome";
import ModeSelect from "./components/onboarding/ModeSelect";
import NicheSelect from "./components/onboarding/NicheSelect";
import ToneSelect from "./components/onboarding/ToneSelect";
import ChainSelect from "./components/onboarding/ChainSelect";
import Disclaimer from "./components/onboarding/Disclaimer";
import TimezoneSetup from "./components/onboarding/TimezoneSetup";
import Loading from "./components/onboarding/Loading";

import Dashboard from "./components/dashboard/Dashboard";
import MissionDetail from "./components/missions/MissionDetail";
import FarmDetail from "./components/farm/FarmDetail";
import Recap from "./components/recap/Recap";
import Profile from "./components/profile/Profile";

function AppRoutes() {
  const { state } = useApp();

  if (!state.onboarded) {
    return (
      <ScreenWrapper>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/onboarding/mode" element={<ModeSelect />} />
          <Route path="/onboarding/niches" element={<NicheSelect />} />
          <Route path="/onboarding/tone" element={<ToneSelect />} />
          <Route path="/onboarding/chains" element={<ChainSelect />} />
          <Route path="/onboarding/disclaimer" element={<Disclaimer />} />
          <Route path="/onboarding/setup" element={<TimezoneSetup />} />
          <Route path="/loading" element={<Loading />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ScreenWrapper>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/mission/:id" element={<MissionDetail />} />
      <Route path="/farm/:id" element={<FarmDetail />} />
      <Route path="/recap" element={<Recap />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
