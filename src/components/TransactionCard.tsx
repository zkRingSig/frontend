import React, { useState, useEffect } from "react";
import { ArrowDownUp, ShieldCheck, Wallet, AlertCircle } from "lucide-react";
import { Card } from "./Card";
import { Button } from "./Button";
import { AmountInput } from "./AmountInput";

type TransactionType = "deposit" | "withdraw";

export function TransactionCard() {
  const [transactionType, setTransactionType] =
    useState<TransactionType>("deposit");
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const card = document.querySelector(".transaction-card");
      if (card) {
        const rect = card.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <Card className="w-full max-w-md">
      <div className="transaction-card relative">
        {/* Dynamic background glow */}
        <div
          className="absolute -inset-[2px] rounded-2xl opacity-75 transition-opacity duration-300 blur-lg"
          style={{
            background: `
              radial-gradient(
                circle at ${mousePosition.x}px ${mousePosition.y}px,
                rgba(0, 255, 163, 0.3) 0%,
                rgba(11, 204, 249, 0.3) 25%,
                transparent 70%
              )
            `,
          }}
        />

        {/* Animated border */}
        <div className="absolute -inset-[1px] rounded-2xl">
          <div className="absolute inset-0 rounded-2xl border border-primary/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>
        </div>

        {/* Main content container */}
        <div className="relative bg-dark-lighter/90 backdrop-blur-xl p-8 rounded-2xl border border-primary/10">
          {/* Decorative corner accents */}
          {/* {[
            "-top-px -left-px",
            "-top-px -right-px",
            "-bottom-px -left-px",
            "-bottom-px -right-px",
          ].map((position) => (
            <div key={position} className={`absolute w-8 h-8 ${position}`}>
              <div
                className="absolute inset-0 border-primary/30"
                style={{
                  borderWidth: position.includes("top")
                    ? "1px 1px 0 0"
                    : "0 0 1px 1px",
                  borderRadius: position.includes("top")
                    ? position.includes("left")
                      ? "8px 0 0 0"
                      : "0 8px 0 0"
                    : position.includes("left")
                      ? "0 0 0 8px"
                      : "0 0 8px 0",
                }}
              />
            </div>
          ))} */}

          {/* Toggle button with enhanced design */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <button
              onClick={() =>
                setTransactionType(
                  transactionType === "deposit" ? "withdraw" : "deposit"
                )
              }
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="group p-4 rounded-xl bg-dark-lighter border border-primary/30 hover:border-primary/50 transition-all duration-300 relative"
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 via-accent-blue/5 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-[2px] rounded-lg bg-dark" />
              <ArrowDownUp
                className={`relative text-primary transition-all duration-500 ${
                  isHovering ? "rotate-180 scale-110" : ""
                }`}
                size={24}
              />
              <div className="absolute inset-0 rounded-xl">
                <div className="absolute inset-[-1px] bg-gradient-to-r from-primary/50 via-accent-blue/50 to-primary/50 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
              </div>
            </button>
          </div>

          {/* Header with enhanced typography */}
          <div className="text-center mb-8 pt-2">
            <h2 className="text-2xl font-bold mb-2 relative">
              <span className="relative z-10 bg-gradient-to-r from-primary via-accent-blue to-primary bg-[length:200%_100%] bg-clip-text text-transparent animate-[text-shimmer_3s_linear_infinite]">
                {transactionType === "deposit" ? "Deposit" : "Withdraw"}
              </span>
            </h2>
            <p className="text-gray-400 text-sm">
              {transactionType === "deposit"
                ? "Secure your assets in the privacy pool"
                : "Withdraw your assets anonymously"}
            </p>
          </div>

          {/* Main form with enhanced styling */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-300">
                  Amount
                </label>
                <span className="text-sm">
                  Balance:{" "}
                  <span className="text-primary font-medium">0.0 ETH</span>
                </span>
              </div>
              <AmountInput
                placeholder="0.0"
                className="bg-dark/50 border-primary/20 focus:border-primary/40"
              />
              <div className="flex justify-end gap-2 mt-1">
                {["0.1", "1.0", "10.0"].map((amount) => (
                  <button
                    key={amount}
                    className="px-3 py-1.5 text-xs rounded-lg bg-dark border border-primary/20 hover:border-primary/40 text-gray-400 hover:text-primary transition-all duration-300"
                  >
                    {amount} ETH
                  </button>
                ))}
              </div>
            </div>

            {/* Security info with enhanced visual */}
            <div className="p-4 rounded-xl bg-dark/50 border border-primary/10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-start gap-3 relative">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="text-primary" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-primary mb-1">
                    Security Guarantee
                  </h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Your transaction is protected by zero-knowledge proofs and
                    will remain completely anonymous on the blockchain.
                  </p>
                </div>
              </div>
            </div>

            {/* Warning with enhanced styling */}
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-accent-blue/5 border border-accent-blue/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <AlertCircle size={16} className="text-accent-blue shrink-0" />
              <p className="text-xs text-accent-blue relative">
                Minimum transaction amount is 0.1 ETH
              </p>
            </div>

            {/* Enhanced action button */}

            <div className="w-full group relative overflow-hidden ">
              <div
                className=" absolute inset-0 bg-gradient-to-r from-primary/20 via-accent-blue/20 rounded-xl
                 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
              <Button
                size="lg"
                className="w-full group relative overflow-hidden"
              >
                <div className="flex items-center justify-center relative">
                  <Wallet className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                  <span className="relative">
                    {transactionType === "deposit"
                      ? "Deposit Funds"
                      : "Withdraw Funds"}
                  </span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
