import { useEffect, useRef } from "react";

/**
 * Self-preview of the live camera stream — shows the user what the AI sees.
 * Mirrored (selfie-style) and muted; binds the stream via ref since `srcObject`
 * can't be set as a JSX attribute.
 */
export function CameraPreview({ stream }: { stream: MediaStream | null }) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.srcObject = stream;
    if (stream) {
      const p = video.play?.();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
  }, [stream]);

  return (
    <video
      ref={ref}
      data-testid="camera-preview"
      autoPlay
      muted
      playsInline
      className="h-24 w-32 rounded-xl object-cover ring-1 ring-white/15 shadow-lg"
      style={{ transform: "scaleX(-1)" }}
    />
  );
}
