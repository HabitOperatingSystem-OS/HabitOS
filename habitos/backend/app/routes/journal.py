from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db

journal_bp = Blueprint('journal', __name__)

@journal_bp.route('/', methods=['GET'])
@jwt_required()
def get_journal():
    # TODO: Implement get journal functionality
    return jsonify({'message': 'Get journal endpoint - TODO'}), 200

@journal_bp.route('/', methods=['POST'])
@jwt_required()
def create_journal():
    # TODO: Implement create journal functionality
    return jsonify({'message': 'Create journal endpoint - TODO'}), 201
