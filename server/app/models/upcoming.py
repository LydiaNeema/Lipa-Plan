from app.extensions import db
from datetime import datetime

class UpcomingPayment(db.Model):
    __tablename__ = "upcoming_payments"

    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)
    household_id = db.Column(db.Integer, db.ForeignKey("households.id"), nullable=False)

    # 🔹 Link to user
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    amount = db.Column(db.Float, nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default="pending")  # pending, paid, overdue
    reminder_sent = db.Column(db.Boolean, default=False)
    notes = db.Column(db.Text)

    paid = db.Column(db.Boolean, default=False)
    paid_date = db.Column(db.DateTime)

    frequency = db.Column(db.String(20))  # e.g., weekly, monthly, yearly

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    service = db.relationship("Service", back_populates="upcoming_payments")
    household = db.relationship("Household", back_populates="upcoming_payments")
    user = db.relationship("User", back_populates="upcoming_payments")

    def __repr__(self):
        return f"<UpcomingPayment {self.id} - {self.due_date} - {self.status}>"

    def to_dict(self):
        return {
            "id": self.id,
            "service_id": self.service_id,
            "household_id": self.household_id,
            "user_id": self.user_id,
            "amount": self.amount,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "status": self.status,
            "reminder_sent": self.reminder_sent,
            "notes": self.notes,
            "paid": self.paid,
            "paid_date": self.paid_date.isoformat() if self.paid_date else None,
            "frequency": self.frequency,
        }
