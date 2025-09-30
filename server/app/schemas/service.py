from marshmallow import Schema, fields, validate

class ServiceSchema(Schema):
    id = fields.Int(dump_only=True)

    name = fields.Str(
        required=True,
        validate=validate.Length(min=2, max=100),
        error_messages={"required": "Service name is required."}
    )

    description = fields.Str(allow_none=True)
    amount = fields.Float(required=True)

    # Support recurring services
    frequency = fields.Str(
        validate=validate.OneOf(["weekly", "monthly", "yearly", "annually"]),
        allow_none=True
    )

    category = fields.Str(allow_none=True)
    color = fields.Str(allow_none=True)

    # Date handling with camelCase mapping for frontend
    due_date = fields.DateTime(required=True)
    nextDueDate = fields.DateTime(attribute="next_due_date", dump_only=True)

    # Relationships (backend-safe, frontend-friendly mapping)
    householdId = fields.Int(attribute="household_id", required=True)
    userId = fields.Int(attribute="user_id", dump_only=True)

    status = fields.Str(dump_only=True)  # managed by backend, not client
    created_by = fields.Int(dump_only=True)

    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
