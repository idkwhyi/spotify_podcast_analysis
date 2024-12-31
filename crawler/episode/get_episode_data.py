import os
from requests import get, exceptions
import logging
import json
from datetime import datetime, date
import pandas as pd

'''
    THIS FILE IS USED TO GET THE TOP PODCAST PER DAY IN EACH COUNTRY AVAILABLE
'''

today = datetime.now()
date_column = today.strftime("%Y-%m-%d")

# Format the date as DD_MM_YYYY
formatted_date = today.strftime("%d_%m_%Y")
data_date = f'{formatted_date[:2]}_12_2024' # Folder name

# ALL COUNTRY
available_markets = [
        "AR",
        "AU",
        "AT",
        "BR", 
        "CA",
        "CL",
        "CO",
        "FR",
        "DE",
        "IN",
        "ID",
        "IE",
        "IT",
        "JP",
        "MX",
        "NZ",
        "PH",
        "PL",
        "ES",
        "NL",
        "GB",
        "US",        
    ]
market_length = len(available_markets)


import requests
from base64 import b64encode



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


def _get_auth_header() -> dict:
    return {"Authorization": "Bearer " + get_token()}

"""
    Get Podcast data from podcastcharts api
    
    Args:
        chart (string): type of the chart data
        region (string): region of the podcast
    
    Returns:
        JSON: podcasts data
"""
def _fetch_podcastchart(chart: str, region: str):
    url = f"https://podcastcharts.byspotify.com/api/charts/{chart}"
    params = {"region": region}
    headers = {"Referer": "https://podcastcharts.byspotify.com/"}
    
    try:
        response = get(url, headers=headers, params=params)
        response.raise_for_status()
        logging.info(f"Fetched _fetch_podcastchart: {region}")
        return response.json()  # Call .json() here
    except exceptions.RequestException as e:
        logging.error(f"Error _fetch_podcastchart - fetching data for {region}: {e}")
        return None
    
    
def _fetch_episodes(episode_ids: str, region: str = 'us'):    
    url = "https://api.spotify.com/v1/episodes"
    query = f"?ids={episode_ids}&market={region}"
    url_query = url + query
    headers = _get_auth_header()

    try:
        response = get(url_query, headers=headers)
        response.raise_for_status()
        logging.info(f"Fetched _fetch_episodes: episodes batch in {region}")
        return response.json()
    except exceptions.RequestException as e:
        logging.error(f"Error fetching data for batch in {region}: {e}")
        return None
        
# * Enrich data
def get_transformed_podcastchart(data, chart: str = "top_episodes", region: str = "") -> pd.DataFrame:
    if not data:
        return pd.DataFrame() 
    
    today = date.today()

    columns = [
        "date", "rank", "region", "chartRankMove", "episodeUri", "showUri", "episodeName"
    ]
    df_result = pd.DataFrame(columns=columns)

    for i, item in enumerate(data):
        row = {
            "date": formatted_date,
            "rank": i + 1,
            "region": region,
            "chartRankMove": item["chartRankMove"],
            "episodeUri": item["episodeUri"][16:],  # Extract ID from the URI
            "showUri": item["showUri"][13:],        # Extract ID from the URI
            "episodeName": item["episodeName"]
        }
        df_result = pd.concat([df_result, pd.DataFrame([row])], ignore_index=True)

    return df_result


'''
    Enrich data - Function to get episode description and duration
    
    @Args
        data (JSON): data from the previous process 
        chart (string): type of the chart data
        region (string): target region
        
    @Returns
        Dataframe that contain all columns defined in this function
    
'''
 
