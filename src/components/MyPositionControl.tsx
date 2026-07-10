import { useRef } from "react";
import { useControl } from "react-map-gl/mapbox";

const ACTIVE_COLOR = "#1885d7";

const makeLocationIcon = (stroke: string, fill: string) =>
  `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:auto"><circle cx="12" cy="12" r="4" fill="${fill}"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>`;

export const MyPositionControl = ({
  active,
  onToggle
}: {
  active: boolean;
  onToggle: () => void;
}) => {
  const onToggleRef = useRef(onToggle);
  onToggleRef.current = onToggle;

  useControl(
    () => {
      const container = document.createElement("div");
      container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";
      const button = document.createElement("button");
      button.type = "button";
      button.title = "La mia posizione";
      button.setAttribute("aria-label", "La mia posizione");
      button.style.borderRadius = "4px";
      if (active) {
        button.style.cssText += `background-color: ${ACTIVE_COLOR} !important;`;
        button.innerHTML = makeLocationIcon("#ffffff", "#ffffff");
      } else {
        button.innerHTML = makeLocationIcon("#333333", "none");
      }
      button.addEventListener("click", () => onToggleRef.current());
      container.appendChild(button);
      return { onAdd: () => container, onRemove: () => container.remove() };
    },
    { position: "top-right" }
  );

  return null;
};
