import pandas as pd
import mysql.connector
from mysql.connector import Error
from datetime import datetime
from dotenv import load_dotenv
import os
import logging
import requests
from base64 import b64encode

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Step 1: Connect to MySQL database
def connect_to_database():
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            database=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD')  
        )
        if connection.is_connected():
            logging.info("Connected to MySQL database")
            return connection
    except Error as e:
        logging.error(f"Database connection failed: {e}")
        return None

# Helper function to execute queries with error handling
def execute_query(cursor, query, params):
    try:
        cursor.execute(query, params)
    except Error as e:
        logging.error(f"Query failed: {query} | Params: {params} | Error: {e}")

# Function to get region by region_id
def get_region_name(region_id):
    region = {
        'AR': 'argentina',
        'AU': 'australia',
        'AT': 'austria',
        'BR': 'brazil',
        'CA': 'canada',
        'CL': 'chile',
        'CO':'colombia',
        'FR':'france',
        'DE':'germany',
        'IN':'india',
        'ID':'indonesia',
        'IE':'ireland',
        'IT':'italy',
        'JP':'japan', 
        'MX':'mexico',
        'NZ':'new zealand',
        'PH':'philippines',
        'PH':'poland',
        'ES':'spain',
        'NL':'netherlands',
        'GB':'united kingdom',
        'US':'united states',
    }
    return region.get(region_id, "Region not found")

# Step 2: Insert podcast data
def insert_podcast_data(connection, csv_file_path):
    cursor = connection.cursor()
    data = pd.read_csv(csv_file_path)

    for _, row in data.iterrows():
        # Validate required fields
        if pd.isna(row['date']) or pd.isna(row['region']) or pd.isna(row['showUri']) or pd.isna(row['showName']):
            logging.warning(f"Skipping invalid row: {row}")
            continue

        try:
            # Insert or update Date table
            insert_date_query = """
                INSERT INTO date (date) VALUES (%s) ON DUPLICATE KEY UPDATE date=%s
            """
            formatted_date = datetime.strptime(row['date'], '%Y-%m-%d').date()
            execute_query(cursor, insert_date_query, (formatted_date, formatted_date))

            # Insert or update Region table
            region_name = get_region_name(row['region'])  # get region name
            insert_region_query = """
                INSERT INTO region (region_id, region_name) VALUES (%s, %s) 
                ON DUPLICATE KEY UPDATE region_name=%s
            """
            execute_query(cursor, insert_region_query, (row['region'], region_name, region_name))

            # Insert or update Podcast table
            insert_podcast_query = """
                INSERT INTO podcast (podcast_uri, podcast_name, podcast_description, region_id)
                VALUES (%s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    podcast_name = VALUES(podcast_name),
                    podcast_description = VALUES(podcast_description)
            """
            execute_query(cursor, insert_podcast_query, (
                row['showUri'], row['showName'], row['showDescription'], row['region']
            ))

            # Insert into Top Podcasts table
            insert_top_podcast_query = """
                INSERT INTO top_podcasts (top_podcast_id, rank, chart_rank_move, date_id, region_id, podcast_uri)
                VALUES (UUID(), %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE rank=%s, chart_rank_move=%s
            """
            execute_query(cursor, insert_top_podcast_query, (
                row['rank'], row['chartRankMove'], row['date'], row['region'], row['showUri'],
                row['rank'], row['chartRankMove']
            ))

        except Exception as e:
            logging.error(f"Error processing row: {row} | Error: {e}")

    connection.commit()
    logging.info("Podcast data inserted successfully!")

# Get access token
def get_token():
    CLIENT_ID = 'd95816bc075d4776bddbe0c58285c523'
    CLIENT_SECRET = 'dac5e4d615204fd79fb860d22db2ec37'

    # Prepare the headers for the request
    auth_string = f"{CLIENT_ID}:{CLIENT_SECRET}"
    encoded_auth_string = b64encode(auth_string.encode('utf-8')).decode('utf-8')

    headers = {
        "Authorization": f"Basic {encoded_auth_string}",
        "Content-Type": "application/x-www-form-urlencoded"
    }

    # Data to be sent in the request body
    data = {
        "grant_type": "client_credentials"
    }

    # Send the request to Spotify API
    response = requests.post("https://accounts.spotify.com/api/token", headers=headers, data=data)

    # Check if the request was successful
    if response.status_code == 200:
        access_token = response.json()['access_token']
    else:
        print(f"Failed to get access token. Status code: {response.status_code}")
        
    return access_token

# Function to get podcast name, podcast description, podcast region
def get_podcast_details(show_uri):
    access_token = get_token()  # Ensure the function is called to get the token
    
    url = f"https://api.spotify.com/v1/shows/{show_uri}"
    headers = {
        'Authorization': f'Bearer {access_token}',
    }
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        podcast_data = response.json()
        podcast_name = podcast_data['name']
        podcast_description = podcast_data['description']
        podcast_region = podcast_data.get('country', 'Unknown')
        
        return {
            'podcast_name': podcast_name,
            'podcast_description': podcast_description,
        }
    else:
        print(f"Error fetching data: {response.status_code}")
        return None

