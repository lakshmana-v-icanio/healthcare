from config.db_config import db
from model.patient import Patient, Summary
from config.ai_config import model
import os
from datetime import datetime

def generate_patient_summary(patient_id):
    patient = Patient.query.get(patient_id)
    if not patient:
        return {'error': 'Patient not found'}, 404
    
    # Prepare patient data for AI summary
    patient_info = {
        'name': patient.patient_name,
        'age': patient.patient_age,
        'gender': patient.patient_gender,
        'diagnosis': patient.diagnosis,
        'doctor_advice': patient.doctor_advice,
        'medicines': [
            {
                'medicine_name': med.medicine_name,
                'dosage': med.dosage,
                'frequency': med.frequency
            } for med in patient.medicines
        ]
    }
    
    # Create prompt for Gemini
    prompt = f"""
    Analyze the following patient information and provide a concise medical summary:
    
    Patient: {patient_info['name']}, {patient_info['age']} years old, {patient_info['gender']}
    Diagnosis: {patient_info['diagnosis']}
    Doctor's Advice: {patient_info['doctor_advice']}
    
    Medications:
    """
    
    for med in patient_info['medicines']:
        prompt += f"- {med['medicine_name']}: {med['dosage']}, {med['frequency']}\n"
    
    prompt += "\nProvide a brief summary of the patient's condition, treatment plan, and key observations in a professional medical tone."
    
    try:
        # Generate summary with Gemini using the centralized configuration
        response = model.generate_content(prompt)
        ai_summary = response.text
        
        # Check if a summary already exists for this patient
        existing_summary = Summary.query.filter_by(patient_id=patient_id).first()
        
        if existing_summary:
            # Update existing summary
            existing_summary.summary = ai_summary
            existing_summary.updated_at = datetime.utcnow()
            db.session.commit()
            
            return {
                'summary': ai_summary,
                'summary_id': str(existing_summary.id),
                'updated': True
            }, 200
        else:
            # Create new summary
            new_summary = Summary(
                summary=ai_summary,
                patient_id=patient_id
            )
            
            db.session.add(new_summary)
            db.session.commit()
            
            return {
                'summary': ai_summary,
                'summary_id': str(new_summary.id),
                'created': True
            }, 201
        
    except Exception as e:
        db.session.rollback()
        return {'error': str(e)}, 500

def get_patient_summaries(patient_id):
    """
    Gets all summaries for a specific patient
    """
    summaries = Summary.query.filter_by(patient_id=patient_id).all()
    return {
        'summaries': [summary.to_dict() for summary in summaries]
    }, 200

def delete_summary(summary_id):
    """
    Deletes a specific summary
    """
    summary = Summary.query.get(summary_id)
    if not summary:
        return {'error': 'Summary not found'}, 404
    
    db.session.delete(summary)
    db.session.commit()
    
    return {'message': 'Summary deleted successfully'}, 200
