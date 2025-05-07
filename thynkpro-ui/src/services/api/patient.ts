import { createApiUrl, handleApiResponse, defaultFetchOptions } from './utils';

export interface Medicine {
  medicine_name: string;
  dosage: string;
  frequency: string;
}

export interface Summary {
  id: string;
  summary: string;
  patient_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface Note {
  id: string;
  content: string;
  patient_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface PatientFile {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  patient_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface Patient {
  patient_name: string;
  diagnosis: string;
  patient_age: number;
  patient_gender: string;
  doctor_name?: string;
  hospital_name?: string;
  doctor_advice?: string;
  created_at: string;
  updated_at: string;
  id?: string;
  medicines?: Medicine[];
  summaries?: Summary[];
  notes?: Note[];
  files?: PatientFile[];
  date?: string;
}

interface ApiResponse {
  success: string;
  Data: Patient[];
}

interface PatientResponse {
  success: string;
  Data: Patient;
  Message?: string;
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
      throw new Error(result.Message || "Invalid response format");
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

/**
 * Updates the medicines for a specific patient
 */
export const updatePatientMedicines = async (patientId: string, medicines: Medicine[]): Promise<Patient> => {
  try {
    const response = await fetch(
      createApiUrl(`/patient/${patientId}`),
      {
        ...defaultFetchOptions,
        method: 'PUT',
        body: JSON.stringify({ medicines }),
      }
    );
    
    const result = await handleApiResponse<PatientResponse>(response);
    
    if (result.success === "true" && result.Data) {
      return result.Data;
    } else {
      throw new Error(result.Message || "Failed to update patient medicines");
    }
  } catch (error) {
    console.error(`Error updating medicines for patient with ID ${patientId}:`, error);
    throw error;
  }
};

/**
 * Fetches patient details with multiple IDs
 */
export const fetchPatientsDetails = async (patientIds: string[]): Promise<Patient[]> => {
  try {
    const response = await fetch(
      createApiUrl('/patient/details'),
      {
        ...defaultFetchOptions,
        method: 'POST',
        body: JSON.stringify({ patient_ids: patientIds }),
      }
    );
    
    const result = await handleApiResponse<ApiResponse>(response);
    
    if (result.success === "true" && Array.isArray(result.Data)) {
      return result.Data;
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error('Error fetching patients details:', error);
    throw error;
  }
}; 