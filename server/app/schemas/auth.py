from marshmallow import Schema, fields, validate

class UserSchema(Schema):
    id = fields.Int(dump_only=True)

    username = fields.Str(
        required=True,
        validate=validate.Length(min=3, max=50),
        error_messages={"required": "Username is required."}
    )

    email = fields.Email(
        required=True,
        error_messages={"required": "Email is required."}
    )

    household_id = fields.Int(
        required=True,
        error_messages={"required": "Household ID is required."}
    )

    role = fields.Str(dump_only=True)

    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
