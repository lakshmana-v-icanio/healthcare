"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface FileItem {
  id: string;
  file: File;
  name: string;
  preview: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  patientData?: any; // Add this to store the returned patient data
}

const UploadPage = () => {
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [currentUploadIndex, setCurrentUploadIndex] = useState<number>(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFilesToQueue(Array.from(files));
    }
  };
  
  const addFilesToQueue = (files: File[]) => {
    const newFileItems = files.map(file => {
      return {
        id: Math.random().toString(36).substring(2, 9),
        file,
        name: file.name,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: 'pending' as const
      };
    });
    
    setFileItems(prev => [...prev, ...newFileItems]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      addFilesToQueue(Array.from(files));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      fileItems.forEach(item => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, []); // Empty dependency array since we only want this to run on unmount

  const uploadFile = async (fileItem: FileItem, index: number) => {
    // Update status to uploading
    setFileItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status: 'uploading', progress: 0 };
      return updated;
    });
    
    try {
      // Create form data to send to the API
      const formData = new FormData();
      formData.append('image', fileItem.file);
      
      // Make API call to the backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/patient/extract_text`, {
        method: 'POST',
        body: formData,
      });
      
      // Parse the response
      const result = await response.json();
      
      if (response.ok && result.success === "true") {
        // Update file item with success status and store patient data
        const patientData = result.Data;
        
        setFileItems(prev => {
          const updated = [...prev];
          updated[index] = { 
            ...updated[index], 
            status: 'completed', 
            progress: 100,
            patientData
          };
          return updated;
        });
        
        // Navigate to the detail page with the document and data
        const docId = patientData.id || Math.random().toString(36).substring(2, 9);
        const previewUrl = fileItem.preview;
        // Store preview in sessionStorage to retrieve it on the next page
        sessionStorage.setItem(`preview_${docId}`, previewUrl);
        sessionStorage.setItem(`patientData_${docId}`, JSON.stringify(patientData));
        
        // Navigate to detail page
        router.push(`/prescription/detail/${docId}`);
      } else {
        // Handle API error
        setFileItems(prev => {
          const updated = [...prev];
          updated[index] = { 
            ...updated[index], 
            status: 'error', 
            progress: 0
          };
          return updated;
        });
      }
      
      // Check if all files are completed or errored
      setFileItems(prev => {
        const allFinished = prev.every(item => 
          item.status === 'completed' || item.status === 'error'
        );
        
        if (allFinished && isUploading) {
          setIsUploading(false);
          const successCount = prev.filter(item => item.status === 'completed').length;
          setTimeout(() => {
            if (successCount > 0) {
              alert(`${successCount} prescription(s) processed successfully!`);
            }
          }, 500);
        }
        
        return prev;
      });
      
    } catch (error) {
      console.error("Error uploading file:", error);
      setFileItems(prev => {
        const updated = [...prev];
        updated[index] = { 
          ...updated[index], 
          status: 'error', 
          progress: 0 
        };
        return updated;
      });
    }
  };

  const handleUploadSubmit = () => {
    if (fileItems.length === 0 || isUploading) return;
    
    setIsUploading(true);
    // Upload files one by one
    fileItems.forEach((fileItem, index) => {
      if (fileItem.status === 'pending') {
        uploadFile(fileItem, index);
      }
    });
  };
  
  const handleRemoveFile = (id: string) => {
    setFileItems(prev => {
      // If removing the currently uploading file, we need to handle that specially
      const itemIndex = prev.findIndex(item => item.id === id);
      if (itemIndex === currentUploadIndex && isUploading) {
        // Skip to the next file if we're removing the current one
        setCurrentUploadIndex(-1);
      }
      
      // Clean up preview URL before removing the item
      const itemToRemove = prev.find(item => item.id === id);
      if (itemToRemove?.preview) {
        URL.revokeObjectURL(itemToRemove.preview);
      }
      
      return prev.filter(item => item.id !== id);
    });
  };
  
  const handleRemoveAllFiles = () => {
    if (isUploading) {
      // Stop the upload process
      setIsUploading(false);
      setCurrentUploadIndex(-1);
    }
    
    // Clean up object URLs to prevent memory leaks
    fileItems.forEach(item => URL.revokeObjectURL(item.preview));
    setFileItems([]);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Upload Patient Prescription</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Upload your patient prescriptions by dragging and dropping files or clicking the upload button.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 mb-8">
        <div
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center min-h-[300px] transition-colors ${isDragging ? "border-brand-500 bg-brand-50 dark:bg-gray-800" : "border-gray-300 dark:border-gray-700"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
          <svg
            className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            ></path>
          </svg>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Multiple prescriptions supported - PNG, JPG, GIF up to 10MB each
          </p>
          <button
            onClick={handleUploadClick}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-md hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
          >
            Select File
          </button>
        </div>
      </div>

      {/* File Queue Section */}
      {fileItems.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Selected Files ({fileItems.length})</h2>
            <div className="flex gap-2">
              <button
                onClick={handleRemoveAllFiles}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
                disabled={isUploading}
              >
                Remove All
              </button>
              <button
                onClick={handleUploadSubmit}
                className="px-3 py-1.5 text-xs font-medium text-white bg-brand-500 rounded-md hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUploading || fileItems.length === 0}
              >
                Upload All Files
              </button>
            </div>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {fileItems.map((item) => (
              <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-start mb-2">
                  <div className="h-12 w-12 rounded bg-gray-200 dark:bg-gray-600 mr-3 overflow-hidden flex-shrink-0">
                    {item.preview && (
                      <Image 
                        src={item.preview} 
                        alt={item.name} 
                        width={48} 
                        height={48} 
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {item.status === 'pending' && 'Ready to upload'}
                      {item.status === 'uploading' && 'Processing prescription...'}
                      {item.status === 'completed' && item.patientData && `Extracted data for ${item.patientData.patient_name || 'Patient'}`}
                      {item.status === 'error' && 'Processing failed'}
                    </p>
                    {item.status === 'completed' && item.patientData && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        ID: {item.patientData.id} • {item.patientData.diagnosis || 'No diagnosis'}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveFile(item.id)}
                    disabled={isUploading && currentUploadIndex === fileItems.findIndex(f => f.id === item.id)}
                    className="ml-2 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </button>
                </div>
                
                {(item.status === 'uploading' || item.status === 'completed') && (
                  <div className="w-full mt-2">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                      <span>{item.status === 'uploading' ? 'Processing...' : 'Processed'}</span>
                      <span>{item.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ease-in-out ${item.status === 'completed' ? 'bg-green-500' : 'bg-brand-500'}`}
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;