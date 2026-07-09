import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type {
  SegmentSummary,
  ServiceCoverageReport,
  UnservedStandGap
} from "./serviceCoverage.ts";

type ReportProps = {
  report: ServiceCoverageReport;
};

type MetricTone = "amber" | "coral" | "violet" | "";

const integerFormatter = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 0
});
const decimalFormatter = new Intl.NumberFormat("it-IT", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2
});
const euroFormatter = new Intl.NumberFormat("it-IT", {
  currency: "EUR",
  maximumFractionDigits: 0,
  style: "currency"
});

const formatInteger = (value: number) => integerFormatter.format(value);
const formatKilometers = (meters: number) =>
  `${decimalFormatter.format(meters / 1000)} km`;
const formatMeters = (meters: number) => `${decimalFormatter.format(meters)} m`;
const formatPercent = (ratio: number) =>
  `${decimalFormatter.format(ratio * 100)}%`;
const formatEuro = (value: number) => euroFormatter.format(value);

const getSegmentLabel = (gap: UnservedStandGap) => {
  if (gap.routeSegment === "north") {
    return "Nord";
  }

  if (gap.routeSegment === "south") {
    return "Sud";
  }

  return "Fuori confronto";
};

const getReportStyles = () => `
  @page {
    margin: 12mm;
    size: A4;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #17211f;
    font-family:
      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
      "Segoe UI", sans-serif;
    font-size: 12px;
    line-height: 1.45;
    overflow: visible;
  }

  body {
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }

  .toolbar {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px;
    border-bottom: 1px solid #e2ded2;
    background: #ffffff;
  }

  .toolbar button {
    border: 0;
    border-radius: 6px;
    padding: 10px 14px;
    background: #0f766e;
    color: #ffffff;
    font-weight: 700;
    cursor: pointer;
  }

  .page {
    width: 100%;
    max-width: 186mm;
    margin: 0 auto;
  }

  .hero {
    padding: 16mm 0 8mm;
    border-bottom: 2px solid #17211f;
  }

  .badge {
    display: inline-block;
    margin-bottom: 10px;
    border-radius: 4px;
    padding: 5px 8px;
    background: #d9901d;
    color: #ffffff;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  h1,
  h2,
  h3,
  p {
    margin: 0;
  }

  h1 {
    max-width: 150mm;
    font-size: 34px;
    line-height: 0.98;
    letter-spacing: 0;
  }

  h2 {
    margin-bottom: 12px;
    font-size: 20px;
    line-height: 1.1;
  }

  h3 {
    font-size: 15px;
    line-height: 1.2;
  }

  .lead {
    max-width: 160mm;
    margin-top: 12px;
    color: #33413c;
    font-size: 13px;
  }

  .section {
    padding: 9mm 0;
    border-bottom: 1px solid #e7e1d6;
    break-inside: avoid;
  }

  .section.split-ok {
    break-inside: auto;
  }

  .eyebrow {
    margin-bottom: 4px;
    color: #b45309;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .grid {
    display: grid;
    gap: 10px;
  }

  .grid-2 {
    grid-template-columns: repeat(2, 1fr);
  }

  .grid-3 {
    grid-template-columns: repeat(3, 1fr);
  }

  .grid-4 {
    grid-template-columns: repeat(4, 1fr);
  }

  .card {
    min-height: 32mm;
    padding: 12px;
    border: 1px solid #e2ded2;
    border-top: 4px solid #0f766e;
    border-radius: 6px;
    background: #ffffff;
    break-inside: avoid;
  }

  .card.coral {
    border-top-color: #dc5f45;
  }

  .card.violet {
    border-top-color: #7c3aed;
  }

  .card.amber {
    border-top-color: #d9901d;
  }

  .label {
    color: #66736d;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .value {
    margin-top: 5px;
    color: #17211f;
    font-size: 24px;
    font-weight: 900;
    line-height: 1;
  }

  .detail {
    margin-top: 6px;
    color: #5c6863;
    font-size: 10px;
  }

  .assumption {
    padding: 12px;
    border: 1px solid #d8e4df;
    border-radius: 6px;
    background: #f8fffc;
    break-inside: avoid;
  }

  .route-panel {
    padding: 14px;
    border: 1px solid #e2ded2;
    border-radius: 6px;
    background: #ffffff;
    break-inside: avoid;
  }

  .route-rail {
    position: relative;
    height: 16mm;
    margin-top: 10px;
    border-radius: 6px;
    background:
      linear-gradient(#d2ddd8, #d2ddd8) center / 100% 4px no-repeat,
      #f1f5f3;
  }

  .unserved-band {
    position: absolute;
    top: 6.2mm;
    height: 4mm;
    border-radius: 999px;
    background: #dc5f45;
  }

  .route-dot {
    position: absolute;
    top: 50%;
    width: 3.6mm;
    height: 3.6mm;
    border: 1px solid #ffffff;
    border-radius: 999px;
    background: #0f766e;
    transform: translate(-50%, -50%);
  }

  .route-dot.north {
    background: #d9901d;
  }

  .route-dot.outside {
    background: #7d8782;
  }

  .coverage-bar {
    display: flex;
    width: 100%;
    height: 5mm;
    overflow: hidden;
    border-radius: 999px;
    background: #ede8dc;
  }

  .coverage-served {
    background: #0f766e;
  }

  .coverage-unserved {
    background: #dc5f45;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    break-inside: auto;
  }

  tr {
    break-inside: avoid;
  }

  th,
  td {
    padding: 8px;
    border-bottom: 1px solid #e7e1d6;
    text-align: left;
    vertical-align: top;
  }

  th {
    color: #66736d;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .pill {
    display: inline-block;
    border-radius: 4px;
    padding: 3px 6px;
    background: #e8f4f1;
    color: #0f766e;
    font-size: 10px;
    font-weight: 800;
  }

  .pill.north {
    background: #fff2d6;
    color: #9a5b00;
  }

  .gap-meter {
    height: 5px;
    margin-top: 4px;
    overflow: hidden;
    border-radius: 999px;
    background: #f1d8d0;
  }

  .gap-meter-fill {
    height: 100%;
    border-radius: inherit;
    background: #dc5f45;
  }

  .note {
    padding: 12px;
    border: 1px solid #f0d9a8;
    border-radius: 6px;
    background: #fff9ed;
    break-inside: avoid;
  }

  .mt-8 {
    margin-top: 8px;
  }

  .mt-12 {
    margin-top: 12px;
  }

  @media print {
    .toolbar {
      display: none;
    }

    .section,
    .card,
    .assumption,
    .route-panel,
    .note {
      box-shadow: none;
    }
  }
`;

