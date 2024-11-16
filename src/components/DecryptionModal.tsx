import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader, CheckCircle2, AlertCircle } from "lucide-react";
import { parseKS } from "./contract/functions";
import { useEthersSigner } from "./contract/ethers";
import { ethers } from "ethers";
import { Source } from "./decryption/source";
import FunctionsConsumer from "./decryption/FunctionsConsumer.json";
import { utf8ArrayToStr, byteStrToUint8Array } from "./contract/functions";

const abi = FunctionsConsumer;
interface DecryptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Location = {
  Inline: 0,
  Remote: 1,
  DONHosted: 2,
};

// sepolia test
const consumerAddress = "0xbc38276Aa222cf14f45449a6A55baeDf164813c7";
const subscriptionId = "1759";

type Status = "input" | "processing" | "success" | "error";

export function DecryptionModal({
  isOpen,
  onClose,
  proofArgs,
}: DecryptionModalProps) {
  const signer = useEthersSigner();

  const [proof, setProof] = useState("");
  const [status, setStatus] = useState<Status>("input");
  const [hash, setHash] = useState("");
  const [result, setResult] = useState({ id: "", result: "" });
  const [error, setError] = useState("");

  const proofArgsStr = useMemo(() => proofArgs.join(""), [proofArgs]);

  useEffect(() => {
    setProof(proofArgsStr);
  }, [proofArgsStr]);

  const readResponse = async () => {
    const functionsConsumer = new ethers.Contract(consumerAddress, abi, signer);

    const s_lastRequestId = await functionsConsumer.s_lastRequestId();
    const s_lastResponse = await functionsConsumer.s_lastResponse();
    const s_lastError = await functionsConsumer.s_lastError();

    console.log("s_lastRequestId: ", s_lastRequestId);
    console.log("s_lastResponse: ", s_lastResponse);
    console.log("s_lastError: ", s_lastError);

    console.log("");

    return {
      s_lastRequestId,
      s_lastResponse: utf8ArrayToStr(byteStrToUint8Array(s_lastResponse)),
      s_lastError: utf8ArrayToStr(byteStrToUint8Array(s_lastError)),
    };
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
    const args = parseKS(proofArgs);

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

    return requestTx.hash;
  };

  const handleSubmit = async () => {
    if (!proof.trim()) return;

    try {
      setStatus("processing");
      const hash = await sendRequest();

      // Simulate API call for demo
      // await new Promise((resolve) => setTimeout(resolve, 1500));
      setHash(hash);

      // Start polling
      checkTransaction();
    } catch (err) {
      setStatus("error");
      setError("Failed to submit proof");
    }
  };

  const checkTransaction = async () => {
    const previousRequestId = localStorage.getItem("lastRequestId") || "";

    const intervalId = setInterval(async () => {
      const { s_lastRequestId, s_lastResponse, s_lastError } =
        await readResponse();

      if (s_lastRequestId !== previousRequestId) {
        localStorage.setItem("lastRequestId", s_lastRequestId);
        setStatus("success");
        setResult({
          id: s_lastRequestId,
          result: s_lastResponse || s_lastError,
        });
      }
    }, 3000); // 3000ms = 3 seconds

    return () => clearInterval(intervalId); // Return a function to clear the interval if needed
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#1e2329] rounded-2xl p-8 w-full max-w-lg mx-4 border border-gray-800 shadow-xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-emerald-400">
                Decryption Request
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {status === "input" && (
                <div>
                  <textarea
                    value={proof}
                    onChange={(e) => setProof(e.target.value)}
                    placeholder="Enter your proof string..."
                    className="w-full h-32 px-4 py-3 bg-[#2a2f36] rounded-xl text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                  <button
                    onClick={handleSubmit}
                    className="mt-4 w-full py-3 bg-emerald-500 text-black rounded-xl font-medium hover:bg-emerald-400 transition-colors"
                  >
                    Submit Proof
                  </button>
                </div>
              )}

              {status === "processing" && (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="inline-block"
                  >
                    <Loader className="w-8 h-8 text-emerald-400" />
                  </motion.div>
                  <p className="mt-4 text-gray-300">
                    Processing your request...
                  </p>
                  {hash && (
                    <p className="mt-2 text-sm text-gray-400">
                      Transaction Hash:{" "}
                      <span className="text-emerald-400">{hash}</span>
                    </p>
                  )}
                </div>
              )}

              {status === "success" && (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">
                    Decryption Successful
                  </h3>
                  <div className="bg-[#2a2f36] rounded-xl p-4 mt-4 text-left">
                    <p className="text-sm text-gray-300 mb-2">
                      Transaction ID:{" "}
                      <span className="text-emerald-400">{result.id}</span>
                    </p>
                    <p className="text-sm text-gray-300">
                      Result:{" "}
                      <span className="text-emerald-400">{result.result}</span>
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="mt-6 px-6 py-2 bg-emerald-500 text-black rounded-lg font-medium hover:bg-emerald-400 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}

              {status === "error" && (
                <div className="text-center py-4">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-red-400 mb-2">
                    Error
                  </h3>
                  <p className="text-gray-300">{error}</p>
                  <button
                    onClick={() => setStatus("input")}
                    className="mt-6 px-6 py-2 bg-[#2a2f36] text-white rounded-lg font-medium hover:bg-[#353a42] transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
