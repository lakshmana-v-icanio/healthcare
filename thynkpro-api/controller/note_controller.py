from flask import Blueprint, request, jsonify
import uuid
from model.patient import Note, Patient
from config.db_config import db

note_bp = Blueprint('notes', __name__)

@note_bp.route('/patients/<patient_id>/notes', methods=['GET'])
def get_patient_notes(patient_id):
    """Get all notes for a specific patient"""
    try:
        patient = Patient.query.get(uuid.UUID(patient_id))
        if not patient:
            return jsonify({"error": "Patient not found"}), 404
        
        notes = [note.to_dict() for note in patient.notes]
        return jsonify(notes), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@note_bp.route('/patients/<patient_id>/notes', methods=['POST'])
def create_note(patient_id):
    """Create a new note for a patient"""
    try:
        patient = Patient.query.get(uuid.UUID(patient_id))
        if not patient:
            return jsonify({"error": "Patient not found"}), 404
        
        data = request.get_json()
        note = Note(
            content=data.get('content', ''),
            patient_id=uuid.UUID(patient_id)
        )
        
        db.session.add(note)
        db.session.commit()
        
        return jsonify(note.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@note_bp.route('/notes/<note_id>', methods=['GET'])
def get_note(note_id):
    """Get a specific note by ID"""
    try:
        note = Note.query.get(uuid.UUID(note_id))
        if not note:
            return jsonify({"error": "Note not found"}), 404
        
        return jsonify(note.to_dict()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@note_bp.route('/notes/<note_id>', methods=['PUT'])
def update_note(note_id):
    """Update a specific note"""
    try:
        note = Note.query.get(uuid.UUID(note_id))
        if not note:
            return jsonify({"error": "Note not found"}), 404
        
        data = request.get_json()
        if 'content' in data:
            note.content = data['content']
        
        db.session.commit()
        return jsonify(note.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@note_bp.route('/notes/<note_id>', methods=['DELETE'])
def delete_note(note_id):
    """Delete a specific note"""
    try:
        note = Note.query.get(uuid.UUID(note_id))
        if not note:
            return jsonify({"error": "Note not found"}), 404
        
        db.session.delete(note)
        db.session.commit()
        
        return jsonify({"message": "Note deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
