import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  SimpleGrid,
  Slider,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
  Tooltip
} from "@mantine/core";
import {
  IconBeach,
  IconCar,
  IconChartBar,
  IconCurrencyEuro,
  IconFileTypePdf,
  IconGripVertical,
  IconSettings,
  type IconProps,
  IconRoute,
  IconUsers,
  IconWalk,
  IconX
} from "@tabler/icons-react";
import { useAtom, useAtomValue } from "jotai";
import { useRef, type ComponentType, type ReactNode } from "react";
import { useReactToPrint } from "react-to-print";
import {
  serviceCoverageMaxRoundTripMinutesAtom,
  serviceCoverageReportAtom
} from "../atoms/serviceCoverage.ts";
import {
  type SegmentSummary,
  type ServiceCoverageReport,
  type UnservedStandGap
} from "../utils/serviceCoverage.ts";
import { serviceCoveragePrintPageStyle } from "../utils/serviceCoveragePrint.ts";
import classes from "./ServiceCoverageReportModal.module.css";
import {
  formatEuro,
  formatInteger,
  formatKilometers,
  formatMeters,
  formatPercent,
  formatWalkingMinutes
} from "../utils/units.ts";

type ServiceCoverageReportModalProps = {
  opened: boolean;
  onClose: () => void;
};

type IconComponent = ComponentType<IconProps>;
type ReportMode = "print" | "screen";
type ReportProps = {
  report: ServiceCoverageReport;
};
type InteractiveReportProps = ReportProps & {
  maxRoundTripMinutes: number;
  onMaxRoundTripMinutesChange: (value: number) => void;
  mode: ReportMode;
};

const getSegmentLabel = (gap: UnservedStandGap) => {
  if (gap.routeSegment === "north") {
    return "Nord";
  }

  if (gap.routeSegment === "south") {
    return "Sud";
  }

  return "Fuori confronto";
};

export const ServiceCoverageReportModal = ({
  opened,
  onClose
}: ServiceCoverageReportModalProps) => {
  const [maxRoundTripMinutes, setMaxRoundTripMinutes] = useAtom(
    serviceCoverageMaxRoundTripMinutesAtom
  );
  const report = useAtomValue(serviceCoverageReportAtom);
  const printContentRef = useRef<HTMLDivElement>(null);
  const printReport = useReactToPrint({
    contentRef: printContentRef,
    documentTitle: () =>
      `Report servizi lungomare Sabaudia - ${maxRoundTripMinutes} minuti`,
    pageStyle: serviceCoveragePrintPageStyle
  });

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="1120px"
      padding={0}
      radius="md"
      withCloseButton={false}
      withinPortal
      classNames={{
        body: classes.modalBody,
        content: classes.modalContent,
        inner: classes.modalInner,
        overlay: classes.modalOverlay,
        root: classes.modalRoot
      }}
    >
      <Box
        className={`${classes.reportShell} ${classes.printRoot} service-report-print-root`}
      >
        <Group
          justify="space-between"
          wrap="nowrap"
          className={`${classes.modalToolbar} ${classes.noPrint}`}
        >
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon color="teal" variant="light" radius="md" size={36}>
              <IconChartBar size={20} />
            </ThemeIcon>
            <Text fw={700}>Report sui servizi</Text>
          </Group>
          <Group gap="xs" wrap="nowrap">
            <Button
              leftSection={<IconFileTypePdf size={18} />}
              onClick={() => printReport()}
              variant="filled"
              color="teal"
            >
              Scarica PDF
            </Button>
            <Tooltip label="Chiudi">
              <ActionIcon
                aria-label="Chiudi report"
                onClick={onClose}
                variant="subtle"
                color="gray"
              >
                <IconX size={20} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>

        <ServiceCoverageReportContent
          mode="screen"
          report={report}
          maxRoundTripMinutes={maxRoundTripMinutes}
          onMaxRoundTripMinutesChange={setMaxRoundTripMinutes}
        />
      </Box>
      <Box className={classes.printHost} aria-hidden="true">
        <Box
          ref={printContentRef}
          className={`${classes.reportShell} ${classes.printRoot} ${classes.printDocument}`}
        >
          <ServiceCoverageReportContent
            mode="print"
            report={report}
            maxRoundTripMinutes={maxRoundTripMinutes}
            onMaxRoundTripMinutesChange={setMaxRoundTripMinutes}
          />
        </Box>
      </Box>
    </Modal>
  );
};

