"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchPatients, deletePatient } from '@/services/api/patient';

interface Patient {
  patient_name: string;
  diagnosis: string;
  patient_age: number;
  patient_gender: string;
  created_at: string;
  updated_at: string;
  id?: string; // Optional as it might not be included in the API response
}

const PatientDetailsPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 6;
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);

  useEffect(() => {
    const getPatients = async () => {
      try {
        setLoading(true);
        const data = await fetchPatients();
        setPatients(data || {});
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching patients:', err);
      } finally {
        setLoading(false);
      }
    };

    getPatients();
  }, []);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patient_gender.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGender = filterGender === 'all' || patient.patient_gender.toLowerCase() === filterGender.toLowerCase();
    
    return matchesSearch && matchesGender;
  });

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const navigateToPatientDetail = (patientId: string) => {
    router.push(`/patient-details/${patientId}`);
  };

  const handleDeletePatient = async (patientId: string) => {
    if (!patientId) return;
    
    try {
      const success = await deletePatient(patientId);
      if (success) {
        // Remove the patient from the local state
        setPatients(prev => prev.filter(patient => patient.id !== patientId));
        setDeleteConfirmation(null);
      }
    } catch (error) {
      console.error('Error deleting patient:', error);
      setError('Failed to delete patient. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-brand-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-3 text-gray-600 dark:text-gray-400">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Patient Details</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View and manage hospital patient records
        </p>
      </div>

      <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search patients..."
              className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg
                className="w-5 h-5 text-gray-400 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          
          <div>
            <select
              className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-brand-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
            >
              <option value="all">All Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          
          <div className="text-right md:col-span-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Patients: {filteredPatients.length}
            </p>
          </div>
        </div>
      </div>

      {deleteConfirmation && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Are you sure you want to delete this patient? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePatient(deleteConfirmation)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredPatients.length === 0 ? (
        <div className="text-center p-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <p className="text-gray-600 dark:text-gray-400">No Data Found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentPatients.map((patient, index) => (
            <div 
              key={patient.id || index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{patient.patient_name}</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Diagnosis</h4>
                  <p className="text-base text-gray-900 dark:text-white">{patient.diagnosis}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Age</h4>
                    <p className="text-base text-gray-900 dark:text-white">{patient.patient_age} years</p>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Gender</h4>
                    <p className="text-base text-gray-900 dark:text-white">{patient.patient_gender}</p>
                  </div>
                </div>
                
                <div className="flex items-center text-xs text-gray-500">
                  <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>Added: {new Date(patient.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div 
                  className="text-brand-500 text-sm font-medium flex items-center cursor-pointer"
                  onClick={() => patient.id && navigateToPatientDetail(patient.id)}
                >
                  View complete details
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (patient.id) setDeleteConfirmation(patient.id);
                  }}
                  className="text-red-500 hover:text-red-700 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              className={`px-4 py-2 text-sm font-medium rounded-md ${currentPage === pageNumber
                ? 'bg-brand-500 text-white'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {pageNumber}
            </button>
          ))}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientDetailsPage;