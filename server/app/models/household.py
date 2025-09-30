from app import db

# Association table if many-to-many households <-> users
household_members = db.Table(
    "household_members",
    db.Column("household_id", db.Integer, db.ForeignKey("households.id"), primary_key=True),
    db.Column("user_id", db.Integer, db.ForeignKey("users.id"), primary_key=True),
)

class Household(db.Model):
    __tablename__ = 'households'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)

    # Relationships
    members = db.relationship("User", secondary=household_members, back_populates="households")
    services = db.relationship("Service", back_populates="household", cascade="all, delete-orphan")
    payment_history = db.relationship("PaymentHistory", back_populates="household", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Household {self.name}>"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "members": [
                {"id": u.id, "email": u.email, "username": u.username}
                for u in self.members
            ]
        }
