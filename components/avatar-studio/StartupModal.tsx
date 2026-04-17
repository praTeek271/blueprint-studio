import React from "react";
import { Modal } from "@/components/Modal";
import { IconLogo } from "@/components/Icons";

interface StartupModalProps {
  onImport: () => void;
  onDefault: () => void;
}

export const StartupModal: React.FC<StartupModalProps> = ({
  onImport,
  onDefault,
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/90 z-[100] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center mb-4">
          <IconLogo />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
          Avatar Studio V3
        </h2>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed">
          Welcome! Import a custom blueprint, or start with the default rig.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onImport}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition-colors"
          >
            Import Custom Blueprint
          </button>
          <button
            onClick={onDefault}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
          >
            Use Default Avatar 1
          </button>
        </div>
      </div>
    </div>
  );
};
