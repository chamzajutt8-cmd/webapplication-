from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity

from extensions import db
from models import User
from middleware.auth_middleware import user_required
from utils.validators import is_valid_email

user_bp = Blueprint("users", __name__, url_prefix="/api/users")


@user_bp.route("/me", methods=["GET"])
@user_required
def get_profile():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict()), 200


@user_bp.route("/me", methods=["PUT"])
@user_required
def update_profile():
    user = User.query.get(int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True) or {}

    if "email" in data:
        new_email = data["email"].strip().lower()
        if not is_valid_email(new_email):
            return jsonify({"error": "Invalid email address"}), 400
        if new_email != user.email and User.query.filter_by(email=new_email).first():
            return jsonify({"error": "Email already in use"}), 409
        user.email = new_email

    for field in ["full_name", "phone", "address"]:
        if field in data:
            setattr(user, field, data[field])

    if data.get("password"):
        user.set_password(data["password"])

    db.session.commit()
    return jsonify({"message": "Profile updated", "user": user.to_dict()}), 200
from flask import Flask, jsonify

from config import Config
from extensions import db, jwt, cors


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # --- Init extensions ---
    db.init_app(app)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["FRONTEND_ORIGIN"]}})

    # --- JWT denylist check (logout support) ---
    from routes.auth_routes import TOKEN_DENYLIST

    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        return jwt_payload["jti"] in TOKEN_DENYLIST

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Token has expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):
        return jsonify({"error": "Invalid token"}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(reason):
        return jsonify({"error": "Authorization token is required"}), 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Token has been revoked"}), 401

    # --- Register blueprints ---
    from routes.auth_routes import auth_bp
    from routes.food_routes import food_bp
    from routes.category_routes import category_bp
    from routes.cart_routes import cart_bp
    from routes.order_routes import order_bp
    from routes.admin_routes import admin_bp
    from routes.user_routes import user_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(food_bp)
    app.register_blueprint(category_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(order_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(user_bp)

    # --- Health check ---
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({"status": "ok", "service": "FastBite API"}), 200

    # --- Global error handlers ---
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        db.session.rollback()
        return jsonify({"error": "Internal server error"}), 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
