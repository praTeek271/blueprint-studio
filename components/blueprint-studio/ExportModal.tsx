import React from "react";
import { Modal } from "@/components/Modal";

interface ExportModalProps {
  exportedCode: string;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  exportedCode,
  onClose,
}) => {
  return (
    <Modal
      title="Exported Canvas Formula"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg"
          >
            Close
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(exportedCode);
              alert("Copied!");
            }}
            className="px-6 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-md"
          >
            Copy Code
          </button>
        </div>
      }
    >
      <div className="p-0 flex-1">
        <textarea
          className="w-full h-96 p-4 font-mono text-[11px] bg-slate-900 text-green-400 resize-none focus:outline-none leading-relaxed"
          readOnly
          value={exportedCode}
        />
      </div>
    </Modal>
  );
};
