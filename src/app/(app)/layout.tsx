export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-bg flex-1">
      <main className="mx-auto max-w-[1180px] px-4 sm:px-[26px] pt-[30px] pb-[90px]">
        {children}
      </main>
    </div>
  );
}
