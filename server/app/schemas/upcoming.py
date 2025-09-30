from marshmallow import Schema, fields, validate

class UpcomingPaymentSchema(Schema):
    id = fields.Int(dump_only=True)
    service_id = fields.Int(required=True)
    household_id = fields.Int(required=True)

    amount = fields.Float(required=True)
    due_date = fields.Str(required=True)
    status = fields.Str(
        validate=validate.OneOf(["pending", "paid", "overdue"])
    )
    reminder_sent = fields.Bool()
    notes = fields.Str(allow_none=True)

    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    # Optional: include related data (uncomment if needed)
    # service = fields.Nested("ServiceSchema", only=("id", "name"), dump_only=True)
    # household = fields.Nested("HouseholdSchema", only=("id", "name"), dump_only=True)
