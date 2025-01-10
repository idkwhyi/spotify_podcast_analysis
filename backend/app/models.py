from app import db
from datetime import datetime
from uuid6 import uuid6

class Date(db.Model):
    __tablename__ = 'date'

    date = db.Column(db.Date, primary_key=True)

    # Relationships
    top_podcasts = db.relationship('TopPodcast', back_populates='date')
    top_episodes = db.relationship('TopEpisode', back_populates='date')

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
    top_podcasts = db.relationship('TopPodcast', back_populates='region')
    top_episodes = db.relationship('TopEpisode', back_populates='region')
    podcasts = db.relationship('Podcast', back_populates='region')
    episodes = db.relationship('Episode', back_populates='region')

class Podcast(db.Model):
    __tablename__ = 'podcast'

    podcast_uri = db.Column(db.String(255), primary_key=True)
    podcast_name = db.Column(db.String(255), nullable=False)
    podcast_description = db.Column(db.Text)
    
    # Foreign keys
    region_id = db.Column(db.String(255), db.ForeignKey('region.region_id'), nullable=False)


    # Relationships
    episodes = db.relationship('Episode', back_populates='podcast')
    region = db.relationship('Region', back_populates='podcasts')

class Episode(db.Model):
    __tablename__ = 'episode'

    episode_uri = db.Column(db.String(255), primary_key=True)
    episode_name = db.Column(db.String(255), nullable=False)
    episode_description = db.Column(db.Text)
    duration_ms = db.Column(db.String(255), nullable=False)
    main_category = db.Column(db.String(255))
    episode_release_date = db.Column(db.Date, nullable=False)

    # Foreign keys
    podcast_uri = db.Column(db.String(255), db.ForeignKey('podcast.podcast_uri'), nullable=False)
    region_id = db.Column(db.String(255), db.ForeignKey('region.region_id'), nullable=False)
    
    # Relationships
    podcast = db.relationship('Podcast', back_populates='episodes')
    categories = db.relationship('Category', secondary='episode_categories', back_populates='episodes')
    region = db.relationship('Region', back_populates='episodes')

class TopPodcast(db.Model):
    __tablename__ = 'top_podcasts'

    top_podcast_id = db.Column(db.String(255), primary_key=True, default=lambda: str(uuid6()))
    rank = db.Column(db.Integer, nullable=False)
    chart_rank_move = db.Column(db.String(255))

    # Foreign keys
    date_id = db.Column(db.Date, db.ForeignKey('date.date'), nullable=False)  # Rename the column
    region_id = db.Column(db.String(255), db.ForeignKey('region.region_id'), nullable=False)
    podcast_uri = db.Column(db.String(255), db.ForeignKey('podcast.podcast_uri'), nullable=False)

    # Relationships
    date = db.relationship('Date', back_populates='top_podcasts')  # Keep the relationship name
    region = db.relationship('Region', back_populates='top_podcasts')

    # Unique constraint
    __table_args__ = (
        db.UniqueConstraint('date_id', 'region_id', 'podcast_uri', name='uq_top_podcast'),
    )

class TopEpisode(db.Model):
    __tablename__ = 'top_episodes'

    top_episode_id = db.Column(db.String(255), primary_key=True, default=lambda: str(uuid6()))
    rank = db.Column(db.Integer, nullable=False)
    chart_rank_move = db.Column(db.String(255))

    # Foreign keys
    date_id = db.Column(db.Date, db.ForeignKey('date.date'), nullable=False)  # Rename the column
    region_id = db.Column(db.String(255), db.ForeignKey('region.region_id'), nullable=False)
    episode_uri = db.Column(db.String(255), db.ForeignKey('episode.episode_uri'), nullable=False)

    # Relationships
    date = db.relationship('Date', back_populates='top_episodes')  # Keep the relationship name
    region = db.relationship('Region', back_populates='top_episodes')

    # Unique constraint
    __table_args__ = (
        db.UniqueConstraint('date_id', 'region_id', 'episode_uri', name='uq_top_episode'),
    )

class Category(db.Model):
    __tablename__ = 'categories'

    category_name = db.Column(db.String(255), primary_key=True)

    # Relationships
    episodes = db.relationship('Episode', secondary='episode_categories', back_populates='categories')


episode_categories = db.Table(
    'episode_categories',
    db.Column('episode_id', db.String(255), db.ForeignKey('episode.episode_uri'), primary_key=True),
    db.Column('category_id', db.String(255), db.ForeignKey('categories.category_name'), primary_key=True)
)
