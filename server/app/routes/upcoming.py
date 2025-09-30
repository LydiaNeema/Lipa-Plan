from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.upcoming import UpcomingPayment
from app.schemas.upcoming import UpcomingPaymentSchema
from datetime import date, timedelta, datetime

upcoming_bp = Blueprint("upcoming", __name__, url_prefix="/upcoming")

upcoming_schema = UpcomingPaymentSchema()
upcomings_schema = UpcomingPaymentSchema(many=True)

# -------------------------
# Create upcoming payment
# -------------------------
@upcoming_bp.route("/", methods=["POST"])
@jwt_required()
def create_upcoming():
    data = request.get_json()
    user_id = get_jwt_identity()

    new_upcoming = UpcomingPayment(
        service_id=data["service_id"],
        household_id=data["household_id"],
        user_id=user_id,
        amount=data["amount"],
        due_date=data["due_date"],
        status=data.get("status", "pending"),
        reminder_sent=data.get("reminder_sent", False),
        notes=data.get("notes"),
        frequency=data.get("frequency"),
    )

    db.session.add(new_upcoming)
    db.session.commit()

    return upcoming_schema.jsonify(new_upcoming), 201


# -------------------------
# Get all upcoming (for user)
# -------------------------
@upcoming_bp.route("/", methods=["GET"])
@jwt_required()
def get_upcomings():
    user_id = get_jwt_identity()
    upcomings = UpcomingPayment.query.filter_by(user_id=user_id).all()
    return upcomings_schema.jsonify(upcomings)


# -------------------------
# Get one upcoming by ID
# -------------------------
@upcoming_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def get_upcoming(id):
    user_id = get_jwt_identity()
    upcoming = UpcomingPayment.query.filter_by(id=id, user_id=user_id).first_or_404()
    return upcoming_schema.jsonify(upcoming)


# -------------------------
# Update upcoming
# -------------------------
@upcoming_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_upcoming(id):
    user_id = get_jwt_identity()
    upcoming = UpcomingPayment.query.filter_by(id=id, user_id=user_id).first_or_404()
    data = request.get_json()

    for field in ["amount", "due_date", "status", "reminder_sent", "notes", "frequency"]:
        if field in data:
            setattr(upcoming, field, data[field])

    db.session.commit()
    return upcoming_schema.jsonify(upcoming)


# -------------------------
# Delete upcoming
# -------------------------
@upcoming_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_upcoming(id):
    user_id = get_jwt_identity()
    upcoming = UpcomingPayment.query.filter_by(id=id, user_id=user_id).first_or_404()

    db.session.delete(upcoming)
    db.session.commit()
    return jsonify({"message": "Upcoming payment deleted"})


# -------------------------
# Get overdue (for user)
# -------------------------
@upcoming_bp.route("/overdue", methods=["GET"])
@jwt_required()
def get_overdue():
    user_id = get_jwt_identity()
    today = date.today()
    overdue = UpcomingPayment.query.filter(
        UpcomingPayment.user_id == user_id,
        UpcomingPayment.due_date < today,
        UpcomingPayment.status != "paid"
    ).all()

    result = []
    for pay in overdue:
        result.append({
            **upcoming_schema.dump(pay),
            "days_remaining": (pay.due_date - today).days,
            "is_overdue": True
        })

    return jsonify(result), 200


# -------------------------
# Get upcoming (future dues for user)
# -------------------------
@upcoming_bp.route("/upcoming", methods=["GET"])
@jwt_required()
def get_upcoming_list():
    user_id = get_jwt_identity()
    today = date.today()

    days = request.args.get("due_within", type=int)

    query = UpcomingPayment.query.filter(
        UpcomingPayment.user_id == user_id,
        UpcomingPayment.status != "paid",
        UpcomingPayment.due_date >= today
    )

    if days:
        end_date = today + timedelta(days=days)
        query = query.filter(UpcomingPayment.due_date <= end_date)

    upcoming = query.order_by(UpcomingPayment.due_date.asc()).all()

    result = []
    for pay in upcoming:
        result.append({
            **upcoming_schema.dump(pay),
            "days_remaining": (pay.due_date - today).days,
            "is_overdue": False
        })

    return jsonify(result), 200


# -------------------------
# PATCH: Mark partial/full payment
# -------------------------
@upcoming_bp.route("/<int:id>/pay", methods=["PATCH"])
@jwt_required()
def mark_paid(id):
    user_id = get_jwt_identity()
    upcoming = UpcomingPayment.query.filter_by(id=id, user_id=user_id).first_or_404()

    data = request.get_json() or {}
    payment_amount = float(data.get("amount", 0))

    if payment_amount <= 0:
        return jsonify({"error": "Invalid payment amount"}), 400

    if upcoming.status == "paid":
        return jsonify({"error": "Already fully paid"}), 400

    if payment_amount > upcoming.amount:
        return jsonify({"error": "Payment exceeds remaining amount"}), 400

    upcoming.amount -= payment_amount
    if upcoming.amount <= 0:
        upcoming.amount = 0
        upcoming.status = "paid"
        upcoming.paid = True
        upcoming.paid_date = datetime.utcnow()

        # 🔹 Auto-schedule next if recurring
        if upcoming.frequency:
            freq = upcoming.frequency.lower()
            next_due = None
            if freq == "weekly":
                next_due = upcoming.due_date + timedelta(days=7)
            elif freq == "monthly":
                next_due = upcoming.due_date + timedelta(days=30)
            elif freq in ("yearly", "annually"):
                next_due = upcoming.due_date + timedelta(days=365)

            if next_due:
                new_payment = UpcomingPayment(
                    service_id=upcoming.service_id,
                    household_id=upcoming.household_id,
                    user_id=user_id,
                    amount=payment_amount,
                    due_date=next_due,
                    status="pending",
                    frequency=upcoming.frequency,
                )
                db.session.add(new_payment)

    db.session.commit()
    return upcoming_schema.jsonify(upcoming), 200
