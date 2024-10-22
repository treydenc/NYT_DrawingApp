"use client";
import { memo } from 'react';
import dynamic from 'next/dynamic';

const Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), {
  ssr: false
});

let customFont;

const preload = (p5) => {
  customFont = p5.loadFont('/fonts/Sanford.ttf');
};

const YourText = memo(({ words, screenWidth, screenHeight }) => {
  let wordsData = [];
  let currentWordIndex = 0;
  let currentRepetition = 0;
  let lastX = 50;
  let lastY = screenHeight / 2;
  let lineHeight = 40;
  let minWordSpacing = 20; // Minimum space between words

  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(screenWidth, screenHeight).parent(canvasParentRef);
    p5.textFont(customFont);
    p5.textAlign(p5.LEFT, p5.CENTER);
    p5.frameRate(60);
    p5.background(255);

    wordsData = words.map(word => ({
      ...word,
      positions: [],
      isPlaced: false,
      repetitionsNeeded: Math.max(1, Math.floor(word.importance / 2)),
      currentRepetition: 0,
      fadeStart: -1
    }));
  };

  const calculateWordDimensions = (p5, word, size) => {
    p5.push();
    p5.textSize(size);
    const width = p5.textWidth(word) + minWordSpacing;
    p5.pop();
    return { width, height: size };
  };

  const draw = (p5) => {
    p5.background(255, 30);
    
    const placeWord = () => {
      const currentWord = wordsData[currentWordIndex];
      const fontSize = p5.map(currentWord.importance, 10, 50, 16, 40);
      const { width: wordWidth } = calculateWordDimensions(p5, currentWord.text, fontSize);
      
      // Check if we need to start a new line
      if (lastX + wordWidth > p5.width - 50) {
        lastX = 50;
        lastY += lineHeight;
        if (lastY > p5.height - lineHeight) lastY = 50;
      }

      // Add subtle wave movement
      const waveY = p5.sin(lastX * 0.005 + p5.frameCount * 0.02) * 10;
      
      const newPos = {
        x: lastX,
        y: lastY + waveY,
        size: fontSize,
        color: p5.color(0),
        alpha: 255,
        birth: p5.frameCount,
        width: wordWidth
      };
      
      currentWord.positions.push(newPos);
      currentWord.currentRepetition++;
      
      // Update position for next word
      lastX += wordWidth;
    };

    if (currentWordIndex < wordsData.length) {
      const currentWord = wordsData[currentWordIndex];
      
      // Reverse importance-based timing: higher importance = faster
      const baseSpeed = 0.5; // Base speed for all words
      const importanceSpeed = p5.map(currentWord.importance, 10, 50, 0.1, 0.7); // Additional speed based on importance
      const wordsPerFrame = currentWord.currentRepetition > 1 ? 
        importanceSpeed : // Use importance-based speed for repeats
        baseSpeed; // Use base speed for first appearance
      
      currentRepetition += wordsPerFrame;
      
      while (currentRepetition >= 1 && currentWordIndex < wordsData.length) {
        placeWord();
        currentRepetition--;
        
        if (currentWord.currentRepetition >= currentWord.repetitionsNeeded) {
          // Modify this section to include last two words
          if (currentWordIndex >= 0) {  // Changed from currentWordIndex > 1
            wordsData[currentWordIndex].fadeStart = p5.frameCount;
            if (currentWordIndex > 0) {
              wordsData[currentWordIndex - 1].fadeStart = p5.frameCount;
            }
          }
          currentWordIndex++;
          currentRepetition = 0;
        }
      }
    } else {
      // Add this else block to handle the last word
      if (currentWordIndex === wordsData.length) {
        wordsData[wordsData.length - 1].fadeStart = p5.frameCount;
      }
    }
    
    // Draw words
    wordsData.forEach((word, index) => {
      const isCurrent = index === currentWordIndex;
      const isPrevious = index === currentWordIndex - 1;
      
      word.positions.forEach((pos) => {
        p5.push();
        p5.textSize(pos.size);
        
        let alpha = 255;
        
        // Fade out older words
        if (!isCurrent && !isPrevious) {
          if (word.fadeStart > -1) {
            const fadeAge = p5.frameCount - word.fadeStart;
            alpha = p5.map(fadeAge, 0, 40, 255, 0);
            if (alpha <= 0) {
              p5.pop();
              return;
            }
          }
        }
        
        // Draw shadow for current word
        if (isCurrent) {
          p5.fill(0, alpha * 0.2);
          p5.text(word.text, pos.x + 1, pos.y + 1);
        }
        
        // Draw main text
        p5.fill(0, alpha);
        p5.text(word.text, pos.x, pos.y);
        
        p5.pop();
      });
    });
  };

  return <Sketch preload={preload} setup={setup} draw={draw} />;
});

YourText.displayName = 'YourText';

export default YourText;