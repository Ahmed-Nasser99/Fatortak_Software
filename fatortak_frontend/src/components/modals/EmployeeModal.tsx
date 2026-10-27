import React from "react";
import { X, Save } from "lucide-react";
import { toast } from "react-toastify";
import { useLanguage } from "../../contexts/LanguageContext";
import { useCreateEmployee, useUpdateEmployee } from "../../hooks/useEmployees";
import { useRoleAccess } from "../../hooks/useRoleAccess";
import { useDepartments } from "../../hooks/useDepartments";
import {
  CreateEmployeeDto,
  EmployeeDto,
  UpdateEmployeeDto,
} from "@/types/employeeTypes";
import PhoneInputField from "../ui/PhoneInputField";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { parseLocalDate } from "@/Helpers/parseDateTimeToDateOnly";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employee?: EmployeeDto | null;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  employee = null,
}) => {
  const { isRTL, t } = useLanguage();
  const roleAccess = useRoleAccess();
  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();

  // Fetch departments
  const { data: departmentsResponse } = useDepartments({
    pageNumber: 1,
    pageSize: 100,
  });
  const departments = departmentsResponse?.data?.data || [];

  // Validation schema
  const validationSchema = Yup.object().shape({
    fullName: Yup.string().trim().required(t("employeeNameRequired")),
    email: Yup.string().nullable().email(t("invalidEmail")),
    phone: Yup.string().nullable(),
    position: Yup.string().nullable(),
    departmentId: Yup.string().required(t("departmentRequired")),
    salary: Yup.number().nullable().min(0, t("salaryMustBePositive")),
    hireDate: Yup.date().nullable(),
  });

  // Initial values
  const initialValues: CreateEmployeeDto = {
    fullName: employee?.fullName || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    position: employee?.position || "",
    departmentId: employee?.departmentId || "",
    hireDate: parseLocalDate(employee?.hireDate?.toString()) || undefined,
    salary: employee?.salary || undefined,
  };

  // Handle submit
  const handleSubmit = async (values: CreateEmployeeDto) => {
    if (employee && !roleAccess.canEdit()) {
      toast.error(t("noEditPermission"));
      return;
    }
    if (!employee && !roleAccess.canCreate()) {
      toast.error(t("noCreatePermission"));
      return;
    }

    try {
      if (employee) {
        const updateData: UpdateEmployeeDto = { ...values };
        const result = await updateEmployeeMutation.mutateAsync({
          id: employee.id,
          data: updateData,
        });

        if (result.success) {
          toast.success(t("employeeUpdatedSuccessfully"));
          onSuccess();
        }
      } else {
        const result = await createEmployeeMutation.mutateAsync(values);
        if (result.success) {
          toast.success(t("employeeCreatedSuccessfully"));
          onSuccess();
        }
      }
    } catch {
      toast.error(
        employee ? t("failedToUpdateEmployee") : t("failedToCreateEmployee")
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
        <div
          className={`flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {employee ? t("editEmployee") : t("newEmployee")}
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
          {({ values, setFieldValue, isSubmitting }) => (
            <Form className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("fullName")} *
                  </label>
                  <Field
                    name="fullName"
                    type="text"
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                      focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 
                      text-gray-900 dark:text-white ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    placeholder={t("employeeNamePlaceholder")}
                  />
                  <ErrorMessage
                    name="fullName"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("email")}
                  </label>
                  <Field
                    name="email"
                    type="email"
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                      focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 
                      text-gray-900 dark:text-white ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    placeholder={t("emailPlaceholder")}
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Phone */}
                <PhoneInputField
                  value={values.phone}
                  onChange={(val) => setFieldValue("phone", val || "")}
                  label={t("phone")}
                />
                <ErrorMessage
                  name="phone"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("position")}
                  </label>
                  <Field
                    name="position"
                    type="text"
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                      focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 
                      text-gray-900 dark:text-white ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    placeholder={t("positionPlaceholder")}
                  />
                  <ErrorMessage
                    name="position"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("department")} *
                  </label>
                  <Field
                    as="select"
                    name="departmentId"
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                      focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 
                      text-gray-900 dark:text-white ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                  >
                    <option value="">{t("selectDepartment")}</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="departmentId"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Salary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("salary")}
                  </label>
                  <Field
                    name="salary"
                    type="number"
                    step="0.01"
                    min="0"
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                      focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 
                      text-gray-900 dark:text-white ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                    placeholder={t("salaryPlaceholder")}
                  />
                  <ErrorMessage
                    name="salary"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Hire Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("hireDate")}
                  </label>
                  <Field
                    name="hireDate"
                    type="date"
                    value={
                      values.hireDate
                        ? new Date(values.hireDate).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFieldValue(
                        "hireDate",
                        e.target.value ? new Date(e.target.value) : undefined
                      )
                    }
                    className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                      focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 
                      text-gray-900 dark:text-white ${
                        isRTL ? "text-right" : "text-left"
                      }`}
                  />
                  <ErrorMessage
                    name="hireDate"
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
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    createEmployeeMutation.isPending ||
                    updateEmployeeMutation.isPending
                  }
                  className={`flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 ${
                    isRTL ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>
                    {isSubmitting ||
                    createEmployeeMutation.isPending ||
                    updateEmployeeMutation.isPending
                      ? t("saving")
                      : employee
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

export default EmployeeModal;
