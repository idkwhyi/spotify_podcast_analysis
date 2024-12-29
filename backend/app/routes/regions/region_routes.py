from flask import Blueprint, request, jsonify
from app.models import db, Region

region_routes = Blueprint('region_routes', __name__, url_prefix='/api/regions')

# * Add new Region
@region_routes.route('/', methods=['POST'])
def add_region():
    '''Add new region data'''
    try:
        data = request.get_json()
        
        request_fields = [
            'region': request.args.get('region'),
            'region_detail': request.args.get('region_detail')
        ]
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500