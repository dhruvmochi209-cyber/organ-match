from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User
from services.chatbot_service import get_chatbot_response

chatbot_bp = Blueprint('chatbot', __name__)

@chatbot_bp.route('/query', methods=['POST'])
@jwt_required(optional=True)
def query_chatbot():
    """
    Endpoint for the AI Chatbot Assistant.
    """
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'Message required'}), 400
    
    user_id = get_jwt_identity()
    user = User.query.get(user_id) if user_id else None
    
    response = get_chatbot_response(data['message'], user)
    
    return jsonify({
        'response': response,
        'sender': 'bot',
        'timestamp': None # Can add ISO format here if needed
    }), 200
