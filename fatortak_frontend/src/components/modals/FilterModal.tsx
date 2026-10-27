
import React, { useState } from 'react';
import { X, Filter, Calendar, Users, DollarSign, FileText } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: any) => void;
  filterType: 'invoices' | 'reports' | 'customers' | 'items';
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, onApplyFilters, filterType }) => {
  const { isRTL, t } = useLanguage();
  const [filters, setFilters] = useState({
    dateRange: { from: '', to: '' },
    status: '',
    customer: '',
    amountRange: { min: '', max: '' },
    category: '',
    sortBy: '',
    sortOrder: 'desc'
  });

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const clearFilters = () => {
    setFilters({
      dateRange: { from: '', to: '' },
      status: '',
      customer: '',
      amountRange: { min: '', max: '' },
      category: '',
      sortBy: '',
      sortOrder: 'desc'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {isRTL ? 'تصفية البيانات' : 'Filter Data'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
              {isRTL ? 'نطاق التاريخ' : 'Date Range'}
            </label>
            <div className={`grid grid-cols-2 gap-4 ${isRTL ? 'grid-flow-col-dense' : ''}`}>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {isRTL ? 'من' : 'From'}
                </label>
                <input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, from: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {isRTL ? 'إلى' : 'To'}
                </label>
                <input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, to: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Status Filter */}
          {(filterType === 'invoices' || filterType === 'reports') && (
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                {t('status')}
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right' : ''}`}
              >
                <option value="">{isRTL ? 'جميع الحالات' : 'All Status'}</option>
                <option value="paid">{isRTL ? 'مدفوعة' : 'Paid'}</option>
                <option value="sent">{isRTL ? 'مرسلة' : 'Sent'}</option>
                <option value="draft">{isRTL ? 'مسودة' : 'Draft'}</option>
                <option value="overdue">{isRTL ? 'متأخرة' : 'Overdue'}</option>
              </select>
            </div>
          )}

          {/* Amount Range */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
              {isRTL ? 'نطاق المبلغ' : 'Amount Range'}
            </label>
            <div className={`grid grid-cols-2 gap-4 ${isRTL ? 'grid-flow-col-dense' : ''}`}>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {isRTL ? 'الحد الأدنى' : 'Min Amount'}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.amountRange.min}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    amountRange: { ...prev.amountRange, min: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {isRTL ? 'الحد الأقصى' : 'Max Amount'}
                </label>
                <input
                  type="number"
                  placeholder="100000"
                  value={filters.amountRange.max}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    amountRange: { ...prev.amountRange, max: e.target.value }
                  }))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
              {isRTL ? 'ترتيب حسب' : 'Sort By'}
            </label>
            <div className={`grid grid-cols-2 gap-4 ${isRTL ? 'grid-flow-col-dense' : ''}`}>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right' : ''}`}
              >
                <option value="">{isRTL ? 'اختر الترتيب' : 'Select Sort Field'}</option>
                <option value="date">{t('date')}</option>
                <option value="amount">{t('amount')}</option>
                <option value="customer">{t('customer')}</option>
                <option value="status">{t('status')}</option>
              </select>
              <select
                value={filters.sortOrder}
                onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value }))}
                className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isRTL ? 'text-right' : ''}`}
              >
                <option value="desc">{isRTL ? 'تنازلي' : 'Descending'}</option>
                <option value="asc">{isRTL ? 'تصاعدي' : 'Ascending'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={clearFilters}
            className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
          >
            {isRTL ? 'مسح الفلاتر' : 'Clear Filters'}
          </button>
          <div className={`flex space-x-3 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              {isRTL ? 'تطبيق الفلاتر' : 'Apply Filters'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
