import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "./components/Header";
import { DepositCard } from "./components/DepositCard";
import { WithdrawCard } from "./components/WithdrawCard";
import { TabButton } from "./components/TabButton";

function App() {
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");

  const toggleTab = () => {
    setActiveTab((prev) => (prev === "deposit" ? "withdraw" : "deposit"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f15] to-[#1a1f25] text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Header />

        <main className="mt-20 flex flex-col items-center justify-center">
          <div className="w-full max-w-md relative">
            <TabButton activeTab={activeTab} onClick={toggleTab} />
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut",
                }}
              >
                {activeTab === "deposit" ? <DepositCard /> : <WithdrawCard />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
