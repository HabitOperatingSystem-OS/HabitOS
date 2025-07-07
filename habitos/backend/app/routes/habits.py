from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db

habits_bp = Blueprint('habits', __name__)

@habits_bp.route('/', methods=['GET'])
@jwt_required()
def get_habits():
    # TODO: Implement get habits functionality
    return jsonify({'message': 'Get habits endpoint - TODO'}), 200

@habits_bp.route('/', methods=['POST'])
@jwt_required()
def create_habit():
    # TODO: Implement create habit functionality
    return jsonify({'message': 'Create habit endpoint - TODO'}), 201
