"""
    ABOUT:
        This file contain function to get the podcast and episode category(genre) and save it inside a csv file
    
    RESULT:
        Category data
"""

import spacy
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from typing import List, Dict
import joblib

class PodcastCategorizer:
    def __init__(self):
        """Initialize the NLP categorizer with spaCy and sklearn components"""
        # Load spaCy's English language model
        self.nlp = spacy.load('en_core_web_sm')
        
        # Initialize the classification pipeline
        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(
                max_features=5000,
                ngram_range=(1, 2),
                stop_words='english'
            )),
            ('classifier', MultinomialNB())
        ])
        
        self.categories = None
        self.is_trained = False

    def preprocess_text(self, text: str) -> str:
        """
        Preprocess text using spaCy for advanced NLP cleaning
        
        Args:
            text (str): Input text to process
            
        Returns:
            str: Preprocessed text
        """
        # Process text with spaCy
        doc = self.nlp(text.lower())
        
        # Extract tokens, removing stop words, punctuation, and numbers
        tokens = [
            token.lemma_ for token in doc
            if not token.is_stop 
            and not token.is_punct
            and not token.like_num
            and len(token.text) > 2
        ]
        
        return ' '.join(tokens)

    def generate_training_data(self, categories: Dict[str, List[str]], 
                             samples_per_category: int = 20) -> pd.DataFrame:
        """
        Generate training data from category keywords
        
        Args:
            categories (Dict[str, List[str]]): Dictionary of categories and keywords
            samples_per_category (int): Number of training samples per category
            
        Returns:
            pd.DataFrame: Training data with text and category labels
        """
        training_data = []
        
        for category, keywords in categories.items():
            # Generate samples using combinations of keywords
            for _ in range(samples_per_category):
                # Randomly select 2-4 keywords
                num_keywords = min(np.random.randint(2, 5), len(keywords))
                selected_keywords = np.random.choice(keywords, num_keywords, replace=False)
                
                # Create a sample description
                description = ' '.join(selected_keywords)
                processed_description = self.preprocess_text(description)
                
                training_data.append({
                    'text': processed_description,
                    'category': category
                })
        
        return pd.DataFrame(training_data)

    def train(self, categories: Dict[str, List[str]], samples_per_category: int = 20):
        """
        Train the categorizer with generated training data
        
        Args:
            categories (Dict[str, List[str]]): Dictionary of categories and keywords
            samples_per_category (int): Number of training samples per category
        """
        self.categories = categories
        
        # Generate and preprocess training data
        training_df = self.generate_training_data(categories, samples_per_category)
        
        # Train the pipeline
        self.pipeline.fit(training_df['text'], training_df['category'])
        self.is_trained = True

    def predict_category(self, description_text: str) -> Dict[str, float]:
        """
        Predict category for a given text description
        
        Args:
            description_text (str): Text to categorize
            
        Returns:
            Dict[str, float]: Dictionary of category probabilities
        """
        if not self.is_trained:
            raise ValueError("Model needs to be trained first!")
            
        # Preprocess the input text
        processed_text = self.preprocess_text(description_text)
        print("processed_text")
        
        # Get probability predictions for all categories
        probabilities = self.pipeline.predict_proba([processed_text])[0]
        categories = self.pipeline.classes_
        
        # Create dictionary of category probabilities
        category_probs = {
            category: float(prob) 
            for category, prob in zip(categories, probabilities)
        }
        
        return category_probs

    def get_best_category(self, description_text: str, confidence_threshold: float = 0.04) -> List[str]:
        """
        Get the best matching category if it meets the confidence threshold
        
        Args:
            description_text (str): Text to categorize
            confidence_threshold (float): Minimum confidence level required in %
            
        Returns:
            Optional[str]: Best matching category or None if confidence is too low
        """
        category_probs = self.predict_category(description_text)
        
        valid_categories = [
            category for category, prob in category_probs.items() if prob > confidence_threshold
        ]
        return valid_categories if valid_categories else "others"

    def save_model(self, filepath: str):
        """Save the trained model to a file"""
        if not self.is_trained:
            raise ValueError("Model needs to be trained first!")
        joblib.dump(self, filepath)

    @classmethod
    def load_model(cls, filepath: str) -> 'PodcastCategorizer':
        """Load a trained model from a file"""
        return joblib.load(filepath)


