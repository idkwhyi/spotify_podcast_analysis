import pandas as pd
import mysql.connector
from mysql.connector import Error

# Step 1: Connect to MySQL database
def connect_to_database():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='your_database_name',
            user='root',
            password=''
        )
        if connection.is_connected():
            print("Connected to MySQL database")
            return connection
    except Error as e:
        print(f"Error: {e}")
        return None

# Step 2: Insert data into tables
def insert_data_from_csv(connection, csv_file_path):
    cursor = connection.cursor()
    
    # Read the CSV file
    data = pd.read_csv(csv_file_path)
    
    # Loop through each row in the CSV
    for index, row in data.iterrows():
        # Insert into Podcasts table
        insert_podcasts_query = """
            INSERT INTO Podcasts (show_uri, rank, chart_rank_move, show_name, show_description, date, region_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE rank=%s, chart_rank_move=%s, show_name=%s, show_description=%s
        """
        cursor.execute(insert_podcasts_query, (
            row['show_uri'], row['rank'], row['chart_rank_move'], row['show_name'], 
            row['show_description'], row['date'], row['region_id'],
            row['rank'], row['chart_rank_move'], row['show_name'], row['show_description']
        ))

        # Insert into Episodes table
        insert_episodes_query = """
            INSERT INTO Episodes (episode_uri, rank, chart_rank_move, episode_name, episode_description, duration_ms, mainCategory, episode_release_date, date, show_uri, region)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE rank=%s, chart_rank_move=%s, episode_name=%s, episode_description=%s
        """
        cursor.execute(insert_episodes_query, (
            row['episode_uri'], row['rank'], row['chart_rank_move'], row['episode_name'], 
            row['episode_description'], row['duration_ms'], row['mainCategory'], row['episode_release_date'], 
            row['date'], row['show_uri'], row['region'],
            row['rank'], row['chart_rank_move'], row['episode_name'], row['episode_description']
        ))
    
    # Commit the transaction
    connection.commit()
    print("Data inserted successfully!")

# Main function
if __name__ == "__main__":
    csv_file_path = 'path_to_your_csv_file.csv'  # Change this to your CSV file path
    connection = connect_to_database()
    
    if connection:
        insert_data_from_csv(connection, csv_file_path)
        connection.close()
