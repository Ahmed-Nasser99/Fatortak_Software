import React from "react";

interface TemplatePreviewProps {
  templateId: string;
  companyLogo?: string;
  selectedColor?: string;
}

const getColorClasses = (selectedColor: string) => {
  const colorMap: Record<
    string,
    { bg: string; gradient: string; border: string; text: string }
  > = {
    "professional-dark": {
      bg: "bg-slate-800",
      gradient: "from-slate-800 to-slate-900",
      border: "border-slate-800",
      text: "text-slate-800",
    },
    "professional-white": {
      bg: "bg-slate-50",
      gradient: "from-slate-50 to-slate-100",
      border: "border-slate-300",
      text: "text-slate-800",
    },
    "elegant-gray": {
      bg: "bg-slate-600",
      gradient: "from-slate-600 to-slate-700",
      border: "border-slate-600",
      text: "text-slate-600",
    },
    "royal-blue": {
      bg: "bg-blue-600",
      gradient: "from-blue-600 to-blue-700",
      border: "border-blue-600",
      text: "text-blue-600",
    },
    "deep-navy": {
      bg: "bg-blue-900",
      gradient: "from-blue-900 to-blue-950",
      border: "border-blue-900",
      text: "text-blue-900",
    },
    "forest-green": {
      bg: "bg-green-700",
      gradient: "from-green-700 to-green-800",
      border: "border-green-700",
      text: "text-green-700",
    },
  };
  return colorMap[selectedColor] || colorMap["professional-dark"];
};

const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  templateId,
  companyLogo,
  selectedColor = "professional-dark",
}) => {
  const colors = getColorClasses(selectedColor);

  const getPreviewByTemplate = () => {
    switch (templateId) {
      case "modern-gradient":
        return (
          <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-sm">
            <div
              className={`h-8 bg-gradient-to-r ${colors.gradient} flex items-center px-2`}
            >
              {companyLogo && (
                <div className="w-4 h-4 bg-white/20 rounded"></div>
              )}
            </div>
            <div className="p-2 space-y-1">
              <div className="h-1 bg-gray-200 w-3/4"></div>
              <div className="h-1 bg-gray-200 w-1/2"></div>
              <div className={`h-1 ${colors.bg}/20 w-full mt-2`}></div>
              <div className={`h-1 ${colors.bg}/20 w-full`}></div>
            </div>
          </div>
        );

      case "classic-professional":
        return (
          <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-sm">
            <div
              className={`h-8 ${colors.bg} flex items-center justify-between px-2`}
            >
              {companyLogo && (
                <div className="w-4 h-4 bg-white/20 rounded"></div>
              )}
              <div className="w-6 h-2 bg-white/30 rounded"></div>
            </div>
            <div className="p-2 space-y-1">
              <div className="grid grid-cols-3 gap-1 mb-2">
                <div className="h-6 bg-blue-50 rounded"></div>
                <div className="h-6 bg-blue-50 rounded"></div>
                <div className="h-6 bg-blue-50 rounded"></div>
              </div>
              <div className="h-1 bg-gray-200 w-full"></div>
              <div className="h-1 bg-gray-200 w-4/5"></div>
            </div>
          </div>
        );

      case "minimalist-clean":
        return (
          <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-sm border border-gray-900">
            <div className="p-2">
              {companyLogo && (
                <div className="w-3 h-3 bg-gray-200 rounded mb-2"></div>
              )}
              <div className="h-px bg-gray-900 mb-2"></div>
              <div className="space-y-1">
                <div className="h-1 bg-gray-300 w-2/3"></div>
                <div className="h-1 bg-gray-300 w-1/2"></div>
                <div className="h-1 bg-gray-300 w-full mt-2"></div>
                <div className="h-1 bg-gray-300 w-full"></div>
              </div>
            </div>
          </div>
        );

      case "bold-corporate":
        return (
          <div className="w-full h-full bg-white rounded-lg overflow-hidden shadow-sm">
            <div
              className={`h-10 bg-gradient-to-r ${colors.gradient} flex items-center px-2`}
            >
              {companyLogo && <div className="w-5 h-5 bg-white rounded"></div>}
            </div>
            <div className="p-2">
              <div className="grid grid-cols-3 gap-1 mb-2">
                <div
                  className={`h-8 bg-orange-50 rounded-lg border-l-2 ${colors.border}`}
                ></div>
                <div
                  className={`h-8 bg-red-50 rounded-lg border-l-2 ${colors.border}`}
                ></div>
                <div
                  className={`h-8 bg-orange-50 rounded-lg border-l-2 ${colors.border}`}
                ></div>
              </div>
              <div className="h-1 bg-gray-200 w-full"></div>
            </div>
          </div>
        );

      case "elegant-script":
        return (
          <div
            className={`w-full h-full bg-gray-50 rounded-lg overflow-hidden shadow-sm`}
          >
            <div className="p-2 text-center">
              {companyLogo && (
                <div
                  className={`w-4 h-4 ${colors.bg} rounded-full mx-auto mb-1`}
                ></div>
              )}
              <div
                className={`h-1 ${colors.bg} w-2/3 mx-auto mb-2 rounded`}
              ></div>
              <div className="h-6 bg-white rounded-full mb-2"></div>
              <div className="grid grid-cols-2 gap-1 mb-2">
                <div className="h-8 bg-white rounded-2xl"></div>
                <div className="h-8 bg-white rounded-2xl"></div>
              </div>
              <div
                className={`h-8 bg-gradient-to-r ${colors.gradient} rounded-2xl`}
              ></div>
            </div>
          </div>
        );

      case "tech-modern":
        return (
          <div className="w-full h-full bg-gradient-to-br from-cyan-950 to-blue-950 rounded-lg overflow-hidden shadow-sm">
            <div className="p-2">
              <div className="h-8 bg-cyan-900/30 border border-cyan-700/50 rounded-lg mb-2 flex items-center px-1">
                {companyLogo && (
                  <div className="w-3 h-3 bg-cyan-500/20 border border-cyan-500/30 rounded"></div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1 mb-2">
                <div className="h-6 bg-cyan-900/20 border border-cyan-700/30 rounded"></div>
                <div className="h-6 bg-cyan-900/20 border border-cyan-700/30 rounded"></div>
                <div className="h-6 bg-cyan-900/20 border border-cyan-700/30 rounded"></div>
              </div>
              <div className="h-10 bg-cyan-900/20 border border-cyan-700/30 rounded"></div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="w-full h-full">{getPreviewByTemplate()}</div>;
};

export default TemplatePreview;
