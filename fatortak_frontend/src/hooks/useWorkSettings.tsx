import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { workSettingService } from "../services/workSettingService";
import type {
  UpdateWorkSettingDto,
  CreateGeneralVacationDto,
  UpdateGeneralVacationDto,
} from "../types/hrSettingsTypes";

export const useWorkSettings = () => {
  return useQuery({
    queryKey: ["workSettings"],
    queryFn: () => workSettingService.getWorkSettings(),
  });
};

export const useUpdateWorkSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkSettingDto }) =>
      workSettingService.updateWorkSettings(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workSettings"] });
      queryClient.invalidateQueries({ queryKey: ["daily-report"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-report"] });
    },
  });
};

export const useCreateVacation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGeneralVacationDto) =>
      workSettingService.createVacation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workSettings"] });
      queryClient.invalidateQueries({ queryKey: ["daily-report"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-report"] });
    },
  });
};

export const useUpdateVacation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateGeneralVacationDto;
    }) => workSettingService.updateVacation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workSettings"] });
      queryClient.invalidateQueries({ queryKey: ["daily-report"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-report"] });
    },
  });
};

export const useDeleteVacation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workSettingService.deleteVacation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workSettings"] });
      queryClient.invalidateQueries({ queryKey: ["daily-report"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-report"] });
    },
  });
};
