from requests import get, exceptions
import logging
from datetime import date
import pandas as pd
import os

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
       
def get_transformed_podcastchart(data, date_used, chart: str = "top_podcasts", region: str = "") -> pd.DataFrame:
    if not data:
        return pd.DataFrame()  # Return empty DataFrame if no data
    
    columns = [
        "date", "rank", "region", "chartRankMove", "showUri", "showName", "showDescription"
    ]
    df_result = pd.DataFrame(columns=columns)

    for i, item in enumerate(data):
        row = {
            "date": date_used,
            "rank": i + 1,
            "region": region,
            "chartRankMove": item["chartRankMove"],
            "showUri": item["showUri"][13:],        # Extract ID from the URI
            "showName": item["showName"],
            "showDescription": item["showDescription"]
        }
        df_result = pd.concat([df_result, pd.DataFrame([row])], ignore_index=True)

    return df_result


'''
    get_podcast_data()
    
    Params
        regions: Available regions list
        file_name: File name as a date (30_12_2024)
'''

def get_podcast_data(regions: list[str], file_name: str, dir: str, date_used):        
    for index, market in enumerate(regions):
        try:
            # Fetch podcast data
            data = _fetch_podcastchart(chart="top", region=market)
            
            if data:  # Proceed if data is not empty
                # Transform the data into a DataFrame
                transformed_data = get_transformed_podcastchart(data, date_used, "top_podcasts", market)
                
                if not transformed_data.empty:    
                    directory = f"{dir}/{market}/"
                    csv_file_name = os.path.join(os.path.expanduser("~"), directory, f"{file_name}.csv")
                    
                    # Ensure the directory exists
                    os.makedirs(directory, exist_ok=True)

                    # Save the DataFrame to a CSV file
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
            print(f"Progress {index + 1}/{len(regions)}")

            
    print("Podcast Data Retrieved \n")