const ServiceCoverageReportContent = ({
  maxRoundTripMinutes,
  mode,
  onMaxRoundTripMinutesChange,
  report
}: InteractiveReportProps) => (
  <>
    <Section title="Quanto tempo sei disposto a camminare?">
      <WalkingTimeControl
        mode={mode}
        report={report}
        value={maxRoundTripMinutes}
        onChange={onMaxRoundTripMinutesChange}
      />
    </Section>
    <ReportHero report={report} />
    <ReportBody report={report} />
  </>
);

const ReportHero = ({ report }: ReportProps) => {
  const { assumptions } = report;

  return (
    <Box className={classes.hero}>
      <Stack gap="lg" className={classes.heroContent}>
        <Badge color="orange" variant="filled" radius="sm">
          Lungomare di Sabaudia
        </Badge>
        <Title order={1} className={classes.heroTitle}>
          Ho provato a far parlare i numeri
        </Title>
        <Text className={classes.heroText}>
          Intorno ai servizi sul lungomare di Sabaudia c'è una gran discussione.
          <br />
          <br />
          Non sono interessato alle ragioni per cui c'è questo scenario. Questo
          è un discorso per la politica.
          <br />
          <br />
          Piuttosto mi sono domandato: <br />"
          <i>
            Se scelgo casualmente un punto della costa di Sabaudia, qual è la
            probabilità che il servizio più vicino si trovi oltre la distanza
            che sono disposto a percorrere a piedi?
          </i>
          "<br />
          <br />
          Quindi ho fatto questo: ho segnato su mappa tutti i punti di servizio
          (bar, ristori e chioschi) e ho fatto un po' di conti.
          <br />
          <br />I conti si basano su un'assunzione: sono disposto a camminare
          per <b>{assumptions.maxAcceptableRoundTripMinutes}</b> minuti e sulla
          base di questo ho cercato di capire quanto tratto del litorale è
          "fuori" dalla portata di questo parametro.
          <br />
          Ovviamente questo parametro può essere variato, sia aumentandolo, sia
          diminuendolo. L'app aggiornerà tutti i calcoli di conseguenza.
        </Text>
        <SimpleGrid
          cols={{ base: 1, sm: 3 }}
          spacing="sm"
          className={`${classes.heroFacts} ${classes.printGrid3}`}
        >
          <HeroFact
            label="Tempo massimo"
            value={`${assumptions.maxAcceptableRoundTripMinutes} min`}
            detail="tempo massimo di andata e ritorno per raggiungere un punto di servizio"
          />
          <HeroFact
            label="Distanza utile"
            value={formatMeters(assumptions.maxDistanceToStandMeters)}
            detail={`distanza massima da un punto di servizio (che in totale diventa ${formatMeters(assumptions.maxDistanceToStandMeters * 2)}) `}
          />
          <HeroFact
            label="Punti tracciati"
            value={formatInteger(report.standCount)}
            detail="sulla linea costiera"
          />
        </SimpleGrid>
      </Stack>
    </Box>
  );
};

