import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";
import Tracker from "@openreplay/tracker";
import trackerAssist from "@openreplay/tracker-assist";
import trackerFetch from "@openreplay/tracker-fetch";
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}
const openReplayKey = import.meta.env.VITE_OPENREPLAY_PROJECT_KEY;

if (openReplayKey) {
  const tracker = new Tracker({ projectKey: openReplayKey });

  tracker.use(trackerAssist());
  tracker.use(trackerFetch());

  tracker.start();
}

const root = createRoot(rootElement);
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
