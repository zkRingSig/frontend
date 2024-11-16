import React from "react";
import { Zap } from "lucide-react";

export function Header() {
  return (
    <header className="px-6 py-4 flex justify-between items-center border-b border-gray-800">
      <div className="flex items-center space-x-2">
        <Zap className="w-6 h-6 text-green-400" />
        <span className="text-xl font-semibold text-green-400">zkRingSig</span>
      </div>
      <div className="flex items-center space-x-4">
        <button className="px-4 py-2 text-green-400 bg-green-400/10 rounded-lg hover:bg-green-400/20 transition">
          Decryption Request
        </button>
        <div className="px-4 py-2 bg-gray-800 rounded-lg text-sm">
          Connect Wallet
        </div>
      </div>
    </header>
  );
}
