export interface ColorClasses {
  primary: string;
  primaryDark: string;
  gradient: string;
  border: string;
  bg: string;
  bgLight: string;
  text: string;
  textLight: string;
}

export const getColorClasses = (colorId?: string): ColorClasses => {
  const colorMap: Record<string, ColorClasses> = {
    "professional-dark": {
      primary: "slate-800",
      primaryDark: "slate-900",
      gradient: "from-slate-800 to-slate-900",
      border: "border-slate-800",
      bg: "bg-slate-800",
      bgLight: "bg-slate-50",
      text: "text-slate-800",
      textLight: "text-slate-100",
    },
    "professional-white": {
      primary: "slate-100",
      primaryDark: "slate-200",
      gradient: "from-slate-50 to-slate-100",
      border: "border-slate-300",
      bg: "bg-slate-100",
      bgLight: "bg-slate-50",
      text: "text-slate-800",
      textLight: "text-slate-600",
    },
    "elegant-gray": {
      primary: "slate-600",
      primaryDark: "slate-700",
      gradient: "from-slate-600 to-slate-700",
      border: "border-slate-600",
      bg: "bg-slate-600",
      bgLight: "bg-slate-100",
      text: "text-slate-600",
      textLight: "text-slate-200",
    },
    "royal-blue": {
      primary: "blue-600",
      primaryDark: "blue-700",
      gradient: "from-blue-600 to-blue-700",
      border: "border-blue-600",
      bg: "bg-blue-600",
      bgLight: "bg-blue-50",
      text: "text-blue-600",
      textLight: "text-blue-100",
    },
    "deep-navy": {
      primary: "blue-900",
      primaryDark: "blue-950",
      gradient: "from-blue-900 to-blue-950",
      border: "border-blue-900",
      bg: "bg-blue-900",
      bgLight: "bg-blue-50",
      text: "text-blue-900",
      textLight: "text-blue-100",
    },
    "forest-green": {
      primary: "green-700",
      primaryDark: "green-800",
      gradient: "from-green-700 to-green-800",
      border: "border-green-700",
      bg: "bg-green-700",
      bgLight: "bg-green-50",
      text: "text-green-700",
      textLight: "text-green-100",
    },
  };

  return colorMap[colorId || "professional-dark"] || colorMap["professional-dark"];
};
