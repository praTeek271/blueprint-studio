import React from "react";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({
  title,
  onClose,
  children,
  footer,
  maxWidth = "max-w-2xl",
}) => {
  return (
    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh]`}
      >
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h2 className="font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-800 text-xl font-bold"
          >
            &times;
          </button>
        </div>
        <div className="flex-1 min-h-0 overflow-auto">{children}</div>
        {footer && (
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
