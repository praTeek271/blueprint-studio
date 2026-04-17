import React from "react";
import { Modal } from "@/components/Modal";

interface ImportModalProps {
  customImportCategory: string | null;
  importCode: string;
  setImportCode: (v: string) => void;
  onClose: () => void;
  onImport: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  customImportCategory,
  importCode,
  setImportCode,
  onClose,
  onImport,
}) => {
  const title = customImportCategory
    ? `Import Custom ${customImportCategory.charAt(0).toUpperCase() + customImportCategory.slice(1)}`
    : "Load Blueprint";

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onImport}
            className="px-6 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors shadow-md"
          >
            Load Blueprint
          </button>
        </div>
      }
    >
      <div className="p-4">
        <p className="text-xs text-slate-500 mb-2">
          Paste code exported from Blueprint Studio.
        </p>
        <textarea
          className="w-full h-80 p-4 font-mono text-[11px] bg-slate-900 text-blue-400 resize-none focus:outline-none rounded-xl"
          placeholder="Paste Blueprint Code here..."
          value={importCode}
          onChange={(e) => setImportCode(e.target.value)}
        />
      </div>
    </Modal>
  );
};
