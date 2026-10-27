export interface WorkSettingDto {
  id: string;
  workStartTime: string;
  workEndTime: string;
  weekendDays: string;
  gracePeriodMinutes: number;
  breakMinutes: number;
  isRespectGeneralVacation: boolean;
  generalVacations: GeneralVacationDto[];
}

export interface GeneralVacationDto {
  id: string;
  name: string;
  date: string;
  daysOfVacation: number;
  notes: string;
}

export interface UpdateWorkSettingDto {
  workStartTime: string;
  workEndTime: string;
  weekendDays: string;
  gracePeriodMinutes: number;
  breakMinutes: number;
  isRespectGeneralVacation: boolean;
}

export interface CreateGeneralVacationDto {
  name: string;
  date: string;
  daysOfVacation: number;
  notes: string;
}

export interface UpdateGeneralVacationDto {
  name: string;
  date: string;
  daysOfVacation: number;
  notes: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
