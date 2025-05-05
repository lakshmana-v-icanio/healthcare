from datetime import datetime
import json
import uuid
from sqlalchemy.dialects.postgresql import UUID
from config.db_config import db

class Medicine(db.Model):
    __tablename__ = 'medicines'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    medicine_name = db.Column(db.String(255), nullable=True)
    dosage = db.Column(db.String(100))
    frequency = db.Column(db.String(100))
    patient_id = db.Column(UUID(as_uuid=True), db.ForeignKey('patients.id'))
    
    def __repr__(self):
        return f"<Medicine {self.medicine_name}>"
        
    def to_dict(self):
        return {
            'id': str(self.id),
            'medicine_name': self.medicine_name,
            'dosage': self.dosage,
            'frequency': self.frequency
        }

class Summary(db.Model):
    __tablename__ = 'summaries'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    summary = db.Column(db.Text, nullable=True)
    patient_id = db.Column(UUID(as_uuid=True), db.ForeignKey('patients.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Summary {self.id}>"
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'summary': self.summary,
            'patient_id': str(self.patient_id),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Note(db.Model):
    __tablename__ = 'notes'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content = db.Column(db.Text, nullable=True)
    patient_id = db.Column(UUID(as_uuid=True), db.ForeignKey('patients.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Note {self.id}>"
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'content': self.content,
            'patient_id': str(self.patient_id),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Patient(db.Model):
    __tablename__ = 'patients'
    
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_name = db.Column(db.String(255), nullable=True)
    patient_age = db.Column(db.Integer, nullable=True)
    patient_gender = db.Column(db.String(10), nullable=True)
    diagnosis = db.Column(db.Text, nullable=True)
    doctor_advice = db.Column(db.Text, nullable=True)
    doctor_name = db.Column(db.String(255))
    hospital_name = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    medicines = db.relationship('Medicine', backref='patient', lazy=True, cascade="all, delete-orphan")
    summaries = db.relationship('Summary', backref='patient', lazy=True, cascade="all, delete-orphan")
    notes = db.relationship('Note', backref='patient', lazy=True, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Patient {self.patient_name}>"
    
    def to_dict(self):
        return {
            'id': str(self.id),
            'patient_name': self.patient_name,
            'patient_age': self.patient_age,
            'patient_gender': self.patient_gender,
            'diagnosis': self.diagnosis,
            'doctor_advice': self.doctor_advice,
            'doctor_name': self.doctor_name,
            'hospital_name': self.hospital_name,
            'medicines': [
                {
                    'medicine_name': med.medicine_name,
                    'dosage': med.dosage,
                    'frequency': med.frequency
                } for med in self.medicines
            ],
            'summaries': [summary.to_dict() for summary in self.summaries],
            'notes': [note.to_dict() for note in self.notes],
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def from_json(cls, data):
        patient = cls(
            id=uuid.UUID(data.get('id')) if data.get('id') else uuid.uuid4(),
            patient_name=data.get('patient_name'),
            patient_age=data.get('patient_age'),
            patient_gender=data.get('patient_gender'),
            diagnosis=data.get('diagnosis'),
            doctor_advice=data.get('doctor_advice'),
            doctor_name=data.get('doctor_name'),
            hospital_name=data.get('hospital_name')
        )
        
        # Create Medicine objects for each medicine in the data
        if 'medicines' in data and isinstance(data['medicines'], list):
            for med_data in data['medicines']:
                if isinstance(med_data, dict):
                    medicine = Medicine(
                        medicine_name=med_data.get('medicine_name', ''),
                        dosage=med_data.get('dosage', ''),
                        frequency=med_data.get('frequency', '')
                    )
                    patient.medicines.append(medicine)
        
        # Create Summary objects for each summary in the data
        if 'summaries' in data and isinstance(data['summaries'], list):
            for summary_data in data['summaries']:
                if isinstance(summary_data, dict):
                    summary = Summary(
                        summary=summary_data.get('summary', '')
                    )
                    patient.summaries.append(summary)
        
        # Create Note objects for each note in the data
        if 'notes' in data and isinstance(data['notes'], list):
            for note_data in data['notes']:
                if isinstance(note_data, dict):
                    note = Note(
                        content=note_data.get('content', '')
                    )
                    patient.notes.append(note)
        
        return patient 