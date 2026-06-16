import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VoiceView } from "./voice-view";
import type { VoiceConversation } from "./use-voice-conversation";

const conversationMock = vi.hoisted(() => ({
  state: "idle" as VoiceConversation["state"],
  cameraActive: false,
  cameraStream: null as MediaStream | null,
  start: vi.fn(),
  stop: vi.fn(),
  interrupt: vi.fn(),
  toggleCamera: vi.fn(),
}));

vi.mock("./use-voice-conversation", () => ({
  useVoiceConversation: () => ({
    state: conversationMock.state,
    lastUserText: "",
    lastAssistantText: "",
    error: null,
    start: conversationMock.start,
    stop: conversationMock.stop,
    interrupt: conversationMock.interrupt,
    cameraActive: conversationMock.cameraActive,
    cameraStream: conversationMock.cameraStream,
    cameraError: null,
    toggleCamera: conversationMock.toggleCamera,
  }),
}));

vi.mock("./voice-orb", () => ({
  VoiceOrb: ({ state }: { state: string }) => (
    <div data-testid="voice-orb-state">{state}</div>
  ),
}));

vi.mock("./voice-selector", () => ({
  VoiceSelector: () => <div data-testid="voice-selector" />,
}));

vi.mock("./camera-preview", () => ({
  CameraPreview: () => <div data-testid="camera-preview" />,
}));

vi.mock("./audio-playback", () => ({
  unlockAudio: vi.fn(),
}));

describe("VoiceView", () => {
  beforeEach(() => {
    cleanup();
    conversationMock.state = "idle";
    conversationMock.cameraActive = false;
    conversationMock.cameraStream = null;
    conversationMock.start.mockReset();
    conversationMock.stop.mockReset();
    conversationMock.interrupt.mockReset();
    conversationMock.toggleCamera.mockReset();
  });

  it("waits for an orb click before starting microphone capture", () => {
    render(<VoiceView sessionId="voice-test" onBack={vi.fn()} />);

    expect(conversationMock.start).not.toHaveBeenCalled();
    expect(screen.getByText("点光球开始说话")).toBeTruthy();
    expect(screen.queryByTestId("voice-selector")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "voice orb" }));

    expect(conversationMock.start).toHaveBeenCalledTimes(1);
  });

  it("toggles the camera when the camera button is clicked", () => {
    render(<VoiceView sessionId="voice-test" onBack={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "toggle camera" }));

    expect(conversationMock.toggleCamera).toHaveBeenCalledTimes(1);
  });

  it("shows a starting indicator when the camera is on but the stream isn't ready", () => {
    conversationMock.cameraActive = true;
    conversationMock.cameraStream = null;
    render(<VoiceView sessionId="voice-test" onBack={vi.fn()} />);

    expect(screen.getByText("摄像头开启中…")).toBeTruthy();
    expect(screen.queryByTestId("camera-preview")).toBeNull();
  });

  it("shows the self-preview once the stream is live", () => {
    conversationMock.cameraActive = true;
    conversationMock.cameraStream = {} as MediaStream;
    render(<VoiceView sessionId="voice-test" onBack={vi.fn()} />);

    expect(screen.getByTestId("camera-preview")).toBeTruthy();
    expect(screen.getByText("AI 看到的画面")).toBeTruthy();
    // starting indicator gone once the stream is present
    expect(screen.queryByText("摄像头开启中…")).toBeNull();
  });

  it("hides the self-preview when the camera is off", () => {
    conversationMock.cameraActive = false;
    render(<VoiceView sessionId="voice-test" onBack={vi.fn()} />);

    expect(screen.queryByTestId("camera-preview")).toBeNull();
  });
});
