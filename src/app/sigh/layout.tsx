import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SIGH — Espace personnel",
  robots: { index: false, follow: false },
};

export default function LayoutSigh({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f1f5f9]">{children}</div>
  );
}
