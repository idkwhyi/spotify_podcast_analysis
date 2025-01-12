from flask import Blueprint, jsonify
from app import db
from app.models import Date

date_routes = Blueprint('date_routes', __name__, url_prefix='/api/dates')

# * Get all Date
@date_routes.route('/all', methods=['GET'])
def get_all_dates():
    try:
        all_dates = db.session.query(Date.date).all()
        
        if not all_dates:
            return jsonify({"error": "No dates found"})
        
        dates_list = [date[0] for date in all_dates]
        
        return jsonify({"dates": dates_list})
    
    except Exception as e:
        return jsonify({"error": f"Error fetching all dates: {str(e)}"}), 500