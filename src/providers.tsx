import type { ReactNode } from "react";
import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";

type ProvidersProps = { children: ReactNode };

export default function Providers({ children }: ProvidersProps) {
  return (
    <HeroUIProvider>
      <ToastProvider placement="top-right" />
      {children}
    </HeroUIProvider>
  );
}
