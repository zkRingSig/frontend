import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface TabButtonProps {
  activeTab: 'deposit' | 'withdraw';
  onClick: () => void;
}

export function TabButton({ activeTab, onClick }: TabButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1e2329] p-3 rounded-xl border border-gray-800 hover:bg-[#2a2f36] transition-colors cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <ArrowUpDown className="w-6 h-6 text-emerald-400" />
    </motion.button>
  );
}