const GENERIC = "Impossibile determinare la tua posizione.";

export const mapGeolocationError = (raw: string): string => {
  const e = raw.toLowerCase();
  if (e.includes("denied"))
    return "Permesso di geolocalizzazione negato. Attiva la posizione nelle impostazioni del browser.";
  if (e.includes("not supported") || e.includes("not available"))
    return "La geolocalizzazione non è supportata da questo dispositivo o browser.";
  if (e.includes("timeout"))
    return "Tempo scaduto nel rilevare la posizione. Riprova.";
  if (e.includes("unavailable"))
    return "Posizione non disponibile. Verifica che il GPS o i sensori siano attivi.";
  return GENERIC;
};