# Function untuk mengecek apakah podcast ada atau tidak
def podcast_exists(cursor, podcast_uri):
    """Check if a podcast exists in the database."""
    query = "SELECT COUNT(*) FROM podcast WHERE podcast_uri = %s"
    cursor.execute(query, (podcast_uri,))
    return cursor.fetchone()[0] > 0

# Step 3: Insert episode data
def insert_episode_data(connection, csv_file_path):
    cursor = connection.cursor()
    data = pd.read_csv(csv_file_path)

    for _, row in data.iterrows():
        if pd.isna(row['date']) or pd.isna(row['region']) or pd.isna(row['episodeUri']):
            logging.warning(f"Skipping invalid row: {row}")
            continue

        try:
            # Insert or update Date table
            insert_date_query = """
                INSERT INTO date (date) VALUES (%s) ON DUPLICATE KEY UPDATE date=%s
            """
            formatted_date = datetime.strptime(row['date'], '%Y-%m-%d').date()
            execute_query(cursor, insert_date_query, (formatted_date, formatted_date))
            
            # Insert or update Region table
            region_name = get_region_name(row['region'])  # get region name
            insert_region_query = """
                INSERT INTO region (region_id, region_name) VALUES (%s, %s) 
                ON DUPLICATE KEY UPDATE region_name=%s
            """
            execute_query(cursor, insert_region_query, (row['region'], region_name, region_name))

            #! Check if podcast exists
            if not podcast_exists(cursor, row['showUri']):
                podcast_uri = row['showUri']
                podcast_data = get_podcast_details(podcast_uri)
                
                logging.info(f"PODCAST NOT FOUND {row['episodeName']} {row['rank']} {row['showUri']}.\n Inserting new podcast.")
                
                insert_podcast_query = """
                    INSERT INTO podcast (podcast_uri, podcast_name, podcast_description, region_id)
                    VALUES (%s, %s, %s, %s)
                """
                
                execute_query(cursor, insert_podcast_query, (
                    row['showUri'], podcast_data['podcast_name'], podcast_data['podcast_description'], row['region']
                ))

            # Insert or update Episode table
            insert_episode_query = """
                INSERT INTO episode (
                    episode_uri, episode_name, episode_description, duration_ms, main_category,
                    episode_release_date, podcast_uri, region_id
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE episode_name=%s, episode_description=%s
            """
            release_date = datetime.strptime(row['episodeReleaseDate'], '%Y-%m-%d').date()
            execute_query(cursor, insert_episode_query, (
                row['episodeUri'], row['episodeName'], row['episodeDescription'], row['episodeDurationMs'],
                row['mainCategory'], release_date, row['showUri'], row['region'],
                row['episodeName'], row['episodeDescription']
            ))
            

            # Insert categories
            categories = [row['mainCategory']] if pd.notna(row['mainCategory']) else []
            if pd.notna(row['relatedCategories']):
                categories.extend([cat.strip() for cat in row['relatedCategories'].split(',')])

            for category in categories:
                insert_category_query = """
                    INSERT INTO categories (category_name) VALUES (%s) 
                    ON DUPLICATE KEY UPDATE category_name=%s
                """
                execute_query(cursor, insert_category_query, (category, category))

                insert_episode_category_query = """
                    INSERT INTO episode_categories (episode_id, category_id) VALUES (%s, %s)
                    ON DUPLICATE KEY UPDATE episode_id=%s, category_id=%s
                """
                execute_query(cursor, insert_episode_category_query, (
                    row['episodeUri'], category, row['episodeUri'], category
                ))


            # Insert into Top Episodes table
            insert_top_episode_query = """
                INSERT INTO top_episodes (top_episode_id, rank, chart_rank_move, date_id, region_id, episode_uri)
                VALUES (UUID(), %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE rank=%s, chart_rank_move=%s
            """
            execute_query(cursor, insert_top_episode_query, (
                row['rank'], row['chartRankMove'], row['date'], row['region'], row['episodeUri'],
                row['rank'], row['chartRankMove']
            ))

        except Exception as e:
            logging.error(f"Error processing row: {row} | Error: {e}")

    connection.commit()
    logging.info("Episode data inserted successfully!")
  
# * Main Program
if __name__ == "__main__":
    today = datetime.today()
    formatted_date = today.strftime("%d_%m_%Y") # date used for the file name


    podcast_csv_file_path = f"~/Desktop/saved_data/podcasts/US/{formatted_date}.csv"
    episode_csv_file_path = f"~/Desktop/saved_data/episode/US/{formatted_date}.csv"

    connection = connect_to_database()
    
    if connection:
        try:
            insert_podcast_data(connection, podcast_csv_file_path)
            insert_episode_data(connection, episode_csv_file_path)
        finally:
            connection.close()
