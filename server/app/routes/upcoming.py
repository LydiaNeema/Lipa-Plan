from flask import Blueprint, request, jsonify
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
def create_upcoming():
    data = request.get_json()

    new_upcoming = UpcomingPayment(
        service_id=data["service_id"],
        household_id=data["household_id"],
        amount=data["amount"],
        due_date=data["due_date"],
        status=data.get("status", "pending"),
        reminder_sent=data.get("reminder_sent", False),
        notes=data.get("notes"),
        frequency=data.get("frequency"),   # NEW: optional recurrence
    )

    db.session.add(new_upcoming)
    db.session.commit()

    return upcoming_schema.jsonify(new_upcoming), 201


# -------------------------
# Get all upcoming payments
# -------------------------
@upcoming_bp.route("/", methods=["GET"])
def get_upcomings():
    upcomings = UpcomingPayment.query.all()
    return upcomings_schema.jsonify(upcomings)


# -------------------------
# Get upcoming by ID
# -------------------------
@upcoming_bp.route("/<int:id>", methods=["GET"])
def get_upcoming(id):
    upcoming = UpcomingPayment.query.get_or_404(id)
    return upcoming_schema.jsonify(upcoming)


# -------------------------
# Update upcoming
# -------------------------
@upcoming_bp.route("/<int:id>", methods=["PUT"])
def update_upcoming(id):
    upcoming = UpcomingPayment.query.get_or_404(id)
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
def delete_upcoming(id):
    upcoming = UpcomingPayment.query.get_or_404(id)
    db.session.delete(upcoming)
    db.session.commit()
    return jsonify({"message": "Upcoming payment deleted"})


# -------------------------
# Get overdue payments
# -------------------------
@upcoming_bp.route("/overdue", methods=["GET"])
def get_overdue():
    today = date.today()
    overdue = UpcomingPayment.query.filter(
        UpcomingPayment.due_date < today,
        UpcomingPayment.status != "paid"
    ).all()
    return jsonify(upcomings_schema.dump(overdue)), 200


# -------------------------
# PATCH: Mark partial/full payment
# -------------------------
@upcoming_bp.route("/<int:id>/pay", methods=["PATCH"])
def mark_paid(id):
    data = request.get_json() or {}
    payment_amount = float(data.get("amount", 0))

    if payment_amount <= 0:
        return jsonify({"error": "Invalid payment amount"}), 400

    upcoming = UpcomingPayment.query.get_or_404(id)

    if upcoming.status == "paid":
        return jsonify({"error": "Already fully paid"}), 400

    if payment_amount > upcoming.amount:
        return jsonify({"error": "Payment exceeds remaining amount"}), 400

    # Deduct amount
    upcoming.amount -= payment_amount
    if upcoming.amount <= 0:
        upcoming.amount = 0
        upcoming.status = "paid"
        upcoming.paid = True
        upcoming.paid_date = datetime.utcnow()

        # Auto-schedule next if recurring
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
                    amount=payment_amount,  # reset to original or adjust logic
                    due_date=next_due,
                    status="pending",
                    frequency=upcoming.frequency,
                )
                db.session.add(new_payment)

    db.session.commit()
    return upcoming_schema.jsonify(upcoming), 200
