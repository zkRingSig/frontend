import React from 'react';
import { Header } from './components/Header';
import { DepositCard } from './components/DepositCard';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-100">
      <Header />
      <main className="max-w-xl mx-auto mt-20 px-4">
        <DepositCard />
      </main>
    </div>
  );
}

export default App;