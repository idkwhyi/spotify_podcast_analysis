from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:@localhost:3306/SpotifyPodcast'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app=app)
        
    # Creating Models in Database
    with app.app_context():
        from .models import Date, Region, Podcast, Episode
        db.create_all()
        
    from .routes.podcasts.podcasts_routes import podcast_routes
    
    app.register_blueprint(podcast_routes)

    return app
