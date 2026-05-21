import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Video, VideoOff, Download, Trash2, Play, Pause, Square } from "lucide-react";
import { toast } from "sonner";

interface MediaItem {
  type: "image" | "video";
  value: string;
  createdAt: Date;
}

export default function CameraRecorder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [isSupported, setIsSupported] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [permissionBlocked, setPermissionBlocked] = useState(false);
  const [streamActive, setStreamActive] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [currentCamera, setCurrentCamera] = useState("");
  const [currentMicrophone, setCurrentMicrophone] = useState("");
  const [recordingState, setRecordingState] = useState<"stopped" | "recording" | "paused">("stopped");
  const [isRecordingSupported, setIsRecordingSupported] = useState(true);
  const [medias, setMedias] = useState<MediaItem[]>([]);

  useEffect(() => {
    setIsSupported(!!navigator.mediaDevices?.getUserMedia);
    setIsRecordingSupported(typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported("video/webm"));
  }, []);

  const enumerateDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter((d) => d.kind === "videoinput");
      const mics = devices.filter((d) => d.kind === "audioinput");
      setCameras(cams);
      setMicrophones(mics);
      if (cams.length > 0 && !currentCamera) setCurrentCamera(cams[0].deviceId);
      if (mics.length > 0 && !currentMicrophone) setCurrentMicrophone(mics[0].deviceId);
    } catch {}
  }, [currentCamera, currentMicrophone]);

  useEffect(() => {
    if (permissionGranted) enumerateDevices();
  }, [permissionGranted, enumerateDevices]);

  const requestPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermissionGranted(true);
      setPermissionBlocked(false);
    } catch {
      setPermissionBlocked(true);
    }
  };

  const startStream = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        video: currentCamera ? { deviceId: { exact: currentCamera } } : true,
      };
      if (currentMicrophone) {
        constraints.audio = { deviceId: { exact: currentMicrophone } };
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setStreamActive(true);
      setPermissionGranted(true);
    } catch {
      toast.error("Failed to access camera/microphone");
    }
  };

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreamActive(false);
    if (mediaRecorderRef.current && recordingState !== "stopped") {
      mediaRecorderRef.current.stop();
    }
    setRecordingState("stopped");
  }, [recordingState]);

  useEffect(() => {
    return () => { stopStream(); };
  }, [stopStream]);

  const takeScreenshot = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const image = canvas.toDataURL("image/png");
    setMedias((prev) => [{ type: "image", value: image, createdAt: new Date() }, ...prev]);
    toast.success("Screenshot taken");
  };

  const startRecording = () => {
    if (!streamRef.current || !isRecordingSupported) return;
    recordedChunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setMedias((prev) => [{ type: "video", value: url, createdAt: new Date() }, ...prev]);
      recordedChunksRef.current = [];
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecordingState("recording");
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState !== "stopped") {
      mediaRecorderRef.current.stop();
      setRecordingState("stopped");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.pause();
      setRecordingState("paused");
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === "paused") {
      mediaRecorderRef.current.resume();
      setRecordingState("recording");
    }
  };

  const downloadMedia = (item: MediaItem) => {
    const link = document.createElement("a");
    link.href = item.value;
    link.download = `${item.type}-${item.createdAt.getTime()}.${item.type === "image" ? "png" : "webm"}`;
    link.click();
    toast.success(`${item.type === "image" ? "Image" : "Video"} downloaded`);
  };

  const deleteMedia = (index: number) => {
    setMedias((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isSupported) {
    return (
      <div className="rounded-sm border border-border bg-surface p-4 text-center font-mono text-xs text-muted-foreground">
        Your browser does not support recording video from camera
      </div>
    );
  }

  if (!permissionGranted && !streamActive) {
    return (
      <div className="rounded-sm border border-border bg-surface p-4 text-center font-mono text-xs text-foreground">
        <div className="mb-4">You need to grant permission to use your camera and microphone</div>
        {permissionBlocked && (
          <div className="mb-4 rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-left font-mono text-[11px] text-destructive">
            Your browser has blocked permission request or does not support it. You need to grant permission manually in
            your browser settings (usually the lock icon in the address bar).
          </div>
        )}
        {!permissionBlocked && (
          <div className="flex justify-center">
            <Button size="sm" onClick={requestPermissions} className="h-8 rounded-sm font-mono text-xs">
              Grant permission
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-border bg-surface p-4">
        <div className="mb-3 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="w-[60px] font-mono text-[11px] text-muted-foreground">Video:</span>
            <select
              value={currentCamera}
              onChange={(e) => setCurrentCamera(e.target.value)}
              className="h-7 flex-1 rounded-sm border border-border bg-background px-2 font-mono text-xs text-foreground outline-none focus:border-primary/50"
            >
              {cameras.map((c) => (
                <option key={c.deviceId} value={c.deviceId}>{c.label || `Camera ${c.deviceId.slice(0, 8)}`}</option>
              ))}
            </select>
          </div>
          {microphones.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="w-[60px] font-mono text-[11px] text-muted-foreground">Audio:</span>
              <select
                value={currentMicrophone}
                onChange={(e) => setCurrentMicrophone(e.target.value)}
                className="h-7 flex-1 rounded-sm border border-border bg-background px-2 font-mono text-xs text-foreground outline-none focus:border-primary/50"
              >
                {microphones.map((m) => (
                  <option key={m.deviceId} value={m.deviceId}>{m.label || `Microphone ${m.deviceId.slice(0, 8)}`}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {!streamActive ? (
          <div className="flex justify-center">
            <Button size="sm" onClick={startStream} className="h-8 rounded-sm font-mono text-xs">
              <Camera className="mr-1.5 h-3.5 w-3.5" />
              Start webcam
            </Button>
          </div>
        ) : (
          <>
            <div className="my-2">
              <video ref={videoRef} autoPlay controls playsInline className="max-h-full w-full rounded-sm" />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button size="sm" onClick={takeScreenshot} className="h-8 rounded-sm font-mono text-xs">
                <Camera className="mr-1.5 h-3.5 w-3.5" />
                Take screenshot
              </Button>

              {isRecordingSupported ? (
                <div className="flex flex-wrap justify-center gap-2">
                  {recordingState === "stopped" && (
                    <Button size="sm" onClick={startRecording} className="h-8 rounded-sm font-mono text-xs">
                      <Video className="mr-1.5 h-3.5 w-3.5" />
                      Start recording
                    </Button>
                  )}
                  {recordingState === "recording" && (
                    <Button size="sm" onClick={pauseRecording} className="h-8 rounded-sm font-mono text-xs">
                      <Pause className="mr-1.5 h-3.5 w-3.5" />
                      Pause
                    </Button>
                  )}
                  {recordingState === "paused" && (
                    <Button size="sm" onClick={resumeRecording} className="h-8 rounded-sm font-mono text-xs">
                      <Play className="mr-1.5 h-3.5 w-3.5" />
                      Resume
                    </Button>
                  )}
                  {recordingState !== "stopped" && (
                    <Button size="sm" onClick={stopRecording} className="h-8 rounded-sm font-mono text-xs">
                      <Square className="mr-1.5 h-3.5 w-3.5" />
                      Stop
                    </Button>
                  )}
                </div>
              ) : (
                <div className="font-mono text-[11px] italic text-muted-foreground/60">
                  Video recording is not supported in your browser
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {medias.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {medias.map((item, index) => (
            <div key={index} className="rounded-sm border border-border bg-surface p-3">
              {item.type === "image" ? (
                <img src={item.value} alt="Screenshot" className="w-full rounded-sm" />
              ) : (
                <video src={item.value} controls className="w-full rounded-sm" />
              )}
              <div className="mt-2 flex items-center justify-between">
                <div className="font-mono text-[11px] font-bold text-foreground">
                  {item.type === "image" ? "Screenshot" : "Video"}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => downloadMedia(item)}>
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => deleteMedia(index)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
