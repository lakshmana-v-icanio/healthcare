import { createApiUrl, defaultFetchOptions, handleApiResponse } from './utils';

interface SummaryResponse {
  success?: string;
  error?: string;
  summaries?: Summary[];
  summary?: string;
  summary_id?: string;
  created?: boolean;
  updated?: boolean;
  message?: string;
}

export interface Summary {
  id: string;
  summary: string;
  patient_id: string;
  created_at: string;
  updated_at: string;
}

export const getPatientSummaries = async (patientId: string): Promise<Summary[]> => {
  try {
    const response = await fetch(
      createApiUrl(`/summary/${patientId}`),
      defaultFetchOptions
    );
    
    const result = await handleApiResponse<SummaryResponse>(response);
    
    if (result.summaries) {
      return result.summaries;
    } else {
      return [];
    }
  } catch (error) {
    console.error(`Error fetching summaries for patient ${patientId}:`, error);
    throw error;
  }
};

export const generateSummary = async (patientId: string): Promise<{ summary: string; summary_id: string; isNew: boolean }> => {
  try {
    const response = await fetch(
      createApiUrl(`/summary/${patientId}`),
      {
        ...defaultFetchOptions,
        method: 'POST',
      }
    );
    
    const result = await handleApiResponse<SummaryResponse>(response);
    
    if (result.summary && result.summary_id) {
      return {
        summary: result.summary,
        summary_id: result.summary_id,
        isNew: result.created === true
      };
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error(`Error generating summary for patient ${patientId}:`, error);
    throw error;
  }
};

export const deleteSummary = async (summaryId: string): Promise<boolean> => {
  try {
    const response = await fetch(
      createApiUrl(`/summary/${summaryId}`),
      {
        ...defaultFetchOptions,
        method: 'DELETE',
      }
    );
    
    const result = await handleApiResponse<SummaryResponse>(response);
    
    return result.message?.includes('deleted') || false;
  } catch (error) {
    console.error(`Error deleting summary ${summaryId}:`, error);
    throw error;
  }
}; 