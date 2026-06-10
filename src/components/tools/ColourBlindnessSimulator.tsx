import { useState, useCallback, useRef } from "react";
import { Upload, Download, Trash2, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFilePaste } from "@/hooks/use-file-paste";

type CvdType = "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia";

const CVD_MATRICES: Record<CvdType, [number, number, number][]> = {
  protanopia: [
    [0.152286, 0.847714, 0.000002],
    [0.152286, 0.847714, 0.000002],
    [0.002737, 0.000000, 0.997263],
  ],
  deuteranopia: [
    [0.367322, 0.632678, 0.000000],
    [0.367322, 0.632678, 0.000000],
    [0.000000, 0.000000, 1.000000],
  ],
  tritanopia: [
    [1.000000, 0.000000, 0.000000],
    [0.000000, 1.000000, 0.000000],
    [-0.011246, 0.011246, 1.000000],
  ],
  achromatopsia: [
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
    [0.299, 0.587, 0.114],
  ],
};

const CVD_INFO: Record<CvdType, { label: string; desc: string; prevalence: string }> = {
  protanopia: {
    label: "Protanopia",
    desc: "Red-blind — L-cone (long wavelength) deficiency",
    prevalence: "~1 in 12 males",
  },
  deuteranopia: {
    label: "Deuteranopia",
    desc: "Green-blind — M-cone (medium wavelength) deficiency",
    prevalence: "~1 in 20 males",
  },
  tritanopia: {
    label: "Tritanopia",
    desc: "Blue-blind — S-cone (short wavelength) deficiency",
    prevalence: "~1 in 30,000",
  },
  achromatopsia: {
    label: "Achromatopsia",
    desc: "Total color blindness — no cone function",
    prevalence: "~1 in 30,000",
  },
};

function simulate(data: ImageData, matrix: [number, number, number][]): ImageData {
  const pixels = data.data;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i] / 255;
    const g = pixels[i + 1] / 255;
    const b = pixels[i + 2] / 255;
    pixels[i] = Math.min(255, Math.max(0, Math.round((r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2]) * 255)));
    pixels[i + 1] = Math.min(255, Math.max(0, Math.round((r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2]) * 255)));
    pixels[i + 2] = Math.min(255, Math.max(0, Math.round((r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2]) * 255)));
  }
  return data;
}

export default function ColourBlindnessSimulator() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [simulatedImage, setSimulatedImage] = useState<string | null>(null);
  const [cvdType, setCvdType] = useState<CvdType>("protanopia");
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = useCallback((dataUrl: string, type: CvdType) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      simulate(imageData, CVD_MATRICES[type]);
      ctx.putImageData(imageData, 0, 0);
      setSimulatedImage(canvas.toDataURL("image/png"));
      setIsProcessing(false);
    };
    img.src = dataUrl;
  }, []);

  const readFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setSourceImage(dataUrl);
      setIsProcessing(true);
      processImage(dataUrl, cvdType);
    };
    reader.readAsDataURL(file);
  }, [cvdType, processImage]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      readFile(file);
    }
  }, [readFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      readFile(file);
    }
  }, [readFile]);

  useFilePaste(readFile, "image/*");

  const clearImage = useCallback(() => {
    setSourceImage(null);
    setSimulatedImage(null);
    setIsProcessing(false);
  }, []);

  const downloadResult = useCallback(() => {
    if (!simulatedImage) return;
    const link = document.createElement("a");
    link.download = `colour-blindness-${cvdType}.png`;
    link.href = simulatedImage;
    link.click();
  }, [simulatedImage, cvdType]);

  const handleTypeChange = useCallback((value: string) => {
    const type = value as CvdType;
    setCvdType(type);
    if (sourceImage) {
      setIsProcessing(true);
      processImage(sourceImage, type);
    }
  }, [sourceImage, processImage]);

  const info = CVD_INFO[cvdType];

  return (
    <div className="space-y-6">
      {!sourceImage ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => document.getElementById("cvd-input")?.click()}
        >
          <input
            id="cvd-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <EyeOff className="size-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Drop an image here</p>
          <p className="text-sm text-muted-foreground mt-1">
            or click to select a file, or paste
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-bold">Colour Blindness Simulator</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={clearImage}>
                <Trash2 className="size-4 mr-2" />
                Clear
              </Button>
              {simulatedImage && (
                <Button size="sm" onClick={downloadResult}>
                  <Download className="size-4 mr-2" />
                  Download PNG
                </Button>
              )}
            </div>
          </div>

          <Tabs value={cvdType} onValueChange={handleTypeChange}>
            <TabsList className="w-full flex-wrap h-auto">
              {Object.entries(CVD_INFO).map(([key, val]) => (
                <TabsTrigger key={key} value={key} className="flex-1 min-w-0">
                  {val.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {sourceImage && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <EyeOff className="size-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">{info.label}</p>
                <p className="text-xs text-muted-foreground">{info.desc}</p>
                <p className="text-xs text-muted-foreground">Prevalence: {info.prevalence}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center font-medium">Original</p>
              <div className="relative rounded-xl overflow-hidden bg-muted aspect-square flex items-center justify-center">
                <img
                  src={sourceImage}
                  alt="Original"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center font-medium">
                {info.label} Simulation
              </p>
              <div className="relative rounded-xl overflow-hidden bg-muted aspect-square flex items-center justify-center">
                {isProcessing ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <EyeOff className="size-5 animate-pulse" />
                    <span className="text-sm">Processing...</span>
                  </div>
                ) : simulatedImage ? (
                  <img
                    src={simulatedImage}
                    alt={`${info.label} simulation`}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
