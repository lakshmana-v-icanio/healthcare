patient_json_schema = {
    "type": "object",
    "properties": {
        "patient_name": {
            "type": "string",
            "description": "The name of the patient"
            },
        "patient_age": {
            "type": "number",
            "description": "The age of the patient"
            },
        "patient_gender": {
            "type": "string",
            "description": "The gender of the patient (Male, Female, Other) if M is mentioned then it is Male, if F is mentioned then it is Female, if O is mentioned then it is Other"
            },
        "diagnosis": {
            "type": "string",
            "description": "The diagnosis of the patient"
                      },
        "doctor_advice": {"type": "string"},
        "doctor_name": {"type": "string"},
        "hospital_name": {"type": "string"},
        "medicines": [
            {
                "medicine_name": {
                    "type": "string",
                    "description": "The name of the medicine analysis that medicine if it is short form of medicine name then convert it to full form"
                    },
                "dosage": {"type": "string"},
                "frequency": {"type": "string"}
            }
        ]
        
    },
    "required": ["patient_name", "patient_age", "patient_gender", "diagnosis", "doctor_advice", "medicines"]
}