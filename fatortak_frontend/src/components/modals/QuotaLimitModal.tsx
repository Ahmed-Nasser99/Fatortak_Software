
import React from 'react';
import { X, AlertTriangle, Crown, Zap, Users, FileText, Bot } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface QuotaLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotaType: 'ai' | 'invoice' | 'user';
  currentUsage: number;
  limit: number;
  onUpgrade: () => void;
}

const QuotaLimitModal: React.FC<QuotaLimitModalProps> = ({
  isOpen,
  onClose,
  quotaType,
  currentUsage,
  limit,
  onUpgrade,
}) => {
  const { isRTL, t } = useLanguage();

  if (!isOpen) return null;

  const getQuotaInfo = () => {
    switch (quotaType) {
      case 'ai':
        return {
          icon: Bot,
          title: isRTL ? 'تم الوصول لحد استخدام الذكي الاصطناعي' : 'AI Usage Limit Reached',
          description: isRTL 
            ? 'لقد وصلت إلى الحد الأقصى لاستخدام الذكي الاصطناعي في خطتك الحالية'
            : 'You have reached the maximum AI usage limit for your current plan',
          color: 'blue',
          gradient: 'from-blue-500 to-cyan-600',
        };
      case 'invoice':
        return {
          icon: FileText,
          title: isRTL ? 'تم الوصول لحد الفواتير الشهرية' : 'Monthly Invoice Limit Reached',
          description: isRTL 
            ? 'لقد وصلت إلى الحد الأقصى للفواتير الشهرية في خطتك الحالية'
            : 'You have reached the maximum monthly invoice limit for your current plan',
          color: 'green',
          gradient: 'from-green-500 to-emerald-600',
        };
      case 'user':
        return {
          icon: Users,
          title: isRTL ? 'تم الوصول لحد المستخدمين' : 'User Limit Reached',
          description: isRTL 
            ? 'لقد وصلت إلى الحد الأقصى للمستخدمين في خطتك الحالية'
            : 'You have reached the maximum user limit for your current plan',
          color: 'purple',
          gradient: 'from-purple-500 to-violet-600',
        };
      default:
        return {
          icon: AlertTriangle,
          title: isRTL ? 'تم الوصول للحد الأقصى' : 'Limit Reached',
          description: isRTL 
            ? 'لقد وصلت إلى الحد الأقصى لخطتك الحالية'
            : 'You have reached the limit for your current plan',
          color: 'gray',
          gradient: 'from-gray-500 to-gray-600',
        };
    }
  };

  const quotaInfo = getQuotaInfo();
  const IconComponent = quotaInfo.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 w-full max-w-md mx-4 overflow-hidden">
        {/* Header with Gradient */}
        <div className={`bg-gradient-to-r ${quotaInfo.gradient} p-6 relative`}>
          <button
            onClick={onClose}
            className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} text-white/80 hover:text-white transition-colors`}
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <div className={isRTL ? 'text-right' : ''}>
              <h3 className="text-xl font-bold text-white mb-1">
                {quotaInfo.title}
              </h3>
              <div className="flex items-center gap-2 text-white/80">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">
                  {currentUsage}/{limit} {isRTL ? 'مستخدم' : 'used'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className={`text-center space-y-4 ${isRTL ? 'text-right' : ''}`}>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {quotaInfo.description}
            </p>
            
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4">
              <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isRTL ? 'الاستخدام الحالي' : 'Current Usage'}
                </span>
                <span className="text-sm font-bold text-red-600">
                  {currentUsage}/{limit}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${quotaInfo.gradient} h-2 rounded-full transition-all duration-300`}
                  style={{ width: `${Math.min((currentUsage / limit) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h4 className={`font-semibold text-slate-800 dark:text-white ${isRTL ? 'text-right' : ''}`}>
              {isRTL ? 'مزايا الترقية:' : 'Upgrade Benefits:'}
            </h4>
            <div className="space-y-2">
              {[
                isRTL ? 'حدود أعلى للاستخدام' : 'Higher usage limits',
                isRTL ? 'ميزات متقدمة' : 'Advanced features',
                isRTL ? 'دعم أولوية' : 'Priority support',
                isRTL ? 'تحليلات مفصلة' : 'Detailed analytics'
              ].map((benefit, index) => (
                <div key={index} className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-2 h-2 bg-gradient-to-r ${quotaInfo.gradient} rounded-full`}></div>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
            >
              {isRTL ? 'لاحقاً' : 'Later'}
            </button>
            <button
              onClick={onUpgrade}
              className={`flex-1 px-4 py-3 bg-gradient-to-r ${quotaInfo.gradient} text-white rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 font-semibold flex items-center justify-center gap-2`}
            >
              <Crown className="w-4 h-4" />
              <span>{isRTL ? 'ترقية الآن' : 'Upgrade Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotaLimitModal;
