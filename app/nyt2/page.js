"use client";
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import the P5Generative component with no SSR
const P5Generative = dynamic(() => import('../../components/p5generative'), {
  ssr: false
});

export default function GenerativeNYT() {
  const [phrases, setPhrases] = useState([]);
  const [dimensions, setDimensions] = useState({
    width: 800,  // Default width
    height: 600  // Default height
  });
  const [isClient, setIsClient] = useState(false);

  // Function to fetch the CSV file and read the titles
  const fetchPhrasesFromCSV = async () => {
    try {
      const response = await fetch('/api/fetch-most-popular');
      const data = await response.json();

      if (response.ok) {
        const filePath = data.filePath;
        const fileResponse = await fetch(filePath);
        const csvContent = await fileResponse.text();

        const titles = csvContent.split('\n').filter(Boolean);
        setPhrases(titles);
      } else {
        console.error('Error fetching CSV file:', data.error);
      }
    } catch (error) {
      console.error('Error fetching phrases:', error);
    }
  };

  // Set initial client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle window dimensions and data fetching
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateDimensions = () => {
        setDimensions({
          width: Math.min(window.innerWidth * 0.9, 1200),  // 90% of window width, max 1200px
          height: Math.min(window.innerHeight * 0.8, 800)  // 80% of window height, max 800px
        });
      };

      // Initial dimension set
      updateDimensions();

      // Add event listener for resize
      window.addEventListener('resize', updateDimensions);

      // Fetch data
      fetchPhrasesFromCSV();

      // Cleanup
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  if (!isClient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold text-center mb-8 pt-10">Generative NYT Drawing App</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8 pt-10">Generative NYT Drawing App</h1>
      <Link href="/">
        <button className="text-blue-500 hover:underline">home</button>
      </Link>
      
      {phrases.length > 0 ? (
        <div className="flex justify-center">
          <P5Generative
            phrases={phrases}
            screenWidth={dimensions.width}
            screenHeight={dimensions.height}
          />
        </div>
      ) : (
        <p>Loading phrases...</p>
      )}
    </div>
  );
}