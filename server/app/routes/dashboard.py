from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.history import PaymentHistory
from app.models.auth import User
from datetime import date

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/dashboard")

@dashboard_bp.route("/", methods=["GET"])
@jwt_required()
def get_dashboard():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    household_ids = [h.id for h in user.households]

    today = date.today()

    upcoming = PaymentHistory.query.filter(
        PaymentHistory.due_date >= today,
        PaymentHistory.paid == False,
        (PaymentHistory.user_id == user_id) | (PaymentHistory.household_id.in_(household_ids))
    ).all()

    overdue = PaymentHistory.query.filter(
        PaymentHistory.due_date < today,
        PaymentHistory.paid == False,
        (PaymentHistory.user_id == user_id) | (PaymentHistory.household_id.in_(household_ids))
    ).all()

    paid = PaymentHistory.query.filter(
        PaymentHistory.paid == True,
        (PaymentHistory.user_id == user_id) | (PaymentHistory.household_id.in_(household_ids))
    ).all()

    return jsonify({
        "upcoming": [p.to_dict() for p in upcoming],
        "overdue": [p.to_dict() for p in overdue],
        "paid": [p.to_dict() for p in paid]
    }), 200
