📐 Blueprint Studio: Vector & Sketch Editor

A high-performance, purely mathematical 2D canvas rigging tool built with React and Next.js.

Blueprint Studio allows developers and artists to trace over reference images using mathematical vector curves (Bezier, Quadratic, Lines) or freehand sketches, and immediately export the exact CanvasRenderingContext2D JavaScript formulas to paste into their own engines.

 (You can add a screenshot here later)

✨ Features

Dual Engine: Switch seamlessly between Vector Rigging (manipulating exact mathematical anchors) and Freehand Sketching (for static accessories).

Magnetic Snapping: Anchors intelligently snap to the center X-axis (marked in green) or to adjacent nodes (marked in amber) to ensure perfectly closed loops.

Live Mirror Symmetry: Draw on the left side of the canvas and watch the right side generate perfectly mirrored math in real-time.

Canvas Code Generation: One-click export translates your visual geometry into flawless, ready-to-run HTML5 Canvas code (ctx.bezierCurveTo(), etc.).

Trace References: Upload any PNG/SVG reference image, adjust its scale, opacity, and X/Y offsets, and trace directly over it.

🚀 Quick Start

Clone the repository:

git clone [https://github.com/your-username/blueprint-studio.git](https://github.com/your-username/blueprint-studio.git)
cd blueprint-studio


Install dependencies:

npm install


Run the development server:

npm run dev


Open http://localhost:3000 with your browser to see the result.

🛠️ Tech Stack

Framework: Next.js (App Router)

Language: TypeScript

Styling: Tailwind CSS

Rendering: HTML5 <canvas>

📜 License

This project is licensed under the MIT License - see the LICENSE file for details.