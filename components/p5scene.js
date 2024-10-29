"use client";
import { memo, useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';

const Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), {
  ssr: false
});

const SmoothShapeMorph = memo(({ width = 800, height = 600 }) => {
  const [morphColor] = useState(() => ({ r: 147, g: 51, b: 234, a: 180 }));
  const [fadeStartTime, setFadeStartTime] = useState(null);
  
  // Cache for smoothed and resampled lines
  const cachedLinesRef = useRef({
    A: Array(5).fill(null),
    B: Array(5).fill(null)
  });
  
  const scenesRef = useRef({
    A: Array(5).fill().map(() => []),
    B: Array(5).fill().map(() => []),
    currentScene: 'A',
    currentLine: 0,
    points: []
  });

  // Memoize the smooth line function
  const smoothLine = useCallback((points, numSegments = 50) => {
    if (points.length < 4) return points;
    
    const catmullRom = (p0, p1, p2, p3, t, tension = 0.5) => {
      const t2 = t * t;
      const t3 = t2 * t;
      
      const v0 = (p2[0] - p0[0]) * tension;
      const v1 = (p3[0] - p1[0]) * tension;
      const x = (2 * p1[0] - 2 * p2[0] + v0 + v1) * t3 +
                (-3 * p1[0] + 3 * p2[0] - 2 * v0 - v1) * t2 +
                v0 * t + p1[0];
                
      const w0 = (p2[1] - p0[1]) * tension;
      const w1 = (p3[1] - p1[1]) * tension;
      const y = (2 * p1[1] - 2 * p2[1] + w0 + w1) * t3 +
                (-3 * p1[1] + 3 * p2[1] - 2 * w0 - w1) * t2 +
                w0 * t + p1[1];
                
      return [x, y];
    };

    const extendedPoints = [
      [2 * points[0][0] - points[1][0], 2 * points[0][1] - points[1][1]],
      ...points,
      [2 * points[points.length-1][0] - points[points.length-2][0], 
       2 * points[points.length-1][1] - points[points.length-2][1]]
    ];

    const smoothPoints = [];
    for (let i = 0; i < extendedPoints.length - 3; i++) {
      for (let t = 0; t < 1; t += 1 / numSegments) {
        smoothPoints.push(catmullRom(
          extendedPoints[i],
          extendedPoints[i + 1],
          extendedPoints[i + 2],
          extendedPoints[i + 3],
          t
        ));
      }
    }

    return smoothPoints;
  }, []);

  // Memoize the resample points function
  const resamplePoints = useCallback((points, targetCount) => {
    const result = new Array(targetCount);
    const totalDist = points.reduce((acc, pt, i) => {
      if (i === 0) return 0;
      const dx = pt[0] - points[i-1][0];
      const dy = pt[1] - points[i-1][1];
      return acc + Math.sqrt(dx*dx + dy*dy);
    }, 0);
    
    for (let i = 0; i < targetCount; i++) {
      const targetDist = (i / (targetCount - 1)) * totalDist;
      let currentDist = 0;
      
      for (let j = 1; j < points.length; j++) {
        const prevPt = points[j-1];
        const currentPt = points[j];
        const segmentDist = Math.sqrt(
          Math.pow(currentPt[0] - prevPt[0], 2) + 
          Math.pow(currentPt[1] - prevPt[1], 2)
        );
        
        if (currentDist + segmentDist >= targetDist) {
          const remainder = targetDist - currentDist;
          const t = remainder / segmentDist;
          result[i] = [
            prevPt[0] + (currentPt[0] - prevPt[0]) * t,
            prevPt[1] + (currentPt[1] - prevPt[1]) * t
          ];
          break;
        }
        currentDist += segmentDist;
      }
    }
    
    if (result[targetCount - 1] === undefined) {
      result[targetCount - 1] = [...points[points.length - 1]];
    }
    
    return result;
  }, []);

  const processLine = useCallback((line) => {
    const smoothedPoints = smoothLine(line, 100);
    return resamplePoints(smoothedPoints, 50);
  }, [smoothLine, resamplePoints]);

  const draw = (p5) => {
    p5.background(220);
    const scenes = scenesRef.current;
    
    // Draw instructions
    p5.fill(0);
    p5.noStroke();
    if (!scenesAreComplete()) {
      p5.text(`Drawing Scene ${scenes.currentScene}, Line ${scenes.currentLine}/5`, 10, 10);
    }
    
    // Calculate fade alpha
    let previewAlpha = 255;
    if (scenesAreComplete()) {
      if (fadeStartTime === null) {
        setFadeStartTime(p5.millis());
      } else {
        const fadeTime = 1000;
        const timeSinceFade = p5.millis() - fadeStartTime;
        previewAlpha = p5.map(timeSinceFade, 0, fadeTime, 255, 0);
        previewAlpha = p5.constrain(previewAlpha, 0, 255);
      }
    }

    // Draw scenes using cached processed lines
    ['A', 'B'].forEach((scene, sceneIndex) => {
      const color = scene === 'A' ? [0, 100, 255] : [255, 100, 0];
      scenes[scene].forEach((line, lineIndex) => {
        if (line.length > 0) {
          if (!cachedLinesRef.current[scene][lineIndex]) {
            cachedLinesRef.current[scene][lineIndex] = processLine(line);
          }
          
          const processedLine = cachedLinesRef.current[scene][lineIndex];
          p5.fill(color[0], color[1], color[2], previewAlpha * 0.4);
          p5.stroke(color[0], color[1], color[2], previewAlpha);
          p5.strokeWeight(2);
          p5.beginShape();
          processedLine.forEach(pt => p5.vertex(pt[0], pt[1]));
          p5.endShape(p5.CLOSE);
        }
      });
    });
    
    // Draw current line while drawing
    if (scenes.points.length > 0) {
      const currentColor = scenes.currentScene === 'A' ? 
        [0, 100, 255] : [255, 100, 0];
      p5.fill(currentColor[0], currentColor[1], currentColor[2], 100);
      p5.stroke(currentColor[0], currentColor[1], currentColor[2]);
      p5.strokeWeight(2);
      p5.beginShape();
      scenes.points.forEach(pt => p5.vertex(pt[0], pt[1]));
      p5.endShape();
    }
    
    // Draw interpolated shapes
    if (scenesAreComplete()) {
      const pct = (p5.sin(p5.millis() / 1000) * 0.5 + 0.5);
      
      for (let i = 0; i < 5; i++) {
        const processedA = cachedLinesRef.current.A[i];
        const processedB = cachedLinesRef.current.B[i];
        
        if (processedA && processedB) {
          p5.fill(morphColor.r, morphColor.g, morphColor.b, morphColor.a);
          p5.stroke(morphColor.r, morphColor.g, morphColor.b, 100);
          p5.strokeWeight(1.5);
          p5.beginShape();
          
          for (let j = 0; j < processedA.length; j++) {
            const x = p5.lerp(processedA[j][0], processedB[j][0], pct);
            const y = p5.lerp(processedA[j][1], processedB[j][1], pct);
            p5.vertex(x, y);
          }
          
          p5.endShape(p5.CLOSE);
        }
      }
    }
  };

  const mousePressed = (p5) => {
    scenesRef.current.points = [[p5.mouseX, p5.mouseY]];
  };

  const mouseDragged = (p5) => {
    const scenes = scenesRef.current;
    const lastPoint = scenes.points[scenes.points.length - 1];
    const dx = p5.mouseX - lastPoint[0];
    const dy = p5.mouseY - lastPoint[1];
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 5) {
      scenes.points.push([p5.mouseX, p5.mouseY]);
    }
  };

  const mouseReleased = () => {
    const scenes = scenesRef.current;
    if (scenes.points.length >= 3) {
      const currentArray = scenes[scenes.currentScene];
      currentArray[scenes.currentLine] = [...scenes.points];
      
      // Clear the cache for this line
      cachedLinesRef.current[scenes.currentScene][scenes.currentLine] = null;
      
      scenes.currentLine++;
      if (scenes.currentLine >= 5) {
        scenes.currentLine = 0;
        if (scenes.currentScene === 'A') {
          scenes.currentScene = 'B';
        }
      }
    }
    scenes.points = [];
  };

  const scenesAreComplete = () => {
    const scenes = scenesRef.current;
    return scenes.A.every(line => line.length >= 3) && 
           scenes.B.every(line => line.length >= 3);
  };

  return (
    <div className="relative">
      <Sketch 
        setup={(p5, canvasParentRef) => {
          p5.createCanvas(width, height).parent(canvasParentRef);
          p5.textAlign(p5.LEFT, p5.TOP);
        }}
        draw={draw}
        mousePressed={mousePressed}
        mouseDragged={mouseDragged}
        mouseReleased={mouseReleased}
      />
    </div>
  );
});

SmoothShapeMorph.displayName = 'SmoothShapeMorph';

export default SmoothShapeMorph;