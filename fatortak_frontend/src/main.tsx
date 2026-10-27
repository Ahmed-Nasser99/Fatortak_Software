import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import Tracker from "@openreplay/tracker";
import trackerAssist from "@openreplay/tracker-assist";
import trackerFetch from "@openreplay/tracker-fetch";
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}
const tracker = new Tracker({ projectKey: "VGhrpcIasBKj6b0n5ajq" });

tracker.use(trackerAssist());
tracker.use(trackerFetch());

tracker.start();
const root = createRoot(rootElement);
root.render(<App />);
