import React, { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { Button } from "./Button";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { useEthersSigner } from "./contract/ethers";
import { DecryptionModal } from "./DecryptionModal";

import FunctionsConsumer from "./decryption/FunctionsConsumer.json";
const abi = FunctionsConsumer;
import { TransactionNotification } from "./TransactionNotification";

// s_lastRequestId:  0x8e4c37dd0aec21732dc411b65ee5500551d4decb82d7fab602a0eb72ba7f9287
// Header.tsx:56 s_lastResponse:  0x307831393336333033396365306361643636336166633130356532386435643935306632316531356132366637613239616162613532393735656661643236326636307832386363323533353237396364303063393161343465643632623339646663643861626665363562613963353963616665323134343638306430363338363135
// Header.tsx:57 s_lastError:  0x

type TransactionType = "deposit" | "withdraw";
type TransactionStatus = "pending" | "confirmed" | "failed";

interface Transaction {
  hash: string;
  type: TransactionType;
  amount: string;
  timestamp: number;
  status: TransactionStatus;
}

export function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function Header({ proofArgs }: { proofArgs: any[] }) {
  const [isDecryptionModalOpen, setIsDecryptionModalOpen] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { isConnected, address = "" } = useAccount();
  const signer = useEthersSigner();

  const [currentTransaction, setCurrentTransaction] =
    useState<Transaction | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "border-b border-primary/10 bg-dark/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
      style={
        {
          "--header-glow-x": `${mousePosition.x}%`,
          "--header-glow-y": `${mousePosition.y}%`,
        } as React.CSSProperties
      }
    >
      <DecryptionModal
        proofArgs={proofArgs}
        isOpen={isDecryptionModalOpen}
        onClose={() => setIsDecryptionModalOpen(false)}
      />

      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at var(--header-glow-x) var(--header-glow-y), rgba(0, 255, 163, 0.2), transparent 70%)`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 h-20 flex items-center justify-between relative">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 group">
            <Zap className="w-6 h-6 text-primary transition-all duration-300 group-hover:scale-125 group-hover:rotate-12" />
            <span
              className="text-2xl font-bold bg-gradient-to-r from-primary via-accent-blue to-primary bg-[length:200%_100%] bg-clip-text text-transparent animate-[text-shimmer_3s_linear_infinite] glitch-effect"
              data-text="zkRingSig"
            >
              zkRingSig
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* <div onClick={readResponse} className="group relative">
            <span
              className="h-[34px] flex items-center px-4 py-2
                text-sm rounded-full bg-gradient-to-r from-primary/10 to-accent-blue/10 text-primary
                hover:from-primary/20 hover:to-accent-blue/20 transition-all duration-300 cursor-pointer animate-pulse
                group-hover:animate-none group-hover:bg-gradient-to-r group-hover:from-primary/30 group-hover:to-accent-blue/30"
            >
              Decryption Check
            </span>
          </div> */}

          <div
            onClick={() => setIsDecryptionModalOpen(true)}
            // onClick={sendRequest}
            className="group relative"
          >
            <span
              className="h-[34px] flex items-center px-4 py-2
                text-sm rounded-full bg-gradient-to-r from-primary/10 to-accent-blue/10 text-primary
                hover:from-primary/20 hover:to-accent-blue/20 transition-all duration-300 cursor-pointer animate-pulse
                group-hover:animate-none group-hover:bg-gradient-to-r group-hover:from-primary/30 group-hover:to-accent-blue/30"
            >
              Decryption Request
            </span>
          </div>

          {/* Current Transaction Status */}
          {currentTransaction && (
            <TransactionNotification
              transaction={currentTransaction}
              onClose={() => setCurrentTransaction(null)}
            />
          )}

          <div className=" group relative overflow-hidden " title={address}>
            <div
              className=" absolute inset-0 bg-gradient-to-r from-primary/20 via-accent-blue/20 rounded-xl
                 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            ></div>
            <div className=" absolute" style={{ zIndex: 999, opacity: 0 }}>
              <ConnectKitButton theme="nouns" />
            </div>

            <Button
              size="sm"
              className="flex items-center gap-2 group/connect relative overflow-hidden"
            >
              <div className="flex items-center justify-center gap-2">
                {/* <Wallet
                  size={16}
                  className="transition-transform duration-300 group-hover/connect:scale-110"
                /> */}
                <span className="relative z-10">
                  {isConnected
                    ? `${truncateAddress(address)}`
                    : "Connect Wallet"}
                </span>
              </div>
            </Button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-[pulse_4s_ease-in-out_infinite]" />
        </div>
      </div>
    </header>
  );
}
