export interface EmployeeDto {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  departmentName: string;
  hireDate?: Date;
  salary?: number;
}

export interface CreateEmployeeDto {
  departmentId: string;
  fullName: string;
  email?: string;
  phone?: string;
  position?: string;
  hireDate?: string;
  salary?: number;
}

export interface UpdateEmployeeDto {
  departmentId?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  position?: string;
  hireDate?: Date;
  salary?: number;
}

export interface EmployeeFilterDto {
  search?: string;
}
