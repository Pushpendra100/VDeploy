import Header from "@/components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="h-[100vh] w-[100vw]">
      <Header />
      {children}
    </main>
  );
}
