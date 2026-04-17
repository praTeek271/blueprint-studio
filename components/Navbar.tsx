"use client";

import React, { useState } from "react";
import { IconLogo, IconSidebarLeft, IconSidebarRight, IconMenu } from "./Icons";

export interface MenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}

interface NavbarProps {
  title: string;
  badge?: string;
  leftSidebarOpen?: boolean;
  onToggleLeftSidebar?: () => void;
  rightSidebarOpen?: boolean;
  onToggleRightSidebar?: () => void;
  centerContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  menuItems?: MenuItem[];
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  badge,
  leftSidebarOpen,
  onToggleLeftSidebar,
  rightSidebarOpen,
  onToggleRightSidebar,
  centerContent,
  rightContent,
  menuItems,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 z-30 shadow-sm shrink-0">
      {/* Left section */}
      <div className="flex items-center gap-4">
        {onToggleLeftSidebar && (
          <button
            onClick={onToggleLeftSidebar}
            className={`p-2 rounded-lg transition-colors ${leftSidebarOpen ? "bg-slate-100 text-blue-600" : "hover:bg-slate-100 text-slate-600"}`}
          >
            <IconSidebarLeft />
          </button>
        )}
        {onToggleLeftSidebar && <div className="h-6 w-px bg-slate-200"></div>}
        <div className="flex items-center gap-2">
          <IconLogo />
          <span className="font-black tracking-tight text-slate-800 hidden sm:inline">
            {title}
          </span>
          {badge && (
            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-black uppercase tracking-widest rounded-md">
              {badge}
            </span>
          )}
        </div>
      </div>

      {/* Center section */}
      {centerContent && (
        <div className="flex items-center gap-2">{centerContent}</div>
      )}

      {/* Right section */}
      <div className="flex items-center gap-3">
        {rightContent}
        {onToggleRightSidebar && (
          <>
            <div className="h-6 w-px bg-slate-200"></div>
            <button
              onClick={onToggleRightSidebar}
              className={`p-2 rounded-lg transition-colors ${rightSidebarOpen ? "bg-slate-100 text-blue-600" : "hover:bg-slate-100 text-slate-600"}`}
            >
              <IconSidebarRight />
            </button>
          </>
        )}
        {menuItems && menuItems.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
            >
              <IconMenu />
            </button>
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                ></div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 shadow-xl rounded-xl z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  {menuItems.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        item.onClick();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      {item.icon} {item.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
