from flask import Blueprint, request, jsonify
from app.models import db, Podcast 

podcast_routes = Blueprint('podcast_routes', __name__, url_prefix='/api/podcast')

@podcast_routes.route('/<string:podcast_uri>', methods=['GET'])
def get_podcast_by_uri(podcast_uri):
    try:
        podcast = Podcast.query.filter_by(podcast_uri=podcast_uri).first()
        
        if not podcast:
            return jsonify({"error": "Podcast not found"}), 404

        podcast_data = serialize_podcast(podcast)

        return jsonify({'podcast': podcast_data}), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def serialize_podcast(podcast):
    """Helper function to serialize podcast object to dictionary."""
    return {
        "podcast_uri": podcast.podcast_uri,
        "podcast_name": podcast.podcast_name,
        "podcast_description": podcast.podcast_description,
        "region_id": podcast.region_id,
    }
    
    

