import { useRef } from "react";
import { useControl } from "react-map-gl/mapbox";

const RESET_VIEW_ICON =
  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#333333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:auto"><path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4"/></svg>';

export const ResetViewControl = ({ onReset }: { onReset: () => void }) => {
  const onResetRef = useRef(onReset);
  onResetRef.current = onReset;

  useControl(
    () => {
      const container = document.createElement("div");
      container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
      const button = document.createElement("button");
      button.type = "button";
      button.title = "Reimposta vista";
      button.setAttribute("aria-label", "Reimposta vista");
      button.innerHTML = RESET_VIEW_ICON;
      button.addEventListener("click", () => onResetRef.current());
      container.appendChild(button);
      return { onAdd: () => container, onRemove: () => container.remove() };
    },
    { position: "top-right" }
  );

  return null;
};
