import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import WelcomePage from "pages/WelcomePage";
import DeviceSelectorPage from "pages/DeviceSelectorPage";
import EmulatorSelectorPage from "pages/EmulatorSelectorPage";
import EmulatorConfigurationPage from "pages/EmulatorConfigurationPage";
import RomStoragePage from "pages/RomStoragePage";
import RomStructurePage from "pages/RomStructurePage";
import AspectRatio2DPage from "pages/AspectRatio2DPage";
import AspectRatio3DPage from "pages/AspectRatio3DPage";
import AspectRatioSNESPage from "pages/AspectRatioSNESPage";
import RABezelsPage from "pages/RABezelsPage";
import PegasusThemePage from "pages/PegasusThemePage";
import EndPage from "pages/EndPage";

const path = `${process.env.PUBLIC_URL}`;

export const AppRouter = () => {
  return (
    <BrowserRouter path={path}>
      <Routes>
        <Route exact path="/" element={<WelcomePage />} />
        <Route exact path="/welcome" element={<WelcomePage />} />
        <Route exact path="/device-selector" element={<DeviceSelectorPage />} />
        <Route
          exact
          path="/emulator-selector"
          element={<EmulatorSelectorPage />}
        />
        <Route
          exact
          path="/emulator-configuration"
          element={<EmulatorConfigurationPage />}
        />
        <Route exact path="/rom-storage" element={<RomStoragePage />} />
        <Route exact path="/rom-structure" element={<RomStructurePage />} />
        <Route exact path="/RA-bezels" element={<RABezelsPage />} />
        <Route exact path="/aspect-ratio-2d" element={<AspectRatio2DPage />} />
        <Route exact path="/aspect-ratio-snes" element={<AspectRatioSNESPage />} />
        <Route exact path="/aspect-ratio-3d" element={<AspectRatio3DPage />} />
        <Route exact path="/pegasus-theme" element={<PegasusThemePage />} />
        <Route exact path="/end" element={<EndPage />} />
      </Routes>
    </BrowserRouter>
  );
};
