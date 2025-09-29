from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from .extensions import db, migrate, api
from .config import DevelopmentConfig  # Switch to ProductionConfig in prod
from app.routes import all_blueprints


def create_app():
    app = Flask(__name__)

    # ------------------- Config -------------------
    app.config.from_object(DevelopmentConfig)

    # ------------------- Extensions -------------------
    db.init_app(app)
    migrate.init_app(app, db)
    JWTManager(app)
    api.init_app(app)
    CORS(app)

    # ------------------- Import models (for Alembic) -------------------
    from app.models.user import User
    from app.models.history import PaymentHistory
    from app.models.household import Household
    from app.models.service import Service
    from app.models.upcoming import UpcomingPayment

    # ------------------- Register blueprints -------------------
    for bp in all_blueprints:
        app.register_blueprint(bp)

    # ------------------- Default route -------------------
    @app.route("/")
    def home():
        return "Backend is running"

    return app
