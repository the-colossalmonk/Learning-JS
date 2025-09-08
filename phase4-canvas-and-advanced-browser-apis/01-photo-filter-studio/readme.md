# Phase 4, Project 1: Photo Filter Studio

This is an interactive, browser-based photo editing application built with vanilla JavaScript. It allows users to upload their own images, apply a variety of Instagram-style filters in real-time, add text overlays, and download their creations. The application uses the HTML Canvas API to manipulate image data at the pixel level.

### Key Features

-   **Local Image Processing:** Upload any image from your computer and edit it directly in the browser. No data is sent to a server.
-   **One-Click Filters:** Apply classic filters like Grayscale, Sepia, and Invert instantly.
-   **Adjustable Filters:** Fine-tune the image with sliders for Brightness, Contrast, and Saturation, with real-time updates.
-   **Advanced Convolution Filters:** Apply matrix-based filters for professional effects like Sharpen, Blur, and Edge Detection.
-   **Draggable Text Overlays:** Add custom text to your image, choose its color, and drag it to the perfect position.
-   **Undo Functionality:** Made a mistake? The app keeps a history of your filter applications, allowing you to step back with an "Undo" button.
-   **Download Your Creation:** Save your edited image (with text overlays baked in) as a PNG file directly from the browser.

---

### Core JavaScript Concepts Covered

This project is a deep dive into the HTML Canvas API and demonstrates a range of advanced, client-side browser capabilities.

#### 1. Canvas Pixel Manipulation (`getImageData` / `putImageData`)

The core of the application is the ability to read, manipulate, and write raw pixel data.
-   `ctx.drawImage()` renders the user's uploaded image to the canvas.
-   `ctx.getImageData()` reads the entire canvas into a `Uint8ClampedArray`, which contains the R, G, B, and A (alpha) value for every single pixel.
-   Filter functions loop through this massive array, applying mathematical transformations to each pixel's RGBA values.
-   `ctx.putImageData()` writes the modified pixel array back to the canvas, instantly displaying the result.

**Example: The Grayscale filter algorithm (`script.js`)**

```javascript
grayscale: (imgData) => {
    // Create a copy of the pixel data to avoid modifying the original
    const data = new Uint8ClampedArray(imgData.data);
    // Loop through every pixel (4 values at a time: R, G, B, A)
    for (let i = 0; i < data.length; i += 4) {
        // Calculate the average of the R, G, and B values
        const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        // Set R, G, and B to the average, creating a shade of gray
        data[i] = data[i + 1] = data[i + 2] = avg;
    }
    // Return a new ImageData object with the modified data
    return new ImageData(data, imgData.width, imgData.height);
}
```

#### 2. Convolution Kernels for Advanced Filters

Filters like "Sharpen" and "Blur" are implemented using a convolution matrix (or "kernel"). This is an advanced image processing technique where each pixel's final value is determined by a weighted average of its neighboring pixels. This demonstrates a deeper, more algorithmic approach to pixel manipulation.

**Example: Applying a convolution kernel (`script.js`)**
```javascript
// A "sharpen" kernel enhances the difference between a pixel and its neighbors
const sharpenKernel = [[0, -1, 0], [-1, 5, -1], [0, -1, 0]];

function applyConvolution(imgData, kernel) {
    // ... loops through every pixel (x, y) ...
    // For each pixel, it loops through its neighbors according to the kernel
    // It calculates the new R, G, B values based on the weighted sum
    // ... returns new ImageData ...
}
```

#### 3. Advanced Browser APIs (`FileReader`)

To handle local file uploads without a server, the application uses the `FileReader` API. This API allows JavaScript to asynchronously read the contents of files that the user has selected, which is essential for loading the image into the application.

#### 4. State Management for History (Undo)

To enable the "Undo" feature, the application maintains a `historyStack` array. Every time a filter is successfully applied, the new `ImageData` object is pushed onto the stack. The Undo button simply pops the last state off the stack and redraws the canvas with the state before it, demonstrating a practical use of the stack data structure.

#### 5. Combining DOM and Canvas

The draggable text feature showcases how to layer interactive HTML elements (`<div contenteditable>`) on top of a `<canvas>` element. When downloading the image, the text from these DOM elements is "baked" onto the canvas using `ctx.fillText()`, demonstrating how to merge two different rendering contexts into a single output.

### How to Run

1.  Save the three files (`index.html`, `style.css`, `script.js`) in the same folder.
2.  Open `index.html` in your web browser.
3.  Click "Upload Image" to begin.
```