// app/api/fetch-images/route.js

import fs from 'fs';
import path from 'path';

export async function GET(req) {
  const apiKey = process.env.NEXT_PUBLIC_NYT_API_KEY;
  try {
    console.log('Starting the API request...');
    // Call the NY Times API
    const url = `https://api.nytimes.com/svc/topstories/v2/home.json?api-key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error('Failed to fetch from NYT API:', response.statusText);
      throw new Error('Failed to fetch from NYT API');
    }

    const data = await response.json();
    console.log('NYT API response received:', data);

    // Create a directory based on the current date
    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const imagesDir = path.join(process.cwd(), 'public', 'images', today);

    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
      console.log('Created images directory for today:', imagesDir);
    }

    const imageUrls = [];
    for (const article of data.results) {
      if (article.multimedia && article.multimedia.length > 0) {
        const imageUrl = article.multimedia[0].url;
        const imageName = article.title.replace(/\s+/g, '_').substring(0, 50).replace(/[^a-zA-Z0-9_]/g, '') + '.jpg';

        // Download and save the image
        console.log('Downloading image:', imageUrl);
        const imageResponse = await fetch(imageUrl);

        if (!imageResponse.ok) {
          console.error('Failed to fetch image:', imageResponse.statusText);
          throw new Error(`Failed to fetch image: ${imageUrl}`);
        }

        const buffer = await imageResponse.arrayBuffer();
        const imagePath = path.join(imagesDir, imageName);

        // Write the image to the file
        fs.writeFileSync(imagePath, Buffer.from(buffer));
        console.log('Saved image to:', imagePath);

        imageUrls.push(`/images/${today}/${imageName}`);
      }
    }

    // Return the list of image URLs
    return new Response(JSON.stringify({ images: imageUrls }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in API route:', error.message);
    return new Response(JSON.stringify({ error: 'Failed to fetch images' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
