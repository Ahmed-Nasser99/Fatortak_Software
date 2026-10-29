
import React, { useState } from 'react';
import { formatDate } from '@/Helpers/localization';
import { Edit, Trash2, Plus, MoreHorizontal, Shield, ShieldCheck, User, Users, Mail, Crown } from 'lucide-react';
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

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  joinedAt: string;
  permissions: string[];
}

interface TeamTableProps {
  data: TeamMember[];
  onEdit: (member: TeamMember) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

const TeamTable: React.FC<TeamTableProps> = ({ data, onEdit, onDelete, onAdd }) => {
  const { isRTL, t } = useLanguage();

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <Crown className="w-4 h-4 text-red-500" />;
      case 'manager':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-slate-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200 dark:from-red-900/30 dark:to-pink-900/30 dark:text-red-400 dark:border-red-700';
      case 'manager':
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-400 dark:border-blue-700';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:from-slate-800 dark:to-slate-800 dark:text-slate-400 dark:border-slate-600';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    return status === 'active'
      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400 dark:border-green-700'
      : 'bg-slate-100 text-slate-800 border-slate-200 dark:from-slate-800 dark:to-slate-800 dark:text-slate-400 dark:border-slate-600';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-brand-600',
      'bg-brand-600',
      'bg-emerald-600',
      'bg-gradient-to-r from-yellow-500 to-amber-500',
      'bg-gradient-to-r from-pink-500 to-rose-500',
      'bg-rose-500',
    ];
    return colors[name.length % colors.length];
  };

  return (
    <div className="space-y-6 animate-fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Enhanced Header */}
      <div className="page-hero">
        <div className={`flex justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center space-x-4 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
            <div className="page-hero-icon">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {t('teamMembers') || (isRTL ? 'أعضاء الفريق' : 'Team Management')}
              </h2>
              <p className="text-blue-100 text-lg">
                {t('manageYourTeam') || (isRTL ? 'إدارة فريق العمل' : 'Manage your team members and roles')}
              </p>
            </div>
          </div>
          <Button 
            onClick={onAdd} 
            className="page-hero-action"
          >
            <Plus className="w-5 h-5 mr-2" />
            <span className="font-semibold">{t('addMember') || (isRTL ? 'إضافة عضو' : 'Add Member')}</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6 dark:border-emerald-900 dark:bg-emerald-950/30">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Members</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {data.filter(member => member.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-6 dark:border-brand-900 dark:bg-brand-950/30">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Managers</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {data.filter(member => member.role.toLowerCase() === 'manager').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-red-200 dark:border-red-700 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Admins</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                {data.filter(member => member.role.toLowerCase() === 'admin').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <ResponsiveTable className="bg-white dark:bg-slate-900 shadow-lg border-0 overflow-hidden">
          <ResponsiveTableHeader>
            <ResponsiveTableRow className="bg-slate-50 dark:bg-slate-800/60 border-0">
              <ResponsiveTableHead className="font-bold text-slate-900 dark:text-white py-6">
                {t('name') || (isRTL ? 'الاسم' : 'Name')}
              </ResponsiveTableHead>
              <ResponsiveTableHead className="font-bold text-slate-900 dark:text-white py-6">
                {t('email') || (isRTL ? 'البريد الإلكتروني' : 'Email')}
              </ResponsiveTableHead>
              <ResponsiveTableHead className="font-bold text-slate-900 dark:text-white py-6">
                {t('role') || (isRTL ? 'الدور' : 'Role')}
              </ResponsiveTableHead>
              <ResponsiveTableHead className="font-bold text-slate-900 dark:text-white py-6">
                {t('status') || (isRTL ? 'الحالة' : 'Status')}
              </ResponsiveTableHead>
              <ResponsiveTableHead className="font-bold text-slate-900 dark:text-white py-6">
                {t('joinedAt') || (isRTL ? 'تاريخ الانضمام' : 'Joined')}
              </ResponsiveTableHead>
              <ResponsiveTableHead className="font-bold text-slate-900 dark:text-white py-6 w-[100px]">
                {t('actions') || (isRTL ? 'الإجراءات' : 'Actions')}
              </ResponsiveTableHead>
            </ResponsiveTableRow>
          </ResponsiveTableHeader>
          <ResponsiveTableBody>
            {data.map((member, index) => (
              <ResponsiveTableRow 
                key={member.id} 
                className={`border-0 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors duration-200 ${
                  index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/50 dark:bg-slate-800/50'
                }`}
              >
                <ResponsiveTableCell className="py-6">
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <div className={`w-12 h-12 ${getAvatarColor(member.name)} rounded-xl flex items-center justify-center shadow-lg`}>
                      <span className="text-sm font-bold text-white">
                        {getInitials(member.name)}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-lg">{member.name}</div>
                    </div>
                  </div>
                </ResponsiveTableCell>
                <ResponsiveTableCell className="py-6">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-400">{member.email}</span>
                  </div>
                </ResponsiveTableCell>
                <ResponsiveTableCell className="py-6">
                  <Badge className={`flex items-center space-x-2 rtl:space-x-reverse ${getRoleBadgeColor(member.role)} border font-semibold px-3 py-1`}>
                    {getRoleIcon(member.role)}
                    <span>{member.role}</span>
                  </Badge>
                </ResponsiveTableCell>
                <ResponsiveTableCell className="py-6">
                  <Badge className={`${getStatusBadgeColor(member.status)} border font-semibold px-3 py-1`}>
                    {member.status === 'active' 
                      ? (isRTL ? 'نشط' : 'Active')
                      : (isRTL ? 'غير نشط' : 'Inactive')
                    }
                  </Badge>
                </ResponsiveTableCell>
                <ResponsiveTableCell className="py-6">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    {formatDate(member.joinedAt)}
                  </span>
                </ResponsiveTableCell>
                <ResponsiveTableCell className="py-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/20">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="rounded-xl shadow-xl border-0 bg-white dark:bg-slate-800">
                      <DropdownMenuItem onClick={() => onEdit(member)} className="rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <Edit className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2 text-blue-600" />
                        <span className="font-medium">{t('edit') || (isRTL ? 'تعديل' : 'Edit')}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(member.id)}
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
        {data.map((member) => (
          <div key={member.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-lg transition-all duration-300 transform ">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4 rtl:space-x-reverse flex-1">
                <div className={`w-16 h-16 ${getAvatarColor(member.name)} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <span className="text-lg font-bold text-white">
                    {getInitials(member.name)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{member.name}</h3>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">{member.email}</p>
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/20">
                    <MoreHorizontal className="w-6 h-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="rounded-xl shadow-xl border-0 bg-white dark:bg-slate-800">
                  <DropdownMenuItem onClick={() => onEdit(member)} className="rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                    <Edit className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2 text-blue-600" />
                    <span className="font-medium">{t('edit') || (isRTL ? 'تعديل' : 'Edit')}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(member.id)}
                    className="rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4 mr-2 rtl:mr-0 rtl:ml-2" />
                    <span className="font-medium">{t('delete') || (isRTL ? 'حذف' : 'Delete')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="rounded-xl border border-brand-100 bg-brand-50/70 p-4 dark:border-brand-900 dark:bg-brand-950/30">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">
                  {t('role') || (isRTL ? 'الدور' : 'Role')}
                </span>
                <Badge className={`${getRoleBadgeColor(member.role)} border font-semibold flex items-center space-x-1 rtl:space-x-reverse w-fit`}>
                  {getRoleIcon(member.role)}
                  <span>{member.role}</span>
                </Badge>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">
                  {t('status') || (isRTL ? 'الحالة' : 'Status')}
                </span>
                <Badge className={`${getStatusBadgeColor(member.status)} border font-semibold w-fit`}>
                  {member.status === 'active' 
                    ? (isRTL ? 'نشط' : 'Active')
                    : (isRTL ? 'غير نشط' : 'Inactive')
                  }
                </Badge>
              </div>
            </div>
            
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {t('joinedAt') || (isRTL ? 'انضم في' : 'Joined')}: {formatDate(member.joinedAt)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
          <div className="w-24 h-24 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Users className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {t('noTeamMembers') || (isRTL ? 'لا يوجد أعضاء فريق' : 'No team members found')}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 text-lg">
            {t('noTeamMembersDescription') || (isRTL ? 'ابدأ ببناء فريق العمل' : 'Start building your team')}
          </p>
          <Button 
            onClick={onAdd}
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-3 rounded-lg shadow-sm transition-colors "
          >
            <Plus className="w-5 h-5 mr-2" />
            <span className="font-semibold">{t('addFirstMember') || (isRTL ? 'إضافة أول عضو' : 'Add First Member')}</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default TeamTable;
