from flask import Blueprint, request, jsonify
from app.models import db, Region

region_routes = Blueprint('region_routes', __name__, url_prefix='/api/regions')

# * Add new Region
@region_routes.route('/', methods=['POST'])
def add_region():
    '''Add new region data'''
    try:
        data = request.get_json()
        
        required_fields = {
            'region',
            'region_detail'
        }
        
        if missing_fields := [
            field for field in required_fields
            if not data.get(field)
        ]:
            return jsonify({
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400

        new_region = Region(**{
            field: data[field] for field in required_fields
        })
        
        db.session.add(new_region)
        db.session.commit()
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500