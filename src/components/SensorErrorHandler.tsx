import { notifications } from "@mantine/notifications";
import { IconMapPinOff } from "@tabler/icons-react";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { myPositionAtom } from "../atoms/myPosition";
import { mapGeolocationError } from "../utils/geolocationErrors";

const NOTIFICATION_ID = "sensor-geolocation-error";

export const SensorErrorHandler = () => {
  const { active, error } = useAtomValue(myPositionAtom);

  useEffect(() => {
    if (active && error) {
      notifications.show({
        id: NOTIFICATION_ID,
        color: "red",
        title: "Errore di posizione",
        message: mapGeolocationError(error),
        icon: <IconMapPinOff size={18} />,
        autoClose: 5000,
        withCloseButton: true
      });
    }
  }, [active, error]);

  return null;
};
