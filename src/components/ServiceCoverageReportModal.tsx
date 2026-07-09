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
  IconSettings,
  type IconProps,
  IconRoute,
  IconUsers,
  IconWalk,
  IconX
} from "@tabler/icons-react";
import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type ReactNode
} from "react";
import {
  createServiceCoverageReport,
  SERVICE_COVERAGE_ASSUMPTIONS,
  type SegmentSummary,
  type ServiceCoverageReport,
  type UnservedStandGap
} from "../utils/serviceCoverage.ts";
import { openServiceCoverageReportPrintDocument } from "../utils/serviceCoveragePrint.ts";
import { formatDuration } from "../utils/time.ts";
import classes from "./ServiceCoverageReportModal.module.css";

type ServiceCoverageReportModalProps = {
  opened: boolean;
  onClose: () => void;
};

type IconComponent = ComponentType<IconProps>;
type ReportProps = {
  report: ServiceCoverageReport;
};
type InteractiveReportProps = ReportProps & {
  maxRoundTripMinutes: number;
  onMaxRoundTripMinutesChange: (value: number) => void;
};

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
const formatWalkingMinutes = (minutes: number) => formatDuration(minutes);

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
  const [maxRoundTripMinutes, setMaxRoundTripMinutes] = useState(
    SERVICE_COVERAGE_ASSUMPTIONS.maxAcceptableRoundTripMinutes
  );
  const report = useMemo(
    () =>
      createServiceCoverageReport({
        maxAcceptableRoundTripMinutes: maxRoundTripMinutes
      }),
    [maxRoundTripMinutes]
  );
  const printReport = () => openServiceCoverageReportPrintDocument(report);

  useEffect(() => {
    if (!opened) {
      return undefined;
    }

    document.body.classList.add("service-report-open");

    return () => {
      document.body.classList.remove("service-report-open");
    };
  }, [opened]);

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
              onClick={printReport}
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

        <ReportHero report={report} />
        <ReportBody
          report={report}
          maxRoundTripMinutes={maxRoundTripMinutes}
          onMaxRoundTripMinutesChange={setMaxRoundTripMinutes}
        />
      </Box>
    </Modal>
  );
};

