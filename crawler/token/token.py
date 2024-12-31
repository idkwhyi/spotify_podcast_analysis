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
        print(f"Access Token: {access_token}")
    else:
        print(f"Failed to get access token. Status code: {response.status_code}")
        print(response.text)
        
    return access_token