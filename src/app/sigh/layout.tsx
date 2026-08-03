import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SIGH — Espace personnel",
  robots: { index: false, follow: false },
};

export default function LayoutSigh({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-[#f1f5f9]">
      {children}
    </div>
  );
}
