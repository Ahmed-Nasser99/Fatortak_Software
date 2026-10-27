import React, { useEffect } from "react";
import { X, Save } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  useCreateDepartment,
  useUpdateDepartment,
} from "../../hooks/useDepartments";
import { useRoleAccess } from "../../hooks/useRoleAccess";
import {
  CreateDepartmentDto,
  DepartmentDto,
  UpdateDepartmentDto,
} from "@/types/departmentTypes";
import { toast } from "react-toastify";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  department?: DepartmentDto | null;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  department = null,
}) => {
  const { isRTL, t } = useLanguage();
  const roleAccess = useRoleAccess();
  const createDepartmentMutation = useCreateDepartment();
  const updateDepartmentMutation = useUpdateDepartment();

  // Validation schema
  const validationSchema = Yup.object().shape({
    name: Yup.string().trim().required(t("departmentNameRequired")),
    description: Yup.string().nullable(),
  });

  // Initial values
  const initialValues: CreateDepartmentDto = {
    name: department?.name || "",
    description: department?.description || "",
  };

  const handleSubmit = async (values: CreateDepartmentDto) => {
    // Permission check
    if (department && !roleAccess.canEdit()) {
      toast.error(t("noEditPermission"));
      return;
    }
    if (!department && !roleAccess.canCreate()) {
      toast.error(t("noCreatePermission"));
      return;
    }

    try {
      if (department) {
        // Update
        const updateData: UpdateDepartmentDto = {
          name: values.name,
          description: values.description,
        };
        const result = await updateDepartmentMutation.mutateAsync({
          id: department.id,
          data: updateData,
        });

        if (result.success) {
          toast.success(t("departmentUpdatedSuccessfully"));
          onSuccess();
        }
      } else {
        // Create
        const result = await createDepartmentMutation.mutateAsync(values);
        if (result.success) {
          toast.success(t("departmentCreatedSuccessfully"));
          onSuccess();
        }
      }
    } catch (error) {
      toast.error(
        department
          ? t("failedToUpdateDepartment")
          : t("failedToCreateDepartment")
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {department ? t("editDepartment") : t("newDepartment")}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Formik Form */}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("name")} *
                  </label>
                  <Field
                    type="text"
                    name="name"
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                      focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                      ${isRTL ? "text-right" : "text-left"}`}
                    placeholder={t("departmentNamePlaceholder")}
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("description")}
                  </label>
                  <Field
                    as="textarea"
                    name="description"
                    rows={3}
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                      focus:ring-2 focus:ring-purple-500 focus:border-transparent 
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                      ${isRTL ? "text-right" : "text-left"}`}
                    placeholder={t("departmentDescriptionPlaceholder")}
                  />
                  <ErrorMessage
                    name="description"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
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
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 
                    text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 
                    dark:hover:bg-gray-700 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    createDepartmentMutation.isPending ||
                    updateDepartmentMutation.isPending
                  }
                  className={`flex items-center space-x-2 px-6 py-2 bg-purple-600 
                    text-white rounded-lg hover:bg-purple-700 transition-colors 
                    disabled:opacity-50 ${
                      isRTL ? "flex-row-reverse space-x-reverse" : ""
                    }`}
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isSubmitting ||
                    createDepartmentMutation.isPending ||
                    updateDepartmentMutation.isPending
                      ? t("saving")
                      : department
                      ? t("update")
                      : t("add")}
                  </span>
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default DepartmentModal;
