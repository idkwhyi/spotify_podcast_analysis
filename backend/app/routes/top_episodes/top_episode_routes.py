from flask import Blueprint, jsonify
from app.models import TopEpisode  

top_episodes_routes = Blueprint('top_episodes_routes', __name__, url_prefix='/api/top_episodes')

# * GET all top episodes
@top_episodes_routes.route('/', methods=['GET'])
def get_all_top_episodes():
    try:
        # Query all top episodes from the database
        top_episodes = TopEpisode.query.order_by(TopEpisode.date_id.desc()).all()
        
        # Serialize each episode using the helper function
        top_episodes_data = [serialize_top_episodes(episode) for episode in top_episodes]
        
        # Return the serialized data as JSON
        return jsonify({'top_episodes': top_episodes_data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def serialize_top_episodes(episode):
    """Helper function to serialize podcast object to dictionary."""
    return {   
        "top_episode_id": episode.top_episode_id,
        "rank": episode.rank,
        "chart_rank_move": episode.chart_rank_move,
        "date": episode.date_id,
        "region_id": episode.region_id,
        "episode_uri": episode.episode_uri
    }