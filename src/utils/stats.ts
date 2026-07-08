import { beachStands, type BeachStand } from "../data/points.ts";
import {
  estimateTimeByDistance,
  haversineDistance,
  type MovingMode
} from "./map.ts";
import { formatDuration } from "./time.ts";

type Meter = number;
type MaxDistanceBeetweenStand = {
  distance: number;
  standA: BeachStand;
  standB: BeachStand;
};

const formatWalkingTime = (times: Record<MovingMode, number>) =>
  `${formatDuration(times.walking)} (camminata)`;

const stats = () => {
  const distanceBetweenStands: MaxDistanceBeetweenStand[] = [];
  const totalLineCovered: Meter = beachStands.reduce((acc, curr, idx) => {
    if (idx + 1 >= beachStands.length) {
      return acc;
    }

    const next = beachStands[idx + 1];
    const distanceBetween = haversineDistance(
      curr.coordinates,
      next.coordinates
    );

    distanceBetweenStands.push({
      distance: distanceBetween,
      standA: curr,
      standB: next
    });

    return acc + distanceBetween;
  }, 0);

  console.log(
    `Linea totale coperta: ${(totalLineCovered / 1000).toFixed(2)}km`
  );

  // it they are uniform distributed
  const standPerMeters = totalLineCovered / beachStands.length;

  console.log(
    `Un servizio ogni: ${(standPerMeters / 1000).toFixed(2)}km (${formatWalkingTime(estimateTimeByDistance(standPerMeters))})`
  );

  distanceBetweenStands.sort((a, b) => b.distance - a.distance);
  distanceBetweenStands.forEach(s =>
    console.log(
      `${(s.distance / 1000).toFixed(2)}km tra ${s.standA.name} e ${s.standB.name} (${formatWalkingTime(estimateTimeByDistance(s.distance))})`
    )
  );
};

stats();
