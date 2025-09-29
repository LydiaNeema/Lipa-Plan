from app import db

class Household(db.Model):
    __tablename__ = 'households'

    id = db.Column(db.Integer,primary_key =True)
    name = db.Column(db.String(120),nullable = False)

    #Relationships
    users = db.relationship("User", back_populates="household", cascade = "all,delete-orphan")
    services = db.relationship("Service", back_populates="household", cascade = "all,delete-orphan")
    payment_history = db.relationship("PaymentHistory", back_populates="household", cascade = "all,delete-orphan")

    def __repr__(self):
        return f"<Household {self.name}>"
