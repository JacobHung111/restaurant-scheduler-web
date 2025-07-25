// src/hooks/useScheduleGeneration.ts
import { useMutation } from '@tanstack/react-query';
import { generateScheduleAPI } from '../api/scheduleApi';
import { useScheduleStore } from '../stores/useScheduleStore';
import { useStaffStore } from '../stores/useStaffStore';
import { useUnavailabilityStore } from '../stores/useUnavailabilityStore';
import type { ApiResponse } from '../types';
import { logger } from '../utils/logger';

interface GenerateScheduleParams {
  onSuccess?: (data: ApiResponse) => void;
  onError?: (error: unknown) => void;
}

export const useScheduleGeneration = ({ onSuccess, onError }: GenerateScheduleParams = {}) => {
  const { 
    setSchedule, 
    setWarnings, 
    setIsLoading, 
    weeklyNeeds, 
    shiftDefinitions, 
    shiftPreference,
    showMessage 
  } = useScheduleStore();
  
  const { staffList, getStaffPriority } = useStaffStore();
  const { unavailabilityList } = useUnavailabilityStore();

  const mutation = useMutation({
    mutationFn: generateScheduleAPI,
    onMutate: () => {
      setIsLoading(true);
      setSchedule(null);
      setWarnings([]);
    },
    onSuccess: (data: ApiResponse) => {
      setSchedule(data.schedule || null);
      setWarnings(data.warnings || []);
      setIsLoading(false);
      onSuccess?.(data);
    },
    onError: (error: unknown) => {
      setIsLoading(false);
      const errorMessage = (error as { message?: string })?.message || 'An unknown error occurred during schedule generation.';
      const errorWarnings = (error as { warnings?: string[] })?.warnings || [];
      
      setWarnings([errorMessage, ...errorWarnings]);
      showMessage(
        'error',
        'Schedule Generation Failed',
        errorMessage,
        errorWarnings.length > 0 ? errorWarnings : undefined
      );
      onError?.(error);
    },
  });

  const generateSchedule = () => {
    // Validation
    if (staffList.length === 0) {
      showMessage(
        'warning',
        'Missing Staff Data',
        'Please add at least one staff member before generating a schedule.'
      );
      return;
    }

    if (Object.keys(weeklyNeeds).length === 0) {
      showMessage(
        'warning', 
        'Missing Weekly Needs',
        'Please define weekly needs before generating a schedule.'
      );
      return;
    }

    // Prepare request data
    const requestData = {
      staffList,
      unavailabilityList,
      weeklyNeeds,
      shiftDefinitions,
      shiftPreference,
      staffPriority: getStaffPriority(),
    };

    logger.log('[Schedule Generation] Request data:', requestData);
    mutation.mutate(requestData);
  };

  return {
    generateSchedule,
    isLoading: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
  };
};