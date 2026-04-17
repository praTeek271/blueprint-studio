import React from "react";
import { Modal } from "@/components/Modal";

interface ExportModalProps {
  exportPayload: { json: string; env: string };
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  exportPayload,
  onClose,
}) => {
  return (
    <Modal
      title="Export Player Assets"
      onClose={onClose}
      maxWidth="max-w-4xl"
      footer={
        <div className="flex justify-between items-center gap-3">
          <span className="text-xs font-bold text-slate-400 hidden sm:block">
            Save JSON file and add ENV variables to your Next.js Player
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors ml-auto"
          >
            Done
          </button>
        </div>
      }
    >
      <div className="flex flex-1 min-h-0 flex-col md:flex-row">
        <div className="flex-1 flex flex-col border-r border-slate-200">
          <div className="p-2 bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4">
            avatar-config.json
          </div>
          <textarea
            className="w-full flex-1 p-4 font-mono text-[11px] bg-slate-900 text-green-400 resize-none focus:outline-none"
            readOnly
            value={exportPayload.json}
          />
        </div>
        <div className="w-full md:w-1/3 flex flex-col bg-slate-50">
          <div className="p-2 bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4">
            .env Variables
          </div>
          <textarea
            className="w-full flex-1 p-4 font-mono text-[11px] bg-slate-800 text-blue-300 resize-none focus:outline-none"
            readOnly
            value={exportPayload.env}
          />
        </div>
      </div>
    </Modal>
  );
};
