
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface SubscriptionModalResult {
  showSubscriptionModal: boolean;
  handleSubscriptionRequired: () => void;
  closeSubscriptionModal: () => void;
  handleViewPlans: () => void;
  clearSubscriptionRestriction: () => void;
}

export const useSubscriptionModal = (): SubscriptionModalResult => {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const navigate = useNavigate();

  const handleSubscriptionRequired = () => {
    setShowSubscriptionModal(true);
  };

  const closeSubscriptionModal = () => {
    setShowSubscriptionModal(false);
  };

  const handleViewPlans = () => {
    setShowSubscriptionModal(false);
    navigate('/subscription-plans');
  };

  const clearSubscriptionRestriction = () => {
    localStorage.removeItem("subscription_required");
  };

  return {
    showSubscriptionModal,
    handleSubscriptionRequired,
    closeSubscriptionModal,
    handleViewPlans,
    clearSubscriptionRestriction,
  };
};
