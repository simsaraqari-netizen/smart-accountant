import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export interface ConfirmDialogState {
  isOpen: boolean;
  message: string;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

interface ConfirmDialogProps {
  dialog: ConfirmDialogState;
  setDialog: React.Dispatch<React.SetStateAction<ConfirmDialogState>>;
}

export function ConfirmDialog({ dialog, setDialog }: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {dialog.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDialog({ ...dialog, isOpen: false })}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-sm rounded-2xl shadow-2xl p-8 text-center"
          >
            <div className="mb-6">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                تأكيد العملية
              </h3>
              <p className="text-gray-500">{dialog.message}</p>
            </div>
            <div className="flex gap-3">
              <button
                disabled={dialog.isLoading}
                onClick={() => setDialog({ ...dialog, isOpen: false })}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                تراجع
              </button>
              <button
                disabled={dialog.isLoading}
                onClick={async () => {
                  setDialog((prev) => ({
                    ...prev,
                    isLoading: true,
                  }));
                  try {
                    await dialog.onConfirm();
                    setDialog({
                      ...dialog,
                      isOpen: false,
                      isLoading: false,
                    });
                  } catch (error) {
                    console.error("Confirm Dialog Error:", error);
                    setDialog((prev) => ({
                      ...prev,
                      isLoading: false,
                    }));
                  }
                }}
                className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {dialog.isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "تأكيد"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