const getPrintScript = () => `
  document
    .querySelector("[data-print-button]")
    ?.addEventListener("click", () => window.print());

  window.addEventListener("load", () => {
    window.focus();
    window.setTimeout(() => window.print(), 250);
  });
`;

const MetricCard = ({
  detail,
  label,
  tone = "",
  value
}: {
  detail: string;
  label: string;
  tone?: MetricTone;
  value: string;
}) => (
  <article className={tone ? `card ${tone}` : "card"}>
    <p className="label">{label}</p>
    <p className="value">{value}</p>
    <p className="detail">{detail}</p>
  </article>
);

const Assumption = ({
  detail,
  label,
  value
}: {
  detail: string;
  label: string;
  value: string;
}) => (
  <article className="assumption">
    <p className="value">{value}</p>
    <p className="mt-8">
      <strong>{label}</strong>
    </p>
    <p className="detail">{detail}</p>
  </article>
);

const RouteMap = ({ report }: ReportProps) => {
  const maxPosition = report.totalMeasuredLineMeters || 1;

  return (
    <div className="route-panel">
      <strong>Linea dei servizi tracciati</strong>
      <p className="detail">
        Rosso = tratto non servito, punti = servizi tracciati.
      </p>
      <div className="route-rail">
        {report.unservedStandGaps.map(gap => {
          const left =
            ((gap.startOffsetMeters +
              report.assumptions.maxDistanceToStandMeters) /
              maxPosition) *
            100;
          const width = (gap.unservedSpanMeters / maxPosition) * 100;

          return (
            <span
              key={`${gap.standA.id}-${gap.standB.id}`}
              className="unserved-band"
              style={{ left: `${left}%`, width: `${width}%` }}
            />
          );
        })}
        {report.standRoutePositions.map(position => {
          const segmentClass =
            position.routeSegment === "north"
              ? "north"
              : position.routeSegment === "outsideComparison"
                ? "outside"
                : "";

          return (
            <span
              key={position.stand.id}
              className={
                segmentClass ? `route-dot ${segmentClass}` : "route-dot"
              }
              style={{ left: `${position.positionRatio * 100}%` }}
              title={position.stand.name}
            />
          );
        })}
      </div>
      <div className="grid grid-2 mt-8">
        <p className="detail">Latina / Bufalara</p>
        <p className="detail" style={{ textAlign: "right" }}>
          San Felice / Saporetti
        </p>
      </div>
    </div>
  );
};

