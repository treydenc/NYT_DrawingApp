"use client";
import { useState, useEffect, useCallback } from 'react';
import YourText from '../../components/P5yourText';
import Link from 'next/link';

export default function YourTextFinal() {
  const [words, setWords] = useState([]);
  const [screenWidth, setScreenWidth] = useState(800); // Default size
  const [screenHeight, setScreenHeight] = useState(600); // Default size
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const updateDimensions = useCallback(() => {
    setScreenWidth(Math.min(window.innerWidth * 0.8, 1200)); // Max width of 1200
    setScreenHeight(Math.min(window.innerHeight * 0.8, 800)); // Max height of 800
  }, []);

  useEffect(() => {
    const fetchCSV = async () => {
      try {
        const response = await fetch('/word_importance.csv');
        if (!response.ok) throw new Error('Failed to fetch CSV file');
        const csvText = await response.text();
        
        const lines = csvText.trim().split('\n');
        const parsedWords = lines.slice(1).map(line => {
          const [text, importance] = line.split(',');
          return {
            text: text.trim(),
            importance: parseInt(importance.trim())
          };
        });

        setWords(parsedWords);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading CSV:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchCSV();
    updateDimensions();

    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8 pt-10">Word Importance Visualization</h1>
      <Link href="/">
        <button className="text-blue-500 hover:underline">home</button>
      </Link>
      {isLoading ? (
        <div className="mt-8">
          <p className="text-gray-600">Loading visualization...</p>
        </div>
      ) : words.length > 0 ? (
        <div className="flex justify-center mt-8">
          <YourText
            words={words}
            screenWidth={screenWidth}
            screenHeight={screenHeight}
          />
        </div>
      ) : (
        <p className="text-gray-600">No words found in the CSV file.</p>
      )}
    </div>
  );
}