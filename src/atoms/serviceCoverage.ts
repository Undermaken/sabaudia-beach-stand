import { atom } from "jotai";
import {
  createServiceCoverageReport,
  SERVICE_COVERAGE_ASSUMPTIONS
} from "../utils/serviceCoverage.ts";

export const serviceCoverageMaxRoundTripMinutesAtom = atom(
  SERVICE_COVERAGE_ASSUMPTIONS.maxAcceptableRoundTripMinutes
);

export const serviceCoverageReportAtom = atom(get =>
  createServiceCoverageReport({
    maxAcceptableRoundTripMinutes: get(serviceCoverageMaxRoundTripMinutesAtom)
  })
);

export const serviceCoverageMaxDistanceToStandMetersAtom = atom(
  get => get(serviceCoverageReportAtom).assumptions.maxDistanceToStandMeters
);
