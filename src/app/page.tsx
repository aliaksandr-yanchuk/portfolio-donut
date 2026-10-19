import { PortfolioScreen } from "@/features/portfolio/components/portfolio-screen";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-4 sm:px-6">
      <header className="pt-6">
        <h1 className="text-lg font-semibold">ポートフォリオ</h1>
      </header>
      <PortfolioScreen />
    </main>
  );
}
