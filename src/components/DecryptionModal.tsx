import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, CheckCircle2, AlertCircle } from 'lucide-react';

interface DecryptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Status = 'input' | 'processing' | 'success' | 'error';

export function DecryptionModal({ isOpen, onClose }: DecryptionModalProps) {
  const [proof, setProof] = useState('');
  const [status, setStatus] = useState<Status>('input');
  const [hash, setHash] = useState('');
  const [result, setResult] = useState({ id: '', result: '' });
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!proof.trim()) return;
    
    try {
      setStatus('processing');
      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      setHash('0x' + Math.random().toString(16).slice(2, 10));
      
      // Start polling
      checkTransaction();
    } catch (err) {
      setStatus('error');
      setError('Failed to submit proof');
    }
  };

  const checkTransaction = async () => {
    // Simulate polling
    await new Promise(resolve => setTimeout(resolve, 2000));
    setStatus('success');
    setResult({
      id: '0x' + Math.random().toString(16).slice(2, 42),
      result: 'Transaction completed successfully'
    });
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
              <h2 className="text-2xl font-semibold text-emerald-400">Decryption Request</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {status === 'input' && (
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

              {status === 'processing' && (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block"
                  >
                    <Loader className="w-8 h-8 text-emerald-400" />
                  </motion.div>
                  <p className="mt-4 text-gray-300">Processing your request...</p>
                  {hash && (
                    <p className="mt-2 text-sm text-gray-400">
                      Transaction Hash: <span className="text-emerald-400">{hash}</span>
                    </p>
                  )}
                </div>
              )}

              {status === 'success' && (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">Decryption Successful</h3>
                  <div className="bg-[#2a2f36] rounded-xl p-4 mt-4 text-left">
                    <p className="text-sm text-gray-300 mb-2">
                      Transaction ID: <span className="text-emerald-400">{result.id}</span>
                    </p>
                    <p className="text-sm text-gray-300">
                      Result: <span className="text-emerald-400">{result.result}</span>
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

              {status === 'error' && (
                <div className="text-center py-4">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-red-400 mb-2">Error</h3>
                  <p className="text-gray-300">{error}</p>
                  <button
                    onClick={() => setStatus('input')}
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