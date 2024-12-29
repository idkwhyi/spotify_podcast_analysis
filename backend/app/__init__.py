from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqlconnector://root:@localhost:3306/SpotifyPodcast'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app=app)
    migrate.init_app(app, db)
        
    # Creating Models in Database
    with app.app_context():
        from .models import Date, Region, Podcast, Episode
        db.create_all()
        
        
    # Register Blueprint Routes
    from .routes.podcasts.podcasts_routes import podcast_routes
    from .routes.regions.region_routes import region_routes
    
    app.register_blueprint(podcast_routes)
    app.register_blueprint(region_routes)

    return app
