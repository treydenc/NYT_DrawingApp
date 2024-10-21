import fs from 'fs';
import path from 'path';

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

    // Prepare an array of article titles for CSV
    const titles = data.results.map(article => article.title);

    // Define the CSV content
    const csvContent = titles.join('\n'); // Titles separated by new lines

    // Define the path to save the CSV file in the public directory
    const csvDir = path.join(process.cwd(), 'public', 'csv');
    if (!fs.existsSync(csvDir)) {
      fs.mkdirSync(csvDir, { recursive: true });
    }

    const filePath = path.join(csvDir, 'NYTmostpopular.csv');

    // Write the CSV content to the file
    fs.writeFileSync(filePath, csvContent);
    console.log('CSV file written:', filePath);

    // Respond with success and the file path
    return new Response(JSON.stringify({ message: 'CSV file created', filePath: `/csv/NYTmostpopular.csv` }), {
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
