import { EnTetePublic } from "@/components/layout/en-tete-public";
import { PiedDePagePublic } from "@/components/layout/pied-de-page-public";
import { NavigationMobile } from "@/components/layout/navigation-mobile";

export default function LayoutSite({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <EnTetePublic />
      <main className="flex-1 overflow-x-clip pt-16 pb-[72px] lg:pt-20 lg:pb-0">{children}</main>
      <PiedDePagePublic />
      <NavigationMobile />
    </>
  );
}
