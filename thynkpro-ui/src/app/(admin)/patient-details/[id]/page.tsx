"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Add medical history entry interface
interface MedicalHistoryEntry {
  id?: string; // Add ID for edit functionality
  date: string;
  eventType: string;
  description: string;
  provider: string;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodGroup: string;
  admissionDate: string;
  diagnosis: string;
  status: string;
  medicalSummary?: string;
  medicalHistory: MedicalHistoryEntry[]; // Add medical history array
}

// Same mock data as the main page
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
    medicalSummary: 'Patient has been diagnosed with Stage 2 Hypertension (160/95 mmHg) and shows early signs of left ventricular hypertrophy. He has a family history of cardiovascular disease, with his father having suffered a myocardial infarction at age 52. John has been managing his condition with ACE inhibitors (Lisinopril 20mg daily) and lifestyle modifications for the past 3 years but has struggled with medication adherence. Recent stress test results show adequate cardiac function, however, his lipid panel indicates borderline high LDL levels (138 mg/dL). He reports occasional chest discomfort during physical exertion, which requires further investigation to rule out coronary artery disease.',
    medicalHistory: [
      {
        id: '1',
        date: '2023-12-20',
        eventType: 'Consultation',
        description: 'Quarterly check-up. BP: 155/92 mmHg. Patient reports intermittent adherence to medication regimen.',
        provider: 'Dr. Sarah Chen, Cardiology'
      },
      {
        id: '2',
        date: '2023-10-05',
        eventType: 'Diagnostic',
        description: 'Stress echocardiogram performed. Results: Adequate cardiac function. Early signs of LVH noted.',
        provider: 'Dr. James Wilson, Cardiology'
      },
      {
        id: '3',
        date: '2023-07-18',
        eventType: 'Consultation',
        description: 'BP: 168/97 mmHg. Patient reports occasional chest discomfort during exertion.',
        provider: 'Dr. Sarah Chen, Cardiology'
      },
      {
        id: '4',
        date: '2023-04-02',
        eventType: 'Diagnostic',
        description: 'Lipid panel. Total cholesterol: 210 mg/dL, LDL: 138 mg/dL, HDL: 42 mg/dL, Triglycerides: 150 mg/dL.',
        provider: 'LabCorp Medical'
      },
      {
        id: '5',
        date: '2022-11-15',
        eventType: 'Consultation',
        description: 'Medication adjusted. Increased Lisinopril to 20mg daily from 10mg.',
        provider: 'Dr. Sarah Chen, Cardiology'
      }
    ]
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
    medicalSummary: 'Jane was diagnosed with Type 2 Diabetes Mellitus 5 years ago following gestational diabetes during her second pregnancy. Her current HbA1c is significantly elevated at 9.8%, indicating poor glycemic control despite being on Metformin (1000mg twice daily) and Gliclazide (60mg daily). She recently presented to the emergency department with symptoms of diabetic ketoacidosis, including severe dehydration, nausea, and elevated blood glucose levels (428 mg/dL). She also exhibits early signs of diabetic nephropathy with microalbuminuria detected in recent lab tests. Jane has reported numbness and tingling in her extremities, suggesting peripheral neuropathy. Her BMI is 31.5, and she has been referred to nutrition counseling and diabetes education sessions.',
    medicalHistory: [
      {
        id: '1',
        date: '2024-01-16',
        eventType: 'Emergency',
        description: 'Admitted for DKA. Blood glucose: 428 mg/dL. IV fluids and insulin drip initiated.',
        provider: 'Dr. Michael Torres, Emergency Medicine'
      },
      {
        id: '2',
        date: '2023-11-28',
        eventType: 'Laboratory',
        description: 'HbA1c: 9.8%. Microalbuminuria detected in urine analysis.',
        provider: 'Quest Diagnostics'
      },
      {
        id: '3',
        date: '2023-09-15',
        eventType: 'Consultation',
        description: 'Reports numbness and tingling in feet. Early signs of peripheral neuropathy diagnosed.',
        provider: 'Dr. Lisa Johnson, Endocrinology'
      },
      {
        id: '4',
        date: '2023-06-10',
        eventType: 'Consultation',
        description: 'Added Gliclazide 60mg daily to medication regimen due to poor glycemic control.',
        provider: 'Dr. Lisa Johnson, Endocrinology'
      },
      {
        id: '5',
        date: '2022-12-05',
        eventType: 'Education',
        description: 'Diabetes management education session. Nutrition counseling provided.',
        provider: 'Maria Garcia, CDE'
      },
      {
        id: '6',
        date: '2019-03-15',
        eventType: 'Diagnosis',
        description: 'Initial diagnosis of Type 2 Diabetes following history of gestational diabetes.',
        provider: 'Dr. Lisa Johnson, Endocrinology'
      }
    ]
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
    medicalSummary: 'Robert was admitted with community-acquired pneumonia affecting the right lower lobe, confirmed by chest radiography. He presented with a 5-day history of productive cough with yellowish sputum, fever up to 102°F (38.9°C), and right-sided pleuritic chest pain. His oxygen saturation on admission was 92% on room air, improving to 96% with supplemental oxygen. Sputum culture isolated Streptococcus pneumoniae, sensitive to the current antibiotic regimen of intravenous Ceftriaxone (1g daily). His medical history is significant for COPD (15 pack-year smoking history, quit 3 years ago) and well-controlled hypertension. Lung auscultation reveals diminished breath sounds and crackles in the right lower field. His white blood cell count has decreased from 15,800/μL on admission to 11,200/μL, suggesting positive response to treatment.',
    medicalHistory: [
      {
        id: '1',
        date: '2024-01-14',
        eventType: 'Admission',
        description: 'Admitted for community-acquired pneumonia. Chest X-ray shows right lower lobe infiltrate.',
        provider: 'Dr. Kevin Patel, Pulmonology'
      },
      {
        id: '2',
        date: '2024-01-15',
        eventType: 'Laboratory',
        description: 'Sputum culture: Streptococcus pneumoniae. WBC: 15,800/μL. Started on IV Ceftriaxone 1g daily.',
        provider: 'Dr. Kevin Patel, Pulmonology'
      },
      {
        id: '3',
        date: '2024-01-17',
        eventType: 'Progress',
        description: 'Improving clinically. O2 sat 96% on room air. WBC decreased to 11,200/μL.',
        provider: 'Dr. Kevin Patel, Pulmonology'
      },
      {
        id: '4',
        date: '2023-10-20',
        eventType: 'Consultation',
        description: 'Routine COPD follow-up. Pulmonary function tests stable. Continues albuterol as needed.',
        provider: 'Dr. Kevin Patel, Pulmonology'
      },
      {
        id: '5',
        date: '2023-05-18',
        eventType: 'Consultation',
        description: 'BP well-controlled at 128/82 mmHg on current medication regimen.',
        provider: 'Dr. Emily Robinson, Internal Medicine'
      },
      {
        id: '6',
        date: '2021-01-15',
        eventType: 'Lifestyle',
        description: 'Reports successful smoking cessation. Provided resources for continued support.',
        provider: 'Dr. Emily Robinson, Internal Medicine'
      },
      {
        id: '7',
        date: '2016-03-10',
        eventType: 'Diagnosis',
        description: 'Diagnosed with COPD. Pulmonary function testing shows moderate obstruction.',
        provider: 'Dr. Kevin Patel, Pulmonology'
      }
    ]
  },
];

