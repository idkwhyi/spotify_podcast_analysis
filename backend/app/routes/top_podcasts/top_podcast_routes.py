from flask import Blueprint, request, jsonify
from app.models import TopPodcast  

top_podcast_routes = Blueprint('top_podcast_routes', __name__, url_prefix='/api/top_podcasts')

# * get all top podcast
@top_podcast_routes.route('/', methods=['GET'])
def get_all_top_podcast():
    try:
        # Query all top episodes from the database
        top_podcasts = TopPodcast.query.order_by(TopPodcast.date_id.desc()).all()
        
        # Serialize each episode using the helper function
        top_podcasts_data = [serialize_top_podcast(podcast) for podcast in top_podcasts]
        
        # Return the serialized data as JSON
        return jsonify({'top_podcast': top_podcasts_data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

def serialize_top_podcast(podcast):
    return {
        "top_podcast_id": podcast.top_podcast_id,
        "rank": podcast.rank,
        "chart_rank_move": podcast.chart_rank_move,
        "date": podcast.date_id,
        "region_id": podcast.region_id,
        "podcast_uri": podcast.podcast_uri
    }