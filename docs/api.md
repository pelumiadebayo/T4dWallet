[v1.2.1] - 2024-10-05: Added
New Feature: Implemented signup endpoint.
Path: /api/v1/auth/signup
Method: POST
Request Body: Expects a JSON object with user details.

Example:
Request Body:

{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "securepassword123"
}

Response:
Success (201): Returns a success message and the created user object.
Error (400): Returns validation error messages if the input is invalid.
