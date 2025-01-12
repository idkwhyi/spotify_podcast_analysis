from flask import Blueprint, jsonify
from app.models import Category

category_routes = Blueprint('category_routes', __name__, url_prefix='/api/category')

# * GET ALL CATEGORY 
@category_routes.route('/all', methods=['GET'])
def get_all_category():
    try:
        get_all_category = Category.query.all()

        if not get_all_category:
            return jsonify({"error": "Error get all categories"}), 404
        
        categories = serialize_category(get_all_category)
        
        return jsonify({"categories": categories}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def serialize_category(category):
    """Helper function to serialize category object to dictionary."""
    return [{"category_name": cat.category_name} for cat in category]
