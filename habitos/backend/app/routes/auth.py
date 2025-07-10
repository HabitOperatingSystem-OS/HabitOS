from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models.user import User

# Create blueprint for authentication routes
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    User registration endpoint
    Creates a new user account and returns JWT token
    """
    data = request.get_json()
    
    # Validate required input fields
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    # Check if user already exists to prevent duplicate accounts
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409
    
    try:
        # Create new user with provided data
        user = User(
            username=data.get('username'),  # Optional field
            email=data['email'],
            bio=data.get('bio'),  # Optional field
            profile_picture_url=data.get('profile_picture_url')  # Optional field
        )
        # Hash the password before storing
        user.set_password(data['password'])
        
        # Save user to database
        db.session.add(user)
        db.session.commit()
        
        # Generate JWT access token for immediate login
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'message': 'User created successfully',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        # Rollback database changes on error
        db.session.rollback()
        return jsonify({'error': 'Failed to create user', 'details': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    User login endpoint
    Authenticates user credentials and returns JWT token
    """
    data = request.get_json()
    
    # Validate required fields
    if not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password are required'}), 400
    
    try:
        # Find user by email
        user = User.query.filter_by(email=data['email']).first()
        
        # Check if user exists and password is correct
        if user and user.check_password(data['password']):
            # Generate JWT access token
            access_token = create_access_token(identity=user.id)
            return jsonify({
                'access_token': access_token,
                'user': user.to_dict()
            }), 200
        else:
            # Invalid credentials
            return jsonify({'error': 'Invalid credentials'}), 401
            
    except Exception as e:
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()  # Require valid JWT token
def get_current_user():
    """
    Get current user profile endpoint
    Returns user data for the authenticated user
    """
    try:
        # Extract user ID from JWT token
        current_user_id = get_jwt_identity()
        
        # Find user in database
        user = User.query.get(current_user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch user data', 'details': str(e)}), 500
