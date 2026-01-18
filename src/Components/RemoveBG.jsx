import { useRef, useState, useEffect } from "react";

export default function RemoveBG() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [image, setImage] = useState(null);
  const [frame, setFrame] = useState("4.png");
  const [imgPos, setImgPos] = useState({ x: 0, y: 0, scale: 1 });
  const [text, setText] = useState("");
  const [textPos, setTextPos] = useState({ x: 100, y: 400 });
  const [filter, setFilter] = useState("none");
  const [dragTarget, setDragTarget] = useState(null);

  const frames = ["4.png", "3.png"];

  const drawImageCover = (ctx, img, x, y, w, h) => {
    const imgRatio = img.width / img.height;
    const canvasRatio = w / h;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgRatio > canvasRatio) {
      drawHeight = h;
      drawWidth = h * imgRatio;
      offsetX = x - (drawWidth - w) / 2;
      offsetY = y;
    } else {
      drawWidth = w;
      drawHeight = w / imgRatio;
      offsetX = x;
      offsetY = y - (drawHeight - h) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = canvas.width;

    ctx.clearRect(0, 0, size, size);

    if (!image) return;

    const baseImg = new Image();
    const frameImg = new Image();
    baseImg.src = image;
    frameImg.src = frame;

    baseImg.onload = () => {
      ctx.save();
      ctx.filter = filter;
      ctx.translate(imgPos.x, imgPos.y);
      ctx.scale(imgPos.scale, imgPos.scale);
      drawImageCover(ctx, baseImg, 0, 0, size, size);
      ctx.restore();

      frameImg.onload = () => {
        ctx.drawImage(frameImg, 0, 0, size, size);

        if (text) {
          ctx.fillStyle = "white";
          ctx.font = "bold 40px Arial";
          ctx.textAlign = "center";
          ctx.fillText(text, textPos.x, textPos.y);
        }
      };
    };
  };

  useEffect(() => {
    drawCanvas();
  }, [image, frame, imgPos, text, textPos, filter]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const handlePointerMove = (e) => {
    if (!dragTarget) return;
    if (dragTarget === "image") {
      setImgPos((p) => ({ ...p, x: p.x + e.movementX, y: p.y + e.movementY }));
    }
    if (dragTarget === "text") {
      setTextPos((p) => ({ x: p.x + e.movementX, y: p.y + e.movementY }));
    }
  };

  const handleZoom = (delta) => {
    setImgPos((p) => ({
      ...p,
      scale: Math.min(Math.max(p.scale + delta, 0.1), 5),
    }));
  };

  const downloadImage = () => {
    const link = document.createElement("a");
    link.download = "twibbon.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <div
      className="bebas-neue-regular min-h-screen bg-[#090919] text-cyan-400 flex flex-col p-8 font-mono justify-center items-center"
      onPointerMove={handlePointerMove}
      onPointerUp={() => setDragTarget(null)}
    >
      <h1 className="text-center text-4xl md:text-7xl font-bold tracking-tighter">
        তৈরী করুন আপনার ছবি
      </h1>

      <div className="w-72 p-4 space-y-3">
        <h1 className="text-center macondo-regular">Upload Your Image</h1>
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          id="fileInput"
          className="hidden"
        />
        <label
          htmlFor="fileInput"
          className="flex flex-col items-center justify-center cursor-pointer text-center border border-cyan-400/50 p-4 rounded-lg hover:border-purple-500 transition"
        >
          <img src="https://cdn-icons-png.flaticon.com/512/2716/2716054.png" alt="" width={24} />
          <span className="text-sm opacity-35 font-serif">Supported Formats: JPG, PNG</span>
        </label>

        
      </div>
      {image && <div className="w-72 p-4 space-y-3">
        <button onClick={downloadImage} className="w-full bg-cyan-400/50 text-white hover:bg-cyan-400 p-3 rounded">Download</button>
      </div>}
      {image && (
        <div className="flex flex-col justify-center items-center">
          <div ref={containerRef} className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={800}
              className="w-80 h-80 bg-black rounded"
              onPointerDown={() => setDragTarget("image")}
            />
          </div>
          {image && (
          <div className="flex justify-center space-x-2 mt-2">
            <button onClick={() => handleZoom(-0.1)} className="bg-cyan-400/50 text-white px-4 py-2 rounded">Zoom Out</button>
            <button onClick={() => handleZoom(0.1)} className="bg-cyan-400/50 text-white px-4 py-2 rounded">Zoom In</button>
          </div>
        )}
        </div>
      )}

      <div className="flex flex-row p-2 space-x-2 justify-center">
        {frames.map((f, index) => (
          <img
            key={index}
            src={f}
            onClick={() => setFrame(f)}
            className={`w-16 h-16 rounded cursor-pointer border-2 transition ${frame === f ? "border-cyan-400" : "border-transparent"}`}
            draggable={false}
          />
        ))}
      </div>

    </div>
  );
}
