// components/p5generative.js
export default function P5Generative({ phrases }) {
    return (
      <div id="p5-container">
        {/* Canvas will be injected here */}
      </div>
    );
  }
  
  // p5.js sketch
  class PhraseLine {
    constructor(phrase, x1, y1, x2, y2) {
      this.phrase = phrase;
      this.x1 = x1;
      this.y1 = y1;
      this.x2 = x2;
      this.y2 = y2;
    }
  
    draw() {
      // Calculate the line's length
      const totalDistance = dist(this.x1, this.y1, this.x2, this.y2);
      const letterSpacing = totalDistance / (this.phrase.length - 1); // Adjust spacing based on phrase length
  
      // Draw each letter at calculated positions along the line
      for (let i = 0; i < this.phrase.length; i++) {
        const t = i / (this.phrase.length - 1); // Ratio to interpolate between two points
        const x = lerp(this.x1, this.x2, t);
        const y = lerp(this.y1, this.y2, t);
        
        text(this.phrase[i], x, y);
      }
    }
  }
  
  let phraseObjects = [];
  
  function setup() {
    createCanvas(windowWidth, windowHeight);
  
    // Example: Randomize positions for each phrase
    phrases.forEach((phrase, index) => {
      let x1 = random(width);
      let y1 = random(height);
      let x2 = random(width);
      let y2 = random(height);
  
      // Create a PhraseLine object for each phrase
      phraseObjects.push(new PhraseLine(phrase, x1, y1, x2, y2));
    });
  }
  
  function draw() {
    background(255);
  
    // Draw each phrase line
    phraseObjects.forEach((phraseLine) => {
      phraseLine.draw();
    });
  }
  