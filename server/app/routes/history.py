from flask import Blueprint, jsonify, g
from app.models.history import PaymentHistory
from app.models.auth import User
from flask_jwt_extended import jwt_required, get_jwt_identity

history_bp = Blueprint('history', __name__)


@history_bp.route('/', methods=['GET'])
@jwt_required()
def get_payment_history():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    # Fetch payment history for the authenticated user
    own_payments = PaymentHistory.query.filter_by(user_id=user_id,paid=True)

    household_payments = []
    if user.household_id:
        household_payments = PaymentHistory.query.filter_by(
            household_id=user.household_id,
            paid=True
        )
    payments = own_payments.union(household_payments).all()    
    return jsonify([p.to_dict() for p in payments]), 200

