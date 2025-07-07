from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db

check_ins_bp = Blueprint('check_ins', __name__)

@check_ins_bp.route('/', methods=['GET'])
@jwt_required()
def get_check_ins():
    # TODO: Implement get check_ins functionality
    return jsonify({'message': 'Get check_ins endpoint - TODO'}), 200

@check_ins_bp.route('/', methods=['POST'])
@jwt_required()
def create_check_in():
    # TODO: Implement create check_in functionality
    return jsonify({'message': 'Create check_in endpoint - TODO'}), 201
