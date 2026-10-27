
import React from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuotaGuard } from '../../hooks/useQuotaGuard';
import QuotaLimitModal from '../modals/QuotaLimitModal';
import { useLanguage } from '../../contexts/LanguageContext';

interface CreateUserButtonProps {
  onCreateClick: () => void;
  className?: string;
  children?: React.ReactNode;
}

const CreateUserButton: React.FC<CreateUserButtonProps> = ({
  onCreateClick,
  className,
  children
}) => {
  const { isRTL, t } = useLanguage();
  const {
    checkQuota,
    showQuotaModal,
    quotaModalType,
    closeQuotaModal,
    handleUpgrade,
    quotaUsage
  } = useQuotaGuard();

  const handleClick = async () => {
    const canProceed = await checkQuota('user');
    if (canProceed) {
      onCreateClick();
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        className={className}
      >
        {children || (
          <>
            <UserPlus className="w-4 h-4 mr-2" />
            {isRTL ? 'مستخدم جديد' : 'New User'}
          </>
        )}
      </Button>

      <QuotaLimitModal
        isOpen={showQuotaModal && quotaModalType === 'user'}
        onClose={closeQuotaModal}
        quotaType="user"
        currentUsage={quotaUsage?.users || 0}
        limit={quotaUsage?.userLimit || 0}
        onUpgrade={handleUpgrade}
      />
    </>
  );
};

export default CreateUserButton;