def get_transformed_search_eps(data, **kwargs: str) -> pd.DataFrame:
    chart = kwargs.get('chart', '')
    region = kwargs.get('region', '')
        
    if chart and region:
        if not isinstance(data, list):
            raise ValueError(f"Unexpected data format: {type(data)}")
        
        episodeUris_list = []
        chartRankMoves_list = []
        for item in data:
            if isinstance(item, dict) and 'episodeUri' in item:
                date_col = item['date']
                # The episodeUri is already in the correct format from get_transformed_podcastchart
                episode_id = item['episodeUri']
                # chartRankMoves[episode_id] = item['chartRankMove']
                chartRankMove = item['chartRankMove']
                
                if episode_id:  # Make sure it's not empty
                    episodeUris_list.append(episode_id)
                if chartRankMove:
                    chartRankMoves_list.append(chartRankMove)
                    
    elif "chart_file" in kwargs:
        episodeUris_list = kwargs.get("episodeUris_list", [])
    else:
        raise ValueError(f"get_transformed_search_eps has no valid inputs in kwargs: {kwargs}")
    
    if not episodeUris_list:
        raise ValueError("Episode URIs list is empty or invalid.")
    
    try:
        columns = ['date', 'rank', 'region', 'chartRankMove', 'episodeUri', 
                   'showUri', 'episodeName', 'episodeDescription', 'episodeDurationMs', 'episodeReleaseDate']
        df_result = pd.DataFrame(columns=columns)

        # Process episodes in batches of 50
        for i in range(0, len(episodeUris_list), 50):
            batch = episodeUris_list[i:i + 50]
            
            # Join the IDs with commas
            episode_ids_str = ','.join(batch)
                        
            # Fetch the episodes data
            search_json = _fetch_episodes(episode_ids_str, region)
            
            if not search_json or not isinstance(search_json, dict) or 'episodes' not in search_json:
                logging.warning(f"No episodes found in batch starting at index {i}. Skipping this batch.")
                continue
            
            for idx, episode in enumerate(search_json.get('episodes', []), start=i):
                if not isinstance(episode, dict) or 'id' not in episode:
                    logging.warning(f"Invalid episode data in batch starting at index {i}. Skipping.")
                    continue
                
                episodeUri = episode.get("uri")
                if episodeUri:
                    episodeUri = episodeUri[16:]

                showUri = episode.get("show", {}).get("uri")
                if showUri:
                    showUri = showUri[13:]
                

                data = {
                    "date": date_col,
                    "rank": idx + 1,
                    "region": region,
                    "chartRankMove": chartRankMoves_list[idx],
                    "episodeUri": episodeUri,
                    "showUri": showUri,
                    "episodeName": episode.get("name"),
                    "episodeDescription": episode.get("description"),
                    "episodeDurationMs": episode.get("duration_ms"),
                    "episodeReleaseDate": episode.get("release_date"),
                }
                df_result = pd.concat([df_result, pd.DataFrame([data])], ignore_index=True)

        return df_result
    except Exception as e:
        print(f"Exception in get_transformed_search_eps: {e}")
        logging.error(f"Error in get_transformed_search_eps with {region}: {e}")
        raise


# Loop to get top podcast data in each country
for index, market in enumerate(available_markets):
    # Modified code
    try:
        # Fetch podcast data
        data = _fetch_podcastchart(chart="top_episodes", region=market)
        
        if data:  # Proceed if data is not empty
            transformed_data = get_transformed_podcastchart(data, "top_episodes", market)
            enriched_data = get_transformed_search_eps(data=transformed_data.to_dict(orient="records"), chart="top_episodes", region=market)
            
            if not enriched_data.empty:
                # Create a directory called 'output' in the current directory
                directory = f"ENHANCE/episode/{data_date}"
                os.makedirs(directory, exist_ok=True)

                # Define the JSON file path inside the output directory
                json_file_name = os.path.join(directory, f"TEST_WORK1_{market}.json")
                
                enriched_json = enriched_data.to_dict(orient="records")

                # Save the result to a new JSON file
                # with open(json_file_name, "w", encoding="utf-8") as json_file:
                #     json.dump(enriched_json, json_file, ensure_ascii=False, indent=4)
                # print(f"Data saved to {json_file_name}")

                # Save the result to a CSV format
                csv_file_name = os.path.join(directory, f"TOP_EPISODE_{market}.csv")
                enriched_data.to_csv(csv_file_name, index=False)
                print(f"Data saved to {csv_file_name}")
            else:
                print(f"No transformed data for {market}")
        else:
            print(f"Failed to get data from {market}.")

    except Exception as e:
        print(f"Error processing market {market}: {e}")

    finally:
        print(f"Progress {index + 1}/{len(available_markets)}")

        
print("I got the Episodes :D")