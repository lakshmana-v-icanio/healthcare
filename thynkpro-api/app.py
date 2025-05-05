from flask import Flask
from config.ai_config import model
from controller.patient_controller import patient_bp
from controller.summary_controller import summary_bp
from controller.note_controller import note_bp
from config.db_config import init_db
from model import init_models
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

init_db(app)

init_models(app)

app.register_blueprint(patient_bp)
app.register_blueprint(summary_bp)
app.register_blueprint(note_bp)

if __name__ == '__main__':
    app.run(debug=True)