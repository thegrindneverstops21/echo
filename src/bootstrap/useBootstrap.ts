import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { InstrumentSerif_400Regular } from "@expo-google-fonts/instrument-serif";
import { Geist_400Regular, Geist_500Medium } from "@expo-google-fonts/geist";
import { configureAudioSession } from "../audio/audioSession";
import { toMessage } from "../shared/errors";
import { getDatabase } from "../storage/database";

export type BootStatus = "loading" | "ready" | "error";

export function useBootstrap(): { status: BootStatus; message: string | null } {
  const [fontsLoaded, fontError] = useFonts({
    InstrumentSerif_400Regular,
    Geist_400Regular,
    Geist_500Medium,
  });
  const [dataStatus, setDataStatus] = useState<BootStatus>("loading");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getDatabase(), configureAudioSession()])
      .then(() => setDataStatus("ready"))
      .catch((cause) => {
        setMessage(toMessage(cause));
        setDataStatus("error");
      });
  }, []);

  if (dataStatus === "error") return { status: "error", message };
  const fontsSettled = fontsLoaded || fontError !== null;
  return {
    status: dataStatus === "ready" && fontsSettled ? "ready" : "loading",
    message: null,
  };
}
