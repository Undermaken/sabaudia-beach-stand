import { Layer, Source } from "react-map-gl/mapbox";
import { useAtomValue } from "jotai";
import {
  selectedBeachStandAtom,
  selectedBeachStandNeighbors
} from "../atoms/selectedBeackStand.ts";
import { COLORS } from "../utils/colors.ts";
import { myPositionAtom } from "../atoms/myPosition.ts";
import { isNotNullish } from "../utils/typeGuards.ts";

export const NeighborLines = () => {
  const beachStand = useAtomValue(selectedBeachStandAtom);
  const neighbors = useAtomValue(selectedBeachStandNeighbors);
  const myPosition = useAtomValue(myPositionAtom);

  if (myPosition.active || !beachStand) return null;

  const nextNeighbor = neighbors.find(n => n.direction === "next");
  const previousNeighbor = neighbors.find(n => n.direction === "previous");

  const lines = [nextNeighbor, previousNeighbor]
    .filter(isNotNullish)
    .map(neighbor => ({
      id: `neighbor-line-${neighbor.id}`,
      color:
        neighbor.direction === "next"
          ? COLORS.nextBeachStandLineColor
          : COLORS.prevBeachStandLineColor,
      data: {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "LineString" as const,
          coordinates: [
            [neighbor.coordinates.longitude, neighbor.coordinates.latitude],
            [beachStand.coordinates.longitude, beachStand.coordinates.latitude]
          ]
        }
      }
    }));

  return (
    <>
      {lines.map(({ id, color, data }) => (
        <Source key={id} id={id} type="geojson" data={data}>
          <Layer
            id={`${id}-layer`}
            type="line"
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={{
              "line-color": color,
              "line-width": 3,
              "line-dasharray": [2, 2]
            }}
          />
        </Source>
      ))}
    </>
  );
};