const ReportBody = ({ report }: ReportProps) => {
  const { assumptions, economicImpact } = report;

  return (
    <Stack gap={0} className={classes.reportBody}>
      <Section eyebrow="Sintesi" title="Il problema in quattro numeri">
        <SimpleGrid
          cols={{ base: 1, sm: 2 }}
          spacing="md"
          className={classes.printGrid2}
        >
          <MetricCard
            icon={IconRoute}
            label="Lunghezza lungomare"
            value={formatKilometers(report.totalMeasuredLineMeters)}
            detail="Stimata seguendo la sequenza dei punti di servizio tracciati"
            tone="teal"
          />
          <MetricCard
            icon={IconBeach}
            label="Spazio non servito"
            value={formatKilometers(report.totalUnservedSpanMeters)}
            detail={
              <Text>
                <b>{formatPercent(report.totalUnservedSpanRatio)}</b> della
                lunghezza stimata. <br />
                Questa percentuale indica{" "}
                <b>
                  <u>
                    la probabilità che ho di finire in un punto del litorale in
                    cui i servizi sono più distanti di quanto sono disposto a
                    camminare
                  </u>
                </b>
              </Text>
            }
            tone="coral"
          />
          <MetricCard
            icon={IconUsers}
            label="Persone al giorno"
            value={formatInteger(economicImpact.dailyPeopleImpacted)}
            detail={
              <Text>
                Potenzialmente presenti nelle tratte scoperte.
                <br />
                Questo valore si ottiene dividendo la lunghezza del tratto
                "scoperto" da servizi{" "}
                {formatKilometers(report.totalUnservedSpanMeters)} per la
                lunghezza media di un veicolo in parcheggio{" "}
                {formatMeters(assumptions.averageParkedVehicleLengthMeters)} e
                moltiplicando tutto per l'assunzione che ogni veicolo trasporti
                in media {assumptions.averagePeoplePerVehicle} persone.
              </Text>
            }
            tone="violet"
          />
          <MetricCard
            icon={IconCurrencyEuro}
            label="Opportunità"
            value={formatEuro(economicImpact.dailyEconomicOpportunityEuros)}
            detail={`La cifra che si perde ogni giorno non servendo quelle persone che finiscono in un punto del litorale in cui non sono disposte a raggiungere nessun punto di servizio. Questo valore viene calcolato considerando le auto che possono sostare nei tratti "scoperti", assumendo che ogni veicolo trasporti in media ${assumptions.averagePeoplePerVehicle} persone e che ciascuna di loro spenda, in media, ${assumptions.averageExpensePerPersonEuros}€`}
            tone="amber"
          />
        </SimpleGrid>
      </Section>

      <Section eyebrow="Metodo" title="Le ipotesi di partenza">
        <SimpleGrid
          cols={{ base: 1, sm: 2, md: 4 }}
          spacing="sm"
          className={classes.printGrid4}
        >
          <AssumptionPill
            label="Camminata"
            value={`${assumptions.walkingSpeedKmH} km/h`}
            detail="velocità media stimata per un adulto"
          />
          <AssumptionPill
            label="Copertura combinata"
            value={formatMeters(assumptions.maxCoveredGapBetweenStandsMeters)}
            detail="lo spazio che la persona adulta percorre tra andata e ritorno per raggiungere un punto di servizio."
          />
          <AssumptionPill
            label="Auto parcheggiata"
            value={`${assumptions.averageParkedVehicleLengthMeters} m`}
            detail="ingombro medio di un veicolo in sosta"
          />
          <AssumptionPill
            label="Ricambio"
            value={formatPercent(assumptions.vehicleDailyTurnoverRatio)}
            detail="quota di posti che si libera e viene rioccupata nello stesso giorno"
          />
        </SimpleGrid>
      </Section>

      <Section eyebrow="Mappa lineare" title="Dove si apre il vuoto">
        <RouteCoverageMap report={report} />
      </Section>

      <Section eyebrow="Tratte critiche" title="I buchi più evidenti">
        <CriticalGapsTable report={report} />
      </Section>

      <Section eyebrow="Impatto" title="Dal vuoto alle persone">
        <ImpactFlow report={report} />
      </Section>

      <Section eyebrow="Distribuzione" title="Nord e sud non si assomigliano">
        <SegmentComparison report={report} />
      </Section>

      <ReportDisclaimer />
    </Stack>
  );
};

const Section = ({
  children,
  eyebrow,
  title
}: {
  children: ReactNode;
  eyebrow?: string;
  title: string;
}) => (
  <Box component="section" className={classes.section}>
    <Stack gap="md">
      <Stack gap={4}>
        {eyebrow && <Text className={classes.eyebrow}>{eyebrow}</Text>}
        <Title order={2} className={classes.sectionTitle}>
          {title}
        </Title>
      </Stack>
      {children}
    </Stack>
  </Box>
);

const HeroFact = ({
  detail,
  label,
  value
}: {
  detail: string;
  label: string;
  value: string;
}) => (
  <Box className={classes.heroFact}>
    <Text size="xs" tt="uppercase" fw={700}>
      {label}
    </Text>
    <Text fw={800} className={classes.heroFactValue}>
      {value}
    </Text>
    <Text size="sm" style={{ color: "#b7b6b6" }}>
      {detail}
    </Text>
  </Box>
);