# Main Function
def get_category(description: str) -> any:   
    
    categories = {
        "arts and entertainment": ["movies", "theater", "music", "art exhibitions", "celebrities"],
        "books": ["novels", "literature", "biographies", "audiobooks", "bestsellers", "book", "books"],
        "celebrities": ["Hollywood", "pop stars", "scandals", "actors", "red carpet"],
        "comedy": ["stand-up", "satire", "comedians", "humor", "sketch comedy"],
        "design": ["graphic design", "interior design", "UX/UI", "architecture", "fashion design"],
        "fiction": ["mystery", "fantasy", "sci-fi", "thriller", "romance", "myths", "forgotten stories", "strange truths", "UFO"],
        "pop culture": ["trends", "social media", "memes", "fandoms", "viral videos"],
        "stories": ["narratives", "personal experiences", "short stories", "folklore", "drama", "filmmaker", "ask", "moment", "speaker"],
        "tv": ["streaming services", "series", "reality TV", "sitcoms", "dramas"],
        "business": ["entrepreneurship", "startups", "corporate", "management", "business news"],
        "business and technology": ["AI", "blockchain", "startups", "fintech", "innovation"],
        "careers": ["job search", "resumes", "interviews", "networking", "career development"],
        "economics": ["markets", "trade", "GDP", "inflation", "policy"],
        "finance": ["investments", "stocks", "budgeting", "crypto", "personal finance"],
        "marketing": ["advertising", "branding", "SEO", "social media marketing", "campaigns"],
        "technology": ["gadgets", "AI", "software", "hardware", "tech trends"],
        "educational": ["learning", "online courses", "tutorials", "academics", "skill-building", "book", "books"],
        "government": ["policy", "public services", "laws", "elections", "diplomacy"],
        "history": ["ancient civilizations", "wars", "historical figures", "timelines", "archaeology"],
        "language": ["linguistics", "grammar", "language learning", "dialects", "etymology"],
        "philosophy": ["ethics", "logic", "existentialism", "stoicism", "metaphysics"],
        "science": ["biology", "physics", "chemistry", "space", "innovation"],
        "games": ["board games", "puzzles", "card games", "role-playing", "strategy games"],
        "video games": ["esports", "PC games", "console games", "mobile games", "game reviews"],
        "beauty": ["makeup", "skincare", "cosmetics", "hair care", "beauty tips"],
        "fashion": ["clothing", "runways", "streetwear", "designers", "trends"],
        "fitness and nutrition": ["workouts", "diet plans", "wellness", "exercise", "healthy eating"],
        "food": ["recipes", "restaurants", "cuisine", "food reviews", "cooking tips"],
        "health": ["mental health", "physical health", "wellness", "medicine", "fitness"],
        "hobbies": ["crafting", "gardening", "photography", "writing", "collecting"],
        "lifestyle": ["travel", "minimalism", "productivity", "family life", "personal growth"],
        "meditation podcasts": ["mindfulness", "guided meditations", "relaxation", "breathing exercises", "zen"],
        "parenting": ["childcare", "education", "family life", "parenting tips", "motherhood"],
        "relationship": ["dating", "marriage", "communication", "breakups", "love advice"],
        "self-care": ["mental health", "relaxation", "mindfulness", "journaling", "spa days"],
        "sex": ["sexual health", "intimacy", "relationships", "education", "consent"],
        "news and politics": ["current events", "global news", "political analysis", "elections", "policy"],
        "politics": ["government", "policies", "elections", "parties", "debates"],
        "baseball": ["MLB", "world series", "baseball"],
        "basketball": ["NBA", "playoffs", "basketball"],
        "boxing": ["matches", "fighters", "training", "belts", "weight classes"],
        "football": ["NFL", "teams", "players", "stats", "super bowl"],
        "hockey": ["NHL", "teams", "players", "stats", "stanley cup"],
        "MMA": ["UFC", "fighters", "matches", "training", "belts"],
        "outdoor": ["hiking", "camping", "fishing", "adventures", "nature"],
        "rugby": ["teams", "players", "matches", "stats", "world cup"],
        "running": ["marathons", "training", "gear", "trail running", "races"],
        "soccer": ["FIFA", "teams", "players", "stats", "world cup"],
        "sports and recreation": ["sports news", "fitness", "outdoor activities", "leisure", "teams"],
        "tennis": ["grand slams", "players", "matches", "gear", "training"],
        "wrestling": ["WWE", "matches", "wrestlers", "training", "events"],
        "true crime": ["murder mysteries", "investigations", "criminal psychology", "serial killers", "cold cases", "killer", "terrorrist", "dead", "brutally murdered", "murdered", "murder"],
    }

    # Initialize and train the categorizer
    categorizer = PodcastCategorizer()
    print("success initialize categorizer")
    categorizer.train(categories)
    print("success initialize train categorizer")
    
    print("start propbs")
    probs = categorizer.predict_category(description) # Percentage of each categories (All)
    print("probs")
    best_category = categorizer.get_best_category(description) # Highest percentage categories from probs (>1)
    print("best cate")
    
    main_category = max(probs, key=probs.get) # Highest percentage from best_category (1)

    print(f"\nText: {description}")
    print("Main Category: ", {main_category})
    print(f"Best Category: {best_category}")
    print('\n')
    
    returned_data = {
        'main_category': main_category,
        'categories': best_category,
    }
    return returned_data