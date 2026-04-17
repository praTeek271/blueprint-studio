import React from "react";

interface SidebarProps {
  position: "left" | "right";
  open: boolean;
  width?: string;
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  position,
  open,
  width,
  children,
}) => {
  const w = width || (position === "left" ? "md:w-[360px]" : "md:w-[320px]");
  const borderClass = position === "left" ? "border-r" : "border-l";
  const posClass = position === "left" ? "left-0" : "right-0";

  const openTransform = "translate-x-0";
  const closedTransform =
    position === "left"
      ? `-translate-x-full lg:-ml-[${width ? width.replace("md:w-[", "").replace("]", "") : position === "left" ? "360px" : "320px"}]`
      : `translate-x-full lg:-mr-[${width ? width.replace("md:w-[", "").replace("]", "") : "320px"}]`;

  // Use explicit class names for Tailwind to pick up
  const closedClass =
    position === "left"
      ? "-translate-x-full lg:-ml-[360px]"
      : "translate-x-full lg:-mr-[320px]";

  return (
    <div
      className={`absolute lg:relative top-0 ${posClass} h-full w-full ${w} bg-white ${borderClass} border-slate-200 flex flex-col z-20 shadow-2xl lg:shadow-none transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? openTransform : closedClass}`}
    >
      {children}
    </div>
  );
};
