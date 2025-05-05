import json
import re
from config.ai_config import model
from model.patient import Patient
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
            db.session.add(patient)
            db.session.commit()
            # Update extracted_data with database ID
            extracted_data['id'] = patient.id
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
