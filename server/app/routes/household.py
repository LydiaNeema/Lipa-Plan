from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.household import Household
from app.models.auth import User

household_bp = Blueprint("household", __name__, url_prefix="/household")

# -------------------
# Create Household
# -------------------
@household_bp.route("/", methods=["POST"])
@jwt_required()
def create_household():
    user_id = get_jwt_identity()
    data = request.get_json()
    name = data.get("name")

    if not name:
        return jsonify({"error": "Household name required"}), 400

    new_household = Household(name=name)
    db.session.add(new_household)

    # Add creator as member
    user = User.query.get(user_id)
    if user:
        new_household.members.append(user)

    db.session.commit()
    return jsonify(new_household.to_dict()), 201


# -------------------
# Get households for user
# -------------------
@household_bp.route("/", methods=["GET"])
@jwt_required()
def get_households():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify([h.to_dict() for h in user.households]), 200


# -------------------
# Get one household
# -------------------
@household_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_household(id):
    user_id = get_jwt_identity()
    household = Household.query.get(id)

    if not household:
        return jsonify({"error": "Household not found"}), 404

    if user_id not in [u.id for u in household.members]:
        return jsonify({"error": "Forbidden"}), 403

    return jsonify(household.to_dict()), 200


# -------------------
# Add member to household
# -------------------
@household_bp.route("/<int:id>/members", methods=["POST"])
@jwt_required()
def add_member(id):
    user_id = get_jwt_identity()
    household = Household.query.get(id)

    if not household:
        return jsonify({"error": "Household not found"}), 404

    if user_id not in [u.id for u in household.members]:
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "Member email required"}), 400

    new_member = User.query.filter_by(email=email).first()
    if not new_member:
        return jsonify({"error": "User not found"}), 404

    if new_member in household.members:
        return jsonify({"error": "User already in household"}), 400

    household.members.append(new_member)
    db.session.commit()
    return jsonify(household.to_dict()), 200


# -------------------
# Update household
# -------------------
@household_bp.route("/<int:id>", methods=["PUT", "PATCH"])
@jwt_required()
def update_household(id):
    user_id = get_jwt_identity()
    household = Household.query.get(id)

    if not household:
        return jsonify({"error": "Household not found"}), 404

    if user_id not in [u.id for u in household.members]:
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json()
    household.name = data.get("name", household.name)
    db.session.commit()
    return jsonify(household.to_dict()), 200


# -------------------
# Delete household
# -------------------
@household_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_household(id):
    user_id = get_jwt_identity()
    household = Household.query.get(id)

    if not household:
        return jsonify({"error": "Household not found"}), 404

    if user_id not in [u.id for u in household.members]:
        return jsonify({"error": "Forbidden"}), 403

    db.session.delete(household)
    db.session.commit()
    return jsonify({"message": "Household deleted"}), 200

