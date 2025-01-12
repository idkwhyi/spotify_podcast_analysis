from flask import Blueprint, request, jsonify
from app.models import Episode  # Pastikan model TopEpisode terhubung dengan database Anda
from app import db

episode_routes = Blueprint('episode_routes', __name__, url_prefix='/api/episode')

# * GET episode detail by episode_uri
@episode_routes.route('/<string:episode_uri>', methods=['GET'])
def get_episode_by_uri(episode_uri):
    try:
        episode = Episode.query.filter_by(episode_uri=episode_uri).first()

        if not episode:
            return jsonify({"error": "Episode not found"}), 404

        episode_data = serialize_top_episode(episode)

        return jsonify({'episode': episode_data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def serialize_top_episode(episode):
    """Helper function to serialize podcast object to dictionary."""
    return {
        "episode_uri": episode.episode_uri,
        "episode_name": episode.episode_name,
        "episode_description": episode.episode_description,
        "duration_ms": episode.duration_ms,
        "main_category": episode.main_category,
        "episode_release_date": episode.episode_release_date,
        "podcast_uri": episode.podcast_uri,
        "region_id": episode.region_id
    }
