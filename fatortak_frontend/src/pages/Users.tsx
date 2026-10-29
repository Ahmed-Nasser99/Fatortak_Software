import React, { useState } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  User,
  Shield,
  Crown,
  Mail,
  Phone,
  Calendar,
  Filter,
  Grid,
  List,
  MoreHorizontal,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useUsers, useDeleteUser, useUpdateUser } from "../hooks/useUsers";
import { PaginationDto, UserFilterDto, UserDto } from "../types/api";
import { toast } from "react-toastify";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../components/ui/avatar";

const Users: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Pagination state
  const [pagination, setPagination] = useState<PaginationDto>({
    pageNumber: 1,
    pageSize: 12,
  });

  // Filters
  const filters: UserFilterDto = {
    ...(searchTerm && { email: searchTerm }),
    ...(roleFilter !== "all" && { role: roleFilter }),
  };

  // Fetch users
  const {
    data: usersResponse,
    isLoading,
    error,
    refetch,
  } = useUsers(pagination, filters);

  const deleteUserMutation = useDeleteUser();
  const updateUserMutation = useUpdateUser();

  const users = usersResponse?.success ? usersResponse.data?.data || [] : [];
  const totalCount = usersResponse?.success
    ? usersResponse.data?.totalCount || 0
    : 0;

  const handleDeleteUser = async (userId: string) => {
    if (
      window.confirm(
        t("confirmDeleteUser")
      )
    ) {
      try {
        const result = await deleteUserMutation.mutateAsync(userId);
        if (result.success) {
          toast.success(
            t("userDeleted")
          );
          refetch();
        }
      } catch (error) {
        toast.error(
          t("failedToDeleteUser")
        );
      }
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return <Crown className="w-4 h-4 text-red-500" />;
      case "manager":
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-slate-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-gradient-to-r from-red-500 to-pink-500 text-white";
      case "manager":
        return "bg-brand-600 text-white";
      default:
        return "bg-gradient-to-r from-slate-500 to-slate-500 text-white";
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    if (!name) return "bg-gradient-to-r from-slate-500 to-slate-500";
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

  const getFullName = (user: UserDto) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || user.lastName || user.email.split("@")[0];
  };

  if (error) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-slate-950 p-4 sm:p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {isRTL ? "خطأ في تحميل المستخدمين" : "Error Loading Users"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {error instanceof Error
                ? error.message
                : "Unknown error occurred"}
            </p>
            <Button onClick={() => refetch()}>
              {isRTL ? "إعادة المحاولة" : "Retry"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas dark:bg-slate-950">
      <div className="mx-auto p-4 sm:p-6 lg:p-8" dir={isRTL ? "rtl" : "ltr"}>
        {/* Enhanced Header */}
        <div className="page-hero mb-6">
          <div
            className={`flex flex-col lg:flex-row lg:items-center lg:justify-between ${
              isRTL ? "lg:flex-row-reverse" : ""
            }`}
          >
            <div className="mb-6 lg:mb-0">
              <div
                className={`flex items-center space-x-4 mb-4 ${
                  isRTL ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <div className="page-hero-icon">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {t("users") || (isRTL ? "المستخدمون" : "Users")}
                  </h1>
                  <p className="text-blue-100 text-lg">
                    {isRTL
                      ? "إدارة المستخدمين والأدوار"
                      : "Manage users and their roles"}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div
                className={`flex space-x-6 ${
                  isRTL ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold">{totalCount}</div>
                  <div className="text-sm text-blue-200">
                    {isRTL ? "إجمالي المستخدمين" : "Total Users"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {
                      users.filter(
                        (user) => user.role?.toLowerCase() === "admin"
                      ).length
                    }
                  </div>
                  <div className="text-sm text-blue-200">
                    {isRTL ? "المدراء" : "Admins"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {users.filter((user) => user.isActive).length}
                  </div>
                  <div className="text-sm text-blue-200">
                    {isRTL ? "النشطون" : "Active"}
                  </div>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="page-hero-action h-11 px-6"
            >
              <Plus className="w-6 h-6 mr-2" />
              <span className="font-semibold text-lg">
                {isRTL ? "مستخدم جديد" : "New User"}
              </span>
            </Button>
          </div>
        </div>

        {/* Enhanced Filters */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div
              className={`flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6 ${
                isRTL ? "lg:flex-row-reverse lg:space-x-reverse" : ""
              }`}
            >
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className={`absolute top-1/2 transform -translate-y-1/2 ${
                      isRTL ? "right-4" : "left-4"
                    } w-5 h-5 text-slate-400`}
                  />
                  <input
                    type="text"
                    placeholder={
                      isRTL ? "البحث في المستخدمين..." : "Search users..."
                    }
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full ${
                      isRTL ? "pr-12 pl-4 text-end" : "pl-12 pr-4"
                    } py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white transition-all duration-200`}
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-slate-500" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white min-w-[150px]"
                >
                  <option value="all">
                    {isRTL ? "جميع الأدوار" : "All Roles"}
                  </option>
                  <option value="admin">{isRTL ? "مدير" : "Admin"}</option>
                  <option value="manager">
                    {isRTL ? "مدير فرع" : "Manager"}
                  </option>
                  <option value="user">{isRTL ? "مستخدم" : "User"}</option>
                </select>
              </div>

              {/* View Toggle */}
              <div
                className={`flex items-center space-x-2 ${
                  isRTL ? "flex-row-reverse space-x-reverse" : ""
                }`}
              >
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-lg"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("table")}
                  className="rounded-lg"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card className="shadow-lg">
            <CardContent className="p-12">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-4"></div>
                <span className="text-lg text-slate-600 dark:text-slate-400">
                  {isRTL ? "جاري تحميل المستخدمين..." : "Loading users..."}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Grid/Table */}
        {!isLoading && (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {users.map((user: UserDto) => (
                  <Card
                    key={user.id}
                    className="group hover:shadow-lg transition-all duration-300 transform  border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
                  >
                    <CardHeader className="pb-3">
                      <div
                        className={`flex items-start justify-between ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div
                          className={`flex items-center space-x-3 ${
                            isRTL ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          <div
                            className={`w-12 h-12 ${getAvatarColor(
                              getFullName(user)
                            )} rounded-xl flex items-center justify-center shadow-lg`}
                          >
                            <span className="text-sm font-bold text-white">
                              {getInitials(getFullName(user))}
                            </span>
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                              {getFullName(user)}
                            </CardTitle>
                            <div
                              className={`flex items-center space-x-1 ${
                                isRTL ? "flex-row-reverse space-x-reverse" : ""
                              }`}
                            >
                              {getRoleIcon(user.role || "user")}
                              <Badge
                                className={`${getRoleBadgeColor(
                                  user.role || "user"
                                )} font-medium`}
                              >
                                {user.role || "User"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100 dark:hover:bg-slate-700"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isRTL ? "start" : "end"}>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              {isRTL ? "تعديل" : "Edit"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {isRTL ? "حذف" : "Delete"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div
                          className={`flex items-center space-x-2 ${
                            isRTL ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600 dark:text-slate-400 truncate">
                            {user.email}
                          </span>
                        </div>

                        {user.phoneNumber && (
                          <div
                            className={`flex items-center space-x-2 ${
                              isRTL ? "flex-row-reverse space-x-reverse" : ""
                            }`}
                          >
                            <Phone className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {user.phoneNumber}
                            </span>
                          </div>
                        )}

                        <div
                          className={`flex items-center space-x-2 ${
                            isRTL ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {new Date(user.createdAt).toLocaleDateString(
                              isRTL ? "ar" : "en"
                            )}
                          </span>
                        </div>

                        <div
                          className={`flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {isRTL ? "الحالة" : "Status"}
                          </span>
                          <Badge
                            variant={user.isActive ? "default" : "secondary"}
                          >
                            {user.isActive
                              ? isRTL
                                ? "نشط"
                                : "Active"
                              : isRTL
                              ? "غير نشط"
                              : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              // Table View for larger screens
              <Card className="shadow-lg border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-800/60">
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
                          {isRTL ? "الحالة" : "Status"}
                        </th>
                        <th
                          className={`px-4 py-3 ${
                            isRTL ? "text-end" : "text-start"
                          } text-sm font-bold text-slate-900 dark:text-white`}
                        >
                          {isRTL ? "تاريخ الإنشاء" : "Created"}
                        </th>
                        <th
                          className={`px-4 py-3 ${
                            isRTL ? "text-end" : "text-start"
                          } text-sm font-bold text-slate-900 dark:text-white`}
                        >
                          {t("actions") || (isRTL ? "الإجراءات" : "Actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {users.map((user: UserDto, index) => (
                        <tr
                          key={user.id}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors duration-200 ${
                            index % 2 === 0
                              ? "bg-white dark:bg-slate-800"
                              : "bg-slate-50/50 dark:bg-slate-700/50"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div
                              className={`flex items-center space-x-3 ${
                                isRTL ? "flex-row-reverse space-x-reverse" : ""
                              }`}
                            >
                              <div
                                className={`w-10 h-10 ${getAvatarColor(
                                  getFullName(user)
                                )} rounded-lg flex items-center justify-center shadow-lg`}
                              >
                                <span className="text-xs font-bold text-white">
                                  {getInitials(getFullName(user))}
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900 dark:text-white">
                                  {getFullName(user)}
                                </div>
                                {user.phoneNumber && (
                                  <div className="text-sm text-slate-500 dark:text-slate-400">
                                    {user.phoneNumber}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {user.email}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div
                              className={`flex items-center space-x-2 ${
                                isRTL ? "flex-row-reverse space-x-reverse" : ""
                              }`}
                            >
                              {getRoleIcon(user.role || "user")}
                              <Badge
                                className={`${getRoleBadgeColor(
                                  user.role || "user"
                                )} font-medium`}
                              >
                                {user.role || "User"}
                              </Badge>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={user.isActive ? "default" : "secondary"}
                            >
                              {user.isActive
                                ? isRTL
                                  ? "نشط"
                                  : "Active"
                                : isRTL
                                ? "غير نشط"
                                : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {new Date(user.createdAt).toLocaleDateString(
                                isRTL ? "ar" : "en"
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div
                              className={`flex space-x-2 ${
                                isRTL ? "flex-row-reverse space-x-reverse" : ""
                              }`}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-blue-100 dark:hover:bg-blue-900/20"
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                className="hover:bg-red-100 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden p-4 space-y-4">
                  {users.map((user: UserDto) => (
                    <Card
                      key={user.id}
                      className="border border-slate-200 dark:border-slate-700"
                    >
                      <CardContent className="p-4">
                        <div
                          className={`flex items-start justify-between mb-3 ${
                            isRTL ? "flex-row-reverse" : ""
                          }`}
                        >
                          <div
                            className={`flex items-center space-x-3 ${
                              isRTL ? "flex-row-reverse space-x-reverse" : ""
                            }`}
                          >
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
                              <h3 className="font-semibold text-slate-900 dark:text-white">
                                {getFullName(user)}
                              </h3>
                              <div
                                className={`flex items-center space-x-1 mt-1 ${
                                  isRTL
                                    ? "flex-row-reverse space-x-reverse"
                                    : ""
                                }`}
                              >
                                {getRoleIcon(user.role || "user")}
                                <Badge
                                  className={`${getRoleBadgeColor(
                                    user.role || "user"
                                  )} font-medium text-xs`}
                                >
                                  {user.role || "User"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={user.isActive ? "default" : "secondary"}
                          >
                            {user.isActive
                              ? isRTL
                                ? "نشط"
                                : "Active"
                              : isRTL
                              ? "غير نشط"
                              : "Inactive"}
                          </Badge>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div
                            className={`flex items-center space-x-2 ${
                              isRTL ? "flex-row-reverse space-x-reverse" : ""
                            }`}
                          >
                            <Mail className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600 dark:text-slate-400 truncate">
                              {user.email}
                            </span>
                          </div>
                          {user.phoneNumber && (
                            <div
                              className={`flex items-center space-x-2 ${
                                isRTL ? "flex-row-reverse space-x-reverse" : ""
                              }`}
                            >
                              <Phone className="w-4 h-4 text-slate-400" />
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                {user.phoneNumber}
                              </span>
                            </div>
                          )}
                          <div
                            className={`flex items-center space-x-2 ${
                              isRTL ? "flex-row-reverse space-x-reverse" : ""
                            }`}
                          >
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {new Date(user.createdAt).toLocaleDateString(
                                isRTL ? "ar" : "en"
                              )}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`flex space-x-2 ${
                            isRTL ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                          >
                            <Edit className="w-4 h-4 mr-2 text-blue-600" />
                            {isRTL ? "تعديل" : "Edit"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-700"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </Card>
            )}

            {/* Empty State */}
            {users.length === 0 && (
              <Card className="shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {isRTL ? "لا يوجد مستخدمون" : "No users found"}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6 text-lg">
                    {isRTL
                      ? "ابدأ بإضافة أول مستخدم"
                      : "Start by adding your first user"}
                  </p>
                  <Button size="lg" className="px-8">
                    <Plus className="w-5 h-5 mr-2" />
                    {isRTL ? "إضافة مستخدم" : "Add User"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Pagination */}
            {totalCount > pagination.pageSize && (
              <Card className="mt-8 shadow-lg border-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div
                    className={`flex items-center justify-between ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                      {isRTL
                        ? `عرض ${users.length} من أصل ${totalCount} مستخدم`
                        : `Showing ${users.length} of ${totalCount} users`}
                    </p>
                    <div
                      className={`flex space-x-2 ${
                        isRTL ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      <Button
                        variant="outline"
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            pageNumber: Math.max(1, prev.pageNumber - 1),
                          }))
                        }
                        disabled={pagination.pageNumber <= 1}
                      >
                        {isRTL ? "السابق" : "Previous"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setPagination((prev) => ({
                            ...prev,
                            pageNumber: prev.pageNumber + 1,
                          }))
                        }
                        disabled={users.length < pagination.pageSize}
                      >
                        {isRTL ? "التالي" : "Next"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Users;
