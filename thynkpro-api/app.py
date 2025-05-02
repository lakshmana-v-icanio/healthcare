from flask import Flask
from config.ai_config import model
from controller.patient_controller import patient_bp
from config.db_config import init_db
from model import init_models

app = Flask(__name__)

init_db(app)

init_models(app)

app.register_blueprint(patient_bp)

if __name__ == '__main__':
    app.run(debug=True)