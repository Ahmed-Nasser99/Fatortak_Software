import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { exportService } from "@/services/exportService";
import { Download, FileText, Table } from "lucide-react";
import { toast } from "react-toastify";

interface ExportButtonProps {
  data: any;
  elementId?: string;
  filename?: string;
}

export const ExportButton = ({
  data,
  elementId = "reports-container",
  filename = "business-report",
}: ExportButtonProps) => {
  const { t, isRTL } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportService.exportToPDF(elementId, `${filename}.pdf`);
      toast.success(t("reports.export.success"));
    } catch (error) {
      toast(t("reports.export.error"));
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    try {
      exportService.exportStatsToJSON(data, `${filename}.json`);
      toast.success(t("reports.export.success"));
    } catch (error) {
      toast.error(t("reports.export.error"));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={isExporting}
          className={`bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <Download className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
          {isExporting ? t("loading") : t("reports.export.button")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className={`${isRTL ? "text-right" : "text-left"}`}>
        <DropdownMenuItem
          onClick={handleExportPDF}
          className={`${isRTL ? "flex-row-reverse" : ""}`}
        >
          <FileText className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
          {t("reports.export.pdf")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
