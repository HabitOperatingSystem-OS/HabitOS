from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db

goals_bp = Blueprint('goals', __name__)

@goals_bp.route('/', methods=['GET'])
@jwt_required()
def get_goals():
    # TODO: Implement get goals functionality
    return jsonify({'message': 'Get goals endpoint - TODO'}), 200

@goals_bp.route('/', methods=['POST'])
@jwt_required()
def create_goal():
    # TODO: Implement create goal functionality
    return jsonify({'message': 'Create goal endpoint - TODO'}), 201
