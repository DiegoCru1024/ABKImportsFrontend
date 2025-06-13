import type { ReactNode } from "react";
import { Toaster } from "sonner";

type ProvidersProps = { children: ReactNode };

export default function Providers({ children }: ProvidersProps) {
  return (
    <>
      <Toaster position="top-right" richColors />
      {children}
    </>
  );
}
