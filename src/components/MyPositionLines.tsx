import { Layer, Source } from "react-map-gl/mapbox";
import { useAtomValue } from "jotai";
import {
  myPositionAtom,
  myPositionNearbyStandsAtom
} from "../atoms/myPosition.ts";
import { selectedBeachStandAtom } from "../atoms/selectedBeackStand.ts";
import { COLORS } from "../utils/colors.ts";

export const MY_POSITION_LINE_COLORS = [COLORS.prevBeachStandLineColor, COLORS.nextBeachStandLineColor];

export const MyPositionLines = () => {
  const myPosition = useAtomValue(myPositionAtom);
  const nearbyStands = useAtomValue(myPositionNearbyStandsAtom);
  const beachStand = useAtomValue(selectedBeachStandAtom);
  if (!myPosition.position || !myPosition.drawerOpen) {
    return null;
  }
  const lat = myPosition.position?.latitude;
  const lon = myPosition.position?.longitude;

  const closest = nearbyStands.slice(0, 2);

  const lines = (beachStand ? [beachStand] : closest).map(stand => ({
    id: `my-position-line-${stand.id}`,
    data: {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: [
          [lon, lat],
          [stand.coordinates.longitude, stand.coordinates.latitude]
        ]
      }
    }
  }));

  return (
    <>
      {lines.map(({ id, data }, idx) => (
        <Source key={id} id={id} type="geojson" data={data}>
          <Layer
            id={`${id}-layer`}
            type="line"
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={{
              "line-color": MY_POSITION_LINE_COLORS[idx % MY_POSITION_LINE_COLORS.length],
              "line-width": 3,
              "line-dasharray": [2, 2]
            }}
          />
        </Source>
      ))}
    </>
  );
};
