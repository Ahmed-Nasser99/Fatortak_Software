
import React from 'react';
import { X, Crown, AlertTriangle, Sparkles, Zap, Shield } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface SubscriptionRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewPlans: () => void;
}

const SubscriptionRequiredModal: React.FC<SubscriptionRequiredModalProps> = ({
  isOpen,
  onClose,
  onViewPlans,
}) => {
  const { isRTL, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 w-full max-w-md mx-4 overflow-hidden">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 relative">
          <button
            onClick={onClose}
            className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} text-white/80 hover:text-white transition-colors`}
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <h3 className="text-xl font-bold text-white mb-1">
                {isRTL ? 'الاشتراك مطلوب' : 'Subscription Required'}
              </h3>
              <div className="flex items-center gap-2 text-white/80">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">
                  {isRTL ? 'ميزة مميزة' : 'Premium Feature'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className={`text-center space-y-4 ${isRTL ? 'text-right' : ''}`}>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {isRTL 
                ? 'يبدو أنك لم تشترك في خطة مدفوعة بعد. للوصول إلى هذه الميزة المتقدمة، يرجى اختيار خطة اشتراك تناسب احتياجاتك.'
                : 'It looks like you haven\'t subscribed to a paid plan yet. To access this premium feature, please choose a subscription plan that fits your needs.'
              }
            </p>
            
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-800">
              <div className="flex items-center gap-2 justify-center mb-2">
                <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">
                  {isRTL ? 'ماذا ستحصل عليه:' : 'What You\'ll Get:'}
                </span>
              </div>
              <div className="text-xs text-indigo-700 dark:text-indigo-300">
                {isRTL ? 'وصول كامل لجميع الميزات المتقدمة' : 'Full access to all premium features'}
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h4 className={`font-semibold text-slate-800 dark:text-white ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'مزايا الاشتراك:' : 'Subscription Benefits:'}
            </h4>
            <div className="space-y-2">
              {[
                {
                  icon: Zap,
                  text: isRTL ? 'إمكانيات متقدمة للذكاء الاصطناعي' : 'Advanced AI capabilities'
                },
                {
                  icon: Shield,
                  text: isRTL ? 'حدود أعلى للاستخدام' : 'Higher usage limits'
                },
                {
                  icon: Crown,
                  text: isRTL ? 'دعم أولوية' : 'Priority support'
                },
                {
                  icon: Sparkles,
                  text: isRTL ? 'ميزات حصرية' : 'Exclusive features'
                }
              ].map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <div key={index} className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {benefit.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              {isRTL ? 'لاحقاً' : 'Maybe Later'}
            </button>
            <button
              onClick={onViewPlans}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 font-semibold flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" />
              <span>{isRTL ? 'عرض الخطط' : 'View Plans'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionRequiredModal;
