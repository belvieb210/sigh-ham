import { EnTetePublic } from "@/components/layout/en-tete-public";
import { PiedDePagePublic } from "@/components/layout/pied-de-page-public";
import { NavigationMobile } from "@/components/layout/navigation-mobile";

export default function LayoutSite({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <EnTetePublic />
      <main className="flex-1 overflow-x-clip pb-[72px] lg:pb-0">{children}</main>
      <PiedDePagePublic />
      <NavigationMobile />
    </>
  );
}
