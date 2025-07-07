from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db

users_bp = Blueprint('users', __name__)

@users_bp.route('/', methods=['GET'])
@jwt_required()
def get_users():
    # TODO: Implement get users functionality
    return jsonify({'message': 'Get users endpoint - TODO'}), 200

@users_bp.route('/', methods=['POST'])
@jwt_required()
def create_user():
    # TODO: Implement create user functionality
    return jsonify({'message': 'Create user endpoint - TODO'}), 201
