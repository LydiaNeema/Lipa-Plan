from app import db
from datetime import date

class PaymentHistory(db.Model):
    __tablename__ = 'payment_history'

    id = db.Column(db.Integer, primary_key = True)
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    household_id = db.Column(db.Integer, db.ForeignKey("households.id"), nullable=True)

    manual_name = db.Column(db.String(120), nullable=True)
    category = db.Column(db.String(120), nullable=True)
    color = db.Column(db.String(20), nullable=True)

    amount = db.Column(db.Float, nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    paid = db.Column(db.Boolean, default=False, nullable=False)

    # Relationships
    service = db.relationship("Service", back_populates="payment_history", lazy="joined")
    user = db.relationship("User", back_populates="payment_history")
    household = db.relationship("Household", back_populates="payment_history")

    def __repr__(self):
        return f"<PaymentHistory {self.manual_name or self.service_id} - {self.amount}>"

    def to_dict(self):
        return {
            "id": self.id,
            "serviceId": self.service_id,
            "manualName": self.manual_name,
            "userId": self.user_id,
            "householdId": self.household_id,
            "amount": self.amount,
            "dueDate": self.due_date.isoformat() if self.due_date else None,
            "paid": self.paid,
            "category": self.category,
            "color": self.color,
            "service": {
                "id": self.service.id,
                "name": self.service.name,
            } if self.service else None
        }
