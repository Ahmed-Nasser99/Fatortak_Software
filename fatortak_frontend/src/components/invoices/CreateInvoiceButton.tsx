import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuotaGuard } from "../../hooks/useQuotaGuard";
import QuotaLimitModal from "../modals/QuotaLimitModal";
import { useLanguage } from "../../contexts/LanguageContext";

interface CreateInvoiceButtonProps {
  onCreateClick: () => void;
  className?: string;
  children?: React.ReactNode;
}

const CreateInvoiceButton: React.FC<CreateInvoiceButtonProps> = ({
  onCreateClick,
  className,
  children,
}) => {
  const { isRTL, t } = useLanguage();
  const {
    checkQuota,
    showQuotaModal,
    quotaModalType,
    closeQuotaModal,
    handleUpgrade,
    quotaUsage,
  } = useQuotaGuard();

  const handleClick = async () => {
    const canProceed = await checkQuota("invoice");
    if (canProceed) {
      onCreateClick();
    }
  };

  return (
    <>
      <Button onClick={handleClick} className={className}>
        {children || (
          <>
            <Plus className="w-4 h-4 mr-2" />
            {isRTL ? "فاتورة جديدة" : "New Invoice"}
          </>
        )}
      </Button>

      <QuotaLimitModal
        isOpen={showQuotaModal && quotaModalType === "invoice"}
        onClose={closeQuotaModal}
        quotaType="invoice"
        currentUsage={quotaUsage?.invoicesThisMonth || 0}
        limit={quotaUsage?.invoiceLimit || 0}
        onUpgrade={handleUpgrade}
      />
    </>
  );
};

export default CreateInvoiceButton;
