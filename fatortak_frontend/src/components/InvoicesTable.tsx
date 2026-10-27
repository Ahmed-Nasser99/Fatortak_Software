
import React from 'react';
import { Edit, Trash2, Eye, MoreHorizontal, FileText, DollarSign, Calendar, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableRow,
  ResponsiveTableHead,
  ResponsiveTableCell,
} from './ui/responsive-table';
import { formatDate as formatDisplayDate } from '@/Helpers/localization';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  dueDate: string;
  createdAt: string;
}

interface InvoicesTableProps {
  data: Invoice[];
  type: 'buy' | 'sell';
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
}

const InvoicesTable: React.FC<InvoicesTableProps> = ({ data, type, onView, onEdit, onDelete }) => {
  const { isRTL, t } = useLanguage();

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400 dark:border-green-700';
      case 'pending':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200 dark:from-yellow-900/30 dark:to-amber-900/30 dark:text-yellow-400 dark:border-yellow-700';
      case 'overdue':
        return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200 dark:from-red-900/30 dark:to-rose-900/30 dark:text-red-400 dark:border-red-700';
      case 'draft':
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200 dark:from-gray-800 dark:to-slate-800 dark:text-gray-400 dark:border-gray-600';
      case 'cancelled':
        return 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 dark:text-orange-400 dark:border-orange-700';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200 dark:from-gray-800 dark:to-slate-800 dark:text-gray-400 dark:border-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return isRTL ? 'مدفوع' : 'Paid';
      case 'pending':
        return isRTL ? 'معلق' : 'Pending';
      case 'overdue':
        return isRTL ? 'متأخر' : 'Overdue';
      case 'draft':
        return isRTL ? 'مسودة' : 'Draft';
      case 'cancelled':
        return isRTL ? 'ملغي' : 'Cancelled';
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar' : 'en', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return formatDisplayDate(dateString);
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Desktop Table */}
      <div className="hidden lg:block">
        <ResponsiveTable className="bg-white dark:bg-gray-900 shadow-2xl border-0 overflow-hidden rounded-2xl">
          <ResponsiveTableHeader>
            <ResponsiveTableRow className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 border-0">
              <ResponsiveTableHead className="font-bold text-gray-900 dark:text-white py-6">
                {t('invoiceNumber') || (isRTL ? 'رقم الفاتورة' : 'Invoice #')}
              </ResponsiveTableHead>
              <ResponsiveTableHead className="font-bold text-gray-900 dark:text-white py-6">
                {type === 'buy' 
                  ? (t('supplierName') || (isRTL ? 'المورد' : 'Supplier'))
                  : (t('clientName') || (isRTL ? 'العميل' : 'Client'))
                }
              </ResponsiveTableHead>
              <ResponsiveTableHead className="font-bold text-gray-900 dark:text-white py-6">
                {t('amount') || (isRTL ? 'المبلغ' : 'Amount')}
              </ResponsiveTableHead>
              <ResponsiveTableHead className="font-bold text-gray-900 dark:text-white py-6">
                {t('status') || (isRTL ? 'الحالة' : 'Status')}
              </ResponsiveTableHead>
              <ResponsiveTableHead className="font-bold text-gray-900 dark:text-white py-6">
                {t('dueDate') || (isRTL ? 'تاريخ الاستحقاق' : 'Due Date')}
              </ResponsiveTableHead>
              <ResponsiveTableHead className="font-bold text-gray-900 dark:text-white py-6 w-[100px]">
                {t('actions') || (isRTL ? 'الإجراءات' : 'Actions')}
              </ResponsiveTableHead>
            </ResponsiveTableRow>
          </ResponsiveTableHeader>
          <ResponsiveTableBody>
            {data.map((invoice, index) => (
              <ResponsiveTableRow 
                key={invoice.id} 
                className={`border-0 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/10 dark:hover:to-indigo-900/10 transition-all duration-200 ${
                  index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/50'
                }`}
              >
                <ResponsiveTableCell className="py-6">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white text-base">
                        {invoice.invoiceNumber}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(invoice.createdAt)}
                      </p>
                    </div>
                  </div>
                </ResponsiveTableCell>
                <ResponsiveTableCell className="py-6">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {invoice.clientName}
                    </span>
                  </div>
                </ResponsiveTableCell>
                <ResponsiveTableCell className="py-6">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      {formatCurrency(invoice.amount)}
                    </span>
                  </div>
                </ResponsiveTableCell>
                <ResponsiveTableCell className="py-6">
                  <Badge className={`${getStatusBadgeColor(invoice.status)} border font-semibold px-3 py-1`}>
                    {getStatusText(invoice.status)}
                  </Badge>
                </ResponsiveTableCell>
                <ResponsiveTableCell className="py-6">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white font-medium">
                      {formatDate(invoice.dueDate)}
                    </span>
                  </div>
                </ResponsiveTableCell>
                <ResponsiveTableCell className="py-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/20">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="rounded-xl shadow-xl border-0 bg-white dark:bg-gray-800">
                      <DropdownMenuItem onClick={() => onView(invoice)} className="rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <Eye className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2 text-blue-600" />
                        <span className="font-medium">{t('view') || (isRTL ? 'عرض' : 'View')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onEdit(invoice)} 
                        disabled={invoice.status.toLowerCase() === 'cancelled'}
                        className={`rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 ${invoice.status.toLowerCase() === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Edit className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2 text-yellow-600" />
                        <span className="font-medium">{t('edit') || (isRTL ? 'تعديل' : 'Edit')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(invoice.id)}
                        disabled={invoice.status.toLowerCase() === 'cancelled'}
                        className={`rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 ${invoice.status.toLowerCase() === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Trash2 className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                        <span className="font-medium">{t('delete') || (isRTL ? 'حذف' : 'Delete')}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ResponsiveTableCell>
              </ResponsiveTableRow>
            ))}
          </ResponsiveTableBody>
        </ResponsiveTable>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {data.map((invoice) => (
          <div key={invoice.id} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse flex-1">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {invoice.invoiceNumber}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(invoice.createdAt)}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/20">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="rounded-xl shadow-xl border-0 bg-white dark:bg-gray-800">
                  <DropdownMenuItem onClick={() => onView(invoice)} className="rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <Eye className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2 text-blue-600" />
                    <span className="font-medium">{t('view') || (isRTL ? 'عرض' : 'View')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(invoice)} className="rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20">
                    <Edit className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2 text-yellow-600" />
                    <span className="font-medium">{t('edit') || (isRTL ? 'تعديل' : 'Edit')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(invoice.id)}
                    className="rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                    <span className="font-medium">{t('delete') || (isRTL ? 'حذف' : 'Delete')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 rounded-xl p-4">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                  {type === 'buy' 
                    ? (t('supplierName') || (isRTL ? 'المورد' : 'Supplier'))
                    : (t('clientName') || (isRTL ? 'العميل' : 'Client'))
                  }
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {invoice.clientName}
                </span>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                  {t('amount') || (isRTL ? 'المبلغ' : 'Amount')}
                </span>
                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(invoice.amount)}
                </span>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                  {t('dueDate') || (isRTL ? 'تاريخ الاستحقاق' : 'Due Date')}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDate(invoice.dueDate)}
                </span>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-4">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                  {t('status') || (isRTL ? 'الحالة' : 'Status')}
                </span>
                <Badge className={`${getStatusBadgeColor(invoice.status)} border font-semibold text-xs`}>
                  {getStatusText(invoice.status)}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('noInvoices') || (isRTL ? 'لا توجد فواتير' : 'No invoices found')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t('noInvoicesDescription') || (isRTL ? 'ابدأ بإنشاء فاتورتك الأولى' : 'Start by creating your first invoice')}
          </p>
        </div>
      )}
    </div>
  );
};

export default InvoicesTable;
