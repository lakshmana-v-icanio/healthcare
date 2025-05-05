"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface PatientData {
  id: string;
  patient_name: string;
  diagnosis: string;
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
  }[];
  [key: string]: any; // For other possible fields
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

const PrescriptionDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [imageUrl, setImageUrl] = useState<string>("");
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [editableData, setEditableData] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    // Retrieve data from sessionStorage
    const preview = sessionStorage.getItem(`preview_${id}`);
    const data = sessionStorage.getItem(`patientData_${id}`);
    
    if (preview) {
      setImageUrl(preview);
    }
    
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        setPatientData(parsedData);
        setEditableData(JSON.parse(JSON.stringify(parsedData))); // Deep copy
      } catch (error) {
        console.error("Error parsing patient data:", error);
      }
    }
    
    setLoading(false);
    
    // Cleanup function to handle component unmount
    return () => {
      // Optionally clear sessionStorage when navigating away
      // sessionStorage.removeItem(`preview_${id}`);
      // sessionStorage.removeItem(`patientData_${id}`);
    };
  }, [id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reset editable data to original
    setEditableData(JSON.parse(JSON.stringify(patientData)));
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editableData) return;
    
    setIsSaving(true);
    
    try {
      // Here you would typically make an API call to update the data
      // For example:
      // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patient/update`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(editableData),
      // });
      
      // For now, we'll just update the local data
      setPatientData(editableData);
      
      // Update sessionStorage with new data
      sessionStorage.setItem(`patientData_${id}`, JSON.stringify(editableData));
      
      setIsEditing(false);
      
      // Show success message
      alert("Patient data updated successfully!");
    } catch (error) {
      console.error("Error saving patient data:", error);
      alert("Failed to update patient data. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    if (!editableData) return;
    
    setEditableData({
      ...editableData,
      [key]: value
    });
  };

  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    if (!editableData || !editableData.medications) return;
    
    const updatedMedications = [...editableData.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value
    };
    
    setEditableData({
      ...editableData,
      medications: updatedMedications
    });
  };

  // Add new function to handle JSON medication array changes
  const handleJsonMedicationChange = (key: string, medIndex: number, field: string, value: string) => {
    if (!editableData) return;
    
    try {
      // Get the current value
      let currentValue = editableData[key];
      let medicationsArray = [];
      
      // Parse if it's a string
      if (typeof currentValue === 'string') {
        medicationsArray = JSON.parse(currentValue);
      } else if (Array.isArray(currentValue)) {
        medicationsArray = [...currentValue];
      }
      
      // Update the specific field
      if (Array.isArray(medicationsArray) && medicationsArray[medIndex]) {
        medicationsArray[medIndex] = {
          ...medicationsArray[medIndex],
          [field]: value
        };
        
        // Update the state
        setEditableData({
          ...editableData,
          [key]: medicationsArray
        });
      }
    } catch (error) {
      console.error("Error updating JSON medication:", error);
    }
  };
  
  // Function to add a new medication to a JSON array
  const addJsonMedication = (key: string) => {
    if (!editableData) return;
    
    try {
      // Get the current value
      let currentValue = editableData[key];
      let medicationsArray = [];
      
      // Parse if it's a string
      if (typeof currentValue === 'string') {
        medicationsArray = JSON.parse(currentValue);
      } else if (Array.isArray(currentValue)) {
        medicationsArray = [...currentValue];
      }
      
      // Add a new empty medication
      medicationsArray.push({
        medicine_name: "",
        dosage: "",
        frequency: ""
      });
      
      // Update the state
      setEditableData({
        ...editableData,
        [key]: medicationsArray
      });
    } catch (error) {
      console.error("Error adding JSON medication:", error);
    }
  };
  
  // Function to remove a medication from a JSON array
  const removeJsonMedication = (key: string, medIndex: number) => {
    if (!editableData) return;
    
    try {
      // Get the current value
      let currentValue = editableData[key];
      let medicationsArray = [];
      
      // Parse if it's a string
      if (typeof currentValue === 'string') {
        medicationsArray = JSON.parse(currentValue);
      } else if (Array.isArray(currentValue)) {
        medicationsArray = [...currentValue];
      }
      
      // Remove the medication
      medicationsArray.splice(medIndex, 1);
      
      // Update the state
      setEditableData({
        ...editableData,
        [key]: medicationsArray
      });
    } catch (error) {
      console.error("Error removing JSON medication:", error);
    }
  };

  const addMedication = () => {
    if (!editableData) return;
    
    const newMedication = { name: "", dosage: "", frequency: "" };
    
    setEditableData({
      ...editableData,
      medications: [...(editableData.medications || []), newMedication]
    });
  };

  const removeMedication = (index: number) => {
    if (!editableData || !editableData.medications) return;
    
    const updatedMedications = [...editableData.medications];
    updatedMedications.splice(index, 1);
    
    setEditableData({
      ...editableData,
      medications: updatedMedications
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  const displayData = isEditing ? editableData : patientData;

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Prescription Details
        </h1>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600 focus:outline-none disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none"
              >
                Edit Data
              </button>
              <Link 
                href="/upload" 
                className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-md hover:bg-brand-600 focus:outline-none"
              >
                Back to Upload
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side - Document Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Uploaded Document
          </h2>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            {imageUrl ? (
              <div className="relative w-full" style={{ height: "calc(100vh - 250px)" }}>
                <Image
                  src={imageUrl}
                  alt="Prescription Document"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                No document available
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Extracted Data */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {isEditing ? "Edit Patient Data" : "Extracted Patient Data"}
          </h2>
          
          {displayData ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Patient ID</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayData.id || ""}
                        onChange={(e) => handleInputChange("id", e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 dark:text-white">{displayData.id || "N/A"}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Patient Name</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayData.patient_name || ""}
                        onChange={(e) => handleInputChange("patient_name", e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 dark:text-white">{displayData.patient_name || "N/A"}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Diagnosis</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayData.diagnosis || ""}
                        onChange={(e) => handleInputChange("diagnosis", e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 dark:text-white">{displayData.diagnosis || "N/A"}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayData.date || ""}
                        onChange={(e) => handleInputChange("date", e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    ) : (
                      <p className="font-medium text-gray-900 dark:text-white">{displayData.date || "N/A"}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Non-medication Additional Information Section */}
              {Object.entries(displayData).filter(([key]) => 
                !['id', 'patient_name', 'diagnosis', 'date', 'medications'].includes(key) &&
                !(key.toLowerCase().includes('med') || 
                  key.toLowerCase().includes('drug') || 
                  key.toLowerCase().includes('prescription') || 
                  key.toLowerCase().includes('dose') || 
                  key.toLowerCase().includes('treatment'))
              ).length > 0 && (
                <div className="mt-4">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                    Additional Information
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    {Object.entries(displayData)
                      .filter(([key]) => 
                        !['id', 'patient_name', 'diagnosis', 'date', 'medications'].includes(key) &&
                        !(key.toLowerCase().includes('med') || 
                          key.toLowerCase().includes('drug') || 
                          key.toLowerCase().includes('prescription') || 
                          key.toLowerCase().includes('dose') || 
                          key.toLowerCase().includes('treatment'))
                      )
                      .map(([key, value]) => (
                        <div key={key} className="mb-2">
                          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {key.replace(/_/g, ' ')}
                          </p>
                          {isEditing ? (
                            typeof value !== 'object' ? (
                              <input
                                type="text"
                                value={value || ""}
                                onChange={(e) => handleInputChange(key, e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                              />
                            ) : (
                              <p className="font-medium text-gray-900 dark:text-white">
                                {JSON.stringify(value)}
                              </p>
                            )
                          ) : (
                            <p className="font-medium text-gray-900 dark:text-white">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value || "N/A")}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Medications Section */}
              <div className="mt-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                  Medications
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  {/* Standard medications array */}
                  {displayData.medications && displayData.medications.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Prescribed Medications
                      </h4>
                      {displayData.medications.map((med, index) => (
                        <div key={index} className="mb-4 p-3 bg-white dark:bg-gray-800 rounded shadow-sm">
                          <div className="flex justify-between">
                            <h5 className="text-sm font-medium mb-1">Medication #{index + 1}</h5>
                            {isEditing && (
                              <button
                                onClick={() => removeMedication(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={med.name || ""}
                                  onChange={(e) => handleMedicationChange(index, "name", e.target.value)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                />
                              ) : (
                                <p className="font-medium text-gray-900 dark:text-white">{med.name || "N/A"}</p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Dosage</p>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={med.dosage || ""}
                                  onChange={(e) => handleMedicationChange(index, "dosage", e.target.value)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                />
                              ) : (
                                <p className="font-medium text-gray-900 dark:text-white">{med.dosage || "N/A"}</p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Frequency</p>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={med.frequency || ""}
                                  onChange={(e) => handleMedicationChange(index, "frequency", e.target.value)}
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                />
                              ) : (
                                <p className="font-medium text-gray-900 dark:text-white">{med.frequency || "N/A"}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {isEditing && (
                        <button
                          onClick={addMedication}
                          className="mt-2 px-3 py-1 text-sm text-brand-500 border border-brand-500 rounded hover:bg-brand-50"
                        >
                          + Add Medication
                        </button>
                      )}
                    </div>
                  )}

                  {/* Check for any key that might be JSON medication data */}
                  {Object.entries(displayData)
                    .filter(([key, value]) => 
                      (key.toLowerCase().includes('med') || 
                       key.toLowerCase().includes('drug') || 
                       key.toLowerCase().includes('prescription') || 
                       key.toLowerCase().includes('treatment')) && 
                      (typeof value === 'string' && value.startsWith('[') || Array.isArray(value))
                    )
                    .map(([key, value]) => {
                      let medicationsArray = [];
                      try {
                        if (typeof value === 'string') {
                          medicationsArray = JSON.parse(value);
                        } else if (Array.isArray(value)) {
                          medicationsArray = value;
                        }
                        
                        if (!Array.isArray(medicationsArray)) return null;
                        
                        return (
                          <div key={key} className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 capitalize">
                              {key.replace(/_/g, ' ')}
                            </h4>
                            {medicationsArray.map((med, medIndex) => (
                              <div key={medIndex} className="mb-4 p-3 bg-white dark:bg-gray-800 rounded shadow-sm">
                                <div className="flex justify-between">
                                  {isEditing && (
                                    <button
                                      onClick={() => removeJsonMedication(key, medIndex)}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      Remove
                                    </button>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                  {Object.entries(med).map(([field, fieldValue]) => (
                                    <div key={field}>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                        {field.replace(/_/g, ' ')}
                                      </p>
                                      {isEditing ? (
                                        <input
                                          type="text"
                                          value={fieldValue as string || ""}
                                          onChange={(e) => handleJsonMedicationChange(key, medIndex, field, e.target.value)}
                                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                        />
                                      ) : (
                                        <p className="font-medium text-gray-900 dark:text-white">
                                          {fieldValue as string || "N/A"}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                            {isEditing && (
                              <button
                                onClick={() => addJsonMedication(key)}
                                className="mt-2 px-3 py-1 text-sm text-brand-500 border border-brand-500 rounded hover:bg-brand-50"
                              >
                                + Add Item
                              </button>
                            )}
                          </div>
                        );
                      } catch (error) {
                        console.error(`Error parsing ${key}:`, error);
                        return null;
                      }
                    })}

                  {/* Show message if no medications found */}
                  {(!displayData.medications || displayData.medications.length === 0) && 
                   !Object.keys(displayData).some(key => 
                    (key.toLowerCase().includes('med') || 
                     key.toLowerCase().includes('drug') || 
                     key.toLowerCase().includes('prescription') ||
                     key.toLowerCase().includes('treatment')) && 
                    (typeof displayData[key] === 'string' && displayData[key].startsWith('[') || 
                     Array.isArray(displayData[key]))
                   ) && (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                      No medications found.
                      {isEditing && (
                        <button
                          onClick={addMedication}
                          className="ml-2 px-3 py-1 text-sm text-brand-500 border border-brand-500 rounded hover:bg-brand-50"
                        >
                          + Add Medication
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionDetailPage; 