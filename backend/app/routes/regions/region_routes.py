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
            'regionDetail'
        }
        
        if missing_fields := [
            field for field in required_fields
            if not data.get(field)
        ]:
            return jsonify({
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400
            
        region = data['region'].upper()

        new_region = Region(
            region = region,
            regionDetail = data['regionDetail']
        )
        
        db.session.add(new_region)
        db.session.commit()
        
        return jsonify({
            "message": "Region added successfully",
            "podcast": serialize_region(new_region)
        }), 201
        
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e), "region": new_region.region}), 500
    
    
def serialize_region(region):
    return {
        "region": region.region,
        "regionDetail": region.regionDetail
    }