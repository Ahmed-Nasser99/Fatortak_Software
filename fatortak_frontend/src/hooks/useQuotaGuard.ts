
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCanCreateInvoice, useCanUseAi, useCanAddUser, useQuotaUsage } from './useQuota';

export interface QuotaGuardResult {
  checkQuota: (type: 'ai' | 'invoice' | 'user') => Promise<boolean>;
  showQuotaModal: boolean;
  quotaModalType: 'ai' | 'invoice' | 'user' | null;
  closeQuotaModal: () => void;
  handleUpgrade: () => void;
  quotaUsage: any;
}

export const useQuotaGuard = (): QuotaGuardResult => {
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [quotaModalType, setQuotaModalType] = useState<'ai' | 'invoice' | 'user' | null>(null);
  const navigate = useNavigate();
  
  const { data: canCreateInvoice } = useCanCreateInvoice();
  const { data: canUseAi } = useCanUseAi();
  const { data: canAddUser } = useCanAddUser();
  const { data: quotaUsage } = useQuotaUsage();

  const checkQuota = async (type: 'ai' | 'invoice' | 'user'): Promise<boolean> => {
    let canProceed = false;

    switch (type) {
      case 'ai':
        canProceed = canUseAi?.allowed ?? false;
        break;
      case 'invoice':
        canProceed = canCreateInvoice?.allowed ?? false;
        break;
      case 'user':
        canProceed = canAddUser?.allowed ?? false;
        break;
    }

    if (!canProceed) {
      setQuotaModalType(type);
      setShowQuotaModal(true);
      return false;
    }

    return true;
  };

  const closeQuotaModal = () => {
    setShowQuotaModal(false);
    setQuotaModalType(null);
  };

  const handleUpgrade = () => {
    closeQuotaModal();
    navigate('/subscription-plans');
  };

  return {
    checkQuota,
    showQuotaModal,
    quotaModalType,
    closeQuotaModal,
    handleUpgrade,
    quotaUsage,
  };
};