const MetricCard = ({
  detail,
  icon: Icon,
  label,
  tone,
  value
}: {
  detail: React.ReactNode;
  icon: IconComponent;
  label: string;
  tone: "amber" | "coral" | "teal" | "violet";
  value: string;
}) => (
  <Box className={`${classes.metricCard} ${classes[tone]}`}>
    <ThemeIcon
      radius="md"
      variant="light"
      size={42}
      className={classes.metricIcon}
    >
      <Icon size={22} />
    </ThemeIcon>
    <Stack gap={4}>
      <Text className={classes.metricLabel}>{label}</Text>
      <Text fw={900} className={classes.metricValue}>
        {value}
      </Text>
      <Text className={classes.metricDetail}>{detail}</Text>
    </Stack>
  </Box>
);

const AssumptionPill = ({
  detail,
  label,
  value
}: {
  detail: string;
  label: string;
  value: string;
}) => (
  <Box className={classes.assumptionPill}>
    <Text fw={800}>{value}</Text>
    <Text size="sm" fw={700}>
      {label}
    </Text>
    <Text size="xs" c="dimmed">
      {detail}
    </Text>
  </Box>
);

const WalkingTimeControl = ({
  mode,
  onChange,
  report,
  value
}: ReportProps & {
  mode: ReportMode;
  onChange: (value: number) => void;
  value: number;
}) => {
  const { assumptions } = report;
  const isPrint = mode === "print";

  return (
    <Box className={classes.walkingControl}>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start" gap="md">
          <Stack gap={4} maw={700}>
            <Group gap="xs">
              <ThemeIcon color="teal" variant="light" radius="md" size={34}>
                <IconSettings size={19} />
              </ThemeIcon>
            </Group>
            <Text fw={850} className={classes.walkingControlTitle}>
              {isPrint
                ? "Tempo massimo considerato nei calcoli"
                : "Trascina lo slider e vedi l'impatto sui numeri"}
            </Text>
            <Text c="dimmed">
              {isPrint ? (
                <>
                  Questo report traduce in numeri quanto i servizi coprano il
                  lungomare di Sabaudia, e il racconto completo è subito qui
                  sotto. In questa stampa considero un adulto disposto a
                  camminare per <b>{value}</b> minuti in totale, tra andata e
                  ritorno, per raggiungere un punto di servizio. <br />
                  Con una velocità media stimata di{" "}
                  <b>{assumptions.walkingSpeedKmH} km/h</b> e camminando per{" "}
                  <b>{value} minuti</b>, significa accettare un servizio
                  distante al massimo{" "}
                  <b>{formatMeters(assumptions.maxDistanceToStandMeters)}</b>{" "}
                  dalla propria posizione in spiaggia.
                  <br />
                  Percorrendo in totale{" "}
                  <b>
                    {formatMeters(assumptions.maxDistanceToStandMeters * 2)}
                  </b>{" "}
                  tra andata e ritorno.
                </>
              ) : (
                <>
                  Per quanto tempo, quando sei in spiaggia, saresti disposto a
                  camminare per raggiungere un punto di servizio — cibo, acqua o
                  servizi igienici? <br />
                  <br />È l'assunzione da cui parte tutto il resto: mi sembra
                  ragionevole stimarla in <b>{value} minuti</b> in totale,
                  quindi andata e ritorno, ma puoi cambiarla quando vuoi con lo
                  slider.
                  <br />
                  <br />
                  Con una velocità media stimata di{" "}
                  <b>{assumptions.walkingSpeedKmH} km/h</b> e camminando per{" "}
                  <b>{value} minuti</b>, significa accettare un servizio
                  distante al massimo{" "}
                  <b>{formatMeters(assumptions.maxDistanceToStandMeters)}</b>{" "}
                  dalla propria posizione in spiaggia.
                  <br />
                  Percorrendo in totale{" "}
                  <b>
                    {formatMeters(assumptions.maxDistanceToStandMeters * 2)}
                  </b>{" "}
                  tra andata e ritorno.
                </>
              )}
            </Text>
          </Stack>
          <Box className={classes.walkingValueBox}>
            <Text className={classes.walkingValue}>{value}</Text>
            <Text size="xs" fw={800} tt="uppercase">
              minuti
            </Text>
          </Box>
        </Group>
        {!isPrint && (
          <Slider
            value={value}
            onChange={onChange}
            min={4}
            max={30}
            step={1}
            size="lg"
            thumbChildren={<IconGripVertical size={18} stroke={2.4} />}
            thumbSize={34}
            color="teal"
            label={currentValue => `${currentValue} min`}
            styles={{
              thumb: {
                color: "var(--mantine-color-teal-7)",
                cursor: "grab"
              },
              track: {
                cursor: "pointer"
              }
            }}
            marks={[
              {
                value: 5,
                label: (
                  <Text size="sm" mt={4}>
                    5min
                  </Text>
                )
              },
              {
                value: 10,
                label: (
                  <Text size="sm" mt={4}>
                    10min
                  </Text>
                )
              },
              {
                value: 15,
                label: (
                  <Text size="sm" mt={4}>
                    15min
                  </Text>
                )
              },
              {
                value: 20,
                label: (
                  <Text size="sm" mt={4}>
                    20min
                  </Text>
                )
              },
              {
                value: 30,
                label: (
                  <Text size="sm" mt={4}>
                    30min
                  </Text>
                )
              }
            ]}
            className={classes.noPrint}
          />
        )}
      </Stack>
    </Box>
  );
};

