
## Please Follow this Instruction to Run the Crawler

1. **Create virtual environment on the spotify_podcast_analysis**
   ```bash
     python -m venv venv  # Creates a virtual environment named 'venv'
   ```

  - To activate the Virtual Environment use this code
  ```bash
    source venv/bin/activate
  ```

  - To deactivate the Virtual Environment use this code
  ```bash
    deactivate
  ```

2. **Installing required libraries **
   from requirements.txt install the libraries using this code below in the crawler directory

  ```bash
    pip install -r requirements.txt
  ```

3. ** Running the File **
  3.1. main.py
  Run this code to get spotify data and save it to CSV
  3.2. pushDb.py
  Run this code to push spotify data to database
