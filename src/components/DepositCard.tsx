import React from 'react';
import { ArrowUpDown, Shield } from 'lucide-react';

export function DepositCard() {
  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-700">
      <div className="flex justify-center mb-6">
        <div className="p-3 bg-gray-800 rounded-xl">
          <ArrowUpDown className="w-6 h-6 text-green-400" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-center text-green-400 mb-2">
        Deposit
      </h1>
      <p className="text-center text-gray-400 mb-8">
        Secure your assets in the privacy pool
      </p>

      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-400">Balance:</span>
        <span>0 ETH</span>
      </div>

      <div className="relative mb-4">
        <input
          type="number"
          min="0"
          step="0.1"
          placeholder="0.0"
          className="w-full bg-gray-900 rounded-lg px-4 py-3 text-right border border-gray-700 focus:border-green-400 focus:outline-none"
        />
        <span className="absolute right-4 top-3 text-gray-400">ETH</span>
      </div>

      <div className="flex items-center space-x-2 text-sm text-blue-400 bg-blue-400/10 rounded-lg p-4 mb-6">
        <span>Minimum transaction amount is 0.1 ETH</span>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <Shield className="w-5 h-5 text-green-400" />
          <span className="text-green-400 font-medium">Security Guarantee</span>
        </div>
        <p className="text-sm text-gray-400">
          Your transaction is protected by zero-knowledge proofs and will remain completely anonymous on the blockchain.
        </p>
      </div>

      <button className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-4 font-medium transition">
        Deposit Funds
      </button>
    </div>
  );
}