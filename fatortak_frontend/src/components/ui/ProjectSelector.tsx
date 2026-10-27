import React from "react";
import { useProjects } from "../../hooks/useProjects";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useLanguage } from "../../contexts/LanguageContext";

interface ProjectSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  value,
  onChange,
  className,
  placeholder,
}) => {
  const { t, isRTL } = useLanguage();
  // Fetch all projects (pagination logic might need adjustment if many projects, 
  // but for selector usually we need a specific 'list' endpoint or large page size)
  // For now, page size 100 should cover basic needs.
  const { data: projectsResponse, isLoading } = useProjects({
    pageNumber: 1,
    pageSize: 100,
  });

  const projects = projectsResponse?.success
    ? projectsResponse.data?.data || []
    : [];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`${className} ${isRTL ? "text-right" : "text-left"}`}>
        <SelectValue placeholder={placeholder || (isRTL ? "اختر المشروع" : "Select Project")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">
          {isRTL ? "كل المشاريع" : "All Projects"}
        </SelectItem>
        {projects.map((project) => (
          <SelectItem key={project.id} value={project.id}>
            {project.name}
          </SelectItem>
        ))}
        {projects.length === 0 && !isLoading && (
            <div className="p-2 text-sm text-gray-500 text-center">
                {isRTL ? "لا يوجد مشاريع" : "No projects found"}
            </div>
        )}
      </SelectContent>
    </Select>
  );
};

export default ProjectSelector;
