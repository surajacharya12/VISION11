"use client";

import { useState } from "react";
import Image from "next/image";

export default function TeamLogo({
  src,
  name,
  className = "w-7 h-7",
  size,
}: {
  src?: string;
  name: string;
  className?: string;
  size?: string;
}) {
  const [err, setErr] = useState(false);

  const containerClass = size || className;

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  if (!src || err || !src.includes("://")) {
    return (
      <div className={`${containerClass} rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
        {initials}
      </div>
    );
  }

  return (
    <div className={`relative ${containerClass} shrink-0`}>
      <Image
        src={src}
        alt={name}
        fill
        onError={() => setErr(true)}
        className="object-contain"
        unoptimized
      />
    </div>
  );
}
