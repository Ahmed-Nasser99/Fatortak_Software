export interface DepartmentDto {
  id: string;
  name: string;
  description?: string;
  employeesCount?: number;
}

export interface CreateDepartmentDto {
  name: string;
  description?: string;
}

export interface UpdateDepartmentDto {
  name?: string;
  description?: string;
}

export interface DepartmentFilterDto {
  search?: string;
}
