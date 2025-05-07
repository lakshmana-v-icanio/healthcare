import json
import re
import os
from config.ai_config import model
from model.patient import Patient, PatientFile
from config.db_config import db

def _format_response(message, data=None, success=True, status_code=200):
    return {
        "Message": message,
        "Data": data or {},
        "success": "true" if success else "false"
    }, status_code

def extract_text_from_image(image_file, patient_json_schema):

    if image_file.filename == '':
        return _format_response("No image selected", success=False, status_code=400)

    try:
        image_data = image_file.read()
        prompt = [
            {"mime_type": image_file.content_type, "data": image_data},
            "Extract all text from this image and convert it to structured data. Return ONLY valid JSON data according to this schema: " + json.dumps(patient_json_schema),
        ]
        response = model.generate_content(prompt)

        response_text = response.text
        json_str = extract_json_from_text(response_text)

        extracted_data = json.loads(json_str)
        
        # Create a new Patient object from the extracted data
        patient = Patient.from_json(extracted_data)
        
        # Save the patient to the database
        try:
            # Add patient to database first to get an ID
            db.session.add(patient)
            db.session.flush()
            
            # Create a PatientFile record for the uploaded image
            # Get file size
            image_file.seek(0, os.SEEK_END)
            file_size = image_file.tell()
            image_file.seek(0)  # Reset file pointer
            
            # For simplicity, we'll use the filename as the URL
            # In a production environment, you would save the file to storage and get a proper URL
            file_url = f"/uploads/{image_file.filename}"
            
            patient_file = PatientFile(
                file_name=image_file.filename,
                file_url=file_url,
                file_size=file_size,
                patient_id=patient.id
            )
            
            db.session.add(patient_file)
            db.session.commit()
            
            # Update extracted_data with database ID
            extracted_data['id'] = str(patient.id)
            return _format_response("Patient Data Extracted and Saved Successfully", extracted_data)
        except Exception as db_error:
            db.session.rollback()
            return _format_response(f"Error saving to database: {db_error}", success=False, status_code=500)
        
    except json.JSONDecodeError:
        return _format_response("Could not parse JSON from model response", success=False, status_code=500)
    except Exception as e:
        return _format_response(f"Error processing image: {e}", success=False, status_code=500)

def extract_json_from_text(text):
    json_match = re.search(r'```json\s*([\s\S]*?)\s*```', text)
    if json_match:
        return json_match.group(1)
    
    json_match = re.search(r'({[\s\S]*})', text)
    if json_match:
        return json_match.group(1)
    return text

def get_all_patients():
    try:
        patients = Patient.query.all()
        patients_data = []

        if patients is None:
            return _format_response({}, success=False, status_code=404)
        
        for patient in patients:
            patients_data.append({
                'id': patient.id,
                'patient_name': patient.patient_name,
                'diagnosis': patient.diagnosis,
                'patient_age': patient.patient_age,
                'patient_gender': patient.patient_gender,
                'created_at': patient.created_at.isoformat() if patient.created_at else None,
                'updated_at': patient.updated_at.isoformat() if patient.updated_at else None
            })
        
        return _format_response("Patients retrieved successfully", patients_data)
    except Exception as e:
        return _format_response(f"Error retrieving patients: {e}", success=False, status_code=500)

def delete_patient(patient_id):
    try:
        patient = Patient.query.get(patient_id)
        if not patient:
            return _format_response("Patient not found", success=False, status_code=404)
        
        db.session.delete(patient)
        db.session.commit()
        return _format_response("Patient deleted successfully")
    except Exception as e:
        db.session.rollback()
        return _format_response(f"Error deleting patient: {e}", success=False, status_code=500)

def update_patient(patient_id, data):
    try:
        patient = Patient.query.get(patient_id)
        if not patient:
            return _format_response("Patient not found", success=False, status_code=404)
        
        if 'patient_name' in data:
            patient.patient_name = data['patient_name']
        if 'patient_age' in data:
            patient.patient_age = data['patient_age']
        if 'patient_gender' in data:
            patient.patient_gender = data['patient_gender']
        if 'diagnosis' in data:
            patient.diagnosis = data['diagnosis']
        if 'doctor_advice' in data:
            patient.doctor_advice = data['doctor_advice']
        if 'doctor_name' in data:
            patient.doctor_name = data['doctor_name']
        if 'hospital_name' in data:
            patient.hospital_name = data['hospital_name']
        
        # Handle medicines if provided
        if 'medicines' in data and isinstance(data['medicines'], list):
            # Clear existing medicines
            patient.medicines = []
            
            # Add new medicines
            for med_data in data['medicines']:
                if isinstance(med_data, dict):
                    from model.patient import Medicine
                    medicine = Medicine(
                        medicine_name=med_data.get('medicine_name', ''),
                        dosage=med_data.get('dosage', ''),
                        frequency=med_data.get('frequency', '')
                    )
                    patient.medicines.append(medicine)
        
        db.session.commit()
        return _format_response("Patient updated successfully", patient.to_dict())
    except Exception as e:
        db.session.rollback()
        return _format_response(f"Error updating patient: {e}", success=False, status_code=500)

def get_patient_by_id(patient_id):
    try:
        patient = Patient.query.get(patient_id)
        if not patient:
            return _format_response("Patient not found", success=False, status_code=404)
        
        return _format_response("Patient retrieved successfully", patient.to_dict())
    except Exception as e:
        return _format_response(f"Error retrieving patient: {e}", success=False, status_code=500)

def upload_file_for_patient(patient_id, file):
    try:
        patient = Patient.query.get(patient_id)
        if not patient:
            return _format_response("Patient not found", success=False, status_code=404)
        
        # Get file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)  # Reset file pointer
        
        # For simplicity, using filename as URL
        # In production, you would save the file to storage and get a proper URL
        file_url = f"/uploads/{file.filename}"
        
        # Create and add the new file record
        patient_file = PatientFile(
            file_name=file.filename,
            file_url=file_url,
            file_size=file_size,
            patient_id=patient_id
        )
        
        db.session.add(patient_file)
        db.session.commit()
        
        return _format_response("File uploaded successfully", patient_file.to_dict())
    except Exception as e:
        db.session.rollback()
        return _format_response(f"Error uploading file: {e}", success=False, status_code=500)

def get_patients_by_ids(patient_ids):
    try:
        patients_data = []
        
        for patient_id in patient_ids:
            patient = Patient.query.get(patient_id)
            if patient:
                # Get complete patient data including files and other details
                patient_dict = patient.to_dict()
                patients_data.append(patient_dict)
        
        if not patients_data:
            return _format_response("No patients found with the provided IDs", success=False, status_code=404)
        
        return _format_response("Patients data retrieved successfully", patients_data)
    except Exception as e:
        return _format_response(f"Error retrieving patients data: {e}", success=False, status_code=500)
