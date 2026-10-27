
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const MobileDrawer: React.FC = () => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="drawer" dir={isRTL ? 'rtl' : 'ltr'}>
      <input id="mobile-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-side z-50">
        <label htmlFor="mobile-drawer" className="drawer-overlay"></label>
        <div className={`w-64 min-h-full bg-white dark:bg-gray-900 p-4 ${isRTL ? 'border-l' : 'border-r'} border-gray-200 dark:border-gray-700`}>
          <h2 className={`text-lg font-semibold mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('menu')}
          </h2>
          {/* Mobile menu content will be added here */}
        </div>
      </div>
    </div>
  );
};

export default MobileDrawer;
