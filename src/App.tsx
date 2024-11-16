import React, { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { TransactionCard } from "./components/TransactionCard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getDefaultConfig, ConnectKitProvider } from "connectkit";
import { foundry, sepolia } from "wagmi/chains";
import { http, createConfig, WagmiProvider } from "wagmi";

const projectId = "4265189f60ad0e1a606df6152e4e2ca0";

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: [foundry, sepolia],
    transports: {
      // RPC URL for each chain
      [foundry.id]: http("http://127.0.0.1:8545"),
      // [sepolia.id]: http("http://127.0.0.1:8545"),
    },

    // Required API Keys
    walletConnectProjectId: projectId,

    // Required App Info
    appName: "zkRingSig Demo",

    // Optional App Info
    appDescription: "zkRingSig Demo",
    appUrl: "https://family.co", // your app's url
    appIcon: "https://family.co/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  })
);

const queryClient = new QueryClient();

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

  const [proofArgs, setProofArgs] = useState([]);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <div className="min-h-screen bg-dark text-gray-100 relative overflow-hidden">
            <div className="fixed inset-0 matrix-bg pointer-events-none" />
            <div className="fixed inset-0 bg-gradient-to-b from-dark via-transparent to-dark pointer-events-none" />

            <Header proofArgs={proofArgs} />

            <main className="container mx-auto px-4 pt-32 pb-16 relative">
              <div className="flex flex-col items-center gap-6">
                <div className="text-center space-y-4 max-w-2xl relative">
                  <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 rounded-full blur-[100px] glow-effect" />
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent-blue/20 rounded-full blur-[100px] glow-effect" />
                </div>

                <TransactionCard setProofArgs={setProofArgs} />
              </div>
            </main>
          </div>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
