'''
    alur:
        get episode data 
        get podcast data
        
    requirements: 
        date.now that have been formatted
        
    utility:
        automatically create the directory
        
        
'''

from datetime import datetime, date
from podcast.get_podcast_data import get_podcast_data
from episode.get_episode_data import get_episode_data
import os
from region import regions

def main():
    today = datetime.today()
    formatted_date = today.strftime("%d_%m_%Y")
    date_used = date.today() # date used
    print("Today: ", formatted_date)

    podcast_target_directory = os.path.expanduser("~/Desktop/saved_data/podcasts")
    episode_target_directory = os.path.expanduser("~/Desktop/saved_data/episode")

    # Get podcast data and save it to the dir
    get_podcast_data(regions=regions, date_used=date_used, file_name=formatted_date, dir=podcast_target_directory)
    get_episode_data(regions=regions, file_name=formatted_date, dir=episode_target_directory)

if __name__ == "__main__":
    main()