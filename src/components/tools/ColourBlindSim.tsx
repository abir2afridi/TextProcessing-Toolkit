import { useState, useCallback, useRef } from "react";
import { Upload, Download, Trash2, Eye, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFilePaste } from "@/hooks/use-file-paste";

interface ColourBlindnessType {
  id: string;
  name: string;
  description: string;
  matrix: number[];
}

const COLOUR_BLINDNESS_TYPES: ColourBlindnessType[] = [
  {
    id: "normal",
    name: "Normal Vision",
    description: "Standard trichromatic vision",
    matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],
  },
  {
    id: "protanopia",
    name: "Protanopia",
    description: "No red cones (~1% of males)",
    matrix: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
  },
  {
    id: "deuteranopia",
    name: "Deuteranopia",
    description: "No green cones (~1% of males)",
    matrix: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
  },
  {
    id: "tritanopia",
    name: "Tritanopia",
    description: "No blue cones (<1% of males)",
    matrix: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525],
  },
  {
    id: "achromatopsia",
    name: "Achromatopsia",
    description: "Complete colour blindness",
    matrix: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.114],
  },
  {
    id: "protanomaly",
    name: "Protanomaly",
    description: "Reduced red cones (~1% of males)",
    matrix: [0.817, 0.183, 0, 0.333, 0.667, 0, 0, 0.125, 0.875],
  },
  {
    id: "deuteranomaly",
    name: "Deuteranomaly",
    description: "Reduced green cones (~5% of males)",
    matrix: [0.8, 0.2, 0, 0.258, 0.742, 0, 0, 0.142, 0.858],
  },
  {
    id: "tritanomaly",
    name: "Tritanomaly",
    description: "Reduced blue cones (<1% of males)",
    matrix: [0.967, 0.033, 0, 0, 0.733, 0.267, 0, 0.183, 0.817],
  },
];

function applyColourMatrix(
  imageData: ImageData,
  matrix: number[]
): ImageData {
  const data = imageData.data;
  const result = new ImageData(new Uint8ClampedArray(data), imageData.width, imageData.height);
  const rd = result.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    rd[i] = Math.min(255, Math.max(0, matrix[0] * r + matrix[1] * g + matrix[2] * b));
    rd[i + 1] = Math.min(255, Math.max(0, matrix[3] * r + matrix[4] * g + matrix[5] * b));
    rd[i + 2] = Math.min(255, Math.max(0, matrix[6] * r + matrix[7] * g + matrix[8] * b));
    rd[i + 3] = data[i + 3];
  }

  return result;
}

export default function ColourBlindSim() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("protanopia");
  const [processedImages, setProcessedImages] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = useCallback(
    async (dataUrl: string, type: string) => {
      const typeInfo = COLOUR_BLINDNESS_TYPES.find((t) => t.id === type);
      if (!typeInfo) return;

      setIsProcessing(true);

      try {
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = dataUrl;
        });

        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const result = applyColourMatrix(imageData, typeInfo.matrix);

        ctx.putImageData(result, 0, 0);
        const outputUrl = canvas.toDataURL("image/png");
        setProcessedImages((prev) => ({ ...prev, [type]: outputUrl }));
      } catch {
        console.error("Failed to process image");
      } finally {
        setIsProcessing(false);
      }
    },
    []
  );

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setSourceImage(dataUrl);
      setProcessedImages({});
      if (selectedType === "normal") return;
      processImage(dataUrl, selectedType);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      readFile(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      readFile(file);
    }
  };

  useFilePaste(readFile, "image/*");

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    if (sourceImage && type !== "normal" && !processedImages[type]) {
      processImage(sourceImage, type);
    }
  };

  const downloadImage = () => {
    const url = selectedType === "normal" ? sourceImage : processedImages[selectedType];
    if (!url) return;
    const link = document.createElement("a");
    link.download = `colour-blind-${selectedType}.png`;
    link.href = url;
    link.click();
  };

  const clearImage = () => {
    setSourceImage(null);
    setProcessedImages({});
  };

  const displayImage =
    selectedType === "normal" ? sourceImage : processedImages[selectedType] ?? sourceImage;

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />

      {!sourceImage ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => document.getElementById("cb-file-input")?.click()}
        >
          <input
            id="cb-file-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Upload className="size-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Drop an image here</p>
          <p className="text-sm text-muted-foreground mt-1">
            or click to select a file, or paste
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Colour Blindness Simulation</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={clearImage}>
                <Trash2 className="size-4 mr-2" />
                Clear
              </Button>
              <Button size="sm" onClick={downloadImage} disabled={isProcessing}>
                <Download className="size-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          <Tabs value={selectedType} onValueChange={handleTypeChange}>
            <TabsList className="flex flex-wrap h-auto gap-1 p-1">
              {COLOUR_BLINDNESS_TYPES.map((type) => (
                <TabsTrigger
                  key={type.id}
                  value={type.id}
                  className="text-xs"
                >
                  {type.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-1">
                <Eye className="size-3" /> Original
              </p>
              <div className="relative rounded-xl overflow-hidden bg-muted aspect-square flex items-center justify-center">
                <img
                  src={sourceImage}
                  alt="Original"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-1">
                <Eye className="size-3" />{" "}
                {COLOUR_BLINDNESS_TYPES.find((t) => t.id === selectedType)?.name}
              </p>
              <div className="relative rounded-xl overflow-hidden bg-muted aspect-square flex items-center justify-center">
                {isProcessing ? (
                  <div className="text-sm text-muted-foreground">Processing...</div>
                ) : displayImage ? (
                  <img
                    src={displayImage}
                    alt={selectedType}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-sm text-muted-foreground">Click a type above</div>
                )}
              </div>
            </div>
          </div>

          {selectedType !== "normal" && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
              <Info className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                {COLOUR_BLINDNESS_TYPES.find((t) => t.id === selectedType)?.description}
                {" — "}
                This simulation shows approximately how the image appears to someone with this
                type of colour vision deficiency.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
