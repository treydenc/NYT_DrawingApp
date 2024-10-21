import { useRef, useEffect } from 'react';
import p5 from 'p5';

export default function P5Generative({ phrases, screenWidth, screenHeight }) {
  const p5ContainerRef = useRef(null);

  useEffect(() => {
    const sketch = (p) => {
      let phraseObjects = [];

      // Create PhraseLine class to handle position, movement, and drawing
      class PhraseLine {
        constructor(phrase, x, y, speedX, speedY, angle) {
          this.phrase = phrase;
          this.x = x;
          this.y = y;
          this.speedX = speedX;
          this.speedY = speedY;
          this.angle = angle;
        }

        // Draw the phrase and move it across the screen
        draw() {
          p.push();
          p.translate(this.x, this.y);
          p.rotate(this.angle);
          p.fill(255);
          p.textAlign(p.CENTER, p.CENTER);
          p.textSize(24);
          p.text(this.phrase, 0, 0);
          p.pop();

          // Move the phrase
          this.x += this.speedX;
          this.y += this.speedY;

          // If the phrase goes off-screen, reset it to the other side
          if (this.x > p.width) this.x = -p.textWidth(this.phrase);
          if (this.x < -p.textWidth(this.phrase)) this.x = p.width;
          if (this.y > p.height) this.y = -24; // Adjust for text height
          if (this.y < -24) this.y = p.height;
        }
      }

      p.setup = () => {
        p.createCanvas(screenWidth, screenHeight);
        p.background(0);

        // Create PhraseLine objects with random positions, speeds, and angles
        phrases.forEach((phrase) => {
          let x = p.random(p.width);
          let y = p.random(p.height);
          let speedX = p.random(-2, 2); // Random horizontal speed
          let speedY = p.random(-2, 2); // Random vertical speed
          let angle = p.random(p.TWO_PI); // Random rotation angle

          phraseObjects.push(new PhraseLine(phrase, x, y, speedX, speedY, angle));
        });
      };

      p.draw = () => {
        p.background(0); // Reset background to black

        // Draw each phrase and move them
        phraseObjects.forEach((phraseLine) => {
          phraseLine.draw();
        });
      };

      p.windowResized = () => {
        p.resizeCanvas(screenWidth, screenHeight);
      };
    };

    const p5Instance = new p5(sketch, p5ContainerRef.current);

    return () => {
      p5Instance.remove();
    };
  }, [phrases, screenWidth, screenHeight]);

  return <div ref={p5ContainerRef} />;
}
