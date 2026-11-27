import { Stack } from "expo-router";
import { ThemeProvider } from "../theme/ThemeProvider";
import { useBootstrap } from "../bootstrap/useBootstrap";
import { Screen } from "../shared/ui/Screen";
import { StatusBanner } from "../shared/ui/StatusBanner";

export default function RootLayout() {
  const boot = useBootstrap();
  return (
    <ThemeProvider>
      {boot.status === "ready" ? (
        <Stack screenOptions={{ headerShown: false }} />
      ) : (
        <BootFallback status={boot.status} message={boot.message} />
      )}
    </ThemeProvider>
  );
}

function BootFallback({
  status,
  message,
}: {
  status: string;
  message: string | null;
}) {
  if (status !== "error") return null;
  return (
    <Screen>
      <StatusBanner
        message={`ECHO could not start its storage. ${message ?? ""}`.trim()}
      />
    </Screen>
  );
}
