import React, { useState, useEffect } from "react";
import { Zap } from "lucide-react";
import { Button } from "./Button";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { Source } from "./decryption/source";
import { useEthersSigner } from "./contract/ethers";
import { ethers } from "ethers";
import { DecryptionModal } from "./DecryptionModal";

import FunctionsConsumer from "./decryption/FunctionsConsumer.json";
const abi = FunctionsConsumer;
import { TransactionNotification } from "./TransactionNotification";

// s_lastRequestId:  0x8e4c37dd0aec21732dc411b65ee5500551d4decb82d7fab602a0eb72ba7f9287
// Header.tsx:56 s_lastResponse:  0x307831393336333033396365306361643636336166633130356532386435643935306632316531356132366637613239616162613532393735656661643236326636307832386363323533353237396364303063393161343465643632623339646663643861626665363562613963353963616665323134343638306430363338363135
// Header.tsx:57 s_lastError:  0x

const Location = {
  Inline: 0,
  Remote: 1,
  DONHosted: 2,
};

// sepolia test
const consumerAddress = "0xbc38276Aa222cf14f45449a6A55baeDf164813c7";
const subscriptionId = "1759";

type TransactionType = "deposit" | "withdraw";
type TransactionStatus = "pending" | "confirmed" | "failed";

interface Transaction {
  hash: string;
  type: TransactionType;
  amount: string;
  timestamp: number;
  status: TransactionStatus;
}

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function Header() {
  const [isDecryptionModalOpen, setIsDecryptionModalOpen] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { isConnected, address = "" } = useAccount();
  const signer = useEthersSigner();

  const [currentTransaction, setCurrentTransaction] =
    useState<Transaction | null>(null);

  const readResponse = async () => {
    const functionsConsumer = new ethers.Contract(consumerAddress, abi, signer);

    const s_lastRequestId = await functionsConsumer.s_lastRequestId();
    const s_lastResponse = await functionsConsumer.s_lastResponse();
    const s_lastError = await functionsConsumer.s_lastError();

    console.log("s_lastRequestId: ", s_lastRequestId);
    console.log("s_lastResponse: ", s_lastResponse);
    console.log("s_lastError: ", s_lastError);

    console.log("");
  };

  const sendRequest = async () => {
    if (!consumerAddress || !subscriptionId) {
      throw Error("Missing required environment variables.");
    }

    const functionsConsumer = new ethers.Contract(consumerAddress, abi, signer);

    // const source = fs
    //   .readFileSync(path.resolve(__dirname, "./source.js"))
    //   .toString();

    const callbackGasLimit = 300_000; // 300_000;

    // response: 0x307831393336333033396365306361643636336166633130356532386435643935306632316531356132366637613239616162613532393735656661643236326636307832386363323533353237396364303063393161343465643632623339646663643861626665363562613963353963616665323134343638306430363338363135
    // bytes to string: 0x19363039ce0cad663afc105e28d5d950f21e15a26f7a29aaba52975efad262f60x28cc2535279cd00c91a44ed62b39dfcd8abfe65ba9c59cafe2144680d0638615
    const args = [
      "0x2d40aebcad9e5d972ebcadbab2986fb550ca2bb846131cfb2f061f19f4a6dd17",
      "0x0ef2431445ff92190d1115df30c7879746fd8dace6235bb7c3e5612add2b4373",
    ];

    console.log("\n Sending the Request....");
    // const requestTx = await functionsConsumer.sendRequest(
    //   source,
    //   args,
    //   [],
    //   subscriptionId,
    //   callbackGasLimit
    // );

    console.log("Source: ", Source);

    const encryptedSecretsRef =
      "0x7383e9ecab75f5b7e21509e90b20ed7a0259489ed4ec0de1aaea6c4d12fd55f40a98b6dc06b51c115ea651fe4a04c82da00f54c75dc44763bde0da4d8ac272c8cf8125833c84c3ef2a38a6e586ccf4d4ed8f41c96c725e00ca240930cb3a1984075d09b9b0c04965330e77a5b9097f928e844b47e65bb137ff77433138d535d198efb402e60ea97c4a33ac14a01168c93d83662b8bbcdcd1e6a560e81092183ab3f6bf15ef33db6fdebf9a6479aa8fc53392f123d2b2ab48ba8a3e7912568f2c4dc64d0cb2ff97381f5d448a26b6b489414d99108c6998581bddc4da6f6c21f60a337930060feb2e7a54d71c1f8203aae0";
    const requestTx = await functionsConsumer.sendRequestWithSecret(
      Source,
      Location.Remote, // Location.DONHosted, Location.Remote
      encryptedSecretsRef,
      args,
      [],
      subscriptionId,
      callbackGasLimit
    );

    const txReceipt = await requestTx.wait(1);

    console.log(`Request made.  TxHash is ${requestTx.hash}`);

    console.log("", { txReceipt });
  };

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

          {/* <div className="hidden md:flex items-center gap-6">
            <div className="h-4 w-px bg-gradient-to-b from-primary/20 to-accent-blue/20" />
            <nav className="flex gap-6">
              {["Pool", "Stats", "Docs"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-sm text-gray-400 hover:text-primary transition-colors duration-300 relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-primary to-accent-blue group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </nav>
          </div> */}
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