interface PatientDetailPageProps {
  params: {
    id: string;
  };
}

const PatientDetailPage = ({ params }: PatientDetailPageProps) => {
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Add state for edit/add functionality
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState<MedicalHistoryEntry>({
    date: new Date().toISOString().split('T')[0],
    eventType: 'Consultation',
    description: '',
    provider: ''
  });
  
  // Add state for editing patient details
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [editedPatient, setEditedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    // In a real app, you would fetch from an API
    const foundPatient = mockPatients.find(p => p.id === params.id);
    
    if (foundPatient) {
      setPatient(foundPatient);
      setEditedPatient(foundPatient); // Initialize edit form with current patient data
    }
    
    setLoading(false);
  }, [params.id]);

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

  // Function to handle adding a new entry
  const handleAddEntry = () => {
    if (!patient) return;
    
    // In a real app, you'd make an API call here
    const updatedPatient = { 
      ...patient,
      medicalHistory: [
        {
          id: Date.now().toString(), // Generate temporary ID
          ...newEntry
        },
        ...patient.medicalHistory
      ]
    };
    
    setPatient(updatedPatient);
    setIsAddingEntry(false);
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      eventType: 'Consultation',
      description: '',
      provider: ''
    });
  };

  // Function to handle editing an entry
  const handleEditEntry = (entryId: string) => {
    if (!patient) return;
    
    const entryToEdit = patient.medicalHistory.find(entry => entry.id === entryId);
    if (entryToEdit) {
      setNewEntry({ ...entryToEdit });
      setEditingEntryId(entryId);
    }
  };

  // Function to save edited entry
  const handleSaveEdit = () => {
    if (!patient || !editingEntryId) return;
    
    // In a real app, you'd make an API call here
    const updatedHistory = patient.medicalHistory.map(entry => 
      entry.id === editingEntryId ? { ...newEntry, id: editingEntryId } : entry
    );
    
    setPatient({
      ...patient,
      medicalHistory: updatedHistory
    });
    
    setEditingEntryId(null);
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      eventType: 'Consultation',
      description: '',
      provider: ''
    });
  };

  // Function to cancel adding/editing
  const handleCancel = () => {
    setIsAddingEntry(false);
    setEditingEntryId(null);
    setNewEntry({
      date: new Date().toISOString().split('T')[0],
      eventType: 'Consultation',
      description: '',
      provider: ''
    });
  };

  // Function to handle patient data update
  const handleUpdatePatient = () => {
    if (!editedPatient) return;
    
    // In a real app, you'd make an API call here
    setPatient(editedPatient);
    setIsEditingPatient(false);
  };

  const handleCancelPatientEdit = () => {
    // Reset form and close
    if (patient) {
      setEditedPatient(patient);
    }
    setIsEditingPatient(false);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => router.back()}
            className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Patient Not Found</h1>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <p className="text-gray-600 dark:text-gray-400">The requested patient could not be found.</p>
          <button
            onClick={() => router.push('/patient-details')}
            className="mt-4 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg"
          >
            Back to All Patients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.back()}
          className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Patient Details</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Patient Info Card */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{patient.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Patient ID: {patient.id}</p>
            </div>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(patient.status)}`}>
              {patient.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Age</h3>
                <p className="text-base text-gray-900 dark:text-white">{patient.age} years</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</h3>
                <p className="text-base text-gray-900 dark:text-white">{patient.gender}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Blood Group</h3>
                <p className="text-base text-gray-900 dark:text-white">{patient.bloodGroup}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Admission Date</h3>
                <p className="text-base text-gray-900 dark:text-white">{patient.admissionDate}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Diagnosis</h3>
                <p className="text-base text-gray-900 dark:text-white">{patient.diagnosis}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                <p className="text-base text-gray-900 dark:text-white">{patient.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setIsEditingPatient(true)} 
              className="w-full py-2 px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-colors"
            >
              Edit Patient
            </button>
            <button className="w-full py-2 px-4 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 rounded-lg transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600">
              Download Patient Records
            </button>
          </div>
        </div>

        {/* Patient Edit Form */}
        {isEditingPatient && editedPatient && (
          <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input 
                  type="text" 
                  value={editedPatient.name}
                  onChange={(e) => setEditedPatient({...editedPatient, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
                <input 
                  type="number" 
                  value={editedPatient.age}
                  onChange={(e) => setEditedPatient({...editedPatient, age: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                <select 
                  value={editedPatient.gender}
                  onChange={(e) => setEditedPatient({...editedPatient, gender: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Blood Group</label>
                <select 
                  value={editedPatient.bloodGroup}
                  onChange={(e) => setEditedPatient({...editedPatient, bloodGroup: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admission Date</label>
                <input 
                  type="date" 
                  value={editedPatient.admissionDate}
                  onChange={(e) => setEditedPatient({...editedPatient, admissionDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diagnosis</label>
                <input 
                  type="text" 
                  value={editedPatient.diagnosis}
                  onChange={(e) => setEditedPatient({...editedPatient, diagnosis: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select 
                  value={editedPatient.status}
                  onChange={(e) => setEditedPatient({...editedPatient, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Stable">Stable</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medical Summary</label>
              <textarea 
                value={editedPatient.medicalSummary || ''}
                onChange={(e) => setEditedPatient({...editedPatient, medicalSummary: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button 
                onClick={handleCancelPatientEdit}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdatePatient}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-500 hover:bg-brand-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Disease Summary Section */}
        <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Disease Summary</h3>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="flex items-start gap-3 mb-2">
              <span className="mt-1 flex-shrink-0">
                <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Primary Diagnosis</h4>
                <p className="text-gray-600 dark:text-gray-400">{patient.diagnosis}</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {patient.medicalSummary || 'No detailed medical summary available for this patient.'}
              </p>
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Medical History</h3>
            <button 
              onClick={() => setIsAddingEntry(true)} 
              className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg flex items-center"
              disabled={isAddingEntry || editingEntryId !== null}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Entry
            </button>
          </div>
          
          {/* Add/Edit Form */}
          {(isAddingEntry || editingEntryId !== null) && (
            <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                {editingEntryId !== null ? 'Edit Medical History Entry' : 'Add New Medical History Entry'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input 
                    type="date" 
                    value={newEntry.date}
                    onChange={(e) => setNewEntry({...newEntry, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event Type</label>
                  <select 
                    value={newEntry.eventType}
                    onChange={(e) => setNewEntry({...newEntry, eventType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  >
                    <option value="Consultation">Consultation</option>
                    <option value="Diagnostic">Diagnostic</option>
                    <option value="Laboratory">Laboratory</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Admission">Admission</option>
                    <option value="Discharge">Discharge</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Diagnosis">Diagnosis</option>
                    <option value="Education">Education</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Progress">Progress</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea 
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  placeholder="Enter detailed description..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Provider</label>
                <input 
                  type="text" 
                  value={newEntry.provider}
                  onChange={(e) => setNewEntry({...newEntry, provider: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  placeholder="Provider name and specialty"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-600 dark:border-gray-500 dark:text-white dark:hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button 
                  onClick={editingEntryId !== null ? handleSaveEdit : handleAddEntry}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-500 hover:bg-brand-600"
                  disabled={!newEntry.description || !newEntry.provider}
                >
                  {editingEntryId !== null ? 'Save Changes' : 'Add Entry'}
                </button>
              </div>
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Event Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Provider
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {patient?.medicalHistory ? (
                  patient.medicalHistory
                    .map((entry, entryIndex) => (
                      <tr key={entry.id} className={entry.id === editingEntryId ? 'bg-brand-50 dark:bg-gray-600' : entryIndex % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${entry.eventType === 'Emergency' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                              entry.eventType === 'Consultation' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                              entry.eventType === 'Diagnostic' || entry.eventType === 'Laboratory' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                              entry.eventType === 'Admission' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                              entry.eventType === 'Diagnosis' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}
                          >
                            {entry.eventType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                          {entry.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {entry.provider}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => handleEditEntry(entry.id || '')}
                            disabled={isAddingEntry || editingEntryId !== null}
                            className="text-brand-500 hover:text-brand-600 dark:text-brand-400 dark:hover:text-brand-300 mr-3 disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                      No medical history records available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailPage; 