const ReportHero = ({ report }: ReportProps) => {
  const { assumptions } = report;

  return (
    <Box className={classes.hero}>
      <Stack gap="lg" maw={860}>
        <Badge color="orange" variant="filled" radius="sm">
          Lungomare di Sabaudia
        </Badge>
        <Title order={1} className={classes.heroTitle}>
          Ho provato a far parlare i numeri
        </Title>
        <Text className={classes.heroText}>
          Intorno ai servizi sul lungomare di Sabaudia c'è una grande polemica.
          Io, però, faccio fatica a capire davvero l'impatto se non provo a
          tradurlo in numeri. Per questo ho fatto un esercizio semplice e
          personale: segnare sulla mappa tutti i punti in cui puoi acquistare e
          consumare cibo e bevande, e usare i servizi igienici. Spero di averli
          inclusi tutti. Da lì ho fatto alcune assunzioni, dichiarate, e ho
          lasciato che fossero i numeri a raccontare il resto.
        </Text>
        <SimpleGrid
          cols={{ base: 1, sm: 3 }}
          spacing="sm"
          className={classes.heroFacts}
        >
          <HeroFact
            label="Tempo massimo"
            value={`${assumptions.maxAcceptableRoundTripMinutes} min`}
            detail="andata e ritorno"
          />
          <HeroFact
            label="Distanza utile"
            value={formatMeters(assumptions.maxDistanceToStandMeters)}
            detail="massimo da un servizio"
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

const ReportBody = ({
  maxRoundTripMinutes,
  onMaxRoundTripMinutesChange,
  report
}: InteractiveReportProps) => {
  const { assumptions, economicImpact } = report;

  return (
    <Stack gap={0} className={classes.reportBody}>
      <Section
        eyebrow="Parametro interattivo"
        title="Quanto tempo sei disposto a camminare?"
      >
        <WalkingTimeControl
          report={report}
          value={maxRoundTripMinutes}
          onChange={onMaxRoundTripMinutesChange}
        />
      </Section>

      <Section eyebrow="Sintesi" title="Il problema in quattro numeri">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          <MetricCard
            icon={IconRoute}
            label="Lunghezza lungomare"
            value={formatKilometers(report.totalMeasuredLineMeters)}
            detail="stimata seguendo la sequenza dei punti di servizio tracciati"
            tone="teal"
          />
          <MetricCard
            icon={IconBeach}
            label="Spazio non servito"
            value={formatKilometers(report.totalUnservedSpanMeters)}
            detail={`${formatPercent(report.totalUnservedSpanRatio)} della lunghezza stimata`}
            tone="coral"
          />
          <MetricCard
            icon={IconUsers}
            label="Persone al giorno"
            value={formatInteger(economicImpact.dailyPeopleImpacted)}
            detail="potenzialmente impattate dalle tratte scoperte"
            tone="violet"
          />
          <MetricCard
            icon={IconCurrencyEuro}
            label="Opportunità"
            value={formatEuro(economicImpact.dailyEconomicOpportunityEuros)}
            detail="stima giornaliera, con ipotesi dichiarate"
            tone="amber"
          />
        </SimpleGrid>
      </Section>

      <Section eyebrow="Metodo" title="Le ipotesi di partenza">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="sm">
          <AssumptionPill
            label="Camminata"
            value={`${assumptions.walkingSpeedKmH} km/h`}
            detail="velocità media stimata per un adulto"
          />
          <AssumptionPill
            label="Copertura combinata"
            value={formatMeters(assumptions.maxCoveredGapBetweenStandsMeters)}
            detail="somma dei due raggi raggiungibili"
          />
          <AssumptionPill
            label="Auto parcheggiata"
            value={`${assumptions.averageParkedVehicleLengthMeters} m`}
            detail="ingombro medio"
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
    </Stack>
  );
};

const Section = ({
  children,
  eyebrow,
  title
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
}) => (
  <Box component="section" className={classes.section}>
    <Stack gap="md">
      <Stack gap={4}>
        <Text className={classes.eyebrow}>{eyebrow}</Text>
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
    <Text size="sm">{detail}</Text>
  </Box>
);

const MetricCard = ({
  detail,
  icon: Icon,
  label,
  tone,
  value
}: {
  detail: string;
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
      <Text className={classes.metricValue}>{value}</Text>
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
  onChange,
  report,
  value
}: ReportProps & {
  onChange: (value: number) => void;
  value: number;
}) => {
  const { assumptions } = report;

  return (
    <Box className={classes.walkingControl}>
      <Stack gap="md">
        <Group justify="space-between" align="flex-start" gap="md">
          <Stack gap={4} maw={700}>
            <Group gap="xs">
              <ThemeIcon color="teal" variant="light" radius="md" size={34}>
                <IconSettings size={19} />
              </ThemeIcon>
              <Badge color="teal" radius="sm" variant="filled">
                Interattivo
              </Badge>
            </Group>
            <Text fw={850} className={classes.walkingControlTitle}>
              Trascina lo slider: tutti i numeri si aggiornano subito
            </Text>
            <Text c="dimmed">
              L'assunzione centrale è questa: un adulto sarebbe disposto a
              camminare per {value} minuti in totale, quindi andata e ritorno,
              per raggiungere un punto di servizio. Con una velocità media
              stimata di {assumptions.walkingSpeedKmH} km/h, significa accettare
              un servizio distante al massimo{" "}
              {formatMeters(assumptions.maxDistanceToStandMeters)} dalla propria
              posizione in spiaggia.
            </Text>
          </Stack>
          <Box className={classes.walkingValueBox}>
            <Text className={classes.walkingValue}>{value}</Text>
            <Text size="xs" fw={800} tt="uppercase">
              minuti
            </Text>
          </Box>
        </Group>
        <Slider
          value={value}
          onChange={onChange}
          min={4}
          max={30}
          step={1}
          color="teal"
          label={currentValue => `${currentValue} min`}
          marks={[
            { value: 5, label: "5" },
            { value: 10, label: "10" },
            { value: 15, label: "15" },
            { value: 20, label: "20" },
            { value: 30, label: "30" }
          ]}
          className={classes.noPrint}
        />
        <Text size="sm" c="dimmed">
          Il PDF usa il valore selezionato al momento della stampa. Cambiando lo
          slider si aggiornano spazio non servito, persone potenzialmente
          impattate e stima economica.
        </Text>
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
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
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
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
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

      <SimpleGrid cols={3} spacing="xs">
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
