"use client";
import { useState, useEffect } from 'react';
import P5Generative from '../../components/p5generative';
import Link from 'next/link';

export default function GenerativeNYT() {
  const [phrases, setPhrases] = useState([]);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [screenHeight, setScreenHeight] = useState(window.innerHeight);

  // Function to fetch the CSV file and read the titles
  const fetchPhrasesFromCSV = async () => {
    try {
      const response = await fetch('/api/fetch-most-popular');
      const data = await response.json();

      if (response.ok) {
        const filePath = data.filePath;
        const fileResponse = await fetch(filePath);
        const csvContent = await fileResponse.text();

        const titles = csvContent.split('\n').filter(Boolean); // Filter out empty lines
        setPhrases(titles);
      } else {
        console.error('Error fetching CSV file:', data.error);
      }
    } catch (error) {
      console.error('Error fetching phrases:', error);
    }
  };

  useEffect(() => {
    fetchPhrasesFromCSV();
  }, []);

  return (
<div className="flex flex-col items-center justify-center min-h-screen">
  <h1 className="text-3xl font-bold text-center mb-8 pt-10">Generative NYT Drawing App</h1>
  <Link href="/">
            <button className="text-blue-500 hover:underline">home</button>
  </Link>
  {/* Render the p5.js component once phrases are loaded */}
  {phrases.length > 0 ? (
    <div className="flex justify-center">
      <P5Generative
        phrases={phrases}
        screenWidth={screenWidth}
        screenHeight={screenHeight}
      />
    </div>
  ) : (
    <p>Loading phrases...</p>
  )}
</div>
  );
}
