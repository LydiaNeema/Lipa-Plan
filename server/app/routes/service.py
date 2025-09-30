from flask import Blueprint, request, jsonify
from app import db
from app.models.service import Service
from app.schemas.service_schema import ServiceSchema

service_bp = Blueprint("service", __name__, url_prefix="/services")

service_schema = ServiceSchema()
services_schema = ServiceSchema(many=True)

# Create service
@service_bp.route("/", methods=["POST"])
def create_service():
    data = request.get_json()

    new_service = Service(
        name=data["name"],
        amount=data["amount"],
        due_date=data["due_date"],
        category=data["category"],
        description=data.get("description"),
        status=data.get("status", "active"),
        household_id=data["household_id"],
        created_by=data.get("created_by")
    )

    db.session.add(new_service)
    db.session.commit()

    return service_schema.jsonify(new_service), 201

# Get all services
@service_bp.route("/", methods=["GET"])
def get_services():
    services = Service.query.all()
    return services_schema.jsonify(services)

# Get service by ID
@service_bp.route("/<int:id>", methods=["GET"])
def get_service(id):
    service = Service.query.get_or_404(id)
    return service_schema.jsonify(service)

# Update service
@service_bp.route("/<int:id>", methods=["PUT"])
def update_service(id):
    service = Service.query.get_or_404(id)
    data = request.get_json()

    for field in ["name", "amount", "due_date", "category", "description", "status"]:
        if field in data:
            setattr(service, field, data[field])

    db.session.commit()
    return service_schema.jsonify(service)

# Delete service
@service_bp.route("/<int:id>", methods=["DELETE"])
def delete_service(id):
    service = Service.query.get_or_404(id)
    db.session.delete(service)
    db.session.commit()
    return jsonify({"message": "Service deleted"})
