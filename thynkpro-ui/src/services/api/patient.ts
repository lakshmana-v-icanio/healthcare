import { createApiUrl, handleApiResponse, defaultFetchOptions } from './utils';

interface Patient {
  patient_name: string;
  diagnosis: string;
  patient_age: number;
  patient_gender: string;
  created_at: string;
  updated_at: string;
  id?: string;
}

interface ApiResponse {
  success: string;
  Data: Patient[];
}

interface PatientResponse {
  success: string;
  Data: Patient;
}

export const fetchPatients = async (): Promise<Patient[]> => {
  try {
    const response = await fetch(createApiUrl('/patient'), defaultFetchOptions);
    
    const result = await handleApiResponse<ApiResponse>(response);
    
    if (result.success === "true" && Array.isArray(result.Data)) {
      return result.Data;
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
};

export const getPatientById = async (patientId: string): Promise<Patient> => {
  try {
    const response = await fetch(
      createApiUrl(`/patient/${patientId}`), 
      defaultFetchOptions
    );
    
    const result = await handleApiResponse<PatientResponse>(response);
    
    if (result.success === "true" && result.Data) {
      return result.Data;
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error(`Error fetching patient with ID ${patientId}:`, error);
    throw error;
  }
};

export const updatePatient = async (patientId: string, patientData: Partial<Patient>): Promise<Patient> => {
  try {
    const response = await fetch(
      createApiUrl(`/patient/${patientId}`),
      {
        ...defaultFetchOptions,
        method: 'PUT',
        body: JSON.stringify(patientData),
      }
    );
    
    const result = await handleApiResponse<PatientResponse>(response);
    
    if (result.success === "true" && result.Data) {
      return result.Data;
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error(`Error updating patient with ID ${patientId}:`, error);
    throw error;
  }
};

export const deletePatient = async (patientId: string): Promise<boolean> => {
  try {
    const response = await fetch(
      createApiUrl(`/patient/${patientId}`),
      {
        ...defaultFetchOptions,
        method: 'DELETE',
      }
    );
    
    const result = await handleApiResponse<{success: string}>(response);
    
    if (result.success === "true") {
      return true;
    } else {
      throw new Error("Failed to delete patient");
    }
  } catch (error) {
    console.error(`Error deleting patient with ID ${patientId}:`, error);
    throw error;
  }
}; 