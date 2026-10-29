import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FolderKanban,
  Calendar,
  Briefcase,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Users,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  useProjects,
  useDeleteProject,
  useUpdateProjectStatus,
} from "../hooks/useProjects";
import { PaginationDto, ProjectFilterDto, ProjectStatus } from "../types/api";
import { toast } from "react-toastify";
import { Badge } from "../components/ui/badge";
import StatCard from "../components/ui/StatCard";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import ProjectModal from "../components/modals/ProjectModal";
import ClientSelector from "../components/ui/ClientSelector";
import EnhancedDeleteDialog from "../components/ui/enhanced-delete-dialog";
// import { useRoleAccess } from "@/hooks/useRoleAccess"; // Assuming role access is needed later
import { formatDate, formatNumber } from "@/Helpers/localization";

const Projects: React.FC = () => {
  // const roleAccess = useRoleAccess();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const clientIdParam = searchParams.get("clientId");

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProject, setEditProject] = useState<any>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);

  // Filter state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    clientIdParam,
  );

  // Pagination state
  const [pagination, setPagination] = useState<PaginationDto>({
    pageNumber: 1,
    pageSize: 10,
  });

  const filters: ProjectFilterDto = {
    ...(searchTerm && { name: searchTerm }),
    ...(selectedCustomerId && { customerId: selectedCustomerId }),
  };

  const {
    data: projectsResponse,
    isLoading,
    error,
    refetch,
  } = useProjects(pagination, filters);

  const updateStatusMutation = useUpdateProjectStatus();
  const deleteProjectMutation = useDeleteProject();

  const projects = projectsResponse?.success
    ? projectsResponse.data?.data || []
    : [];

  const totalCount = projectsResponse?.success
    ? projectsResponse.data?.totalCount || 0
    : 0;

  const calculateProjectTotal = (p: any) => {
    const subtotal = p.contractValue || 0;
    const discount = p.discount || 0;
    const vatAmount = p.includeVat ? subtotal * (p.vatRate || 0) : 0;
    return subtotal - discount + vatAmount;
  };

  const calculateStats = () => {
    const totalBudget = projects.reduce(
      (acc: number, p: any) => acc + calculateProjectTotal(p),
      0,
    );
    const activeProjects = projects.filter(
      (p: any) => p.status === ProjectStatus.Active,
    ).length;
    const completedProjects = projects.filter(
      (p: any) => p.status === ProjectStatus.Completed,
    ).length;

    return { totalBudget, activeProjects, completedProjects };
  };

  const projectStats = calculateStats();

  const handleNewProject = () => {
    navigate("new-with-contract");
  };

  const handleEditProject = (project: any) => {
    navigate(`/projects/edit-with-contract/${project.id}`);
  };

  const handleDeleteProject = (projectId: string) => {
    setDeleteProjectId(projectId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteProjectId) return;

    try {
      const result = await deleteProjectMutation.mutateAsync(deleteProjectId);

      if (result.success) {
        toast.success(
          isRTL ? "تم حذف المشروع بنجاح" : "Project deleted successfully",
        );
        setDeleteProjectId(null);
        refetch();
      }
    } catch (error) {
      toast.error(isRTL ? "فشل في حذف المشروع" : "Failed to delete project");
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, pageNumber: newPage }));
  };

  const handleStatusChange = async (
    projectId: string,
    newStatus: ProjectStatus,
  ) => {
    try {
      const result = await updateStatusMutation.mutateAsync({
        id: projectId,
        status: newStatus,
      });

      if (result.success) {
        toast.success(isRTL ? "تم تحديث الحالة" : "Status updated");
        refetch();
      } else {
        toast.error(
          result.errorMessage ||
            (isRTL ? "فشل تحديث الحالة" : "Failed to update status"),
        );
      }
    } catch (error) {
      toast.error(isRTL ? "فشل تحديث الحالة" : "Failed to update status");
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Active:
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800";
      case ProjectStatus.Completed:
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800";
      case ProjectStatus.NotStarted:
        return "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-800";
      case ProjectStatus.OnHold:
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800";
      case ProjectStatus.Cancelled:
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      case ProjectStatus.Settled:
        return "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800";
      case ProjectStatus.Archived:
        return "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/20 dark:text-slate-500 dark:border-slate-800";
      case ProjectStatus.Draft:
        return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusLabel = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Active:
        return isRTL ? "نشط" : "Active";
      case ProjectStatus.Completed:
        return isRTL ? "مكتمل" : "Completed";
      case ProjectStatus.NotStarted:
        return isRTL ? "لم يبدأ" : "Not Started";
      case ProjectStatus.OnHold:
        return isRTL ? "معلق" : "On Hold";
      case ProjectStatus.Cancelled:
        return isRTL ? "ملغى" : "Cancelled";
      case ProjectStatus.Settled:
        return isRTL ? "تمت تسويته" : "Settled";
      case ProjectStatus.Archived:
        return isRTL ? "مؤرشف" : "Archived";
      case ProjectStatus.Draft:
        return isRTL ? "مسودة" : "Draft";
      default:
        return status;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-slate-950">
        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderKanban className="w-8 h-8 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold text-destructive mb-2">
                {isRTL ? "خطأ في تحميل المشاريع" : "Error Loading Projects"}
              </h2>
              <Button onClick={() => refetch()} className="w-full">
                {isRTL ? "إعادة المحاولة" : "Retry"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas dark:bg-slate-950">
      <div className="container !max-w-full mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="page-hero">
          <div
            className={`flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 ${
              isRTL ? "lg:flex-row-reverse" : ""
            }`}
          >
            <div className={`flex items-center space-x-4`}>
              <div className="page-hero-icon mx-3">
                <FolderKanban className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {isRTL ? "المشاريع" : "Projects"}
                </h1>
                <p className="text-blue-100 text-lg text-opacity-90">
                  {isRTL
                    ? "إدارة مهامك ومشاريعك بكفاءة"
                    : "Manage your tasks and projects efficiently"}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => navigate("new-with-contract")}
                className="page-hero-action"
              >
                <Plus className="w-4 h-4" />
                <span className="font-semibold">
                  {isRTL ? "مشروع جديد" : "New Project"}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard
            title={isRTL ? "إجمالي الميزانية" : "Total Budget"}
            value={formatNumber(projectStats.totalBudget)}
            subtitle={isRTL ? "الميزانية المخططة" : "Planned budget across projects"}
            icon={DollarSign}
            tone="info"
          />
          <StatCard
            title={isRTL ? "مشاريع نشطة" : "Active Projects"}
            value={formatNumber(projectStats.activeProjects)}
            subtitle={isRTL ? "قيد التنفيذ" : "Currently in progress"}
            icon={TrendingUp}
            tone="success"
          />
          <StatCard
            title={isRTL ? "مشاريع مكتملة" : "Completed Projects"}
            value={formatNumber(projectStats.completedProjects)}
            subtitle={isRTL ? "تم تسليمها" : "Delivered and closed"}
            icon={CheckCircle}
            tone="brand"
          />
        </div>

        {/* Search & Filter */}
        <Card className="border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-slate-800 dark:bg-slate-900">
          <CardContent className="p-5">
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isRTL ? "rtl" : "ltr"}`}
            >
              <div className="relative">
                <Search
                  className={`absolute top-1/2 transform -translate-y-1/2 ${
                    isRTL ? "right-4" : "left-4"
                  } w-5 h-5 text-muted-foreground`}
                />
                <input
                  type="text"
                  placeholder={
                    isRTL ? "البحث في المشاريع..." : "Search projects..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full py-2.5 px-4 ${
                    isRTL ? "pr-12 text-end" : "pl-12"
                  } border border-slate-200 bg-white shadow-sm outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-900`}
                />
              </div>

              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="flex-1">
                  <ClientSelector
                    value={selectedCustomerId || ""}
                    onChange={(value) => {
                      setSelectedCustomerId(value);
                      if (value) {
                        setSearchParams({ clientId: value });
                      } else {
                        setSearchParams({});
                      }
                    }}
                    placeholder={
                      isRTL ? "تصفية حسب العميل" : "Filter by Client"
                    }
                  />
                </div>
                {selectedCustomerId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCustomerId(null);
                      setSearchParams({});
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {isRTL ? "إلغاء التصفية" : "Clear"}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects List */}
        {!isLoading && (
          <Card className="border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-slate-800 dark:bg-slate-900">
            <div className="hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-slate-50/50 dark:bg-slate-800/50">
                      <th
                        className={`px-6 py-5 text-${isRTL ? "right" : "left"} text-xs font-bold text-slate-400 uppercase tracking-wider`}
                      >
                        {isRTL ? "المشروع" : "Project"}
                      </th>
                      <th
                        className={`px-6 py-5 text-${isRTL ? "right" : "left"} text-xs font-bold text-slate-400 uppercase tracking-wider`}
                      >
                        {isRTL ? "العميل" : "Client"}
                      </th>
                      <th
                        className={`px-6 py-5 text-${isRTL ? "right" : "left"} text-xs font-bold text-slate-400 uppercase tracking-wider`}
                      >
                        {isRTL ? "الميزانية" : "Budget"}
                      </th>
                      <th
                        className={`px-6 py-5 text-${isRTL ? "right" : "left"} text-xs font-bold text-slate-400 uppercase tracking-wider`}
                      >
                        {isRTL ? "المدفوع" : "Paid"}
                      </th>
                      <th
                        className={`px-6 py-5 text-${isRTL ? "right" : "left"} text-xs font-bold text-slate-400 uppercase tracking-wider`}
                      >
                        {isRTL ? "المتبقي" : "Remaining"}
                      </th>
                      <th
                        className={`px-6 py-5 text-${isRTL ? "right" : "left"} text-xs font-bold text-slate-400 uppercase tracking-wider`}
                      >
                        {isRTL ? "الحالة" : "Status"}
                      </th>
                      <th
                        className={`px-6 py-5 text-${isRTL ? "right" : "left"} text-xs font-bold text-slate-400 uppercase tracking-wider`}
                      >
                        {isRTL ? "التاريخ" : "Date"}
                      </th>
                      <th
                        className={`px-6 py-5 text-${isRTL ? "right" : "left"} text-xs font-bold text-slate-400 uppercase tracking-wider`}
                      >
                        {isRTL ? "إجراءات" : "Actions"}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {projects.map((project: any) => (
                      <tr
                        key={project.id}
                        className="hover:bg-muted/20 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold">{project.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {project.description}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {project.customerName || "-"}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {calculateProjectTotal(project) > 0
                            ? formatNumber(calculateProjectTotal(project))
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                          {formatNumber(project.totalCollected || 0)}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-rose-600 dark:text-rose-400">
                          {formatNumber(
                            Math.max(0, calculateProjectTotal(project) - (project.totalCollected || 0)),
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="w-[140px]">
                            <Select
                              value={project.status}
                              onValueChange={(value) =>
                                handleStatusChange(
                                  project.id,
                                  value as ProjectStatus,
                                )
                              }
                              disabled={
                                updateStatusMutation.isPending ||
                                project.status === ProjectStatus.Completed ||
                                project.status === ProjectStatus.Cancelled
                              }
                            >
                              <SelectTrigger
                                className={`h-8 ${getStatusColor(project.status)} border-2 font-medium`}
                              >
                                <SelectValue>
                                  {getStatusLabel(project.status)}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(ProjectStatus)
                                  .filter((status) => {
                                    // Prevent moving back to Draft if Active or Completed
                                    if (status === ProjectStatus.Draft) {
                                      return (
                                        project.status !==
                                          ProjectStatus.Active &&
                                        project.status !==
                                          ProjectStatus.Completed
                                      );
                                    }
                                    return true;
                                  })
                                  .map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {getStatusLabel(status)}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {formatDate(project.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                navigate(`/projects/${project.id}`)
                              }
                              className="text-indigo-600 hover:text-indigo-800"
                              title={isRTL ? "عرض التفاصيل" : "View Details"}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProject(project)}
                              className="text-primary hover:text-primary/80"
                              disabled={
                                project.status === ProjectStatus.Completed ||
                                project.status === ProjectStatus.Cancelled
                              }
                              title={
                                project.status === ProjectStatus.Completed ||
                                project.status === ProjectStatus.Cancelled
                                  ? isRTL
                                    ? "لا يمكن تعديل مشروع منتهي"
                                    : "Cannot edit closed project"
                                  : ""
                              }
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProject(project.id)}
                              className="text-destructive hover:text-destructive/80"
                              disabled={
                                project.status === ProjectStatus.Completed
                              }
                              title={
                                project.status === ProjectStatus.Completed
                                  ? isRTL
                                    ? "لا يمكن حذف مشروع منتهي"
                                    : "Cannot delete closed project"
                                  : ""
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View - Simplified */}
            <div className="lg:hidden divide-y divide-border/50">
              {projects.map((project: any) => (
                <div key={project.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{project.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {project.customerName}
                      </p>
                    </div>
                    <div className="w-[130px]">
                      <Select
                        value={project.status}
                        onValueChange={(value) =>
                          handleStatusChange(project.id, value as ProjectStatus)
                        }
                        disabled={
                          updateStatusMutation.isPending ||
                          project.status === ProjectStatus.Completed ||
                          project.status === ProjectStatus.Cancelled
                        }
                      >
                        <SelectTrigger
                          className={`h-8 ${getStatusColor(project.status)} border-2 font-medium`}
                        >
                          <SelectValue>
                            {getStatusLabel(project.status)}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(ProjectStatus)
                            .filter((status) => {
                              if (status === ProjectStatus.Draft) {
                                return (
                                  project.status !== ProjectStatus.Active &&
                                  project.status !== ProjectStatus.Completed
                                );
                              }
                              return true;
                            })
                            .map((status) => (
                              <SelectItem key={status} value={status}>
                                {getStatusLabel(status)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>
                      {isRTL ? "الميزانية: " : "Budget: "}
                      {calculateProjectTotal(project) > 0
                        ? formatNumber(calculateProjectTotal(project))
                        : "-"}
                    </span>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/projects/${project.id}`)}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditProject(project)}
                      disabled={
                        project.status === ProjectStatus.Completed ||
                        project.status === ProjectStatus.Cancelled
                      }
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-destructive"
                      disabled={project.status === ProjectStatus.Completed}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="border-t bg-muted/20 px-4 py-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  {isRTL
                    ? `عرض ${formatNumber(projects.length)} من ${formatNumber(totalCount)} مشاريع`
                    : `Showing ${formatNumber(projects.length)} of ${formatNumber(totalCount)} projects`}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.pageNumber - 1)}
                    disabled={pagination.pageNumber <= 1}
                  >
                    {isRTL ? "السابق" : "Previous"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.pageNumber + 1)}
                    disabled={projects.length < pagination.pageSize} // basic check, ideally use totalPages
                  >
                    {isRTL ? "التالي" : "Next"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && projects.length === 0 && (
          <Card className="border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FolderKanban className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {isRTL ? "لا يوجد مشاريع" : "No projects found"}
              </h3>
              <Button
                onClick={() => navigate("new-with-contract")}
                className="bg-brand-600 hover:bg-brand-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isRTL ? "إضافة أول مشروع" : "Add First Project"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        project={editProject}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          refetch();
        }}
      />

      <EnhancedDeleteDialog
        isOpen={!!deleteProjectId}
        onClose={() => setDeleteProjectId(null)}
        onConfirm={handleConfirmDelete}
        title={isRTL ? "حذف المشروع" : "Delete Project"}
        description={
          isRTL
            ? "هل أنت متأكد من حذف هذا المشروع؟"
            : "Are you sure you want to delete this project?"
        }
        itemName={projects.find((p: any) => p.id === deleteProjectId)?.name}
        isLoading={deleteProjectMutation.isPending}
      />
    </div>
  );
};

export default Projects;
