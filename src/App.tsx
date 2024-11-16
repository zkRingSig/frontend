import React, { useEffect } from "react";
import { Header } from "./components/Header";
import { TransactionCard } from "./components/TransactionCard";
import { Shield, Lock, Zap } from "lucide-react";

function App() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.querySelectorAll(".feature-card").forEach((card) => {
        const rect = (card as HTMLElement).getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty("--mouse-x", `${x}px`);
        (card as HTMLElement).style.setProperty("--mouse-y", `${y}px`);
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-dark text-gray-100 relative overflow-hidden">
      <div className="fixed inset-0 matrix-bg pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-b from-dark via-transparent to-dark pointer-events-none" />

      <Header />

      <main className="container mx-auto px-4 pt-32 pb-16 relative">
        <div className="flex flex-col items-center gap-6">
          <div className="text-center space-y-4 max-w-2xl relative">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-[100px] glow-effect" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-blue/20 rounded-full blur-[100px] glow-effect" />
          </div>

          <TransactionCard />
        </div>
      </main>
    </div>
  );
}

export default App;
