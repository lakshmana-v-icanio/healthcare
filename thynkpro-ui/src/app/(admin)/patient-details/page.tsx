"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  admissionDate: string;
  diagnosis: string;
  status: string;
}

const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'John Doe',
    age: 45,
    gender: 'Male',
    bloodGroup: 'O+',
    admissionDate: '2024-01-15',
    diagnosis: 'Hypertension',
    status: 'Active',

  },
  {
    id: '2',
    name: 'Jane Smith',
    age: 32,
    gender: 'Female',
    bloodGroup: 'A-',
    admissionDate: '2024-01-16',
    diagnosis: 'Diabetes Type 2',
    status: 'Critical',

  },
  {
    id: '3',
    name: 'Robert Johnson',
    age: 58,
    gender: 'Male',
    bloodGroup: 'B+',
    admissionDate: '2024-01-14',
    diagnosis: 'Pneumonia',
    status: 'Stable',

  },
];

const PatientDetailsPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');
  const [patients] = useState<Patient[]>(mockPatients);
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 6;

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || patient.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesGender = filterGender === 'all' || patient.gender.toLowerCase() === filterGender.toLowerCase();
    
    return matchesSearch && matchesStatus && matchesGender;
  });

  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'stable':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const navigateToPatientDetail = (patientId: string) => {
    router.push(`/patient-details/${patientId}`);
  };

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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="critical">Critical</option>
              <option value="stable">Stable</option>
            </select>
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
          
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Patients: {filteredPatients.length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentPatients.map((patient) => (
          <div 
            key={patient.id} 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-300 cursor-pointer"
            onClick={() => navigateToPatientDetail(patient.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{patient.name}</h3>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.status)}`}>
                {patient.status}
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Diagnosis</h4>
                <p className="text-base text-gray-900 dark:text-white">{patient.diagnosis}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Age</h4>
                  <p className="text-base text-gray-900 dark:text-white">{patient.age} years</p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Blood Group</h4>
                  <p className="text-base text-gray-900 dark:text-white">{patient.bloodGroup}</p>
                </div>
              </div>
              
              <div className="flex items-center text-xs text-gray-500">
                <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Admitted: {patient.admissionDate}</p>
              </div>
            </div>

            <div className="mt-4 text-brand-500 text-sm font-medium flex items-center">
              View complete details
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>

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