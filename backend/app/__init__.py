from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv
import os

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    CORS(app)
    
    # Database configuration from environment variables
    DB_USER = os.getenv('DB_USER')
    DB_PASSWORD = os.getenv('DB_PASSWORD')
    DB_HOST = os.getenv('DB_HOST')
    DB_NAME = os.getenv('DB_NAME')
    DB_PORT = os.getenv('DB_PORT')
    
    # SQLAlchemy configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app=app)
    migrate.init_app(app, db)
        
    # Creating Models in Database
    with app.app_context():
        from .models import Date, Region, Podcast, Episode, Category, episode_categories
        db.create_all()
        
        
    # # Register Blueprint Routes
    # from .routes.podcasts.podcasts_routes import podcast_routes
    # from .routes.regions.region_routes import region_routes
    
    # app.register_blueprint(podcast_routes)
    # app.register_blueprint(region_routes)

    return app
