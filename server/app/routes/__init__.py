from .auth import auth_bp
from .history import history_bp
from .dashboard import dashboard_bp
from .household import household_bp
from .service import service_bp
from .upcoming import upcoming_bp

all_blueprints = [
    auth_bp,
    history_bp,
    dashboard_bp,
    household_bp,
    service_bp,
    upcoming_bp,
]
