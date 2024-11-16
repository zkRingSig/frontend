import React from 'react';
import { Zap } from 'lucide-react';

export function Header() {
  return (
    <header className="flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Zap className="w-6 h-6 text-emerald-400" />
        <span className="text-xl font-semibold text-white">zkRingSig</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="px-4 py-2 text-emerald-400 hover:text-emerald-300 transition-colors">
          Decryption Request
        </button>
        <button className="px-4 py-2 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-colors">
          Connect Wallet
        </button>
      </div>
    </header>
  );
}