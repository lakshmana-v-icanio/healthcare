from flask import Blueprint, request, jsonify
from service.patient_service import extract_text_from_image, get_all_patients, delete_patient, update_patient, get_patient_by_id, upload_file_for_patient, get_patients_by_ids
from schema.json_schema import patient_json_schema
import os

patient_bp = Blueprint('patient', __name__, url_prefix='/patient')

@patient_bp.route('/extract_text', methods=['POST'])
def extract_text():
    image_file = request.files['image']
    result, status_code = extract_text_from_image(image_file, patient_json_schema)
    return jsonify(result), status_code

@patient_bp.route('', methods=['GET'])
def get_patients():
    result, status_code = get_all_patients()
    return jsonify(result), status_code

@patient_bp.route('/<patient_id>', methods=['DELETE'])
def remove_patient(patient_id):
    result, status_code = delete_patient(patient_id)
    return jsonify(result), status_code

@patient_bp.route('/<patient_id>', methods=['PUT'])
def update_patient_data(patient_id):
    data = request.get_json()
    result, status_code = update_patient(patient_id, data)
    return jsonify(result), status_code

@patient_bp.route('/<patient_id>', methods=['GET'])
def get_patient(patient_id):
    result, status_code = get_patient_by_id(patient_id)
    return jsonify(result), status_code

@patient_bp.route('/<patient_id>/upload_file', methods=['POST'])
def upload_patient_file(patient_id):
    if 'file' not in request.files:
        return jsonify({"Message": "No file part", "success": "false"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"Message": "No selected file", "success": "false"}), 400
    
    result, status_code = upload_file_for_patient(patient_id, file)
    return jsonify(result), status_code

@patient_bp.route('/details', methods=['POST'])
def get_multiple_patients():
    data = request.get_json()
    if not data or 'patient_ids' not in data or not isinstance(data['patient_ids'], list):
        return jsonify({
            "Message": "Invalid request. Please provide a list of patient_ids",
            "success": "false"
        }), 400
    
    result, status_code = get_patients_by_ids(data['patient_ids'])
    return jsonify(result), status_code
