"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  updatePatient, 
  fetchPatientsDetails, 
  updatePatientMedicines, 
  Patient,
  Medicine,
  Summary,
  Note,
  PatientFile
} from '@/services/api/patient';

interface DocumentFile {
  id: string;
  name: string;
  size: string;
  preview?: string | null;
}

// Use the Patient type from the API service instead of redefining it
type PatientData = Patient;

const DocumentDetailPage = () => {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [patientDetails, setPatientDetails] = useState<PatientData | null>(null);
  const [editedPatientDetails, setEditedPatientDetails] = useState<PatientData | null>(null);
  const [patientsData, setPatientsData] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('general');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [newMedicine, setNewMedicine] = useState<Medicine>({ medicine_name: '', dosage: '', frequency: '' });

  useEffect(() => {
    // Retrieve patient IDs from session storage
    const storedPatientIds = sessionStorage.getItem('allPatientIds');
    if (!storedPatientIds) {
      setError('No patient IDs found');
      setLoading(false);
      return;
    }

    const patientIds = JSON.parse(storedPatientIds) as string[];
    
    // Create temporary document list from patient IDs
    const tempDocuments = patientIds.map(id => {
      // Get preview and data from session storage if available
      const preview = sessionStorage.getItem(`preview_${id}`);
      const patientDataStr = sessionStorage.getItem(`patientData_${id}`);
      let patientName = 'Patient Document';
      
      if (patientDataStr) {
        try {
          const data = JSON.parse(patientDataStr);
          if (data.patient_name) {
            patientName = data.patient_name;
          }
        } catch (e) {
          console.error('Error parsing patient data', e);
        }
      }
      
      return {
        id,
        name: `${patientName}.pdf`,
        size: 'N/A',
        preview
      };
    });
    
    setDocuments(tempDocuments);
    
    // Set the first document as selected by default
    if (tempDocuments.length > 0) {
      setSelectedDocument(tempDocuments[0].id);
    }
    
    // Fetch patient details from API using the dedicated function
    fetchPatientDetails(patientIds, tempDocuments.length > 0 ? tempDocuments[0].id : null);
  }, []);

  const fetchPatientDetails = async (patientIds: string[], defaultSelectedId: string | null = null) => {
    try {
      setLoading(true);
      // Use API service function instead of direct fetch
      const patients = await fetchPatientsDetails(patientIds);
      
      if (patients && patients.length > 0) {
        setPatientsData(patients);
        
        // Determine which patient to select
        const selectedId = selectedDocument || defaultSelectedId;
        
        if (selectedId) {
          const selectedPatient = patients.find(p => p.id === selectedId);
          if (selectedPatient) {
            setPatientDetails(selectedPatient);
            setEditedPatientDetails(selectedPatient);
          } else if (patients.length > 0) {
            // If selected patient not found, default to first patient
            setPatientDetails(patients[0]);
            setEditedPatientDetails(patients[0]);
            // Ensure patient ID exists before setting as selected
            if (patients[0].id) {
              setSelectedDocument(patients[0].id);
            }
          }
        } else if (patients.length > 0) {
          // If no selection, default to first patient
          setPatientDetails(patients[0]);
          setEditedPatientDetails(patients[0]);
          // Ensure patient ID exists before setting as selected
          if (patients[0].id) {
            setSelectedDocument(patients[0].id);
          }
        }
      } else {
        setError('Failed to fetch patient details');
      }
    } catch (error) {
      console.error('Error fetching patient details:', error);
      setError('Error fetching patient details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentClick = (id: string) => {
    if (id === selectedDocument) return; // Don't reload if already selected
    
    setSelectedDocument(id);
    // Find patient details for the selected document
    const selectedPatient = patientsData.find(p => p.id === id);
    if (selectedPatient) {
      setPatientDetails(selectedPatient);
      setEditedPatientDetails(selectedPatient);
    } else {
      // If not found in API data, try to get from session storage
      const patientDataStr = sessionStorage.getItem(`patientData_${id}`);
      if (patientDataStr) {
        try {
          const data = JSON.parse(patientDataStr);
          setPatientDetails(data);
          setEditedPatientDetails(data);
        } catch (e) {
          console.error('Error parsing patient data', e);
          setPatientDetails(null);
          setEditedPatientDetails(null);
        }
      } else {
        setPatientDetails(null);
        setEditedPatientDetails(null);
      }
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    if (editedPatientDetails) {
      setEditedPatientDetails({
        ...editedPatientDetails,
        [field]: value
      });
    }
  };

  const handleMedicineChange = (index: number, field: keyof Medicine, value: string) => {
    if (editedPatientDetails && editedPatientDetails.medicines) {
      const updatedMedicines = [...editedPatientDetails.medicines];
      updatedMedicines[index] = {
        ...updatedMedicines[index],
        [field]: value
      };
      
      setEditedPatientDetails({
        ...editedPatientDetails,
        medicines: updatedMedicines
      });
    }
  };

  const handleAddMedicine = () => {
    if (editedPatientDetails) {
      if (!newMedicine.medicine_name.trim()) return;
      
      const updatedMedicines = editedPatientDetails.medicines ? 
        [...editedPatientDetails.medicines, newMedicine] : 
        [newMedicine];
      
      setEditedPatientDetails({
        ...editedPatientDetails,
        medicines: updatedMedicines
      });
      
      // Reset the new medicine form
      setNewMedicine({ medicine_name: '', dosage: '', frequency: '' });
    }
  };

  const handleRemoveMedicine = (index: number) => {
    if (editedPatientDetails && editedPatientDetails.medicines) {
      const updatedMedicines = [...editedPatientDetails.medicines];
      updatedMedicines.splice(index, 1);
      
      setEditedPatientDetails({
        ...editedPatientDetails,
        medicines: updatedMedicines
      });
    }
  };

  const handleSaveChanges = async () => {
    if (!editedPatientDetails || !editedPatientDetails.id) return;
    
    try {
      setSaveLoading(true);
      
      // Use the API service function to update patient
      const updatedPatient = await updatePatient(
        editedPatientDetails.id,
        editedPatientDetails
      );
      
      // If medicine-specific updates are needed, you can use the specialized function
      if (editedPatientDetails.medicines && editedPatientDetails.medicines.length > 0) {
        await updatePatientMedicines(
          editedPatientDetails.id,
          editedPatientDetails.medicines
        );
      }
      
      if (updatedPatient) {
        // Update local state
        setPatientDetails(editedPatientDetails);
        
        // Update in patients data array
        setPatientsData(prev => 
          prev.map(p => p.id === editedPatientDetails.id ? editedPatientDetails : p)
        );
        
        // Exit edit mode
        setIsEditing(false);
      } else {
        setError('Failed to update patient details');
      }
    } catch (error) {
      console.error('Error updating patient details:', error);
      setError('Error updating patient details. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset edited details to original
    setEditedPatientDetails(patientDetails);
    setIsEditing(false);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Document Details</h1>
          <button
            className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
            onClick={() => router.push('/patient-details')}
          >
            Done
          </button>
        </div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          View and manage patient documents and information
        </p>
      </div>


      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left side - Document list */}
          <div className="md:col-span-1 space-y-4">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                    selectedDocument === doc.id 
                      ? 'border-brand-500 bg-brand-50 dark:bg-gray-700 shadow-sm' 
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-brand-300'
                  }`}
                  onClick={() => handleDocumentClick(doc.id)}
                >
                  <div className="flex flex-col">
                    {doc.preview && (
                      <div className="h-24 w-full rounded bg-gray-200 dark:bg-gray-600 mb-3 overflow-hidden">
                        <Image 
                          src={doc.preview} 
                          alt={doc.name} 
                          width={200} 
                          height={100} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <span className="text-gray-900 dark:text-white font-medium mb-1">
                      {doc.name}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ID: {doc.id}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                No documents available
              </div>
            )}
          </div>

          {/* Right side - Patient details */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 h-full">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Patient Details
              </h2>

              {patientDetails ? (
                <>
                  {/* Tabs navigation */}
                  <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
                    <ul className="flex flex-wrap -mb-px">
                      <li className="mr-2">
                        <button
                          className={`inline-block p-2 border-b-2 rounded-t-lg ${
                            activeTab === 'general'
                              ? 'border-brand-500 text-brand-500'
                              : 'border-transparent hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'
                          }`}
                          onClick={() => setActiveTab('general')}
                        >
                          General
                        </button>
                      </li>
                      <li className="mr-2">
                        <button
                          className={`inline-block p-2 border-b-2 rounded-t-lg ${
                            activeTab === 'medical'
                              ? 'border-brand-500 text-brand-500'
                              : 'border-transparent hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'
                          }`}
                          onClick={() => setActiveTab('medical')}
                        >
                          Medical
                        </button>
                      </li>
                      <li className="mr-2">
                        <button
                          className={`inline-block p-2 border-b-2 rounded-t-lg ${
                            activeTab === 'documents'
                              ? 'border-brand-500 text-brand-500'
                              : 'border-transparent hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'
                          }`}
                          onClick={() => setActiveTab('documents')}
                        >
                          Documents
                        </button>
                      </li>
                      <li className="mr-2">
                        <button
                          className={`inline-block p-2 border-b-2 rounded-t-lg ${
                            activeTab === 'notes'
                              ? 'border-brand-500 text-brand-500'
                              : 'border-transparent hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300'
                          }`}
                          onClick={() => setActiveTab('notes')}
                        >
                          Notes
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Tab content */}
                  {activeTab === 'general' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Patient Name
                        </h4>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedPatientDetails?.patient_name || ''}
                            onChange={(e) => handleInputChange('patient_name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          />
                        ) : (
                          <p className="text-base text-gray-900 dark:text-white">
                            {patientDetails?.patient_name || 'N/A'}
                          </p>
                        )}
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Age
                        </h4>
                        {isEditing ? (
                          <input
                            type="number"
                            value={editedPatientDetails?.patient_age || ''}
                            onChange={(e) => handleInputChange('patient_age', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          />
                        ) : (
                          <p className="text-base text-gray-900 dark:text-white">
                            {patientDetails?.patient_age ? `${patientDetails.patient_age} years` : 'N/A'}
                          </p>
                        )}
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Gender
                        </h4>
                        {isEditing ? (
                          <select
                            value={editedPatientDetails?.patient_gender || ''}
                            onChange={(e) => handleInputChange('patient_gender', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        ) : (
                          <p className="text-base text-gray-900 dark:text-white">
                            {patientDetails?.patient_gender || 'N/A'}
                          </p>
                        )}
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Patient ID
                        </h4>
                        <p className="text-base text-gray-900 dark:text-white">
                          {patientDetails?.id || 'N/A'}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Hospital Name
                        </h4>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedPatientDetails?.hospital_name || ''}
                            onChange={(e) => handleInputChange('hospital_name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          />
                        ) : (
                          <p className="text-base text-gray-900 dark:text-white">
                            {patientDetails?.hospital_name || 'N/A'}
                          </p>
                        )}
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Created Date
                        </h4>
                        <p className="text-base text-gray-900 dark:text-white">
                          {patientDetails?.created_at 
                            ? new Date(patientDetails.created_at).toLocaleDateString() 
                            : patientDetails?.date || 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'medical' && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Diagnosis
                        </h4>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedPatientDetails?.diagnosis || ''}
                            onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          />
                        ) : (
                          <p className="text-base text-gray-900 dark:text-white">
                            {patientDetails?.diagnosis || 'N/A'}
                          </p>
                        )}
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Doctor Name
                        </h4>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editedPatientDetails?.doctor_name || ''}
                            onChange={(e) => handleInputChange('doctor_name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                          />
                        ) : (
                          <p className="text-base text-gray-900 dark:text-white">
                            {patientDetails?.doctor_name || 'N/A'}
                          </p>
                        )}
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Doctor's Advice
                        </h4>
                        {isEditing ? (
                          <textarea
                            value={editedPatientDetails?.doctor_advice || ''}
                            onChange={(e) => handleInputChange('doctor_advice', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                            rows={3}
                          />
                        ) : (
                          <p className="text-base text-gray-900 dark:text-white">
                            {patientDetails?.doctor_advice || 'N/A'}
                          </p>
                        )}
                      </div>

                      {patientDetails.medicines && patientDetails.medicines.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              Medicines
                            </h4>
                            {isEditing && (
                              <button
                                type="button"
                                className="text-xs text-brand-500 hover:text-brand-600 flex items-center"
                                onClick={() => document.getElementById('add-medicine-panel')?.scrollIntoView({ behavior: 'smooth' })}
                              >
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add Medicine
                              </button>
                            )}
                          </div>
                          <div className="space-y-3">
                            {(!isEditing ? patientDetails?.medicines : editedPatientDetails?.medicines)?.map((medicine: Medicine, index: number) => (
                              <div key={index} className="border-b border-gray-200 dark:border-gray-600 pb-3 last:border-0 last:pb-0">
                                {isEditing ? (
                                  <div className="space-y-2">
                                    <div>
                                      <label htmlFor={`medicine-name-${index}`} className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        Medicine Name
                                      </label>
                                      <input
                                        id={`medicine-name-${index}`}
                                        type="text"
                                        value={medicine.medicine_name}
                                        onChange={(e) => handleMedicineChange(index, 'medicine_name', e.target.value)}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <label htmlFor={`medicine-dosage-${index}`} className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                          Dosage
                                        </label>
                                        <input
                                          id={`medicine-dosage-${index}`}
                                          type="text"
                                          value={medicine.dosage}
                                          onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                        />
                                      </div>
                                      <div>
                                        <label htmlFor={`medicine-frequency-${index}`} className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                          Frequency
                                        </label>
                                        <input
                                          id={`medicine-frequency-${index}`}
                                          type="text"
                                          value={medicine.frequency}
                                          onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                        />
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveMedicine(index)}
                                      className="text-red-500 hover:text-red-700 text-xs flex items-center"
                                    >
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                      Remove
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-base font-medium text-gray-900 dark:text-white">
                                      {medicine.medicine_name}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      Dosage: {medicine.dosage || 'N/A'} • Frequency: {medicine.frequency || 'N/A'}
                                    </p>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          {isEditing && (
                            <div id="add-medicine-panel" className="mt-4 border-t border-gray-200 dark:border-gray-600 pt-4">
                              <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Add New Medicine
                              </h5>
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  placeholder="Medicine Name"
                                  value={newMedicine.medicine_name}
                                  onChange={(e) => setNewMedicine({...newMedicine, medicine_name: e.target.value})}
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    placeholder="Dosage"
                                    value={newMedicine.dosage}
                                    onChange={(e) => setNewMedicine({...newMedicine, dosage: e.target.value})}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Frequency"
                                    value={newMedicine.frequency}
                                    onChange={(e) => setNewMedicine({...newMedicine, frequency: e.target.value})}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={handleAddMedicine}
                                  disabled={!newMedicine.medicine_name.trim()}
                                  className="mt-2 px-3 py-1 bg-brand-500 text-white text-sm rounded hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Add Medicine
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {patientDetails?.summaries && patientDetails.summaries.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                            Summary
                          </h4>
                          <div className="space-y-2">
                            {patientDetails.summaries.map((summary: Summary) => (
                              <div key={summary.id} className="border-b border-gray-200 dark:border-gray-600 pb-2 last:border-0 last:pb-0">
                                <p className="text-base text-gray-900 dark:text-white">
                                  {summary.summary}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {summary.created_at ? new Date(summary.created_at).toLocaleString() : 'N/A'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'documents' && (
                    <div className="space-y-4">
                      {patientDetails?.files && patientDetails.files.length > 0 ? (
                        patientDetails.files.map((file: PatientFile) => (
                          <div key={file.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {file.file_name}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Size: {Math.round(file.file_size / 1024)} KB
                              </p>
                            </div>
                            <button 
                              className="px-3 py-1 bg-brand-500 text-white rounded-lg hover:bg-brand-600 text-sm"
                              onClick={() => window.open(file.file_url, '_blank')}
                            >
                              View
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <p className="text-base text-gray-900 dark:text-white">
                            No files available
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <div className="space-y-4">
                      {patientDetails?.notes && patientDetails.notes.length > 0 ? (
                        patientDetails.notes.map((note: Note) => (
                          <div key={note.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">
                              {note.content}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              {note.created_at ? new Date(note.created_at).toLocaleString() : 'N/A'}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <p className="text-base text-gray-900 dark:text-white">
                            No notes available
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                      onClick={() => router.back()}
                    >
                      Back
                    </button>
                    {isEditing ? (
                      <>
                        <button
                          className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center"
                          onClick={handleSaveChanges}
                          disabled={saveLoading}
                        >
                          {saveLoading ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </>
                    ) : (
                      <button
                        className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600"
                        onClick={() => setIsEditing(true)}
                      >
                        Edit Details
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-base text-gray-900 dark:text-white">
                    No patient details available
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDetailPage; 