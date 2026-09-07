import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const SW_RELOAD = "sproutling.sw-reloaded";

async function watchForUpdates() {
  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });

  const check = () => {
    void registration.update();
  };

  check();
  window.setInterval(check, 60 * 1000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") check();
  });
  window.addEventListener("focus", check);
  window.addEventListener("online", check);

  const takeOver = (worker: ServiceWorker | null) => {
    worker?.postMessage({ type: "SKIP_WAITING" });
  };

  if (registration.waiting) takeOver(registration.waiting);
  registration.addEventListener("updatefound", () => {
    const worker = registration.installing;
    if (!worker) return;
    worker.addEventListener("statechange", () => {
      if (worker.state === "installed" && navigator.serviceWorker.controller) takeOver(worker);
    });
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (sessionStorage.getItem(SW_RELOAD)) return;
    sessionStorage.setItem(SW_RELOAD, "1");
    window.location.reload();
  });
}

void watchForUpdates();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