const RouteCoverageMap = ({ report }: ReportProps) => {
  const maxPosition = report.totalMeasuredLineMeters;

  return (
    <Stack gap="lg">
      <Box className={classes.routePanel}>
        <Group justify="space-between" gap="xs" mb="md">
          <Text fw={700}>Linea dei servizi tracciati</Text>
          <Badge color="red" variant="light" radius="sm">
            rosso = tratto non servito
          </Badge>
        </Group>
        <Box className={classes.routeRail} aria-hidden="true">
          {report.unservedStandGaps.map(gap => {
            const left =
              ((gap.startOffsetMeters +
                report.assumptions.maxDistanceToStandMeters) /
                maxPosition) *
              100;
            const width = (gap.unservedSpanMeters / maxPosition) * 100;

            return (
              <Box
                key={`${gap.standA.id}-${gap.standB.id}`}
                className={classes.unservedBand}
                style={{ left: `${left}%`, width: `${width}%` }}
              />
            );
          })}
          {report.standRoutePositions.map(position => (
            <Tooltip key={position.stand.id} label={position.stand.name}>
              <Box
                component="span"
                className={`${classes.routeDot} ${
                  position.routeSegment === "north"
                    ? classes.routeDotNorth
                    : position.routeSegment === "south"
                      ? classes.routeDotSouth
                      : classes.routeDotOutside
                }`}
                style={{ left: `${position.positionRatio * 100}%` }}
              />
            </Tooltip>
          ))}
        </Box>
        <Group justify="space-between" mt="sm" className={classes.routeLabels}>
          <Text size="xs">Latina / Bufalara</Text>
          <Text size="xs">San Felice / Saporetti</Text>
        </Group>
      </Box>

      <CoverageBar
        label="Copertura teorica complessiva"
        servedMeters={report.totalServedSpanMeters}
        unservedMeters={report.totalUnservedSpanMeters}
      />
    </Stack>
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
    <Stack gap="xs">
      <Group justify="space-between" gap="xs">
        <Text fw={700}>{label}</Text>
        <Text fw={800} c="red.7">
          {formatPercent(unservedRatio)} non servito
        </Text>
      </Group>
      <Box className={classes.coverageBar}>
        <Box
          className={classes.coverageServed}
          style={{ width: `${(1 - unservedRatio) * 100}%` }}
        />
        <Box
          className={classes.coverageUnserved}
          style={{ width: `${unservedRatio * 100}%` }}
        />
      </Box>
      <Group justify="space-between" className={classes.coverageLegend}>
        <Text size="sm">Servito: {formatKilometers(servedMeters)}</Text>
        <Text size="sm">Non servito: {formatKilometers(unservedMeters)}</Text>
      </Group>
    </Stack>
  );
};

