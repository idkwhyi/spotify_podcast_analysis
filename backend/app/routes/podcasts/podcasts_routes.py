from flask import Blueprint, request, jsonify
from app.models import db, Podcast  # Use relative import

podcast_routes = Blueprint('podcast_routes', __name__, url_prefix='/api/podcasts')

# * GET ROUTES
@podcast_routes.route('/', methods=['GET'])
def get_podcasts():
    try:
        # Get query parameters
        filters = {
            'region': request.args.get('region'),
            'date': request.args.get('date'),
            'rank': request.args.get('rank')
        }
        
        # Build query dynamically
        query = Podcast.query
        
        # Apply only non-None filters
        for key, value in filters.items():
            if value is not None:
                query = query.filter_by(**{key: value})
                
        # Execute query
        podcasts = query.all()
        
        # Serialize response using a helper method
        return jsonify({
            "podcasts": [serialize_podcast(podcast) for podcast in podcasts]
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# * GET PODCAST DATA BY SHOWURI
@podcast_routes.route('/<showURI>', methods=['GET'])
def get_podcast(showURI):
    '''Get podcast detail by showURI'''
    try:
        podcast = Podcast.query.get_or_404(showURI)
        return jsonify(serialize_podcast(podcast)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
  

@podcast_routes.route('/', methods=['POST'])
def add_podcast():
    '''Add a new podcast data to database'''
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = [
            'showURI', 'showName', 'showDescription',
            'rank', 'chartRankMove', 'date', 'region'
        ]
        
        if missing_fields := [
            field for field in required_fields 
            if not data.get(field)
        ]:
            return jsonify({
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400
            
        # Create a new Podcast object
        new_podcast = Podcast(**{
            field: data[field] for field in required_fields
        })
        
        # Add to database session
        db.session.add(new_podcast)
        db.session.commit()
        
        return jsonify({
            "message": "Podcast added successfully",
            "podcast": serialize_podcast(new_podcast)
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500



def serialize_podcast(podcast):
    """Helper function to serialize podcast object to dictionary."""
    return {
        "showURI": podcast.showURI,
        "showName": podcast.showName,
        "showDescription": podcast.showDescription,
        "rank": podcast.rank,
        "chartRankMove": podcast.chartRankMove,
        "date": podcast.date,
        "region": podcast.region,
    }