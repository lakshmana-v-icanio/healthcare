from config.db_config import db
from flask_migrate import Migrate

def init_models(app):
    from .patient import Patient, Medicine

    migrate = Migrate(app, db)

    with app.app_context():
        pass
        
def init_migrations(app, db):
    migrate = Migrate(app, db)
    return migrate 