from app import db
from datetime import datetime

class Date(db.Model):
    __tablename__ = 'date'
    
    date = db.Column(db.Date, primary_key=True)
    
    # Relationships
    podcasts = db.relationship('Podcast', back_populates='date')
    episodes = db.relationship('Episode', back_populates='date')

    @property
    def formatted_date(self):
        return self.date.strftime('%d-%m-%Y')

    @formatted_date.setter
    def formatted_date(self, value):
        self.date = datetime.strptime(value, '%d-%m-%Y').date()

class Region(db.Model):
    __tablename__ = 'region'
    
    region_id = db.Column(db.String(255), primary_key=True)
    region_name = db.Column(db.String(255))
    
    # Relationships
    podcasts = db.relationship('Podcast', back_populates='region')
    episodes = db.relationship('Episode', back_populates='region')

class Podcast(db.Model):
    __tablename__ = 'podcast'

    show_uri = db.Column(db.String(255), primary_key=True)
    rank = db.Column(db.Integer, nullable=False)
    chart_rank_move = db.Column(db.String(255))
    show_name = db.Column(db.String(255), nullable=False)
    show_description = db.Column(db.Text)

    # Foreign keys
    date_id = db.Column(db.Date, db.ForeignKey('date.date'), nullable=False)
    region_id = db.Column(db.String(255), db.ForeignKey('region.region_id'), nullable=False)

    # Relationships
    date = db.relationship('Date', back_populates='podcasts')
    region = db.relationship('Region', back_populates='podcasts')
    episodes = db.relationship('Episode', back_populates='podcast')

class Episode(db.Model):
    __tablename__ = 'episode'

    episode_uri = db.Column(db.String(255), primary_key=True)
    rank = db.Column(db.Integer, nullable=False)
    chart_rank_move = db.Column(db.String(255))
    episode_name = db.Column(db.String(255), nullable=False)
    episode_description = db.Column(db.Text)
    duration_ms = db.Column(db.String(255), nullable=False)
    main_category = db.Column(db.String(255))
    episode_release_date = db.Column(db.Date, nullable=False)

    # Foreign keys
    date_id = db.Column(db.Date, db.ForeignKey('date.date'), nullable=False)
    region_id = db.Column(db.String(255), db.ForeignKey('region.region_id'), nullable=False)
    show_uri = db.Column(db.String(255), db.ForeignKey('podcast.show_uri'), nullable=False)

    # Relationships
    date = db.relationship('Date', back_populates='episodes')
    region = db.relationship('Region', back_populates='episodes')
    podcast = db.relationship('Podcast', back_populates='episodes')
    categories = db.relationship('Category', secondary='episode_categories', back_populates='episodes')

class Category(db.Model):
    __tablename__ = 'category'
    
    category_name = db.Column(db.String(255), primary_key=True)
    
    episodes = db.relationship('Episode', secondary='episode_categories', back_populates='categories')

episode_categories = db.Table(
    'episode_categories',
    db.Column('episode_id', db.String(255), db.ForeignKey('episode.episode_uri'), primary_key=True),
    db.Column('category_id', db.String(255), db.ForeignKey('category.category_name'), primary_key=True)
)