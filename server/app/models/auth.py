from app.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)

    # Role system: "owner", "admin", "member"
    role = db.Column(db.String(20), default="member")

    household_id = db.Column(db.Integer, db.ForeignKey("households.id"), nullable=False)
    household = db.relationship("Household", back_populates="users")

    payment_history = db.relationship("PaymentHistory", back_populates="user", lazy="dynamic")
    upcoming_payments = db.relationship("UpcomingPayment", back_populates="user", lazy="dynamic")  # NEW ✅

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"
