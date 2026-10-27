import React, { useState } from "react";
import { Check, Eye, Palette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import TemplatePreview from "@/components/invoice-templates/TemplatePreview";

const colorOptions = [
  {
    id: "professional-dark",
    name: "Professional Dark",
    nameAr: "داكن احترافي",
    value: "rgb(30, 41, 59)",
    gradient: "from-slate-800 to-slate-900",
  },
  {
    id: "professional-white",
    name: "Professional White",
    nameAr: "أبيض احترافي",
    value: "rgb(248, 250, 252)",
    gradient: "from-slate-50 to-slate-100",
    isDark: false,
  },
  {
    id: "elegant-gray",
    name: "Elegant Gray",
    nameAr: "رمادي أنيق",
    value: "rgb(71, 85, 105)",
    gradient: "from-slate-600 to-slate-700",
  },
  {
    id: "royal-blue",
    name: "Royal Blue",
    nameAr: "أزرق ملكي",
    value: "rgb(37, 99, 235)",
    gradient: "from-blue-600 to-blue-700",
  },
  {
    id: "deep-navy",
    name: "Deep Navy",
    nameAr: "كحلي عميق",
    value: "rgb(30, 58, 138)",
    gradient: "from-blue-900 to-blue-950",
  },
  {
    id: "forest-green",
    name: "Forest Green",
    nameAr: "أخضر غابات",
    value: "rgb(21, 128, 61)",
    gradient: "from-green-700 to-green-800",
  },
];

interface TemplateSelectorProps {
  onSelectTemplate: (templateId: string) => void;
  selectedTemplate?: string;
  isRTL?: boolean;
  t?: (key: string) => string;
  companyLogo?: string;
  onSelectColor?: (colorId: string) => void;
  selectedColor?: string;
}

const templates = [
  {
    id: "modern-gradient",
    name: "Modern Gradient",
    nameAr: "تدرج حديث",
    description: "Bold gradients with contemporary design",
    descriptionAr: "تصميم عصري مع تدرجات جريئة",
    color: "from-purple-600 to-violet-600",
    preview: "bg-gradient-to-br from-purple-600 to-violet-600",
  },
  {
    id: "classic-professional",
    name: "Classic Professional",
    nameAr: "كلاسيكي احترافي",
    description: "Traditional business style with elegance",
    descriptionAr: "أسلوب عمل تقليدي أنيق",
    color: "from-blue-600 to-indigo-600",
    preview: "bg-gradient-to-br from-blue-600 to-indigo-600",
  },
  {
    id: "minimalist-clean",
    name: "Minimalist Clean",
    nameAr: "بسيط ونظيف",
    description: "Simple and elegant minimalism",
    descriptionAr: "بساطة وأناقة في التصميم",
    color: "from-gray-800 to-gray-600",
    preview: "bg-gradient-to-br from-gray-800 to-gray-600",
  },
  {
    id: "bold-corporate",
    name: "Bold Corporate",
    nameAr: "شركات جريء",
    description: "Strong branding with impact",
    descriptionAr: "علامة تجارية قوية ومؤثرة",
    color: "from-orange-600 to-red-600",
    preview: "bg-gradient-to-br from-orange-600 to-red-600",
  },
  {
    id: "elegant-script",
    name: "Elegant Script",
    nameAr: "أنيق وفني",
    description: "Sophisticated typography focus",
    descriptionAr: "تركيز على الطباعة الراقية",
    color: "from-pink-600 to-purple-600",
    preview: "bg-gradient-to-br from-pink-600 to-purple-600",
  },
  {
    id: "tech-modern",
    name: "Tech Modern",
    nameAr: "تقني حديث",
    description: "Perfect for tech industry",
    descriptionAr: "مثالي لصناعة التكنولوجيا",
    color: "from-cyan-600 to-blue-600",
    preview: "bg-gradient-to-br from-cyan-600 to-blue-600",
  },
];

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelectTemplate,
  selectedTemplate = "modern-gradient",
  isRTL = false,
  t = (key) => key,
  companyLogo,
  onSelectColor = () => {},
  selectedColor = "professional-dark",
}) => {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 ${
        isRTL ? "rtl" : "ltr"
      }`}
    >
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                  {isRTL ? "قوالب الفواتير" : "Invoice Templates"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {isRTL
                    ? "اختر التصميم المثالي لفواتيرك"
                    : "Choose the perfect design for your invoices"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {templates.length} {isRTL ? "قالب" : "Templates"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Color Selector */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-600" />
            {isRTL ? "اختر لون القالب" : "Choose Template Color"}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {colorOptions.map((color) => (
              <button
                key={color.id}
                onClick={() => onSelectColor(color.id)}
                className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
                  selectedColor === color.id
                    ? "ring-4 ring-purple-600 shadow-xl scale-105"
                    : "hover:shadow-lg hover:scale-102"
                }`}
              >
                <div
                  className={`h-24 bg-gradient-to-br ${color.gradient} flex items-center justify-center`}
                >
                  {selectedColor === color.id && (
                    <Check className="w-8 h-8 text-white drop-shadow-lg" />
                  )}
                </div>
                <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white text-center">
                    {isRTL ? color.nameAr : color.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                selectedTemplate === template.id
                  ? "ring-4 ring-purple-600 shadow-2xl scale-105"
                  : "hover:shadow-xl"
              }`}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              onClick={() => onSelectTemplate(template.id)}
            >
              {/* Preview Area */}
              <div
                className={`h-48 ${template.preview} relative overflow-hidden flex items-center justify-center p-4`}
              >
                <div className="w-32 h-40 transform hover:scale-110 transition-transform duration-300">
                  <TemplatePreview
                    templateId={template.id}
                    companyLogo={companyLogo}
                    selectedColor={selectedColor}
                  />
                </div>

                {/* Selected Badge */}
                {selectedTemplate === template.id && (
                  <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4 bg-white text-purple-600 rounded-full p-2 shadow-lg">
                    <Check className="w-5 h-5" />
                  </div>
                )}

                {/* Hover Preview Button */}
                {hoveredTemplate === template.id && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="bg-white/90 hover:bg-white text-gray-900 shadow-xl"
                    >
                      <Eye className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" />
                      {isRTL ? "معاينة" : "Preview"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="p-6 bg-white dark:bg-gray-800">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {isRTL ? template.nameAr : template.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {isRTL ? template.descriptionAr : template.description}
                </p>

                {/* Select Button */}
                <Button
                  className={`w-full mt-4 ${
                    selectedTemplate === template.id
                      ? `bg-gradient-to-r ${template.color} text-white`
                      : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTemplate(template.id);
                  }}
                >
                  {selectedTemplate === template.id ? (
                    <>
                      <Check className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                      {isRTL ? "محدد" : "Selected"}
                    </>
                  ) : (
                    <>{isRTL ? "اختيار القالب" : "Select Template"}</>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
