import { useState, useRef, useEffect } from "react";

function RemoveBG() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [template, setTemplate] = useState("temple1");
  const [cutout, setCutout] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Drag & Zoom
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const canvasRef = useRef(null);

  // Template sizes to match preview with download
  const [templateSize, setTemplateSize] = useState({ width: 1, height: 1 });

  const templates = [
    { name: "temple2", img: "4.png" },
  ];

  // Load template size
  const loadTemplate = (templateName) => {
    const temp = templates.find((t) => t.name === templateName);
    const img = new Image();
    img.src = temp.img;
    img.onload = () =>
      setTemplateSize({ width: img.width, height: img.height });
  };

  useEffect(() => {
    loadTemplate(template);
  }, [template]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setCutout(null);
    setPosition({ x: 0, y: 0 });
    setScale(1);
  };

  // Drag Handlers
  const startDrag = (e) => {
    setDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const onDrag = (e) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const stopDrag = () => setDragging(false);

  // Remove BG
  const submit = async () => {
    if (!image) {
      alert("Please upload an image first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image_file", image);

      const res = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: { "X-Api-Key": "vgnm1Mpw7MhxAQgvrw5622Ca" },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to remove background");

      const blob = await res.blob();
      const cutoutURL = URL.createObjectURL(blob);

      setCutout(cutoutURL);
      setPosition({ x: 0, y: 0 });
      setScale(1);
    } catch (err) {
      setError(err.message || "Error removing background");
    } finally {
      setLoading(false);
    }
  };

  // Download final image matching preview
  const downloadFinal = async () => {
    const loadImage = (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
      });

    const templateImg = await loadImage(
      templates.find((t) => t.name === template).img
    );
    const userImg = await loadImage(cutout);

    const canvas = canvasRef.current;
    canvas.width = templateImg.width;
    canvas.height = templateImg.height;
    const ctx = canvas.getContext("2d");

    // Preview container size
    const previewWidth = 320;
    const previewHeight =
      (previewWidth * templateSize.height) / templateSize.width;

    // Ratio between original template and preview
    const ratioX = templateImg.width / previewWidth;
    const ratioY = templateImg.height / previewHeight;

    // Draw cutout scaled and positioned exactly
    const imgW = userImg.width * scale * ratioX;
    const imgH = userImg.height * scale * ratioY;
    const centerX = templateImg.width / 2 + position.x * ratioX;
    const centerY = templateImg.height / 2 + position.y * ratioY;

    ctx.drawImage(userImg, centerX - imgW / 2, centerY - imgH / 2, imgW, imgH);

    // Draw template on top
    ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "temple-photo.png";
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#090919] text-cyan-400 p-8 font-mono relative overflow-hidden">
      <main className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-8">
        <h1 className="text-4xl md:text-7xl font-bold tracking-tighter">
          Temple Photo Editor
        </h1>

        {/* Upload Section */}
        <div className="w-full max-w-2xl border-2 border-cyan-400/50 rounded-lg p-8 bg-black/50">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            id="fileInput"
            className="hidden"
          />
          <label
            htmlFor="fileInput"
            className="flex flex-col items-center justify-center cursor-pointer text-center border border-cyan-400/50 p-4 rounded-lg hover:border-purple-500 transition"
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/2716/2716054.png"
              alt=""
              width={40}
            />
            <span className="text-sm opacity-35 font-serif">
              Supported Formats: JPG, PNG
            </span>
          </label>

          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-4 rounded-lg border border-cyan-400/50"
            />
          )}
        </div>

        {/* Template Selection */}
        <div className="grid grid-cols-2 gap-4 mt-4 w-full max-w-2xl">
          {templates.map((temp) => (
            <div
              key={temp.name}
              onClick={() => setTemplate(temp.name)}
              className={`border-4 rounded-lg cursor-pointer overflow-hidden transition-all duration-300 ${
                template === temp.name
                  ? "border-cyan-400 scale-105"
                  : "border-cyan-400/30 hover:border-purple-500"
              }`}
            >
              <img src={temp.img} alt={temp.name} />
            </div>
          ))}
        </div>

        {/* Remove BG Button */}
        <button
          onClick={submit}
          disabled={loading}
          className="border border-cyan-400/50 px-6 py-2 rounded hover:border-purple-500 transition"
        >
          {loading ? "Processing..." : "Remove Background"}
        </button>

        {error && <p className="text-red-500 mt-2">{error}</p>}

        {/* Frame Editor */}
        {cutout && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <div
              onMouseMove={onDrag}
              onMouseUp={stopDrag}
              onMouseLeave={stopDrag}
              className="relative rounded-xl overflow-hidden border border-cyan-400/50"
              style={{
                width: 320,
                height: (320 * templateSize.height) / templateSize.width,
              }}
            >
              {/* Cutout */}
              <img
                src={cutout}
                onMouseDown={startDrag}
                draggable={false}
                className="absolute cursor-grab"
                style={{
                  left: `calc(50% + ${position.x}px)`,
                  top: `calc(50% + ${position.y}px)`,
                  transform: `translate(-50%, -50%) scale(${scale})`,
                }}
              />

              {/* Frame overlay */}
              <img
                src={templates.find((t) => t.name === template).img}
                className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
              />
            </div>

            {/* Zoom & Download */}
            <div className="flex gap-4 mt-2">
              <button onClick={() => setScale((s) => Math.max(0.1, s - 0.1))}>
                − Zoom
              </button>
              <button onClick={() => setScale((s) => Math.min(5, s + 0.1))}>
                + Zoom
              </button>
              <button onClick={downloadFinal}>Download</button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </main>
    </div>
  );
}

export default RemoveBG;
