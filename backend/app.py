from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from config import Config
from utils.db import db
from werkzeug.security import generate_password_hash
import traceback
from datetime import datetime

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # ✅ CORS Configuration
    CORS(app,
         supports_credentials=True,
         resources={r"/api/*": {
             "origins": [
                 "http://localhost:5173",
                 "http://localhost:5174",
                 "http://127.0.0.1:5173",
                 "http://127.0.0.1:5174"
             ],
             "allow_headers": ["Content-Type", "Authorization"],
             "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
         }}
    )

    # ✅ HOME ROUTE
    @app.route('/')
    def home():
        return "OrganMatch Backend is running!"

    # Initialize extensions
    db.init_app(app)
    from utils.socketio import socketio
    socketio.init_app(app, cors_allowed_origins="*")
    
    jwt = JWTManager(app)
    migrate = Migrate(app, db)

    # ✅ AUTO-CREATE TABLES & ADMIN USER (Persistence Check)
    from models import User
    with app.app_context():
        try:
            db.create_all()
            admin_email = 'admin@organmatch.com'
            admin = User.query.filter_by(email=admin_email).first()
            if not admin:
                new_admin = User(username='admin', email=admin_email, role='super_admin')
                new_admin.set_password('password123')
                db.session.add(new_admin)
                db.session.commit()
        except Exception:
            pass

    # Register blueprints
    from routes.auth_routes import auth_bp
    from routes.donor_routes import donor_bp
    from routes.recipient_routes import recipient_bp
    from routes.hospital_routes import hospital_bp
    from routes.match_routes import match_bp
    from routes.report_routes import report_bp
    from routes.admin_routes import admin_bp
    from routes.chatbot_routes import chatbot_bp
    from routes.payment_routes import payment_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(donor_bp, url_prefix='/api/donor')
    app.register_blueprint(recipient_bp, url_prefix='/api/recipient')
    app.register_blueprint(hospital_bp, url_prefix='/api/hospital')
    app.register_blueprint(match_bp, url_prefix='/api/matches')
    app.register_blueprint(report_bp, url_prefix='/api/reports')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(chatbot_bp, url_prefix='/api/chatbot')
    app.register_blueprint(payment_bp, url_prefix='/api/payment')

    return app


if __name__ == '__main__':
    from utils.socketio import socketio
    app = create_app()
    socketio.run(app, debug=True, port=5000, host='0.0.0.0', use_reloader=False, allow_unsafe_werkzeug=True)