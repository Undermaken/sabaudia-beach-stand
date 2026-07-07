import { useAtomValue, useSetAtom } from "jotai";
import { Marker } from "react-map-gl/mapbox";
import { activeSettingsAtom } from "../atoms/settings.ts";
import { selectedBeachStandAtom } from "../atoms/selectedBeackStand.ts";
import type { BeachStand } from "../data/points.ts";
import { ServiceAreaCircle } from "./ServiceAreaCircle.tsx";
import classes from "./BeachStandMarker.module.css";

type BeachStandProps = {
  beachStand: BeachStand;
};

/**
 * A beach stand shown as a red dot with a white stroke. The name is revealed on
 * click (via the selected-stand drawer). When it matches the selected stand it
 * changes color and pulses, to set it apart from the others.
 */
export const WaypointMarker = ({ beachStand }: BeachStandProps) => {
  const { latitude, longitude } = beachStand.coordinates;
  const selectBeachStand = useSetAtom(selectedBeachStandAtom);
  const selected = useAtomValue(selectedBeachStandAtom);
  const activeSettings = useAtomValue(activeSettingsAtom);
  const isSelected = selected?.id === beachStand.id;
  const showServiceArea = activeSettings.includes("beach_stand_cover_area");

  return (
    <Marker
      latitude={latitude}
      longitude={longitude}
      anchor="center"
      onClick={() => selectBeachStand(beachStand)}
    >
      {showServiceArea && (
        <ServiceAreaCircle
          id={`service-area-${beachStand.id}`}
          center={beachStand.coordinates}
        />
      )}
      <div
        title={beachStand.name}
        className={
          isSelected ? `${classes.dot} ${classes.selected}` : classes.dot
        }
      />
    </Marker>
  );
};
