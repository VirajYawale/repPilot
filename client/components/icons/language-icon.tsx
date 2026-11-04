import * as React from "react";
import {
  SiTypescript,
  SiJavascript,
  SiPython,
  SiGo,
  SiRust,
  SiCplusplus,
  SiRuby,
  SiPhp,
  SiKotlin,
  SiSwift,
  SiHtml5,
  SiCss,
} from "react-icons/si";
import { FaJava } from "react-icons/fa6";
import { IoLanguageOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";

export interface LanguageIconProps extends React.SVGProps<SVGSVGElement> {
  language?: string;
  className?: string;
  size?: number | string;
}

export function LanguageIcon({
  language,
  className,
  size = 16,
  ...props
}: LanguageIconProps) {
  const normalizedSize = size === "sm" ? 12 : size === "md" ? 16 : size === "lg" ? 20 : size;
  const normalized = language?.trim().toLowerCase() || "";

  switch (normalized) {
    case "typescript":
    case "ts":
    case "tsx":
      return (
        <SiTypescript
          className={cn("text-[#3178C6]", className)}
          size={normalizedSize}
          {...props}
        />
      );
    case "javascript":
    case "js":
    case "jsx":
      return (
        <SiJavascript
          className={cn("text-[#F7DF1E]", className)}
          size={normalizedSize}
          {...props}
        />
      );
    case "python":
    case "py":
      return (
        <SiPython
          className={cn("text-[#3776AB]", className)}
          size={normalizedSize}
          {...props}
        />
      );
    case "java":
      return (
        <FaJava
          className={cn("text-[#ED8B00]", className)}
          size={normalizedSize}
          {...props}
        />
      );
    case "go":
    case "golang":
      return (
        <SiGo
          className={cn("text-[#00ADD8]", className)}
          size={normalizedSize}
          {...props}
        />
      );
    case "rust":
    case "rs":
      return (
        <SiRust
          className={cn("text-[#DEA584] dark:text-foreground", className)}
          size={normalizedSize}
          {...props}
        />
      );
    case "c++":
    case "cpp":
    case "c":
      return (
        <SiCplusplus
          className={cn("text-[#00599C]", className)}
          size={normalizedSize}
          {...props}
        />
      );
    case "ruby":
    case "rb":
      return (
        <SiRuby
          className={cn("text-[#CC342D]", className)}
          size={normalizedSize}
          {...props}
        />
      );
    case "php":
      return (
        <SiPhp
          className={cn("text-[#777BB4]", className)}
          size={normalizedSize}
          {...props}
        />
      );
    case "kotlin":
    case "kt":
      return (
        <SiKotlin
          className={cn("text-[#7F52FF]", className)}
          size={normalizedSize}
          {...props}
        />
      );
    case "swift":
      return (
        <SiSwift
          className={cn("text-[#F05138]", className)}
          size={normalizedSize}
          {...props}
        />
      );
    case "html":
      return (
        <SiHtml5
          className={cn("text-[#E34F26]", className)}
          size={normalizedSize}
          {...props}
        />
      );
    case "css":
      return (
        <SiCss
          className={cn("text-[#1572B6]", className)}
          size={normalizedSize}
          {...props}
        />
      );
    default:
      return (
        <IoLanguageOutline
          className={cn("text-muted-foreground", className)}
          size={normalizedSize}
          {...props}
        />
      );
  }
}

export default LanguageIcon;

export function getLanguageLabel(language: string | null) {
  return language || "Unknown";
}
