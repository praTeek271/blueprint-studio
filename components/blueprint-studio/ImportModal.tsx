import React from "react";
import { Modal } from "@/components/Modal";

interface ImportModalProps {
  importCode: string;
  setImportCode: (v: string) => void;
  onClose: () => void;
  onImport: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  importCode,
  setImportCode,
  onClose,
  onImport,
}) => {
  return (
    <Modal
      title="Resume Workspace"
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              onClose();
              setImportCode("");
            }}
            className="px-6 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={onImport}
            className="px-6 py-2 text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-md"
          >
            Load Workspace
          </button>
        </div>
      }
    >
      <div className="p-4 flex-1">
        <p className="text-xs text-slate-500 mb-2">
          Paste previously exported code including the{" "}
          <code>{"// STATE_JSON:..."}</code> line, or raw canvas legacy
          commands.
        </p>
        <textarea
          className="w-full h-80 p-4 font-mono text-[11px] bg-slate-900 text-blue-400 resize-none focus:outline-none rounded-xl"
          placeholder="Paste code here..."
          value={importCode}
          onChange={(e) => setImportCode(e.target.value)}
        />
      </div>
    </Modal>
  );
};