const CriticalGapsTable = ({ report }: ReportProps) => {
  const maxUnservedSpan = Math.max(
    ...report.unservedStandGaps.map(gap => gap.unservedSpanMeters)
  );

  return (
    <Box className={classes.tableShell}>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Tratta</Table.Th>
            <Table.Th>Distanza</Table.Th>
            <Table.Th>Cammino</Table.Th>
            <Table.Th>Vuoto stimato</Table.Th>
            <Table.Th>Zona</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {report.unservedStandGaps.map(gap => (
            <Table.Tr key={`${gap.standA.id}-${gap.standB.id}`}>
              <Table.Td>
                <Text fw={700}>{gap.standA.name}</Text>
                <Text size="sm" c="dimmed">
                  verso {gap.standB.name}
                </Text>
              </Table.Td>
              <Table.Td>{formatKilometers(gap.distanceMeters)}</Table.Td>
              <Table.Td>{formatWalkingMinutes(gap.walkingMinutes)}</Table.Td>
              <Table.Td>
                <Stack gap={6}>
                  <Text fw={800}>{formatMeters(gap.unservedSpanMeters)}</Text>
                  <Box className={classes.gapMeter}>
                    <Box
                      className={classes.gapMeterFill}
                      style={{
                        width: `${(gap.unservedSpanMeters / maxUnservedSpan) * 100}%`
                      }}
                    />
                  </Box>
                </Stack>
              </Table.Td>
              <Table.Td>
                <Badge
                  color={gap.routeSegment === "north" ? "orange" : "teal"}
                  radius="sm"
                  variant="light"
                >
                  {getSegmentLabel(gap)}
                </Badge>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );
};

const ImpactFlow = ({ report }: ReportProps) => {
  const { assumptions, economicImpact } = report;
  const steps: {
    detail: string;
    icon: IconComponent;
    label: string;
    value: string;
  }[] = [
    {
      detail: "somma degli spazi centrali non coperti",
      icon: IconRoute,
      label: "Spazio vuoto",
      value: formatKilometers(report.totalUnservedSpanMeters)
    },
    {
      detail: `${assumptions.averageParkedVehicleLengthMeters} m per auto`,
      icon: IconCar,
      label: "Auto parcheggiabili",
      value: formatInteger(economicImpact.parkedVehiclesInUnservedSpan)
    },
    {
      detail: `${formatPercent(assumptions.vehicleDailyTurnoverRatio)} dei posti auto stimati si libera e viene rioccupato nella stessa giornata`,
      icon: IconCar,
      label: "Auto al giorno",
      value: formatInteger(economicImpact.dailyVehiclesWithTurnover)
    },
    {
      detail: `${assumptions.averagePeoplePerVehicle} persone per veicolo`,
      icon: IconUsers,
      label: "Persone al giorno",
      value: formatInteger(economicImpact.dailyPeopleImpacted)
    },
    {
      detail: `${formatEuro(assumptions.averageExpensePerPersonEuros)} medi a persona`,
      icon: IconCurrencyEuro,
      label: "Valore giornaliero",
      value: formatEuro(economicImpact.dailyEconomicOpportunityEuros)
    },
    {
      detail: `${assumptions.fullUnservedSpanDays} giorni estivi in cui considero pieni gli spazi non serviti`,
      icon: IconBeach,
      label: "Ordine di grandezza",
      value: formatEuro(economicImpact.seasonalEconomicOpportunityEuros)
    }
  ];

  return (
    <SimpleGrid
      cols={{ base: 1, sm: 2, md: 3 }}
      spacing="md"
      className={classes.printGrid3}
    >
      {steps.map(step => (
        <ImpactStep key={step.label} {...step} />
      ))}
    </SimpleGrid>
  );
};

const ImpactStep = ({
  detail,
  icon: Icon,
  label,
  value
}: {
  detail: string;
  icon: IconComponent;
  label: string;
  value: string;
}) => (
  <Box className={classes.impactStep}>
    <ThemeIcon radius="md" color="teal" variant="light" size={40}>
      <Icon size={21} />
    </ThemeIcon>
    <Stack gap={2}>
      <Text size="sm" fw={700} c="dimmed">
        {label}
      </Text>
      <Text fw={850} className={classes.impactValue}>
        {value}
      </Text>
      <Text size="sm" c="dimmed">
        {detail}
      </Text>
    </Stack>
  </Box>
);

const SegmentComparison = ({ report }: ReportProps) => {
  const { north, south } = report.segmentSummaries;

  return (
    <Stack gap="lg">
      <SimpleGrid
        cols={{ base: 1, md: 2 }}
        spacing="md"
        className={classes.printGrid2}
      >
        <SegmentPanel segment={north} tone="north" />
        <SegmentPanel segment={south} tone="south" />
      </SimpleGrid>

      <Divider />

      <Box className={classes.closingNote}>
        <Group gap="sm" align="flex-start" wrap="nowrap">
          <ThemeIcon color="orange" variant="light" radius="md" size={42}>
            <IconWalk size={22} />
          </ThemeIcon>
          <Stack gap={6}>
            <Text fw={800}>La distribuzione pesa più del numero assoluto.</Text>
            <Text>
              La tratta Nord, da {north.fromStandName} fino a{" "}
              {north.toStandName}, è quella che soffre di più: oltre{" "}
              {formatPercent(north.unservedSpanRatio)} della sua lunghezza resta
              fuori dalla copertura teorica. A sud la percentuale scende a{" "}
              {formatPercent(south.unservedSpanRatio)}. Per me il punto è qui:
              non basta contare quanti servizi esistono, bisogna guardare dove
              sono distribuiti.
            </Text>
          </Stack>
        </Group>
      </Box>
    </Stack>
  );
};

const SegmentPanel = ({
  segment,
  tone
}: {
  segment: SegmentSummary;
  tone: "north" | "south";
}) => (
  <Box className={`${classes.segmentPanel} ${classes[tone]}`}>
    <Stack gap="md">
      <Group justify="space-between" gap="xs">
        <Stack gap={2}>
          <Text className={classes.segmentLabel}>{segment.label}</Text>
          <Title order={3} className={classes.segmentTitle}>
            {segment.fromStandName} {"->"} {segment.toStandName}
          </Title>
        </Stack>
        <Badge color={tone === "north" ? "orange" : "teal"} radius="sm">
          {formatPercent(segment.unservedSpanRatio)}
        </Badge>
      </Group>

      <CoverageBar
        label="Spazio della tratta"
        servedMeters={segment.distanceMeters - segment.unservedSpanMeters}
        unservedMeters={segment.unservedSpanMeters}
      />

      <SimpleGrid cols={3} spacing="xs" className={classes.printGrid3}>
        <SegmentMiniStat
          label="Lunghezza"
          value={formatKilometers(segment.distanceMeters)}
        />
        <SegmentMiniStat
          label="Distanza media"
          value={formatKilometers(segment.averageGapMeters)}
        />
        <SegmentMiniStat
          label="Servizi"
          value={formatInteger(segment.standCount)}
        />
      </SimpleGrid>
    </Stack>
  </Box>
);

const SegmentMiniStat = ({
  label,
  value
}: {
  label: string;
  value: string;
}) => (
  <Stack gap={2} className={classes.segmentMiniStat}>
    <Text size="xs" c="dimmed" fw={700}>
      {label}
    </Text>
    <Text fw={850}>{value}</Text>
  </Stack>
);

const ReportDisclaimer = () => (
  <Box component="section" className={classes.disclaimer}>
    <Stack gap={6}>
      <Text fw={800}>Nota di lettura</Text>
      <Text>
        Questo modello è volutamente prudente: usa distanze in linea retta tra i
        punti e una velocità di camminata da asfalto, 5 km/h. Sulla battigia il
        percorso reale tende a essere più lungo e, con sabbia, bambini o borse,
        la velocità reale può scendere. Per questo i risultati vanno letti come
        una stima minima del problema, non come una misura gonfiata.
      </Text>
      <Text>
        La “lunghezza lungomare” indica la linea stimata tra il primo e l'ultimo
        punto di servizio tracciato: non misura la spiaggia fisica prima o dopo
        quei punti. Tuttavia le assunzioni non producono un errore tale
        da distorcere significativamente i calcoli mostrati.
      </Text>
    </Stack>
  </Box>
);
