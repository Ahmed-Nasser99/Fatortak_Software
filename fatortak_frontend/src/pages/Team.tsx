import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  User,
  Mail,
  Shield,
  Loader2,
  Users,
  Crown,
  UserCheck,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useUsers, useDeleteUser } from "../hooks/useUsers";
import { toast } from "react-toastify";
import TeamMemberModal from "../components/modals/TeamMemberModal";
import DeleteConfirmationModal from "../components/modals/DeleteConfirmationModal";
import UserEditModal from "../components/UserEditModal";
import { UserDto } from "../types/api";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import CreateUserButton from "@/components/users/CreateUserButton";
import { formatDate, formatNumber } from "@/Helpers/localization";

const Team: React.FC = () => {
  const roleAccess = useRoleAccess();
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [pagination, setPagination] = useState({ pageNumber: 1, pageSize: 10 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    user: UserDto | null;
  }>({
    isOpen: false,
    user: null,
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  }>({
    isOpen: false,
    userId: "",
    userName: "",
  });

  // API hooks
  const {
    data: usersResponse,
    isLoading,
    error,
    refetch,
  } = useUsers(pagination, {
    email: searchTerm || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
    isActive: true,
  });

  const deleteUserMutation = useDeleteUser();
  const users = usersResponse?.data?.data || [];
  const totalCount = usersResponse?.data?.totalCount || 0;

  const getFullName = (user: UserDto) => `${user.firstName} ${user.lastName}`;

  const handleEditClick = (user: UserDto) => {
    setEditModal({ isOpen: true, user });
  };

  const handleDeleteClick = (userId: string, userName: string) => {
    setDeleteModal({ isOpen: true, userId, userName });
  };

  const handleDeleteConfirm = async () => {
    try {
      const result = await deleteUserMutation.mutateAsync(deleteModal.userId);
      if (result.success) {
        toast.success(
          t("userDeleted")
        );
        refetch();
        setDeleteModal({ isOpen: false, userId: "", userName: "" });
      } else {
        toast.error(
          result.errorMessage ||
            (isRTL ? "فشل في حذف المستخدم" : t("failedToDeleteUser"))
        );
      }
    } catch (error) {
      toast.error(t("errorDeletingUser"));
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return <Crown className="w-4 h-4 text-red-500" />;
      case "editor":
        return <Shield className="w-4 h-4 text-blue-500" />;
      case "watcher":
        return <UserCheck className="w-4 h-4 text-green-500" />;
      default:
        return <User className="w-4 h-4 text-slate-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200 dark:from-red-900/30 dark:to-pink-900/30 dark:text-red-400 dark:border-red-700";
      case "editor":
        return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-400 dark:border-blue-700";
      case "watcher":
        return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200 dark:from-green-900/30 dark:to-emerald-900/30 dark:text-green-400 dark:border-green-700";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200 dark:from-slate-800 dark:to-slate-800 dark:text-slate-400 dark:border-slate-600";
    }
  };

  const getRoleLabel = (role: string) => {
    if (isRTL) {
      switch (role.toLowerCase()) {
        case "admin":
          return "مدير";
        case "editor":
          return "محرر";
        case "watcher":
          return "مراقب";
        default:
          return role;
      }
    }
    return role;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-brand-600",
      "bg-brand-600",
      "bg-emerald-600",
      "bg-gradient-to-r from-yellow-500 to-amber-500",
      "bg-gradient-to-r from-pink-500 to-rose-500",
      "bg-rose-500",
    ];
    return colors[name.length % colors.length];
  };

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPagination((prev) => ({ ...prev, pageNumber: 1 }));
      refetch();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, roleFilter]);

  // Stats calculations
  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    admins: users.filter((u) => u.role.toLowerCase() === "admin").length,
    editors: users.filter((u) => u.role.toLowerCase() === "editor").length,
    watchers: users.filter((u) => u.role.toLowerCase() === "watcher").length,
  };

  if (error) {
    return (
      <div className="p-6  mx-auto">
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">
                  {isRTL ? "خطأ في تحميل البيانات" : "Error loading data"}
                </p>
                <p className="text-sm text-red-500">{error.message}</p>
              </div>
            </div>
            <Button
              onClick={() => refetch()}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white"
            >
              {isRTL ? "إعادة المحاولة" : "Retry"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="p-6 mx-auto space-y-6 animate-fade-in"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Enhanced Header */}
      <div className="page-hero">
        <div
          className={`flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 ${
            isRTL ? "lg:flex-row-reverse" : ""
          }`}
        >
          <div className={`flex items-center space-x-4`}>
            <div className="page-hero-icon mx-3">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {isRTL ? "إدارة الفريق" : "Team Management"}
              </h1>
              <p className="text-blue-100 text-lg">
                {isRTL
                  ? "إدارة أعضاء الفريق والأذونات"
                  : "Manage team members and permissions"}
              </p>
            </div>
          </div>

          {roleAccess.canCreate() && (
            <CreateUserButton
              onCreateClick={() => setShowAddModal(true)}
              className="page-hero-action"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="font-semibold">
                {isRTL ? "عضو جديد" : "New Member"}
              </span>
            </CreateUserButton>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200/80 bg-white transition-colors hover:border-brand-200 dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {isRTL ? "إجمالي الأعضاء" : "Total Members"}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatNumber(stats.total)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {isRTL ? "المدراء" : "Admins"}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatNumber(stats.admins)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white transition-colors hover:border-brand-200 dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {isRTL ? "المحررين" : "Editors"}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatNumber(stats.editors)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white transition-colors dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {isRTL ? "المراقبين" : "Watchers"}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formatNumber(stats.watchers)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div
            className={`flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 ${
              isRTL ? "md:flex-row-reverse md:space-x-reverse" : ""
            }`}
          >
            <div className="flex-1">
              <div className="relative">
                <Search
                  className={`absolute top-3 ${
                    isRTL ? "right-3" : "left-3"
                  } w-5 h-5 text-slate-400`}
                />
                <input
                  type="text"
                  placeholder={
                    isRTL ? "البحث بالبريد الإلكتروني..." : "Search by email..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full ${
                    isRTL ? "pr-12 pl-4" : "pl-12 pr-4"
                  } py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-200 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200`}
                />
              </div>
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-brand-200 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white min-w-[150px]"
            >
              <option value="all">
                {isRTL ? "جميع الأدوار" : "All Roles"}
              </option>
              <option value="Admin">{isRTL ? "مدير" : "Admin"}</option>
              <option value="Editor">{isRTL ? "محرر" : "Editor"}</option>
              <option value="Watcher">{isRTL ? "مراقب" : "Watcher"}</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Content */}
      <Card className="shadow-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  {isRTL ? "جاري التحميل..." : "Loading..."}
                </p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {isRTL ? "لا يوجد أعضاء فريق" : "No team members found"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6 text-lg">
                {isRTL ? "ابدأ ببناء فريق العمل" : "Start building your team"}
              </p>
              {roleAccess.canCreate() && (
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-3 rounded-lg shadow-sm transition-colors "
                >
                  <Plus className="w-5 h-5 mr-2" />
                  <span className="font-semibold">
                    {isRTL ? "إضافة أول عضو" : "Add First Member"}
                  </span>
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600">
                    <tr>
                      <th
                        className={`px-4 py-3 ${
                          isRTL ? "text-end" : "text-start"
                        } text-sm font-bold text-slate-900 dark:text-white`}
                      >
                        {isRTL ? "المستخدم" : "User"}
                      </th>
                      <th
                        className={`px-4 py-3 ${
                          isRTL ? "text-end" : "text-start"
                        } text-sm font-bold text-slate-900 dark:text-white`}
                      >
                        {isRTL ? "البريد الإلكتروني" : "Email"}
                      </th>
                      <th
                        className={`px-4 py-3 ${
                          isRTL ? "text-end" : "text-start"
                        } text-sm font-bold text-slate-900 dark:text-white`}
                      >
                        {isRTL ? "الدور" : "Role"}
                      </th>
                      <th
                        className={`px-4 py-3 ${
                          isRTL ? "text-end" : "text-start"
                        } text-sm font-bold text-slate-900 dark:text-white`}
                      >
                        {isRTL ? "تاريخ الانضمام" : "Joined"}
                      </th>
                      <th
                        className={`px-4 py-3 ${
                          isRTL ? "text-end" : "text-start"
                        } text-sm font-bold text-slate-900 dark:text-white`}
                      >
                        {t("actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {users.map((user, index) => (
                      <tr
                        key={user.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200 ${
                          index % 2 === 0
                            ? "bg-white dark:bg-slate-800"
                            : "bg-slate-50/50 dark:bg-slate-800/50"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-4 rtl:space-x-reverse">
                            <div
                              className={`w-12 h-12 ${getAvatarColor(
                                getFullName(user)
                              )} rounded-xl flex items-center justify-center shadow-lg`}
                            >
                              <span className="text-sm font-bold text-white">
                                {getInitials(getFullName(user))}
                              </span>
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white text-lg">
                                {getFullName(user)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-400">
                              {user.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            className={`flex items-center space-x-2 rtl:space-x-reverse ${getRoleColor(
                              user.role
                            )} border font-semibold px-3 py-1`}
                          >
                            {getRoleIcon(user.role)}
                            <span>{getRoleLabel(user.role)}</span>
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-slate-600 dark:text-slate-400 font-medium">
                            {formatDate(user.createdAt)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div
                            className={`flex space-x-2 ${
                              isRTL ? "flex-row-reverse space-x-reverse" : ""
                            }`}
                          >
                            {roleAccess.canEdit() && (
                              <button
                                onClick={() => handleEditClick(user)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            {roleAccess.canDelete() && (
                              <button
                                onClick={() =>
                                  handleDeleteClick(user.id, getFullName(user))
                                }
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden p-4 space-y-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 transform "
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-4 rtl:space-x-reverse flex-1">
                        <div
                          className={`w-16 h-16 ${getAvatarColor(
                            getFullName(user)
                          )} rounded-2xl flex items-center justify-center shadow-lg`}
                        >
                          <span className="text-lg font-bold text-white">
                            {getInitials(getFullName(user))}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                            {getFullName(user)}
                          </h3>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <Mail className="w-4 h-4 text-slate-400" />
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`flex space-x-2 ${
                          isRTL ? "flex-row-reverse space-x-reverse" : ""
                        }`}
                      >
                        {roleAccess.canEdit() && (
                          <button
                            onClick={() => handleEditClick(user)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        )}
                        {roleAccess.canDelete() && (
                          <button
                            onClick={() =>
                              handleDeleteClick(user.id, getFullName(user))
                            }
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="rounded-xl border border-brand-100 bg-brand-50/70 p-4 dark:border-brand-900 dark:bg-brand-950/30">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">
                          {isRTL ? "الدور" : "Role"}
                        </span>
                        <Badge
                          className={`${getRoleColor(
                            user.role
                          )} border font-semibold flex items-center space-x-1 rtl:space-x-reverse w-fit`}
                        >
                          {getRoleIcon(user.role)}
                          <span>{getRoleLabel(user.role)}</span>
                        </Badge>
                      </div>
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">
                          {isRTL ? "تاريخ الانضمام" : "Joined"}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                            {formatDate(user.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalCount > pagination.pageSize && (
                <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                        {isRTL
                          ? `عرض ${formatNumber(users.length)} من أصل ${formatNumber(totalCount)}`
                          : `Showing ${formatNumber(users.length)} of ${formatNumber(totalCount)} results`}
                    </p>
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            pageNumber: Math.max(1, prev.pageNumber - 1),
                          }))
                        }
                        disabled={pagination.pageNumber === 1}
                        className="px-4 py-2"
                      >
                        {isRTL ? "السابق" : "Previous"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            pageNumber: prev.pageNumber + 1,
                          }))
                        }
                        disabled={users.length < pagination.pageSize}
                        className="px-4 py-2"
                      >
                        {isRTL ? "التالي" : "Next"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <TeamMemberModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => refetch()}
      />

      {editModal.user && (
        <UserEditModal
          isOpen={editModal.isOpen}
          user={editModal.user}
          onClose={() => setEditModal({ isOpen: false, user: null })}
          onSuccess={() => refetch()}
        />
      )}

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ isOpen: false, userId: "", userName: "" })
        }
        onConfirm={handleDeleteConfirm}
        title={isRTL ? "حذف المستخدم" : "Delete User"}
        message={
          isRTL
            ? "هل أنت متأكد من حذف هذا المستخدم؟ هذا الإجراء لا يمكن التراجع عنه."
            : "Are you sure you want to delete this user? This action cannot be undone."
        }
        itemName={deleteModal.userName}
        isLoading={deleteUserMutation.isPending}
      />
    </div>
  );
};

export default Team;
