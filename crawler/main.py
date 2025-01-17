from datetime import datetime, date
from podcast.get_podcast_data import get_podcast_data
from episode.get_episode_data import get_episode_data
from category.get_category import get_category 
import os
from region import regions
import pandas as pd

def main():
    today = datetime.today()
    formatted_date = today.strftime("%d_%m_%Y") # date used for the file name
    date_used = date.today() # date
    print("Today: ", formatted_date) # File Name

    podcast_target_directory = os.path.expanduser("~/Desktop/saved_data/podcasts")
    episode_target_directory = os.path.expanduser("~/Desktop/saved_data/episode")
    # # Get podcast data and save it to the dir
    get_podcast_data(regions=regions, date_used=date_used, file_name=formatted_date, dir=podcast_target_directory)
    get_episode_data(regions=regions, date_used=date_used, file_name=formatted_date, dir=episode_target_directory)
    
    
    #! Get Category from episode data
    category_target_dictionary = os.path.expanduser(f"~/Desktop/saved_data/episode/US/{formatted_date}")
    category_target_csv = f"{category_target_dictionary}.csv"

    df = pd.read_csv(category_target_csv)
    
    main_categories = []
    related_categories = []
    
    
    for desc in df["episodeDescription"]:
        result = get_category(description=desc)
        main_categories.append(result['main_category'])
        
        categories = result['categories']
        if categories == 'others':
            related_categories.append('others')
        else:
            related_categories.append(', '.join(categories))
        
    df['mainCategory'] = main_categories
    df['relatedCategories'] = related_categories
    
    print("Done get categories :D", formatted_date)
    df.to_csv(category_target_csv, index=False)



if __name__ == "__main__":
    main()