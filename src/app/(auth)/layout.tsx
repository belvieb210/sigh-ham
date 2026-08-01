export default function LayoutAuth({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex min-h-[calc(100vh-0px)] flex-1 items-center justify-center bg-gris-tres-clair py-10">
      {children}
    </main>
  );
}
