import { beforeEach, describe, it, expect, vi } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import type { VoiceState } from "./use-voice-conversation";
import { VoiceView } from "./voice-view";

let mockState: VoiceState = "listening";
const interruptMock = vi.fn();

vi.mock("./use-voice-conversation", () => ({
  useVoiceConversation: () => ({
    state: mockState,
    lastUserText: "你好",
    lastAssistantText: "在的",
    error: null,
    start: vi.fn().mockResolvedValue(undefined),
    stop: vi.fn(),
    interrupt: interruptMock,
  }),
}));

describe("VoiceView", () => {
  beforeEach(() => {
    cleanup();
    mockState = "listening";
    interruptMock.mockClear();
  });

  it("renders orb + captions and exits via the × button", () => {
    const onBack = vi.fn();
    render(<VoiceView sessionId="s1" onBack={onBack} />);
    expect(screen.getByText("在的")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("exit voice mode"));
    expect(onBack).toHaveBeenCalled();
  });

  it("interrupts the current turn when the orb is clicked while thinking", () => {
    mockState = "thinking";
    render(<VoiceView sessionId="s1" onBack={vi.fn()} />);

    fireEvent.click(screen.getByLabelText("voice orb"));

    expect(interruptMock).toHaveBeenCalledTimes(1);
  });
});
