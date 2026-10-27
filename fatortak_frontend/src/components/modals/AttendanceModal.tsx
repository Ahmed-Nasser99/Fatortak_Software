import React, { useState, useEffect } from "react";
import { X, Save, Clock, User, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  useCreateAttendance,
  useUpdateAttendance,
  useAttendances,
} from "../../hooks/useAttendances";
import { useRoleAccess } from "../../hooks/useRoleAccess";
import { useEmployees } from "../../hooks/useEmployees";
import { AttendanceDto, CreateAttendanceDto } from "@/types/attendanceTypes";
import { parseLocalDate } from "@/Helpers/parseDateTimeToDateOnly";
import { formatDate } from "@/Helpers/localization";

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  attendance?: AttendanceDto | null;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  attendance = null,
}) => {
  const { isRTL, t } = useLanguage();
  const roleAccess = useRoleAccess();
  const createAttendanceMutation = useCreateAttendance();
  const updateAttendanceMutation = useUpdateAttendance();

  // Fetch employees for the dropdown
  const { data: employeesResponse } = useEmployees({
    pageNumber: 1,
    pageSize: 100,
  });
  const employees = employeesResponse?.data?.data || [];

  const [formData, setFormData] = useState<CreateAttendanceDto>({
    employeeId: "" as any,
    attendanceDate: new Date().toISOString().split("T")[0],
    attendTime: undefined,
    leaveTime: undefined,
    status: "Attended",
    reason: "",
  });

  const [duplicateWarning, setDuplicateWarning] = useState<{
    show: boolean;
    existingAttendance?: AttendanceDto;
  }>({ show: false });

  // Check for existing attendance when employee and date change
  const { data: existingAttendanceResponse } = useAttendances(
    { pageNumber: 1, pageSize: 10 },
    {
      employeeName: formData.employeeId
        ? employees.find((emp) => emp.id === formData.employeeId)?.fullName
        : undefined,
      date: formData.attendanceDate || undefined,
    },
    {
      enabled: !!(
        formData.employeeId &&
        formData.attendanceDate &&
        !attendance
      ),
    }
  );

  useEffect(() => {
    if (attendance) {
      setFormData({
        employeeId: attendance.employeeId,
        attendanceDate: parseLocalDate(attendance.attendanceDate.toString()),
        attendTime: attendance.attendTime
          ? new Date(attendance.attendTime).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : undefined,
        leaveTime: attendance.leaveTime
          ? new Date(attendance.leaveTime).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : undefined,
        status: attendance.status,
        reason: attendance.reason || "",
      });
    } else {
      setFormData({
        employeeId: "" as any,
        attendanceDate: new Date().toISOString().split("T")[0],
        attendTime: undefined,
        leaveTime: undefined,
        status: "Attended",
        reason: "",
      });
    }
    setDuplicateWarning({ show: false });
  }, [attendance, isOpen]);

  // Check for duplicates when data changes
  useEffect(() => {
    if (!attendance && existingAttendanceResponse?.data?.data) {
      const existingRecords = existingAttendanceResponse.data.data;
      const duplicateRecord = existingRecords.find((record) => {
        const recordDate = new Date(record.attendanceDate).toDateString();
        const formDate = new Date(formData.attendanceDate).toDateString();
        return (
          record.employeeId === formData.employeeId && recordDate === formDate
        );
      });

      if (duplicateRecord) {
        setDuplicateWarning({
          show: true,
          existingAttendance: duplicateRecord,
        });
      } else {
        setDuplicateWarning({ show: false });
      }
    }
  }, [
    existingAttendanceResponse,
    formData.employeeId,
    formData.attendanceDate,
    attendance,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employeeId) {
      toast.error(t("employeeRequired"));
      return;
    }

    if (!formData.attendanceDate) {
      toast.error(t("dateRequired"));
      return;
    }

    // Check for duplicates before submitting (for new records)
    if (!attendance && duplicateWarning.show) {
      toast.error(
        isRTL
          ? "يوجد بالفعل سجل حضور لهذا الموظف في هذا اليوم"
          : "Attendance record already exists for this employee on this date"
      );
      return;
    }

    // Check permissions
    if (attendance && !roleAccess.canEdit()) {
      toast.error(t("noEditPermission"));
      return;
    }

    if (!attendance && !roleAccess.canCreate()) {
      toast.error(t("noCreatePermission"));
      return;
    }

    try {
      // Prepare data for API
      const submitData: any = {
        employeeId: formData.employeeId,
        attendanceDate: formData.attendanceDate,
        status: formData.status,
        reason: formData.reason,
      };

      // Add time fields if provided
      if (formData.attendTime) {
        submitData.attendTime = `${formData.attendanceDate}T${formData.attendTime}:00`;
      }
      if (formData.leaveTime) {
        submitData.leaveTime = `${formData.attendanceDate}T${formData.leaveTime}:00`;
      }

      if (attendance) {
        // Update existing attendance
        const result = await updateAttendanceMutation.mutateAsync({
          id: attendance.id,
          data: submitData,
        });

        if (result.success) {
          toast.success(
            isRTL ? "تم تحديث الحضور بنجاح" : "Attendance updated successfully"
          );
          onSuccess();
        } else {
          // Handle API validation errors
          if (
            result.errorMessage?.includes("duplicate") ||
            result.errorMessage?.includes("already exists")
          ) {
            toast.error(
              isRTL
                ? "يوجد بالفعل سجل حضور لهذا الموظف في هذا اليوم"
                : "Attendance record already exists for this employee on this date"
            );
          } else {
            toast.error(
              result.errorMessage ||
                (isRTL ? "فشل في تحديث الحضور" : "Failed to update attendance")
            );
          }
        }
      } else {
        // Create new attendance
        const result = await createAttendanceMutation.mutateAsync(submitData);

        if (result.success) {
          toast.success(
            isRTL ? "تم إنشاء الحضور بنجاح" : "Attendance created successfully"
          );
          onSuccess();
        } else {
          // Handle API validation errors
          if (
            result.errorMessage?.includes("duplicate") ||
            result.errorMessage?.includes("already exists")
          ) {
            toast.error(
              isRTL
                ? "يوجد بالفعل سجل حضور لهذا الموظف في هذا اليوم"
                : "Attendance record already exists for this employee on this date"
            );
          } else {
            toast.error(
              result.errorMessage ||
                (isRTL ? "فشل في إنشاء الحضور" : "Failed to create attendance")
            );
          }
        }
      }
    } catch (error: any) {
      // Handle network or other errors
      const errorMessage = error?.response?.data?.message || error?.message;
      if (
        errorMessage?.includes("duplicate") ||
        errorMessage?.includes("already exists")
      ) {
        toast.error(
          isRTL
            ? "يوجد بالفعل سجل حضور لهذا الموظف في هذا اليوم"
            : "Attendance record already exists for this employee on this date"
        );
      } else {
        toast.error(
          attendance
            ? isRTL
              ? "حدث خطأ أثناء تحديث الحضور"
              : "Error updating attendance"
            : isRTL
            ? "حدث خطأ أثناء إنشاء الحضور"
            : "Error creating attendance"
        );
      }
    }
  };

  const handleInputChange = (
    field: keyof CreateAttendanceDto,
    value: string | undefined
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatDateTime = (dateTime: string | Date | null | undefined) => {
    if (!dateTime) return "-";
    const date = new Date(dateTime);
    return formatDate(date);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {attendance
              ? isRTL
                ? "تعديل الحضور"
                : "Edit Attendance"
              : isRTL
              ? "حضور جديد"
              : "New Attendance"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Duplicate Warning */}
        {duplicateWarning.show && duplicateWarning.existingAttendance && (
          <div className="mx-6 mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div
              className={`flex items-start space-x-3 ${
                isRTL ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
                  {isRTL ? "تحذير: سجل مكرر" : "Warning: Duplicate Record"}
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  {isRTL
                    ? "يوجد بالفعل سجل حضور لهذا الموظف في هذا اليوم:"
                    : "An attendance record already exists for this employee on this date:"}
                </p>
                <div className="mt-2 p-2 bg-amber-100 dark:bg-amber-900/30 rounded text-xs">
                  <div
                    className={`grid grid-cols-2 gap-2 ${
                      isRTL ? "text-right" : "text-left"
                    }`}
                  >
                    <div>
                      <span className="font-medium">
                        {isRTL ? "الحالة:" : "Status:"}
                      </span>{" "}
                      {t(duplicateWarning.existingAttendance.status)}
                    </div>
                    <div>
                      <span className="font-medium">
                        {isRTL ? "وقت الحضور:" : "Attend Time:"}
                      </span>{" "}
                      {formatDateTime(
                        duplicateWarning.existingAttendance.attendTime
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Employee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? "الموظف" : "Employee"} *
              </label>
              <div className="relative">
                <User
                  className={`absolute top-1/2 transform -translate-y-1/2 ${
                    isRTL ? "right-3" : "left-3"
                  } w-4 h-4 text-gray-400`}
                />
                <select
                  required
                  value={formData.employeeId as string}
                  onChange={(e) =>
                    handleInputChange("employeeId", e.target.value)
                  }
                  className={`w-full ${
                    isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4"
                  } py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    duplicateWarning.show
                      ? "border-amber-300 dark:border-amber-600"
                      : ""
                  }`}
                  disabled={!!attendance} // Disable for edits since employee can't be changed
                >
                  <option value="">
                    {isRTL ? "اختر الموظف" : "Select Employee"}
                  </option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? "التاريخ" : "Date"} *
              </label>
              <div className="relative">
                <Calendar
                  className={`absolute top-1/2 transform -translate-y-1/2 ${
                    isRTL ? "right-3" : "left-3"
                  } w-4 h-4 text-gray-400`}
                />
                <input
                  type="date"
                  required
                  value={formData.attendanceDate}
                  onChange={(e) =>
                    handleInputChange("attendanceDate", e.target.value)
                  }
                  className={`w-full ${
                    isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4"
                  } py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    duplicateWarning.show
                      ? "border-amber-300 dark:border-amber-600"
                      : ""
                  }`}
                />
              </div>
            </div>

            {/* Attend Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? "وقت الحضور" : "Attend Time"}
              </label>
              <div className="relative">
                <Clock
                  className={`absolute top-1/2 transform -translate-y-1/2 ${
                    isRTL ? "right-3" : "left-3"
                  } w-4 h-4 text-gray-400`}
                />
                <input
                  type="time"
                  value={formData.attendTime || ""}
                  onChange={(e) =>
                    handleInputChange("attendTime", e.target.value)
                  }
                  className={`w-full ${
                    isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4"
                  } py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
              </div>
            </div>

            {/* Leave Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? "وقت الانصراف" : "Leave Time"}
              </label>
              <div className="relative">
                <Clock
                  className={`absolute top-1/2 transform -translate-y-1/2 ${
                    isRTL ? "right-3" : "left-3"
                  } w-4 h-4 text-gray-400`}
                />
                <input
                  type="time"
                  value={formData.leaveTime || ""}
                  onChange={(e) =>
                    handleInputChange("leaveTime", e.target.value)
                  }
                  className={`w-full ${
                    isRTL ? "pr-10 pl-4 text-right" : "pl-10 pr-4"
                  } py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {isRTL ? "الحالة" : "Status"} *
              </label>
              <select
                required
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  isRTL ? "text-right" : "text-left"
                }`}
              >
                <option value="Attended">{isRTL ? "حاضر" : "Attended"}</option>
                <option value="Absent">{isRTL ? "غائب" : "Absent"}</option>
                <option value="LeaveWithReason">
                  {isRTL ? "إجازة" : "Leave"}
                </option>
              </select>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {isRTL ? "السبب" : "Reason"}
            </label>
            <textarea
              rows={3}
              value={formData.reason}
              onChange={(e) => handleInputChange("reason", e.target.value)}
              className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                isRTL ? "text-right" : "text-left"
              }`}
              placeholder={
                isRTL ? "اختياري - أدخل السبب" : "Optional - Enter reason"
              }
            />
          </div>

          {/* Buttons */}
          <div
            className={`flex justify-end space-x-4 ${
              isRTL ? "flex-row-reverse space-x-reverse" : ""
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={
                createAttendanceMutation.isPending ||
                updateAttendanceMutation.isPending ||
                (!attendance && duplicateWarning.show)
              }
              className={`flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isRTL ? "flex-row-reverse space-x-reverse" : ""
              }`}
            >
              <Save className="w-4 h-4" />
              <span>
                {createAttendanceMutation.isPending ||
                updateAttendanceMutation.isPending
                  ? isRTL
                    ? "جاري الحفظ..."
                    : "Saving..."
                  : attendance
                  ? isRTL
                    ? "تحديث"
                    : "Update"
                  : isRTL
                  ? "إضافة"
                  : "Add"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceModal;
