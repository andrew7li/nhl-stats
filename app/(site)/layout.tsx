import { SiteHeader } from "@/app/components/SiteHeader";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  );
}
