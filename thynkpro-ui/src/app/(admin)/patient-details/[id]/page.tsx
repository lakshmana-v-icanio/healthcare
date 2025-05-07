"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPatientById, updatePatient } from '@/services/api/patient';
import { getPatientSummaries, generateSummary, deleteSummary } from '@/services/api/summary';
import { Summary } from '@/services/api/summary';
import ReactMarkdown from 'react-markdown';

interface Medicine {
  medicine_name: string;
  dosage: string;
  frequency: string;
}

interface Patient {
  id: string;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  diagnosis: string;
  doctor_advice: string;
  doctor_name: string;
  hospital_name: string;
  medicines: Medicine[];
  created_at: string;
  updated_at: string;
}

interface PatientDetailPageProps {
  params: {
    id: string;
  };
}

const PatientDetailPage = ({ params }: PatientDetailPageProps) => {
  const router = useRouter();
  const { id } = params;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedPatient, setEditedPatient] = useState<Patient | null>(null);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  
  // Summary state
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [generatingNew, setGeneratingNew] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const patientData = await getPatientById(id);
        setPatient(patientData as Patient);
        setEditedPatient(patientData as Patient);
        
        // Load summaries after loading patient
        loadSummaries();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching patient details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  // Function to load summaries
  const loadSummaries = async () => {
    try {
      setSummaryLoading(true);
      setSummaryError(null);
      const data = await getPatientSummaries(id);
      setSummaries(data);
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : 'Failed to load summaries');
    } finally {
      setSummaryLoading(false);
    }
  };

  // Function to generate a new summary
  const handleGenerateSummary = async () => {
    try {
      setGeneratingNew(true);
      setSummaryError(null);
      await generateSummary(id);
      // Reload summaries after generating
      await loadSummaries();
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setGeneratingNew(false);
    }
  };

  // Function to delete a summary
  const handleDeleteSummary = async (summaryId: string) => {
    try {
      setDeletingId(summaryId);
      setSummaryError(null);
      await deleteSummary(summaryId);
      // Reload summaries after deletion
      await loadSummaries();
    } catch (err) {
      setSummaryError(err instanceof Error ? err.message : 'Failed to delete summary');
    } finally {
      setDeletingId(null);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    // Reset edited patient to original patient when toggling edit mode
    if (!isEditing) {
      setEditedPatient({...patient} as Patient);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedPatient(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const handleMedicineChange = (index: number, field: keyof Medicine, value: string) => {
    setEditedPatient(prev => {
      if (!prev) return prev;
      
      const updatedMedicines = [...prev.medicines];
      updatedMedicines[index] = {
        ...updatedMedicines[index],
        [field]: value
      };
      
      return {
        ...prev,
        medicines: updatedMedicines
      };
    });
  };

  const addMedicine = () => {
    setEditedPatient(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        medicines: [
          ...prev.medicines,
          { medicine_name: '', dosage: '', frequency: '' }
        ]
      };
    });
  };

  const removeMedicine = (index: number) => {
    setEditedPatient(prev => {
      if (!prev) return prev;
      
      const updatedMedicines = [...prev.medicines];
      updatedMedicines.splice(index, 1);
      
      return {
        ...prev,
        medicines: updatedMedicines
      };
    });
  };

  const handleSave = async () => {
    if (!editedPatient) return;
    
    try {
      setUpdateLoading(true);
      setUpdateError(null);
      
      const updatedPatient = await updatePatient(id, editedPatient);
      setPatient(updatedPatient as Patient);
      setIsEditing(false);
      
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update patient');
      console.error('Error updating patient:', err);
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md">
          <svg className="animate-spin h-12 w-12 text-brand-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-300">Loading patient details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md border-l-4 border-red-500">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Error Loading Patient Details</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6 flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md border-l-4 border-yellow-500">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 text-yellow-500 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Patient Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The requested patient could not be found.</p>
          <button 
            onClick={handleGoBack} 
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Back to Patient List
          </button>
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={handleGoBack}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white dark:bg-gray-800 rounded-full shadow-md transition-all duration-200 hover:shadow-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Patient Details
            <div className="h-1 w-24 bg-gradient-to-r from-brand-400 to-brand-600 rounded mt-1"></div>
          </h1>
        </div>

        <button
          onClick={handleEditToggle}
          className={`px-5 py-2.5 rounded-lg flex items-center shadow-md hover:shadow-lg transition-all duration-200 ${
            isEditing 
              ? 'bg-gray-600 text-white dark:bg-gray-700' 
              : 'bg-gradient-to-r from-brand-500 to-brand-600 text-white'
          }`}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isEditing ? "M6 18L18 6M6 6l12 12" : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"} />
          </svg>
          {isEditing ? 'Cancel' : 'Edit Patient'}
        </button>
      </div>

      {updateError && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border-l-4 border-red-500 shadow-md">
          <div className="flex">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {updateError}
          </div>
        </div>
      )}

      {updateLoading && (
        <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg border-l-4 border-blue-500 shadow-md flex items-center">
          <svg className="animate-spin h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Saving changes...
        </div>
      )}

      <div className="flex flex-col gap-8">
        {/* Patient Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
          {isEditing ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Patient Name</label>
                <input
                  type="text"
                  name="patient_name"
                  value={editedPatient?.patient_name || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
                  <input
                    type="number"
                    name="patient_age"
                    value={editedPatient?.patient_age || ''}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                  <select
                    name="patient_gender"
                    value={editedPatient?.patient_gender || ''}
                    onChange={(e) => handleInputChange(e as any)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diagnosis</label>
                <textarea
                  name="diagnosis"
                  value={editedPatient?.diagnosis || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Doctor Name</label>
                  <input
                    type="text"
                    name="doctor_name"
                    value={editedPatient?.doctor_name || ''}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hospital</label>
                  <input
                    type="text"
                    name="hospital_name"
                    value={editedPatient?.hospital_name || ''}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Doctor's Advice</label>
                <textarea
                  name="doctor_advice"
                  value={editedPatient?.doctor_advice || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                ></textarea>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={handleSave}
                  disabled={updateLoading}
                  className="px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-lg hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  {updateLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-lg mr-4">
                  {patient.patient_name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {patient.patient_name}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border-l-4 border-brand-500">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Age</h3>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">{patient.patient_age} years</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border-l-4 border-brand-500">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Gender</h3>
                  <p className="text-lg font-medium text-gray-900 dark:text-white capitalize">{patient.patient_gender}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg mb-6 border-l-4 border-brand-500">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-1 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Diagnosis
                </h3>
                <p className="text-base text-gray-900 dark:text-white">{patient.diagnosis || 'Not specified'}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border-l-4 border-indigo-500">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Doctor Name
                  </h3>
                  <p className="text-base text-gray-900 dark:text-white">{patient.doctor_name || 'Not specified'}</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border-l-4 border-indigo-500">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Hospital
                  </h3>
                  <p className="text-base text-gray-900 dark:text-white">{patient.hospital_name || 'Not specified'}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-5 rounded-lg border-l-4 border-teal-500">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-1 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Doctor's Advice
                </h3>
                <p className="text-base text-gray-900 dark:text-white">{patient.doctor_advice || 'No advice provided'}</p>
              </div>

              <div className="mt-8 text-xs text-gray-500 dark:text-gray-400 flex flex-col space-y-1 border-t border-gray-100 dark:border-gray-700 pt-4">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>Created: {formatDate(patient.created_at)}</p>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <p>Last Updated: {formatDate(patient.updated_at)}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Medicines */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white mr-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              Prescribed Medicines
            </h2>
            
            {isEditing && (
              <button
                onClick={addMedicine}
                className="px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm flex items-center shadow-md hover:shadow-lg transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Medicine
              </button>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-4">
              {editedPatient?.medicines?.length ? (
                editedPatient.medicines.map((medicine, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Medicine Name</label>
                      <button 
                        onClick={() => removeMedicine(index)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={medicine.medicine_name}
                      onChange={(e) => handleMedicineChange(index, 'medicine_name', e.target.value)}
                      className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Medicine name"
                    />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dosage</label>
                        <input
                          type="text"
                          value={medicine.dosage}
                          onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="e.g. 500mg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Frequency</label>
                        <input
                          type="text"
                          value={medicine.frequency}
                          onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="e.g. Twice daily"
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">No medicines prescribed.</p>
                  <p className="text-gray-500 dark:text-gray-400">Click "Add Medicine" to add one.</p>
                </div>
              )}
            </div>
          ) : (
            patient.medicines && patient.medicines.length > 0 ? (
              <div className="space-y-4 mt-3">
                {patient.medicines.map((medicine, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow duration-200">
                    <h3 className="font-medium text-lg text-gray-900 dark:text-white flex items-center">
                      <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      {medicine.medicine_name}
                    </h3>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                        <span className="font-semibold text-blue-600 dark:text-blue-400 block mb-1">Dosage</span> 
                        <span className="text-gray-800 dark:text-gray-200">{medicine.dosage || 'Not specified'}</span>
                      </div>
                      <div className="bg-white dark:bg-gray-800 p-3 rounded-md">
                        <span className="font-semibold text-blue-600 dark:text-blue-400 block mb-1">Frequency</span> 
                        <span className="text-gray-800 dark:text-gray-200">{medicine.frequency || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-700 rounded-lg mt-3">
                <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-base text-gray-500 dark:text-gray-400 font-medium">No medications prescribed</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This patient has no prescribed medicines.</p>
              </div>
            )
          )}
        </div>

        {/* Patient Summaries Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Patient Summaries
            </h2>
            
            <button
              onClick={handleGenerateSummary}
              disabled={generatingNew}
              className={`px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors duration-200 flex items-center ${generatingNew ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {generatingNew ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Generate Summary
                </>
              )}
            </button>
          </div>
          
          {summaryError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              <p>{summaryError}</p>
            </div>
          )}
          
          {summaryLoading ? (
            <div className="p-8 flex justify-center">
              <svg className="animate-spin h-8 w-8 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : summaries.length > 0 ? (
            <div className="space-y-4">
              {summaries.map((summary) => (
                <div key={summary.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500">{new Date(summary.created_at).toLocaleString()}</span>
                    <button 
                      onClick={() => handleDeleteSummary(summary.id)}
                      disabled={deletingId === summary.id}
                      className="text-red-500 hover:text-red-700"
                    >
                      {deletingId === summary.id ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>
                      {summary.summary}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              <p>No summaries available. Generate a summary to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDetailPage; 