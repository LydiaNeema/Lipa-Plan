from app.extensions import db
from datetime import datetime, date

class Service(db.Model):
    __tablename__ = "services"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)

    # changed from string → Date
    due_date = db.Column(db.Date, nullable=False)

    category = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(20), default="pending")

    household_id = db.Column(db.Integer, db.ForeignKey("households.id"), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey("users.id"))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    household = db.relationship("Household", back_populates="services")
    payment_history = db.relationship("PaymentHistory", back_populates="service", lazy="dynamic")
    upcoming_payments = db.relationship("UpcomingPayment", back_populates="service", lazy="dynamic")

    def __repr__(self):
        return f"<Service {self.name}>"
