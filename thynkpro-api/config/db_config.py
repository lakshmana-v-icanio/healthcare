import os
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DB_USER = os.getenv('DB_USER')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT')
DB_NAME = os.getenv('DB_NAME')

# SQLAlchemy database URI
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# SQLAlchemy configuration
db_config = {
    'SQLALCHEMY_DATABASE_URI': DATABASE_URL,
    'SQLALCHEMY_TRACK_MODIFICATIONS': False,
    'SQLALCHEMY_ECHO': os.getenv('SQLALCHEMY_ECHO', 'False').lower() == 'true'
}

# Initialize SQLAlchemy
db = SQLAlchemy()

def init_db(app):
    """Initialize the database with the Flask app"""
    app.config.update(db_config)
    db.init_app(app)
