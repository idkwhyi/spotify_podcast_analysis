from flask import Blueprint, jsonify
from sqlalchemy import func, desc
from app import db
from app.models import Category, episode_categories, Date, TopEpisode

category_chart_routes = Blueprint('category_chart_routes', __name__, url_prefix='/api/charts')

# * Visualisasi di pie chart bagian home
@category_chart_routes.route('/category-distribution', methods=['GET'])
def get_category_distribution():
    try:
        # Get the latest date from the Date table
        latest_date = db.session.query(Date.date).order_by(desc(Date.date)).first()
        
        if not latest_date:
            return jsonify({"error": "No dates found in database"}), 404
            
        latest_date = latest_date[0]

        # Get episodes that are in the top charts for the latest date
        top_episode_uris = db.session.query(TopEpisode.episode_uri).filter(
            TopEpisode.date_id == latest_date
        ).all()
        
        top_episode_uris = [uri[0] for uri in top_episode_uris]

        # Count categories for these episodes
        category_counts = db.session.query(
            Category.category_name,
            func.count(episode_categories.c.episode_id).label('count')
        ).join(
            episode_categories,
            Category.category_name == episode_categories.c.category_id
        ).filter(
            episode_categories.c.episode_id.in_(top_episode_uris)
        ).group_by(
            Category.category_name
        ).all()

        if not category_counts:
            return jsonify({"error": "No categories found"}), 404

        # Format data for the pie chart
        chart_data = [
            {
                "value": count,
                "name": category_name
            }
            for category_name, count in category_counts
        ]

        return jsonify({
            "data": chart_data,
            "title": "Category Distribution",
            "subtext": f"As of {latest_date.strftime('%d %B %Y')}"
        }), 200

    except Exception as e:
        return jsonify({"error": f"Error fetching category distribution: {str(e)}"}), 500