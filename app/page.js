"use client";
import { useState, useEffect } from 'react';
import P5Canvas from '../components/p5canvas';

export default function Home() {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImage, setShowImage] = useState(true);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [scaledDimensions, setScaledDimensions] = useState({ width: 0, height: 0 });
  const [fontSize, setFontSize] = useState(16); // Font size state
  const [fontThickness, setFontThickness] = useState(1); // Slider for font thickness
  const [error, setError] = useState(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false); // Track if image is fully loaded
  const [isCanvasReady, setIsCanvasReady] = useState(false); // Track if canvas can be initialized

  // Fetch images dynamically from the backend API
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch("/api/fetch-images"); // Fetch images from the API route
        const data = await response.json();

        if (response.ok) {
          setImages(data.images); // Set images in state
        } else {
          setError(data.error || "Failed to load images");
        }
      } catch (err) {
        setError("Failed to load images");
      }
    };

    fetchImages();
  }, []);

  // Handle image loading and calculate dimensions
  const handleImageLoad = (event) => {
    const { naturalWidth, naturalHeight } = event.target;
    console.log("Loaded image dimensions:", naturalWidth, naturalHeight);

    if (naturalWidth > 0 && naturalHeight > 0) {
      setImageDimensions({ width: naturalWidth, height: naturalHeight });
      setIsImageLoaded(true); // Image is fully loaded

      // Calculate screen space and maintain aspect ratio
      const screenWidth = window.innerWidth * 0.8;
      const screenHeight = window.innerHeight * 0.8;

      const aspectRatio = naturalWidth / naturalHeight;

      let newWidth, newHeight;

      if (screenWidth / aspectRatio <= screenHeight) {
        newWidth = screenWidth;
        newHeight = screenWidth / aspectRatio;
      } else {
        newHeight = screenHeight;
        newWidth = screenHeight * aspectRatio;
      }

      // Set scaled dimensions
      setScaledDimensions({
        width: newWidth,
        height: newHeight,
      });

      setIsCanvasReady(true); // Ready to render the canvas
    }
  };

  // Recalculate dimensions when the image is fully loaded
  useEffect(() => {
    if (selectedImage) {
      const imageElement = document.querySelector("img[src='" + selectedImage + "']");
      if (imageElement && imageElement.complete) {
        // If the image is already loaded (cached), handle it directly
        handleImageLoad({ target: imageElement });
      }
    }
  }, [selectedImage]);

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center mb-8">NYT Drawing App</h1>
      {selectedImage && (
        <div className="text-center mb-8 relative">
          <h2 className="text-lg font-bold mb-4">Today&apos;s Phrase: Art will stop WW3!</h2>
          <div className="relative mx-auto w-full flex justify-center items-center">
            {/* Image with conditional visibility */}
            <div className="relative w-full h-auto max-w-full overflow-hidden">
              {/* Render image and pass scaled dimensions */}
              {/* {isImageLoaded && (
                <img
                  src={selectedImage}
                  alt="Selected"
                  style={{ width: `${scaledDimensions.width}px`, height: `${scaledDimensions.height}px` }}
                  className={`object-contain rounded-md shadow-md ${!showImage && "hidden"}`}
                  onLoad={handleImageLoad} // Triggered once the image is loaded
                />
              )} */}
              {/* Conditionally render P5Canvas only after image is fully loaded and ready */}
              {isCanvasReady && (
                <P5Canvas
                  imageUrl={selectedImage}
                  imageWidth={scaledDimensions.width}
                  imageHeight={scaledDimensions.height}
                  showImage={showImage} // Pass the boolean to control image visibility in p5.js
                  fontSize={fontSize} // Pass the font size to the P5Canvas
                  fontThickness={fontThickness} // Pass the font thickness to P5Canvas
                />
              )}
            </div>
          </div>

          <div className="mt-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 mr-2"
              onClick={() => setShowImage(!showImage)}
            >
              {showImage ? "Hide Image" : "Show Image"}
            </button>
            <button
              className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-md hover:bg-gray-600"
              onClick={() => {
                setSelectedImage(null); // Deselect the image
                setShowImage(true); // Reset showImage to true
                setFontSize(24); // Reset font size to default
                setIsCanvasReady(false); // Reset canvas readiness when going back
                setIsImageLoaded(false); // Reset image load state
              }}
            >
              Go Back
            </button>
          </div>

          {/* Slider to adjust font size */}
          <div className="mt-4">
            <h3 className="block text-white text-sm mb-2">Font Size: {fontSize}</h3>
            <input
              type="range"
              min="10"
              max="200"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))} // Update the font size state
              className="w-full"
            />
          </div>
          {/* Slider to adjust font thickness */}
          {/* <div className="mt-4">
            <label htmlFor="fontThicknessSlider" className="mr-4">Font Thickness: {fontThickness}</label>
            <input
              id="fontThicknessSlider"
              type="range"
              min="1"
              max="10"
              value={fontThickness}
              onChange={(e) => setFontThickness(e.target.value)}
              className="mr-6"
            />
          </div> */}
        </div>
      )}

      {!selectedImage && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <div
              key={index}
              className="relative w-full h-0 pb-[66.66%] overflow-hidden cursor-pointer"
              onClick={() => setSelectedImage(img)}
            >
              <img
                src={img}
                alt={`Image ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover rounded-md hover:opacity-90"
                onLoad={handleImageLoad} // Make sure this is triggered correctly
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
