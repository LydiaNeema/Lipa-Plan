from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.service import Service
from app.schemas.service import ServiceSchema
from datetime import date, timedelta

service_bp = Blueprint("service", __name__, url_prefix="/services")

service_schema = ServiceSchema()
services_schema = ServiceSchema(many=True)


# --- Helper function ---
def update_service_status(service):
    today = date.today()

    if service.status != "paid":
        if service.due_date < today:
            service.status = "overdue"
        else:
            service.status = "pending"
    return service


# Create service
@service_bp.route("/", methods=["POST"])
@jwt_required()
def create_service():
    data = request.get_json()
    user_id = get_jwt_identity()

    new_service = Service(
        name=data["name"],
        amount=data["amount"],
        due_date=date.fromisoformat(data["due_date"]),  # expect YYYY-MM-DD
        category=data["category"],
        description=data.get("description"),
        status="pending",
        household_id=data["household_id"],
        created_by=user_id
    )

    db.session.add(new_service)
    db.session.commit()

    return service_schema.jsonify(new_service), 201


# Get all services (only logged-in user)
@service_bp.route("/", methods=["GET"])
@jwt_required()
def get_services():
    user_id = get_jwt_identity()
    services = Service.query.filter_by(created_by=user_id).all()

    # update statuses dynamically
    for service in services:
        update_service_status(service)

    db.session.commit()
    return services_schema.jsonify(services)


# Get service by ID (only owner can view)
@service_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_service(id):
    user_id = get_jwt_identity()
    service = Service.query.filter_by(id=id, created_by=user_id).first_or_404()

    update_service_status(service)
    db.session.commit()

    return service_schema.jsonify(service)


# Update service
@service_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_service(id):
    user_id = get_jwt_identity()
    service = Service.query.filter_by(id=id, created_by=user_id).first_or_404()
    data = request.get_json()

    for field in ["name", "amount", "category", "description", "status"]:
        if field in data:
            setattr(service, field, data[field])

    if "due_date" in data:
        service.due_date = date.fromisoformat(data["due_date"])

    update_service_status(service)
    db.session.commit()
    return service_schema.jsonify(service)


# Delete service
@service_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_service(id):
    user_id = get_jwt_identity()
    service = Service.query.filter_by(id=id, created_by=user_id).first_or_404()
    db.session.delete(service)
    db.session.commit()
    return jsonify({"message": "Service deleted"})


# Get overdue services
@service_bp.route("/overdue", methods=["GET"])
@jwt_required()
def get_overdue_services():
    user_id = get_jwt_identity()
    today = date.today()

    services = Service.query.filter(
        Service.created_by == user_id,
        Service.due_date < today,
        Service.status != "paid"
    ).all()

    for service in services:
        update_service_status(service)

    db.session.commit()
    return services_schema.jsonify(services)


# Get upcoming services
@service_bp.route("/upcoming", methods=["GET"])
@jwt_required()
def get_upcoming_services():
    user_id = get_jwt_identity()
    today = date.today()

    days = request.args.get("due_within", type=int)
    query = Service.query.filter(
        Service.created_by == user_id,
        Service.due_date >= today,
        Service.status != "paid"
    )

    if days:
        end_date = today + timedelta(days=days)
        query = query.filter(Service.due_date <= end_date)

    services = query.order_by(Service.due_date.asc()).all()

    for service in services:
        update_service_status(service)

    db.session.commit()
    return services_schema.jsonify(services)