const CoverageBar = ({
  label,
  servedMeters,
  unservedMeters
}: {
  label: string;
  servedMeters: number;
  unservedMeters: number;
}) => {
  const totalMeters = servedMeters + unservedMeters;
  const unservedRatio = totalMeters > 0 ? unservedMeters / totalMeters : 0;

  return (
    <div className="mt-12">
      <div className="grid grid-2">
        <strong>{label}</strong>
        <strong style={{ color: "#b42318", textAlign: "right" }}>
          {formatPercent(unservedRatio)} non servito
        </strong>
      </div>
      <div className="coverage-bar mt-8">
        <div
          className="coverage-served"
          style={{ width: `${(1 - unservedRatio) * 100}%` }}
        />
        <div
          className="coverage-unserved"
          style={{ width: `${unservedRatio * 100}%` }}
        />
      </div>
      <div className="grid grid-2 mt-8">
        <p className="detail">Servito: {formatKilometers(servedMeters)}</p>
        <p className="detail" style={{ textAlign: "right" }}>
          Non servito: {formatKilometers(unservedMeters)}
        </p>
      </div>
    </div>
  );
};

const CriticalGapsTable = ({ report }: ReportProps) => {
  const maxUnservedSpan = Math.max(
    1,
    ...report.unservedStandGaps.map(gap => gap.unservedSpanMeters)
  );

  return (
    <table>
      <thead>
        <tr>
          <th>Tratta</th>
          <th>Distanza</th>
          <th>Cammino</th>
          <th>Vuoto stimato</th>
          <th>Zona</th>
        </tr>
      </thead>
      <tbody>
        {report.unservedStandGaps.map(gap => (
          <tr key={`${gap.standA.id}-${gap.standB.id}`}>
            <td>
              <strong>{gap.standA.name}</strong>
              <p className="detail">verso {gap.standB.name}</p>
            </td>
            <td>{formatKilometers(gap.distanceMeters)}</td>
            <td>{formatInteger(gap.walkingMinutes)} min</td>
            <td>
              <strong>{formatMeters(gap.unservedSpanMeters)}</strong>
              <div className="gap-meter">
                <div
                  className="gap-meter-fill"
                  style={{
                    width: `${(gap.unservedSpanMeters / maxUnservedSpan) * 100}%`
                  }}
                />
              </div>
            </td>
            <td>
              <span
                className={gap.routeSegment === "north" ? "pill north" : "pill"}
              >
                {getSegmentLabel(gap)}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const SegmentPanel = ({ segment }: { segment: SegmentSummary }) => (
  <article className={segment.key === "north" ? "card amber" : "card"}>
    <p className="label">{segment.label}</p>
    <h3>
      {segment.fromStandName} {"->"} {segment.toStandName}
    </h3>
    <p className="value">{formatPercent(segment.unservedSpanRatio)}</p>
    <p className="detail">Spazio non servito nella tratta</p>
    <CoverageBar
      label="Spazio della tratta"
      servedMeters={segment.distanceMeters - segment.unservedSpanMeters}
      unservedMeters={segment.unservedSpanMeters}
    />
    <div className="grid grid-3 mt-12">
      <p>
        <span className="label">Lunghezza</span>
        <br />
        <strong>{formatKilometers(segment.distanceMeters)}</strong>
      </p>
      <p>
        <span className="label">Distanza media</span>
        <br />
        <strong>{formatKilometers(segment.averageGapMeters)}</strong>
      </p>
      <p>
        <span className="label">Servizi</span>
        <br />
        <strong>{formatInteger(segment.standCount)}</strong>
      </p>
    </div>
  </article>
);

const ServiceCoveragePrintDocument = ({ report }: ReportProps) => {
  const { assumptions, economicImpact, segmentSummaries } = report;

  return (
    <>
      <div className="toolbar">
        <button type="button" data-print-button="true">
          Stampa / salva PDF
        </button>
      </div>
      <main className="page">
        <section className="hero">
          <span className="badge">Lungomare di Sabaudia</span>
          <h1>Ho provato a far parlare i numeri</h1>
          <p className="lead">
            Intorno ai servizi sul lungomare di Sabaudia c'è una grande
            polemica. Io, però, faccio fatica a capire davvero l'impatto se non
            provo a tradurlo in numeri. Per questo ho fatto un esercizio
            semplice e personale: segnare sulla mappa tutti i punti in cui puoi
            acquistare e consumare cibo e bevande, e usare i servizi igienici.
            Spero di averli inclusi tutti. Da lì ho fatto alcune assunzioni,
            dichiarate, e ho lasciato che fossero i numeri a raccontare il
            resto.
          </p>
          <div className="grid grid-3 mt-12">
            <MetricCard
              label="Tempo massimo"
              value={`${assumptions.maxAcceptableRoundTripMinutes} min`}
              detail="andata e ritorno"
            />
            <MetricCard
              label="Distanza utile"
              value={formatMeters(assumptions.maxDistanceToStandMeters)}
              detail="massimo da un servizio"
            />
            <MetricCard
              label="Punti tracciati"
              value={formatInteger(report.standCount)}
              detail="sulla linea costiera"
            />
          </div>
        </section>

        <section className="section">
          <p className="eyebrow">Sintesi</p>
          <h2>Il problema in quattro numeri</h2>
          <div className="grid grid-2">
            <MetricCard
              label="Lunghezza lungomare"
              value={formatKilometers(report.totalMeasuredLineMeters)}
              detail="stimata seguendo la sequenza dei punti di servizio tracciati"
            />
            <MetricCard
              label="Spazio non servito"
              value={formatKilometers(report.totalUnservedSpanMeters)}
              detail={`${formatPercent(report.totalUnservedSpanRatio)} della lunghezza stimata`}
              tone="coral"
            />
            <MetricCard
              label="Persone al giorno"
              value={formatInteger(economicImpact.dailyPeopleImpacted)}
              detail="potenzialmente impattate dalle tratte scoperte"
              tone="violet"
            />
            <MetricCard
              label="Opportunità"
              value={formatEuro(economicImpact.dailyEconomicOpportunityEuros)}
              detail="stima giornaliera, con ipotesi dichiarate"
              tone="amber"
            />
          </div>
        </section>

        <section className="section">
          <p className="eyebrow">Metodo</p>
          <h2>Le ipotesi di partenza</h2>
          <div className="grid grid-4">
            <Assumption
              label="Camminata"
              value={`${assumptions.walkingSpeedKmH} km/h`}
              detail="velocità media stimata per un adulto"
            />
            <Assumption
              label="Tempo massimo"
              value={`${assumptions.maxAcceptableRoundTripMinutes} min`}
              detail="andata e ritorno per raggiungere un punto di servizio"
            />
            <Assumption
              label="Auto parcheggiata"
              value={`${assumptions.averageParkedVehicleLengthMeters} m`}
              detail="ingombro medio"
            />
            <Assumption
              label="Ricambio"
              value={formatPercent(assumptions.vehicleDailyTurnoverRatio)}
              detail="quota di posti che si libera e viene rioccupata nello stesso giorno"
            />
          </div>
        </section>

        <section className="section">
          <p className="eyebrow">Mappa lineare</p>
          <h2>Dove si apre il vuoto</h2>
          <RouteMap report={report} />
          <CoverageBar
            label="Copertura teorica complessiva"
            servedMeters={report.totalServedSpanMeters}
            unservedMeters={report.totalUnservedSpanMeters}
          />
        </section>

        <section className="section split-ok">
          <p className="eyebrow">Tratte critiche</p>
          <h2>I buchi più evidenti</h2>
          <CriticalGapsTable report={report} />
        </section>

        <section className="section">
          <p className="eyebrow">Impatto</p>
          <h2>Dal vuoto alle persone</h2>
          <div className="grid grid-3">
            <MetricCard
              label="Spazio vuoto"
              value={formatKilometers(report.totalUnservedSpanMeters)}
              detail="somma degli spazi centrali non coperti"
            />
            <MetricCard
              label="Auto al giorno"
              value={formatInteger(economicImpact.dailyVehiclesWithTurnover)}
              detail={`${formatPercent(assumptions.vehicleDailyTurnoverRatio)} dei posti auto stimati si libera e viene rioccupato nella stessa giornata`}
              tone="amber"
            />
            <MetricCard
              label="Persone al giorno"
              value={formatInteger(economicImpact.dailyPeopleImpacted)}
              detail={`${assumptions.averagePeoplePerVehicle} persone per veicolo`}
              tone="violet"
            />
            <MetricCard
              label="Valore giornaliero"
              value={formatEuro(economicImpact.dailyEconomicOpportunityEuros)}
              detail={`${formatEuro(assumptions.averageExpensePerPersonEuros)} medi a persona`}
              tone="amber"
            />
            <MetricCard
              label="Ordine di grandezza"
              value={formatEuro(
                economicImpact.seasonalEconomicOpportunityEuros
              )}
              detail={`${assumptions.fullUnservedSpanDays} giorni estivi in cui considero pieni gli spazi non serviti`}
              tone="coral"
            />
          </div>
        </section>

        <section className="section">
          <p className="eyebrow">Distribuzione</p>
          <h2>Nord e sud non si assomigliano</h2>
          <div className="grid grid-2">
            <SegmentPanel segment={segmentSummaries.north} />
            <SegmentPanel segment={segmentSummaries.south} />
          </div>
          <div className="note mt-12">
            <strong>La distribuzione pesa più del numero assoluto.</strong>
            <p className="mt-8">
              La tratta Nord, da {segmentSummaries.north.fromStandName} fino a{" "}
              {segmentSummaries.north.toStandName}, è quella che soffre di più:
              oltre {formatPercent(segmentSummaries.north.unservedSpanRatio)}{" "}
              della sua lunghezza resta fuori dalla copertura teorica. A sud la
              percentuale scende a{" "}
              {formatPercent(segmentSummaries.south.unservedSpanRatio)}. Per me
              il punto è qui: non basta contare quanti servizi esistono, bisogna
              guardare dove sono distribuiti.
            </p>
          </div>
        </section>
      </main>
    </>
  );
};

export const createServiceCoverageReportHtml = (
  report: ServiceCoverageReport
) => {
  const reportMarkup = renderToStaticMarkup(
    React.createElement(ServiceCoveragePrintDocument, { report })
  );

  return `<!doctype html>
    <html lang="it">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Report servizi lungomare Sabaudia</title>
        <style>${getReportStyles()}</style>
      </head>
      <body>
        ${reportMarkup}
        <script>${getPrintScript()}</script>
      </body>
    </html>`;
};

export const openServiceCoverageReportPrintDocument = (
  report: ServiceCoverageReport
) => {
  const printWindow = window.open("", "_blank", "width=1024,height=1200");

  if (!printWindow) {
    window.alert(
      "Il browser ha bloccato l'apertura della finestra per il PDF. Abilita i popup per questo sito e riprova."
    );
    return;
  }

  printWindow.document.open();
  printWindow.document.write(createServiceCoverageReportHtml(report));
  printWindow.document.close();
};
