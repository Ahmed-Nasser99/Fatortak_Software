"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  Save,
  Plus,
  Edit,
  Trash2,
  Users,
  ChevronDown,
  Info,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { DatePicker } from "@/components/ui/date-picker";
import { formatDate, parseLocalDate } from "@/Helpers/localization";
import { useLanguage } from "../../contexts/LanguageContext";
import {
  useWorkSettings,
  useUpdateWorkSettings,
  useCreateVacation,
  useUpdateVacation,
  useDeleteVacation,
} from "../../hooks/useWorkSettings";
import { toast } from "react-toastify";
import type {
  UpdateWorkSettingDto,
  CreateGeneralVacationDto,
  UpdateGeneralVacationDto,
  GeneralVacationDto,
} from "../../types/hrSettingsTypes";

interface WorkSettings {
  id: string;
  workStartTime: string;
  workEndTime: string;
  weekendDays: string;
  gracePeriodMinutes: number;
  breakMinutes: number;
  isRespectGeneralVacation: boolean;
  generalVacations: GeneralVacationDto[];
}

const HRSettingsForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showVacationForm, setShowVacationForm] = useState(false);
  const [editingVacation, setEditingVacation] =
    useState<GeneralVacationDto | null>(null);
  const [isWeekendDropdownOpen, setIsWeekendDropdownOpen] = useState(false);
  const [selectedWeekendDays, setSelectedWeekendDays] = useState<string[]>([]);
  const [workSettings, setWorkSettings] = useState<WorkSettings>({
    id: "",
    workStartTime: "09:00",
    workEndTime: "17:00",
    weekendDays: "Friday,Saturday",
    gracePeriodMinutes: 15,
    breakMinutes: 60,
    isRespectGeneralVacation: true,
    generalVacations: [],
  });

  const [vacationForm, setVacationForm] = useState({
    name: "",
    date: "",
    daysOfVacation: 1,
    notes: "",
  });

  const { isRTL, t } = useLanguage();
  const { data: workSettingsData } = useWorkSettings();
  const updateWorkSettingsMutation = useUpdateWorkSettings();
  const createVacationMutation = useCreateVacation();
  const updateVacationMutation = useUpdateVacation();
  const deleteVacationMutation = useDeleteVacation();

  useEffect(() => {
    if (workSettingsData?.success && workSettingsData.data) {
      const data = workSettingsData.data;
      setWorkSettings({
        id: data.id,
        workStartTime: data.workStartTime,
        workEndTime: data.workEndTime,
        weekendDays: data.weekendDays,
        gracePeriodMinutes: data.gracePeriodMinutes,
        breakMinutes: data.breakMinutes,
        isRespectGeneralVacation: data.isRespectGeneralVacation,
        generalVacations: data.generalVacations || [],
      });
      setSelectedWeekendDays(
        data.weekendDays ? data.weekendDays.split(",") : []
      );
    }
  }, [workSettingsData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workSettings.id) return;

    setLoading(true);

    try {
      const updateData: UpdateWorkSettingDto = {
        workStartTime: workSettings.workStartTime,
        workEndTime: workSettings.workEndTime,
        weekendDays: selectedWeekendDays.join(","),
        gracePeriodMinutes: workSettings.gracePeriodMinutes,
        breakMinutes: workSettings.breakMinutes,
        isRespectGeneralVacation: workSettings.isRespectGeneralVacation,
      };

      await updateWorkSettingsMutation.mutateAsync({
        id: workSettings.id,
        data: updateData,
      });

      toast.success(t("workSettingsUpdated"));
    } catch (error) {
      toast.error(t("failedToSaveWorkSettings"));
    } finally {
      setLoading(false);
    }
  };

  const handleVacationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingVacation) {
        const updateData: UpdateGeneralVacationDto = {
          name: vacationForm.name,
          date: vacationForm.date,
          daysOfVacation: vacationForm.daysOfVacation,
          notes: vacationForm.notes,
        };

        await updateVacationMutation.mutateAsync({
          id: editingVacation.id,
          data: updateData,
        });

        toast.success(t("vacationUpdated"));
      } else {
        const createData: CreateGeneralVacationDto = {
          name: vacationForm.name,
          date: vacationForm.date,
          daysOfVacation: vacationForm.daysOfVacation,
          notes: vacationForm.notes,
        };

        await createVacationMutation.mutateAsync(createData);
        toast.success(t("vacationCreated"));
      }

      setShowVacationForm(false);
      setEditingVacation(null);
      setVacationForm({ name: "", date: "", daysOfVacation: 1, notes: "" });
    } catch (error) {
      toast.error(t("failedToSaveVacation"));
    }
  };

  const handleEditVacation = (vacation: GeneralVacationDto) => {
    setEditingVacation(vacation);
    setVacationForm({
      name: vacation.name,
      date: vacation.date,
      daysOfVacation: vacation.daysOfVacation,
      notes: vacation.notes,
    });
    setShowVacationForm(true);
  };

  const handleDeleteVacation = async (id: string) => {
    if (confirm(t("confirmDeleteVacation"))) {
      try {
        await deleteVacationMutation.mutateAsync(id);
        toast.success(t("vacationDeleted"));
      } catch (error) {
        toast.error(t("failedToDeleteVacation"));
      }
    }
  };

  const weekendDayOptions = [
    { value: "Sunday", label: t("sunday") },
    { value: "Monday", label: t("monday") },
    { value: "Tuesday", label: t("tuesday") },
    { value: "Wednesday", label: t("wednesday") },
    { value: "Thursday", label: t("thursday") },
    { value: "Friday", label: t("friday") },
    { value: "Saturday", label: t("saturday") },
  ];

  const handleWeekendDayToggle = (day: string) => {
    setSelectedWeekendDays((prev) => {
      if (prev.includes(day)) {
        return prev.filter((d) => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const SectionCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-gradient-to-br from-background to-muted/30 rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-300 p-6 ${className}`}>
      {children}
    </div>
  );

  const SectionHeader = ({ title, color }: { title: string; color: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${color} shadow-sm`} />
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
    </div>
  );

  const InputField = ({ 
    label, 
    required, 
    children 
  }: { 
    label: string; 
    required?: boolean; 
    children: React.ReactNode 
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-bold text-foreground flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      <div className="relative">
        {children}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Work Schedule Section */}
      <SectionCard>
        <SectionHeader title={t("workSchedule")} color="from-orange-500 to-orange-600" />
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <InputField label={t("workStartTime")} required>
              <input
                type="time"
                value={workSettings.workStartTime}
                onChange={(e) => setWorkSettings((prev) => ({ ...prev, workStartTime: e.target.value }))}
                className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                required
              />
            </InputField>

            <InputField label={t("workEndTime")} required>
              <input
                type="time"
                value={workSettings.workEndTime}
                onChange={(e) => setWorkSettings((prev) => ({ ...prev, workEndTime: e.target.value }))}
                className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                required
              />
            </InputField>

            <InputField label={t("weekendDays")}>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsWeekendDropdownOpen(!isWeekendDropdownOpen)}
                  className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm flex items-center justify-between text-left font-medium"
                >
                  <span className="truncate">
                    {selectedWeekendDays.length > 0
                      ? selectedWeekendDays
                          .map((day) => weekendDayOptions.find((opt) => opt.value === day)?.label || day)
                          .join(", ")
                      : t("selectWeekendDays")}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isWeekendDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                {isWeekendDropdownOpen && (
                  <div className="absolute z-50 w-full mt-2 bg-background border rounded-xl shadow-xl p-1 overflow-hidden">
                    {weekendDayOptions.map((option) => (
                      <label key={option.value} className="flex items-center px-3 py-2 hover:bg-muted rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedWeekendDays.includes(option.value)}
                          onChange={() => handleWeekendDayToggle(option.value)}
                          className="w-4 h-4 rounded border-muted text-primary focus:ring-primary/20 focus:ring-2"
                        />
                        <span className="text-sm font-medium ml-3 text-foreground">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </InputField>

            <InputField label={t("gracePeriodMinutes")}>
              <input
                type="number"
                min="0"
                max="120"
                value={workSettings.gracePeriodMinutes}
                onChange={(e) => setWorkSettings((prev) => ({ ...prev, gracePeriodMinutes: Number.parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
              />
            </InputField>

            <InputField label={t("breakMinutes")}>
              <input
                type="number"
                min="0"
                max="240"
                value={workSettings.breakMinutes}
                onChange={(e) => setWorkSettings((prev) => ({ ...prev, breakMinutes: Number.parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
              />
            </InputField>

            <div className="flex items-center space-x-3 pt-8">
              <input
                type="checkbox"
                id="respectVacation"
                checked={workSettings.isRespectGeneralVacation}
                onChange={(e) => setWorkSettings((prev) => ({ ...prev, isRespectGeneralVacation: e.target.checked }))}
                className="w-4 h-4 rounded border-muted text-primary focus:ring-primary/20 focus:ring-2"
              />
              <label htmlFor="respectVacation" className="text-sm font-medium text-foreground cursor-pointer">
                {t("respectGeneralVacation")}
              </label>
            </div>
          </div>
        </form>
      </SectionCard>

      {workSettings.isRespectGeneralVacation && (
        <SectionCard>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <SectionHeader title={t("vacationManagement")} color="from-blue-500 to-blue-600" />
            <button
              type="button"
              onClick={() => {
                setShowVacationForm(true);
                setEditingVacation(null);
                setVacationForm({ name: "", date: "", daysOfVacation: 1, notes: "" });
              }}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 text-sm"
            >
              <Plus className="w-4 h-4" />
              {t("addVacation")}
            </button>
          </div>

          {/* Vacation Form Overlay/Modal-like */}
          {showVacationForm && (
            <div className="mb-8 p-6 rounded-2xl bg-muted/40 border border-muted relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold text-foreground flex items-center gap-2">
                  {editingVacation ? t("editVacation") : t("addNewVacation")}
                </h4>
                <button onClick={() => setShowVacationForm(false)} className="p-1.5 hover:bg-muted rounded-full transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <form onSubmit={handleVacationSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <InputField label={t("vacationName")} required>
                    <input
                      type="text"
                      value={vacationForm.name}
                      onChange={(e) => setVacationForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                      required
                      dir={isRTL ? "rtl" : "ltr"}
                    />
                  </InputField>

                  <InputField label={t("vacationDate")} required>
                    <DatePicker
                      date={parseLocalDate(vacationForm.date)}
                      setDate={(date) => setVacationForm((prev) => ({ ...prev, date: date ? format(date, "yyyy-MM-dd") : "" }))}
                    />
                  </InputField>

                  <InputField label={t("daysOfVacation")} required>
                    <input
                      type="number"
                      min="1"
                      value={vacationForm.daysOfVacation}
                      onChange={(e) => setVacationForm((prev) => ({ ...prev, daysOfVacation: Number.parseInt(e.target.value) || 1 }))}
                      className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                      required
                    />
                  </InputField>
                </div>
                <InputField label={t("notes")}>
                  <textarea
                    value={vacationForm.notes}
                    onChange={(e) => setVacationForm((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    className="w-full px-4 py-2.5 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none font-medium"
                    dir={isRTL ? "rtl" : "ltr"}
                  />
                </InputField>
                <div className="flex justify-end gap-3 mt-2">
                  <button type="button" onClick={() => setShowVacationForm(false)} className="px-5 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors">
                    {t("cancel")}
                  </button>
                  <button type="submit" className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-md text-sm">
                    {editingVacation ? t("update") : t("save")}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Vacations List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workSettings.generalVacations.map((vacation) => (
              <div key={vacation.id} className="group p-5 bg-background border rounded-2xl shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground leading-tight group-hover:text-primary transition-colors mb-1">{vacation.name}</h4>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="font-medium">{formatDate(vacation.date)}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                      <span>{vacation.daysOfVacation} {vacation.daysOfVacation === 1 ? t("day") : t("days")}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEditVacation(vacation)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-all">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteVacation(vacation.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {vacation.notes && (
                  <p className="mt-3 text-xs text-muted-foreground line-clamp-2 italic border-l-2 border-muted pl-2">
                    {vacation.notes}
                  </p>
                )}
              </div>
            ))}

            {workSettings.generalVacations.length === 0 && !showVacationForm && (
              <div className="col-span-full py-16 text-center border-2 border-dashed rounded-3xl border-muted">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-muted-foreground/50 text-2xl">?</div>
                <h5 className="font-semibold text-foreground">{t("noVacationsConfigured")}</h5>
                <p className="text-sm text-muted-foreground max-w-[240px] mx-auto mt-1">{t("addVacationToGetStarted")}</p>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Main Save Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary disabled:opacity-50 text-primary-foreground font-bold rounded-2xl transition-all shadow-xl shadow-primary/25"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>{t("saveChanges")}</span>
        </button>
      </div>
    </div>
  );
};

export default HRSettingsForm;
