from flask import Blueprint, request, jsonify
from service.summary_service import generate_patient_summary, get_patient_summaries, delete_summary
from model.patient import Patient
import uuid

summary_bp = Blueprint('summary', __name__, url_prefix='/summary')

@summary_bp.route('/<patient_id>', methods=['POST'])
def create_summary(patient_id):
    try:
        try:
            patient_uuid = uuid.UUID(patient_id)
        except ValueError:
            return jsonify({'error': 'Invalid patient ID format'}), 400
        result, status_code = generate_patient_summary(patient_uuid)
        
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@summary_bp.route('/<patient_id>', methods=['GET'])
def get_summaries(patient_id):
    try:
        try:
            patient_uuid = uuid.UUID(patient_id)
        except ValueError:
            return jsonify({'error': 'Invalid patient ID format'}), 400
            
        result, status_code = get_patient_summaries(patient_uuid)
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@summary_bp.route('/<summary_id>', methods=['DELETE'])
def remove_summary(summary_id):
    try:
        try:
            summary_uuid = uuid.UUID(summary_id)
        except ValueError:
            return jsonify({'error': 'Invalid summary ID format'}), 400
            
        result, status_code = delete_summary(summary_uuid)
        return jsonify(result), status_code
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
        