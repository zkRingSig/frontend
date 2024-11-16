import React from 'react';

interface TabsProps {
  activeTab: 'deposit' | 'withdraw';
  onTabChange: (tab: 'deposit' | 'withdraw') => void;
}

export function Tabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex justify-center space-x-4 mb-8">
      <button
        onClick={() => onTabChange('deposit')}
        className={`px-6 py-2 rounded-lg transition ${
          activeTab === 'deposit'
            ? 'bg-green-400 text-gray-900'
            : 'text-gray-400 hover:text-green-400'
        }`}
      >
        Deposit
      </button>
      <button
        onClick={() => onTabChange('withdraw')}
        className={`px-6 py-2 rounded-lg transition ${
          activeTab === 'withdraw'
            ? 'bg-green-400 text-gray-900'
            : 'text-gray-400 hover:text-green-400'
        }`}
      >
        Withdraw
      </button>
    </div>
  );
}