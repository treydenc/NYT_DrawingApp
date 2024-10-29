"use client";
import { memo } from 'react';
import dynamic from 'next/dynamic';

const Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), {
  ssr: false
});

const YourText = memo(({ words, screenWidth, screenHeight }) => {
  let wordsData = [];
  let currentWordIndex = 0;
  let currentRepetition = 0;
  let lastRedValue = 255;
  let lastBrightness = 100;

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(screenWidth, screenHeight).parent(canvasParentRef);
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.frameRate(60);
    p5.background(0);

    // Initialize words data
    wordsData = words.map(word => ({
      ...word,
      positions: [],
      isPlaced: false,
      repetitionsNeeded: Math.max(1, Math.floor(word.importance / 3)),
      currentRepetition: 0
    }));
  };

  const draw = (p5) => {
    p5.background(0, 20);
    
    const placeWord = () => {
      const currentWord = wordsData[currentWordIndex];
      const prevWord = currentWordIndex > 0 ? wordsData[currentWordIndex - 1] : null;
      
      // Enhanced color variation
      if (prevWord) {
        if (currentWord.importance > prevWord.importance) {
          // More important words get darker and more intense
          lastRedValue = p5.constrain(lastRedValue - p5.random(60, 100), 20, 255);
          lastBrightness = p5.constrain(lastBrightness + p5.random(10, 30), 0, 100);
        } else {
          // Less important words get lighter but maintain visibility
          lastRedValue = p5.constrain(lastRedValue + p5.random(40, 80), 20, 255);
          lastBrightness = p5.constrain(lastBrightness - p5.random(5, 15), 0, 100);
        }
      }
      
      const angle = p5.random(p5.TWO_PI);
      const radius = p5.map(currentWord.importance * 3, 10, 50, 100, Math.min(p5.width, p5.height) / 3);
      
      const centerPull = p5.map(currentWord.importance * 2, 10, 50, 0.2, 0.8);
      const x = p5.width/2 + p5.cos(angle) * radius * (1 - centerPull);
      const y = p5.height/2 + p5.sin(angle) * radius * (1 - centerPull);
      
      const variation = 20;
      const finalX = p5.constrain(x + p5.random(-variation, variation), 100, p5.width - 100);
      const finalY = p5.constrain(y + p5.random(-variation, variation), 100, p5.height - 100);
      
      const newPos = {
        x: finalX,
        y: finalY,
        angle: p5.random(-0.2, 0.2),
        color: p5.color(
          lastRedValue,
          lastBrightness * 0.2, // Slight variation in green
          lastBrightness * 0.1  // Slight variation in blue
        ),
        alpha: p5.map(currentWord.importance, 10, 50, 180, 255)
      };
      
      currentWord.positions.push(newPos);
      currentWord.currentRepetition++;
    };

    if (currentWordIndex < wordsData.length) {
      const currentWord = wordsData[currentWordIndex];
      
      // Faster progression for repeated important words, slower for less important words
      const wordsPerFrame = currentWord.currentRepetition > 1 ? 
        Math.ceil(currentWord.importance / 10) : // Faster for repeats
        0.5; // Slower for first appearance
      
      // Accumulate partial words
      currentRepetition += wordsPerFrame;
      
      // Place words when we accumulate a whole number
      while (currentRepetition >= 1 && currentWordIndex < wordsData.length) {
        placeWord();
        currentRepetition--;
        
        if (currentWord.currentRepetition >= currentWord.repetitionsNeeded) {
          currentWordIndex++;
          currentRepetition = 0;
        }
      }
    }
    
    // Draw all placed words with enhanced visual effects
    wordsData.forEach((word) => {
      word.positions.forEach((pos) => {
        p5.push();
        p5.translate(pos.x, pos.y);
        p5.rotate(pos.angle);
        
        const size = p5.map(word.importance, 10, 50, 20, 80);
        p5.textSize(size);
        
        // Enhanced shadow for better contrast
        const shadowOffset = word.importance > 30 ? 3 : 2;
        p5.fill(0, 0, 0, 200);
        p5.text(word.text, shadowOffset, shadowOffset);
        
        // Add outer glow for important words
        if (word.importance > 30) {
          p5.drawingContext.shadowBlur = 8;
          p5.drawingContext.shadowColor = `rgba(${p5.red(pos.color)}, 
            ${p5.green(pos.color)}, 
            ${p5.blue(pos.color)}, 0.5)`;
        }
        
        // Main text with enhanced color
        p5.fill(
          p5.red(pos.color),
          p5.green(pos.color),
          p5.blue(pos.color),
          pos.alpha
        );
        p5.text(word.text, 0, 0);
        
        // Add highlight for extra depth on important words
        if (word.importance > 40) {
          p5.fill(255, 255, 255, 30);
          p5.text(word.text, -1, -1);
        }
        
        // Reset shadow effect
        p5.drawingContext.shadowBlur = 0;
        
        p5.pop();
      });
    });
  };

  return <Sketch setup={setup} draw={draw} />;
});

YourText.displayName = 'YourText';

export default YourText;