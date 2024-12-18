import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, ArrowUpRight, XCircle } from "lucide-react";
import { cn } from "../utils/cn";
import { truncateAddress } from "./Header";

interface Transaction {
  hash: string;
  type: "deposit" | "withdraw";
  amount: string;
  timestamp: number;
  status: "pending" | "confirmed" | "failed";
  network: "mainnet" | "ropsten" | "rinkeby" | "sepolia";
}

interface TransactionNotificationProps {
  transaction: Transaction;
  onClose: () => void;
}

export function TransactionNotification({
  transaction,
  onClose,
}: TransactionNotificationProps) {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setShow(true);
    const timer = setInterval(() => {
      setProgress((p) => Math.min(p + 1, 100));
    }, 30);

    return () => clearInterval(timer);
  }, []);

  const statusIcon = {
    preparing: <Loader2 className="w-5 h-5 text-primary animate-spin" />,
    pending: <Loader2 className="w-5 h-5 text-primary animate-spin" />,
    confirmed: <CheckCircle2 className="w-5 h-5 text-primary" />,
    failed: <XCircle className="w-5 h-5 text-red-500" />,
  }[transaction.status];

  const statusText = {
    preparing: "Preparing",
    pending: "Processing",
    confirmed: "Confirmed",
    failed: "Failed",
  }[transaction.status];

  const EXPLORER_URL = "https://sepolia.etherscan.io/tx/" as const;

  return (
    <div
      className={cn(
        "relative overflow-hidden transition-all duration-300 transform",
        show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}
    >
      <div className="p-4 rounded-xl bg-dark-lighter border border-primary/20 relative overflow-hidden">
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 h-0.5 bg-primary/20 w-full">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="shrink-0">{statusIcon}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-300">
                {transaction.type === "deposit" ? "Depositing" : "Withdrawing"}
              </span>
              <span className="text-sm font-medium text-primary">
                {transaction.amount} ETH
              </span>
              <span className="text-xs text-gray-500">• {statusText}</span>
            </div>

            {transaction.hash && (
              <a
                title={transaction.hash}
                href={`${EXPLORER_URL}${transaction.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-primary transition-colors duration-300 flex items-center gap-1 truncate"
                style={{ maxWidth: "100%" }}
              >
                <span className="truncate">{transaction.hash}</span>
                <ArrowUpRight size={12} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
