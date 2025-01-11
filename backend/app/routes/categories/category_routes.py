from flask import Blueprint, jsonify
from app.models import Category

category_routes = Blueprint('category_routes', __name__, url_prefix='/api/category')

# @category_routes.route('<string:cat_id>', methods=['GET'])
# def get_category_by_category_id(category_id):
#     try:
#         category = Category.query.filter_by()
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500