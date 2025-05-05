from model.patient import Patient, Note
from config.db_config import db
import uuid
from datetime import datetime

def get_all_notes_for_patient(patient_id):
    """
    Get all notes for a specific patient
    
    Args:
        patient_id (str): The UUID of the patient
        
    Returns:
        list: List of note dictionaries
    """
    patient = Patient.query.get(uuid.UUID(patient_id))
    if not patient:
        return None
    
    return [note.to_dict() for note in patient.notes]

def create_patient_note(patient_id, content):
    """
    Create a new note for a patient
    
    Args:
        patient_id (str): The UUID of the patient
        content (str): The note content
        
    Returns:
        dict: The created note as a dictionary
    """
    patient = Patient.query.get(uuid.UUID(patient_id))
    if not patient:
        return None
    
    note = Note(
        content=content,
        patient_id=uuid.UUID(patient_id)
    )
    
    db.session.add(note)
    db.session.commit()
    
    return note.to_dict()

def get_note_by_id(note_id):
    """
    Get a note by its ID
    
    Args:
        note_id (str): The UUID of the note
        
    Returns:
        dict: The note as a dictionary
    """
    note = Note.query.get(uuid.UUID(note_id))
    if not note:
        return None
    
    return note.to_dict()

def update_note(note_id, content):
    """
    Update an existing note
    
    Args:
        note_id (str): The UUID of the note
        content (str): The new note content
        
    Returns:
        dict: The updated note as a dictionary
    """
    note = Note.query.get(uuid.UUID(note_id))
    if not note:
        return None
    
    note.content = content
    note.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    return note.to_dict()

def delete_note(note_id):
    """
    Delete a note
    
    Args:
        note_id (str): The UUID of the note
        
    Returns:
        bool: True if deletion was successful, False otherwise
    """
    note = Note.query.get(uuid.UUID(note_id))
    if not note:
        return False
    
    db.session.delete(note)
    db.session.commit()
    
    return True
