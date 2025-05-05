from flask import Blueprint, request, jsonify
from service.patient_service import extract_text_from_image, get_all_patients, delete_patient, update_patient, get_patient_by_id
from schema.json_schema import patient_json_schema

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
