
import React from 'react';
import { formatDate, formatNumber } from '@/Helpers/localization';
import { Edit, Trash2, Plus, MoreHorizontal, Package, DollarSign, Archive, TrendingUp } from 'lucide-react';
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
  MobileCard,
} from './ui/responsive-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface Item {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category: string;
  sku?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

interface ItemsTableProps {
  data: Item[];
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const ItemsTable: React.FC<ItemsTableProps> = ({ data, onEdit, onDelete, onAdd }) => {
  const { isRTL, t } = useLanguage();

  const getStatusBadgeColor = (status: string) => {
    return status === 'active'
      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400 dark:border-green-700'
      : 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200 dark:from-gray-800 dark:to-slate-800 dark:text-gray-400 dark:border-gray-600';
  };

  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200',
      'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200',
      'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200',
      'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 border-pink-200',
    ];
    return colors[category.length % colors.length];
  };

  const getQuantityColor = (quantity: number) => {
    if (quantity <= 10) return 'text-red-600 dark:text-red-400 font-bold';
    if (quantity <= 50) return 'text-yellow-600 dark:text-yellow-400 font-semibold';
    return 'text-green-600 dark:text-green-400 font-medium';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(isRTL ? 'ar' : 'en', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="space-y-6 animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center space-x-4 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {t('items') || (isRTL ? 'العناصر' : 'Items Management')}
              </h2>
              <p className="text-purple-100 text-lg">
                {t('manageYourItems') || (isRTL ? 'إدارة العناصر الخاصة بك' : 'Manage your inventory items')}
              </p>
            </div>
          </div>
          <Button 
            onClick={onAdd} 
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            <span className="font-semibold">{t('addItem') || (isRTL ? 'إضافة عنصر' : 'Add Item')}</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-700 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Active Items</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {formatNumber(data.filter(item => item.status === 'active').length)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Value</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {formatPrice(data.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-700 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
              <Archive className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Low Stock</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {formatNumber(data.filter(item => item.quantity <= 10).length)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <ResponsiveTable className="bg-white dark:bg-gray-900 shadow-2xl border-0 overflow-hidden">
          <ResponsiveTableHeader>
            <ResponsiveTableRow className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 border-0">
              <ResponsiveTableHead className="font-bold text-gray-900 dark:text-white py-6">
                {t('name') || (isRTL ? 'الاسم' : 'Name')}
              </ResponsiveTableHead>
              <ResponsiveTableHead className="font-bold text-gray-900 dark:text-white py-6">
                {t('sku') || (isRTL ? 'رمز المنتج' : 'SKU')}
              </ResponsiveTableHead>
              <ResponsiveTableHead className="font-bold text-gray-900 dark:text-white py-6">
                {t('category') || (isRTL ? 'الفئة' : 'Category')}
              </ResponsiveTableHead>
              <ResponsiveTableHead className="font-bold text-gray-900 dark:text-white py-6">
                {t('price') || (isRTL ? 'السعر' : 'Price')}
              </ResponsiveTableHead>
              <ResponsiveTableHead className="font-bold text-gray-900 dark:text-white py-6">
                {t('quantity') || (isRTL ? 'الكمية' : 'Quantity')}
              </ResponsiveTableHead>
              <ResponsiveTableHead className="font-bold text-gray-900 dark:text-white py-6">
                {t('status') || (isRTL ? 'الحالة' : 'Status')}
              </ResponsiveTableHead>
              <ResponsiveTableHead className="font-bold text-gray-900 dark:text-white py-6 w-[100px]">
                {t('actions') || (isRTL ? 'الإجراءات' : 'Actions')}
              </ResponsiveTableHead>
            </ResponsiveTableRow>
          </ResponsiveTableHeader>
          <ResponsiveTableBody>
            {data.map((item, index) => (
              <ResponsiveTableRow 
                key={item.id} 
                className={`border-0 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 dark:hover:from-purple-900/10 dark:hover:to-violet-900/10 transition-all duration-200 ${
                  index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/50'
                }`}
              >
                <ResponsiveTableCell className="py-6">
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white text-lg">{item.name}</div>
                      {item.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate max-w-[250px]">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </ResponsiveTableCell>
                <ResponsiveTableCell className="py-6">
                  <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                    {item.sku || '-'}
                  </span>
                </ResponsiveTableCell>
                <ResponsiveTableCell className="py-6">
                  <Badge className={`${getCategoryColor(item.category)} border font-semibold px-3 py-1`}>
                    {item.category}
                  </Badge>
                </ResponsiveTableCell>
                <ResponsiveTableCell className="py-6">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatPrice(item.price)}
                  </div>
                </ResponsiveTableCell>
                <ResponsiveTableCell className="py-6">
                  <div className="flex items-center space-x-2">
                    <span className={`text-lg font-bold ${getQuantityColor(item.quantity)}`}>
                      {formatNumber(item.quantity)}
                    </span>
                    {item.quantity <= 10 && (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-xs">
                        Low
                      </Badge>
                    )}
                  </div>
                </ResponsiveTableCell>
                <ResponsiveTableCell className="py-6">
                  <Badge className={`${getStatusBadgeColor(item.status)} border font-semibold px-3 py-1`}>
                    {item.status === 'active' 
                      ? (isRTL ? 'نشط' : 'Active')
                      : (isRTL ? 'غير نشط' : 'Inactive')
                    }
                  </Badge>
                </ResponsiveTableCell>
                <ResponsiveTableCell className="py-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/20">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="rounded-xl shadow-xl border-0 bg-white dark:bg-gray-800">
                      <DropdownMenuItem onClick={() => onEdit(item)} className="rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <Edit className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2 text-blue-600" />
                        <span className="font-medium">{t('edit') || (isRTL ? 'تعديل' : 'Edit')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(item.id)}
                        className="rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
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
        {data.map((item) => (
          <div key={item.id} className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-200 dark:border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4 rtl:space-x-reverse flex-1">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{item.name}</h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/20">
                    <MoreHorizontal className="w-6 h-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="rounded-xl shadow-xl border-0 bg-white dark:bg-gray-800">
                  <DropdownMenuItem onClick={() => onEdit(item)} className="rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <Edit className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2 text-blue-600" />
                    <span className="font-medium">{t('edit') || (isRTL ? 'تعديل' : 'Edit')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(item.id)}
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
                  {t('sku') || (isRTL ? 'رمز المنتج' : 'SKU')}
                </span>
                <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                  {item.sku || '-'}
                </span>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-4">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                  {t('category') || (isRTL ? 'الفئة' : 'Category')}
                </span>
                <Badge className={`${getCategoryColor(item.category)} border font-semibold text-xs`}>
                  {item.category}
                </Badge>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                  {t('price') || (isRTL ? 'السعر' : 'Price')}
                </span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatPrice(item.price)}
                </span>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                  {t('quantity') || (isRTL ? 'الكمية' : 'Quantity')}
                </span>
                <div className="flex items-center space-x-2">
                  <span className={`text-lg font-bold ${getQuantityColor(item.quantity)}`}>
                    {formatNumber(item.quantity)}
                  </span>
                  {item.quantity <= 10 && (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 text-xs">
                      Low
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <Badge className={`${getStatusBadgeColor(item.status)} border font-semibold px-4 py-2`}>
                {item.status === 'active' 
                  ? (isRTL ? 'نشط' : 'Active')
                  : (isRTL ? 'غير نشط' : 'Inactive')
                }
              </Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                {formatDate(item.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-violet-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Package className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('noItems') || (isRTL ? 'لا توجد عناصر' : 'No items found')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">
            {t('noItemsDescription') || (isRTL ? 'ابدأ بإضافة العناصر الأولى' : 'Start by adding your first items')}
          </p>
          <Button 
            onClick={onAdd}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="w-5 h-5 mr-2" />
            <span className="font-semibold">{t('addFirstItem') || (isRTL ? 'إضافة أول عنصر' : 'Add First Item')}</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default ItemsTable;
