"use client";

import FullscreenButton from "./FullscreenButton";
import { usePathname } from "next/navigation";

export default function ClientOnlyFullscreenButton() {
  const pathname = usePathname();
  if (pathname === "/avatar-studio" || pathname === "/blueprint-studio") {
    return <FullscreenButton />;
  }
  return null;
}
