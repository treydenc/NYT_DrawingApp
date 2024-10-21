import fs from 'fs';
import path from 'path';
import { utils, writeFile } from 'xlsx';

export async function GET(req) {
  const apiKey = process.env.NEXT_PUBLIC_NYT_API_KEY;
  try {
    console.log('Starting the API request for most popular articles...');

    // Call the NY Times API for the most viewed articles over the last 7 days
    const url = `https://api.nytimes.com/svc/mostpopular/v2/viewed/7.json?api-key=${apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.error('Failed to fetch from NYT API:', response.statusText);
      throw new Error('Failed to fetch from NYT API');
    }

    const data = await response.json();
    console.log('NYT most popular API response received:', data);

    // Prepare an array of article titles
    const titles = data.results.map(article => [article.title]);
    
    // Create a new workbook and worksheet
    const workbook = utils.book_new();
    const worksheet = utils.aoa_to_sheet(titles); // Create sheet from array of arrays (titles)

    // Add the worksheet to the workbook
    utils.book_append_sheet(workbook, worksheet, 'MostPopularTitles');

    // Define the path to save the file
    const filePath = path.join(process.cwd(), 'NYTmostpopular.xlsx'); // Save in the project root temporarily


    // Write the workbook to a file
    writeFile(workbook, filePath);
    console.log('Excel file written:', filePath);

    // Respond with success and the file path
    return new Response(JSON.stringify({ message: 'Excel file created', filePath }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in API route:', error.message);
    return new Response(JSON.stringify({ error: 'Failed to fetch article titles' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
