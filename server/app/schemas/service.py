from marshmallow import Schema, fields, validate

class ServiceSchema(Schema):
    id = fields.Int(dump_only=True)

    name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    description = fields.Str(allow_none=True)
    amount = fields.Float(required=True)

    frequency = fields.Str(
        validate=validate.OneOf(["weekly", "monthly", "yearly", "annually"]),
        allow_none=True
    )

    category = fields.Str(allow_none=True)
    color = fields.Str(allow_none=True)

    # Dates
    due_date = fields.Date(required=True)
    nextDueDate = fields.Date(attribute="next_due_date", dump_only=True)

    householdId = fields.Int(attribute="household_id", required=True)
    created_by = fields.Int(dump_only=True)

    status = fields.Str(dump_only=True)

    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
