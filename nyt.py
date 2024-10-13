import requests
import os
from PIL import Image
from io import BytesIO

# Your API Key from NY Times
api_key = 'API'

# Make a request to the New York Times Top Stories API
url = f'https://api.nytimes.com/svc/topstories/v2/home.json?api-key={api_key}'
response = requests.get(url)

if response.status_code == 200:
    data = response.json()
    
    # Create a directory for the images
    if not os.path.exists('top_stories_images'):
        os.makedirs('top_stories_images')
    
    # Iterate over the articles and download the top images
    for article in data['results']:
        if 'multimedia' in article and article['multimedia']:
            # Get the URL of the first image (usually largest)
            image_url = article['multimedia'][0]['url']
            image_title = article['title'].replace(' ', '_')[:50]
            
            # Download the image
            image_response = requests.get(image_url)
            if image_response.status_code == 200:
                img = Image.open(BytesIO(image_response.content))
                
                # Convert the image mode to 'RGB' if it's not already in a compatible mode
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Save the image as JPEG
                img_filename = f"top_stories_images/{image_title}.jpg"
                img.save(img_filename)
                print(f"Downloaded: {img_filename}")
else:
    print("Failed to fetch the top stories.")
