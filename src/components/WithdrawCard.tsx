import React from 'react';
import { Shield } from 'lucide-react';

export function WithdrawCard() {
  return (
    <div className="bg-[#1e2329] rounded-2xl p-8 shadow-xl backdrop-blur-sm border border-gray-800 mt-6">
      <h2 className="text-2xl font-semibold text-center text-emerald-400 mb-2">Withdraw</h2>
      <p className="text-gray-400 text-center mb-6">Withdraw your assets anonymously</p>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Amount</span>
          <span className="text-gray-300">Balance: 0.0 ETH</span>
        </div>

        <input
          type="text"
          placeholder="Enter secret note"
          className="w-full px-4 py-3 bg-[#2a2f36] rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <input
          type="text"
          placeholder="Enter recipient address"
          className="w-full px-4 py-3 bg-[#2a2f36] rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <div className="bg-[#2a2f36] p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-400 font-medium">Security Guarantee</span>
          </div>
          <p className="text-gray-400 text-sm">
            Your transaction is protected by zero-knowledge proofs and will remain completely anonymous on the blockchain.
          </p>
        </div>

        <button className="w-full py-3 bg-emerald-500 text-black rounded-xl font-medium hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2">
          Withdraw Funds
        </button>
      </div>
    </div>
  );
}