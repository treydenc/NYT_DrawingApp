"use client";
import { useRef, useEffect } from 'react';
import p5 from 'p5';

export default function P5Generative({ phrases, screenWidth, screenHeight }) {
  const p5ContainerRef = useRef(null);

  useEffect(() => {
    let customFont;

    const sketch = (p) => {
      let wordsData = [];
      let currentWordIndex = 0;
      let currentRepetition = 0;
      let lastX = 50;
      let lastY = screenHeight / 2;
      let minWordSpacing = 20;

      const preload = () => {
        customFont = p.loadFont('/fonts/Sanford.ttf');
      };

      const setup = () => {
        p.createCanvas(screenWidth, screenHeight);
        p.textFont(customFont);
        p.textAlign(p.LEFT, p.CENTER);
        p.frameRate(60);
        p.background(255);

        // Split phrases into words and initialize
        const allWords = phrases
          .join(' ')
          .split(/\s+/)
          .filter(word => word.length > 0);

        wordsData = allWords.map(word => ({
          text: word,
          positions: [],
          isPlaced: false,
          importance: calculateImportance(word),
          repetitionsNeeded: 0,
          currentRepetition: 0,
          fadeStart: -1
        }));

        // Set repetitions based on importance
        wordsData.forEach(word => {
          word.repetitionsNeeded = Math.max(1, Math.floor(word.importance / 2));
        });
      };

      const calculateImportance = (word) => {
        // Calculate importance based on word characteristics
        const length = word.length;
        const capitals = (word.match(/[A-Z]/g) || []).length;
        const punctuation = (word.match(/[.,!?;:'"-]/g) || []).length;
        
        // Scale importance between 10-50
        return p.constrain(
          p.map(length + capitals * 3 + punctuation * 2, 1, 15, 10, 50),
          10,
          50
        );
      };

      const calculateWordWidth = (word, size) => {
        p.push();
        p.textSize(size);
        const width = p.textWidth(word) + minWordSpacing;
        p.pop();
        return width;
      };

      const placeWord = () => {
        const currentWord = wordsData[currentWordIndex];
        const fontSize = p.map(currentWord.importance, 10, 50, 16, 28);
        const wordWidth = calculateWordWidth(currentWord.text, fontSize);

        // Check if we need to start a new line
        if (lastX + wordWidth > p.width - 50) {
          lastX = 50;
          lastY += 40; // line height
          if (lastY > p.height - 40) lastY = 50;
        }

        // Add subtle vertical movement
        const waveY = p.sin(lastX * 0.005 + p.frameCount * 0.02) * 5;

        const newPos = {
          x: lastX,
          y: lastY + waveY,
          size: fontSize,
          alpha: 255,
          birth: p.frameCount,
          width: wordWidth
        };

        currentWord.positions.push(newPos);
        currentWord.currentRepetition++;
        lastX += wordWidth;
      };

      const draw = () => {
        p.background(255, 30);

        if (currentWordIndex < wordsData.length) {
          const currentWord = wordsData[currentWordIndex];
          
          // Calculate speed based on importance
          const baseSpeed = 0.2;
          const importanceSpeed = p.map(currentWord.importance, 10, 50, 0.1, 0.8);
          const wordsPerFrame = currentWord.currentRepetition > 1 ? 
            importanceSpeed : 
            baseSpeed;
          
          currentRepetition += wordsPerFrame;

          while (currentRepetition >= 1 && currentWordIndex < wordsData.length) {
            placeWord();
            currentRepetition--;

            if (currentWord.currentRepetition >= currentWord.repetitionsNeeded) {
              // Start fade for current word
              if (currentWordIndex >= 0) {
                wordsData[currentWordIndex].fadeStart = p5.frameCount;
                if (currentWordIndex > 0) {
                  wordsData[currentWordIndex - 1].fadeStart = p5.frameCount;
                }
              }
              currentWordIndex++;
              currentRepetition = 0;
            }
          }
        }

        // Draw words with fade effect
        wordsData.forEach((word, index) => {
          const isCurrent = index === currentWordIndex;
          const isPrevious = index === currentWordIndex - 1;

          word.positions.forEach((pos) => {
            p.push();
            p.textSize(pos.size);

            let alpha = 255;
            if (!isCurrent && !isPrevious) {
              if (word.fadeStart > -1) {
                const fadeAge = p.frameCount - word.fadeStart;
                alpha = p.map(fadeAge, 0, 40, 255, 0);
                if (alpha <= 0) {
                  p.pop();
                  return;
                }
              }
            }

            // Draw shadow for current word
            if (isCurrent) {
              p.fill(0, alpha * 0.2);
              p.text(word.text, pos.x + 1, pos.y + 1);
            }

            // Draw main text
            p.fill(0, alpha);
            p.text(word.text, pos.x, pos.y);

            p.pop();
          });
        });
      };

      // Initialize the sketch
      p.preload = preload;
      p.setup = setup;
      p.draw = draw;
    };

    // Create and cleanup p5 instance
    const p5Instance = new p5(sketch, p5ContainerRef.current);
    return () => p5Instance.remove();
  }, [phrases, screenWidth, screenHeight]);

  return <div ref={p5ContainerRef} />;
}