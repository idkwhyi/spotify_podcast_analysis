from flask import Blueprint, jsonify
from app import db
from app.models import Episode, Category, episode_categories

episode_category_routes = Blueprint('episode_category_routes', __name__, url_prefix='/api/episode_category')

# * Get episode categories by episode URI
@episode_category_routes.route('/episode/<string:episode_uri>', methods=['GET'])
def get_episode_category_by_episode(episode_uri):
    try:
        # Query all categories for a specific episode
        categories = db.session.query(Category).join(
            episode_categories,
            Category.category_name == episode_categories.c.category_id
        ).filter(
            episode_categories.c.episode_id == episode_uri
        ).all()

        if not categories:
            return jsonify({"error": "No categories found for this episode"}), 404

        # Serialize the categories
        data = [{"category_name": category.category_name} for category in categories]
        return jsonify({'categories': data}), 200
    except Exception as e:
        return jsonify({"error": f"Error fetching episode categories: {str(e)}"}), 500

# * Get episode categories by category
@episode_category_routes.route('/category/<string:category_id>', methods=['GET'])
def get_episode_category_by_category(category_id):
    try:
        # Query all episodes for a specific category
        episodes = db.session.query(Episode).join(
            episode_categories,
            Episode.episode_uri == episode_categories.c.episode_id
        ).filter(
            episode_categories.c.category_id == category_id
        ).all()

        if not episodes:
            return jsonify({"error": f"No episodes found for category: {category_id}"}), 404

        # Serialize the episodes
        data = [{
            "episode_uri": episode.episode_uri,
            "episode_name": episode.episode_name,
            "episode_description": episode.episode_description,
            "duration_ms": episode.duration_ms,
            "main_category": episode.main_category,
            "episode_release_date": episode.episode_release_date.strftime('%Y-%m-%d') if episode.episode_release_date else None
        } for episode in episodes]
        
        return jsonify({'episodes': data}), 200
    except Exception as e:
        return jsonify({"error": f"Error fetching episodes by category: {str(e)}"}), 500