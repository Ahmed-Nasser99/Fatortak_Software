export interface AttendanceDto {
  id: string;
  employeeId: string;
  employeeName: string;
  attendanceDate: Date;
  attendTime?: Date;
  leaveTime?: Date;
  status: string;
  reason?: string;
}

export interface CreateAttendanceDto {
  employeeId: string;
  attendanceDate: string;
  attendTime?: string;
  leaveTime?: string;
  status?: string;
  reason?: string;
}

export interface UpdateAttendanceDto {
  attendTime?: string;
  leaveTime?: string;
  status?: string;
  reason?: string;
}

export interface AttendanceFilterDto {
  employeeName?: string;
  date?: string;
}
export interface DailyAttendanceReportDto {
  date: string; // DateOnly in C# becomes string in TypeScript
  employeeName: string;
  department: string;
  attendanceTime: string; // TimeSpan becomes string
  departureTime: string; // TimeSpan becomes string
  delayDurationHours: string;
  totalWorkingHours: string;
  excessBreakHours: string;
  isAttended: boolean;
  isVacation: boolean;
}

export interface MonthlyAttendanceReportDto {
  employeeName: string;
  department: string;
  totalMonthlyWorkingHours: string;
  totalDelayHours: string;
  totalOvertimeHours: string;
  numberOfDelayDays: number;
  numberOfOvertimeDays: number;
  expectedMonthlyWorkingHours: number;
  presentDays: number;
  absentDays: number;
  vacationDays: number;
  salary: number;
  expectedSalary: number;
}

export interface ReportFilterDto {
  date?: string;
  year?: number;
  month?: number;
  department?: string;
}
