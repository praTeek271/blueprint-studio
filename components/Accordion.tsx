"use client";

import React, { useState } from "react";
import { IconChevron } from "./Icons";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  children,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 flex justify-between items-center hover:bg-slate-100 transition-colors"
      >
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {title}
        </h3>
        <IconChevron open={open} />
      </button>
      {open && (
        <div className="p-4 pt-0 border-t border-slate-200 mt-2">
          {children}
        </div>
      )}
    </div>
  );
};
