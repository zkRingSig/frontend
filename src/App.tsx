import React, { useState } from 'react';
import { Header } from './components/Header';
import { DepositCard } from './components/DepositCard';
import { WithdrawCard } from './components/WithdrawCard';
import { Tabs } from './components/Tabs';

export function App() {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100">
      <Header />
      <main className="max-w-xl mx-auto mt-12 px-4">
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
        {activeTab === 'deposit' ? <DepositCard /> : <WithdrawCard />}
      </main>
    </div>
  );
}