import React from "react";
import { Link } from "react-router-dom";

const Logo = ({ size = "md", showTagline = false, className = "" }) => {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-2.5 group ${className}`}
    >
      {/* Plate + Circular Reuse Arrow Icon Concept */}
      <div
        className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-soft-sm group-hover:shadow-soft-md group-hover:scale-105 transition-all duration-200 shrink-0 ${iconSizes[size]}`}
      >
        {/* Custom SVG Plate + Circular Arrows Logo */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          {/* Outer Plate Circle */}
          <circle cx="12" cy="12" r="9" className="opacity-40" />
          {/* Inner Plate Rim */}
          <circle cx="12" cy="12" r="5" className="opacity-90" />
          {/* Circular Reuse Arrow top-right */}
          <path d="M17 7.5A8 8 0 0 1 19 12a7 7 0 0 1-7 7" strokeWidth="2.2" />
          <polyline points="15 5 17 7.5 14.5 9.5" strokeWidth="2.2" />
          {/* Circular Reuse Arrow bottom-left */}
          <path d="M7 16.5A8 8 0 0 1 5 12a7 7 0 0 1 7-7" strokeWidth="2.2" />
          <polyline points="9 19 7 16.5 9.5 14.5" strokeWidth="2.2" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-tight text-charcoal-900 ${textSizes[size]}`}
          >
            RePlate
          </span>
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
        </div>

        {showTagline && (
          <span className="text-[11px] font-medium text-brand-700 tracking-wide -mt-0.5">
            Good food deserves another plate.
          </span>
        )}
      </div>
    </Link>
  );
};

export default Logo;
