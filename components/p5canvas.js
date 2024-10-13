// components/p5Canvas.js
import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';

// Dynamically import p5.js as it requires the DOM to be loaded
const Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), { ssr: false });

export default function P5Canvas({ imageUrl, imageWidth, imageHeight, showImage, fontSize, fontThickness }) {
  const img = useRef(null);
  const [pathCharacters, setPathCharacters] = useState([]); // Store character positions, index, font size, and color
  const phrase = "ART W ILL STOP WW3 !"; // The phrase to loop through
  let charIndex = useRef(0); // Keep track of which character in the phrase to draw next

  // To track the position of the last drawn character
  let lastX = useRef(0);
  let lastY = useRef(0);

  // Setup sketch with p5
  const setup = (p5, canvasParentRef) => {
    if (imageWidth === 0 || imageHeight === 0) {
      //console.log("Skipping canvas setup because dimensions are zero.");
      return; // Don't create the canvas if dimensions are not set
    }

    console.log("Setting up the canvas with dimensions:", imageWidth, imageHeight);

    // Create the canvas with the scaled dimensions passed as props
    const canvas = p5.createCanvas(imageWidth, imageHeight).parent(canvasParentRef);
    p5.clear(); // Clear the canvas to make it transparent
    canvas.style('position', 'absolute'); // Position the canvas absolutely over the image
    canvas.style('top', '0');
    canvas.style('left', '0');
    canvas.style('z-index', '2');

    // Load the image onto the canvas (initial display)
    img.current = p5.loadImage(imageUrl, () => {
      if (showImage) {
        p5.image(img.current, 0, 0, imageWidth, imageHeight); // Draw the image on the canvas only if showImage is true
      }
    });

    // Set the initial last position to the first mouse position
    lastX.current = p5.mouseX;
    lastY.current = p5.mouseY;
  };

  // Helper function to get the color at the mouse position
  const getColorAtCursor = (p5) => {
    if (img.current && p5.mouseX >= 0 && p5.mouseX <= imageWidth && p5.mouseY >= 0 && p5.mouseY <= imageHeight) {
      const [r, g, b] = p5.get(p5.mouseX, p5.mouseY); // Get RGB values at the cursor
      return p5.color(r, g, b); // Convert to p5.Color object
    }
    return p5.color(255); // Default to white if no image or out of bounds
  };

  // Draw the characters as a polyline with enhanced styling and spacing
  const draw = (p5) => {
    p5.clear(); // Always clear the canvas before drawing

    // Draw the image conditionally based on showImage prop
    if (showImage && img.current) {
      p5.image(img.current, 0, 0, imageWidth, imageHeight);
    } else {
      p5.background(255, 255, 255);
    }

    // Draw the stored characters at their respective positions using their stored font size
    pathCharacters.forEach((charObj) => {
      p5.textSize(charObj.fontSize); // Use the stored font size for each character
    p5.strokeWeight(charObj.fontThickness); // Use the stored font thickness
      p5.fill(charObj.color); // Use the stored color
      p5.text(charObj.char, charObj.x, charObj.y); // Draw each character at the stored coordinates
    });

    // Allow drawing new characters on the canvas
    if (p5.mouseIsPressed) {
      const currentChar = phrase[charIndex.current]; // Get the current character to draw
      const charWidth = p5.textWidth(currentChar); // Get the width of the current character

      // Calculate the distance moved since the last character was drawn
      const distMoved = p5.dist(lastX.current, lastY.current, p5.mouseX, p5.mouseY);

      // Only draw the next character if enough distance has been moved (based on character width)
      if (distMoved >= charWidth + 5) { // Adjust spacing to prevent overlap
        // Get the color at the mouse position from the image
        const pixelColor = getColorAtCursor(p5);
        const hexColor = pixelColor.toString(); // Convert color to a hex string

        // Store the new character with its properties, including the current font size
        const newCharObj = {
          char: currentChar,
          x: p5.mouseX - charWidth / 2, // Center the character horizontally
          y: p5.mouseY + fontSize / 2, // Adjust vertically for better alignment
          color: hexColor,
          fontSize: fontSize,
          fontThickness: fontThickness,
        };

        setPathCharacters((prevChars) => [...prevChars, newCharObj]); // Update the state with the new character

        // Update lastX and lastY to the current position
        lastX.current = p5.mouseX;
        lastY.current = p5.mouseY;

        // Move to the next character in the phrase, loop back if necessary
        charIndex.current = (charIndex.current + 1) % phrase.length;
      }
    }
  };

  return (
    <div className="canvas-overlay">
      <Sketch setup={setup} draw={draw} />
      <style jsx>{`
        .canvas-overlay {
          position: relative;
          width: ${imageWidth}px;
          height: ${imageHeight}px;
          margin: auto;
          border: 1px solid transparent;
        }
      `}</style>
    </div>
  );
}
