from app import db
from datetime import datetime

class Date(db.Model):
    __tablename__ = 'date'

    date = db.Column(db.Date, primary_key=True)  

    # Relationships
    podcasts = db.relationship('Podcast', back_populates='date_relation', lazy=True)
    episodes = db.relationship('Episode', back_populates='date_relation', lazy=True)

    @property
    def formatted_date(self):
        """Return date in DD-MM-YYYY format."""
        return self.date.strftime('%d-%m-%Y')

    @formatted_date.setter
    def formatted_date(self, value):
        """Accept date in DD-MM-YYYY format and convert to Date object."""
        self.date = datetime.strptime(value, '%d-%m-%Y').date()

    def __repr__(self):
        return f"<Date(date={self.formatted_date})>"

class Region(db.Model):
    __tablename__ = 'region'
    
    region = db.Column(db.String(255), primary_key=True)
    regionDetail = db.Column(db.String(255))
    
    podcasts = db.relationship('Podcast', back_populates='region_relation', lazy=True)
    episodes = db.relationship('Episode', back_populates='region_relation', lazy=True)
    

class Podcast(db.Model):
    __tablename__ = 'podcast'

    showURI = db.Column(db.String(255), primary_key=True)
    rank = db.Column(db.Integer, nullable=False)
    chartRankMove = db.Column(db.String(255))
    showName = db.Column(db.String(255), nullable=False)
    showDescription = db.Column(db.Text)

    # Foreign keys
    date = db.Column(db.Date, db.ForeignKey('date.date'), nullable=False)
    region = db.Column(db.String(50), db.ForeignKey('region.region'), nullable=False)

    # Relationships
    date_relation = db.relationship('Date', back_populates='podcasts')
    region_relation = db.relationship('Region', back_populates='podcasts')
    episodes = db.relationship('Episode', back_populates='podcast_relation', lazy=True)

    def __repr__(self):
        return f"<Podcast(showURI={self.showURI}, showName={self.showName})>"


class Episode(db.Model):
    __tablename__ = 'episode'

    episodeURI = db.Column(db.String(255), primary_key=True)
    rank = db.Column(db.Integer, nullable=False)
    chartRankMove = db.Column(db.String(255))
    episodeName = db.Column(db.String(255), nullable=False)
    episodeDescription = db.Column(db.String(255))
    duration = db.Column(db.String(255))

    # Foreign keys
    date = db.Column(db.Date, db.ForeignKey('date.date'), nullable=False)
    region = db.Column(db.String(50), db.ForeignKey('region.region'), nullable=False)
    showURI = db.Column(db.String(255), db.ForeignKey('podcast.showURI'), nullable=False)

    # Relationships
    date_relation = db.relationship('Date', back_populates='episodes')
    region_relation = db.relationship('Region', back_populates='episodes')
    podcast_relation = db.relationship('Podcast', back_populates='episodes')

    def __repr__(self):
        return f"<Episode(episodeURI={self.episodeURI}, episodeName={self.episodeName})>"
