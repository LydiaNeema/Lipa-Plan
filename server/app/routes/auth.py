from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models.user import User
from app.schemas.user_schema import UserSchema
import jwt
from datetime import datetime, timedelta

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

user_schema = UserSchema()
users_schema = UserSchema(many=True)

# Register
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    if not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password required"}), 400

    if User.query.filter_by(email=data.get("email")).first():
        return jsonify({"error": "Email already registered"}), 400

    username = data.get("username") or data["email"].split("@")[0]

    new_user = User(
        username=username,
        email=data["email"],
        role=data.get("role", "member"),
        household_id=data["household_id"]
    )
    new_user.set_password(data["password"])

    db.session.add(new_user)
    db.session.commit()

    return user_schema.jsonify(new_user), 201

# Login
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get("email")).first()

    if not user or not user.check_password(data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    payload = {
        "user_id": user.id,
        "exp": datetime.utcnow() + timedelta(
            seconds=current_app.config.get("JWT_EXP_DELTA_SECONDS", 3600 * 24 * 7)
        ),
    }
    token = jwt.encode(payload, current_app.config.get("JWT_SECRET"), algorithm="HS256")

    return jsonify({
        "message": "Login successful",
        "token": token,
        "user": user_schema.dump(user)
    })

# Get all users
@auth_bp.route("/users", methods=["GET"])
def get_users():
    users = User.query.all()
    return users_schema.jsonify(users), 200

# Get user by ID
@auth_bp.route("/users/<int:id>", methods=["GET"])
def get_user(id):
    user = User.query.get_or_404(id)
    return user_schema.jsonify(user)
