from requests import get, exceptions
import logging
import json
from datetime import datetime, date
import pandas as pd

'''
    THIS CODE IS USED TO GET THE TOP PODCAST PUBLISHER PER DAY IN EACH COUNTRY AVAILABLE
'''

today = datetime.now()

# Format the date as DD_MM_YYYY
formatted_date = today.strftime("%d_%m_%Y")
folder_name = "30_12_2024"

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


def _fetch_podcastchart(chart: str, region: str):
    url = f"https://podcastcharts.byspotify.com/api/charts/{chart}"
    params = {"region": region}
    headers = {"Referer": "https://podcastcharts.byspotify.com/"}
    
    try:
        response = get(url, headers=headers, params=params)
        response.raise_for_status()
        logging.info(f"Fetched _fetch_podcastchart: {region}")
        return response.json()
    except exceptions.RequestException as e:
        logging.error(f"Error fetching data for {region}: {e}")
        return None

        
def get_transformed_podcastchart(data, chart: str = "top_podcasts", region: str = "") -> pd.DataFrame:
    if not data:
        return pd.DataFrame()  # Return empty DataFrame if no data
    
    today = date.today()

    columns = [
        "date", "rank", "region", "chartRankMove", "showUri", "showName", "showDescription"
    ]
    df_result = pd.DataFrame(columns=columns)

    for i, item in enumerate(data):
        row = {
            "date": today,
            "rank": i + 1,
            "region": region,
            "chartRankMove": item["chartRankMove"],
            "showUri": item["showUri"][13:],        # Extract ID from the URI
            "showName": item["showName"],
            "showDescription": item["showDescription"]
        }
        df_result = pd.concat([df_result, pd.DataFrame([row])], ignore_index=True)

    return df_result


# Loop to get top podcast data in each country
for index, market in enumerate(available_markets):
    try:
        # Fetch podcast data
        data = _fetch_podcastchart(chart="top", region=market)
        
        if data:  # Proceed if data is not empty
            # Transform the data into a DataFrame
            transformed_data = get_transformed_podcastchart(data, "top_podcasts", market)
            
            if not transformed_data.empty:
                # Define the JSON and CSV file names
                csv_file_name = f"data/podcast/{folder_name}/TOP_PODCAST_{market}.csv"
                
                # Save the result to a CSV file
                transformed_data.to_csv(csv_file_name, index=False)
                print(f"Data saved to {csv_file_name}")
                
            else:
                print(f"No transformed data for {market}")
        else:
            print(f"Failed to get data from {market}.")
        print('\n')
            
    except Exception as e:
        # Handle any error during the process (network, json, etc.)
        print(f"Error processing market {market}: {e}")
    
    finally:
        # Ensure the loop continues, regardless of errors
        print(f"Progress {index + 1}/{len(available_markets)}")

        
print("I got the Podcasts :D")
