import { useNavigate } from "react-router-dom";
import { HomeNav } from "@/components/home-nav";
import {
  Globe,
  MessageSquare,
  Mic,
  MonitorSmartphone,
  Presentation,
} from "lucide-react";
import { unlockAudio } from "@/home/voice/audio-playback";
import {
  WorkbenchPage,
  WorkbenchRouteCard,
  WorkbenchSectionHeader,
  WorkbenchStatusPill,
} from "@/components/workbench-shell";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <WorkbenchPage>
      <HomeNav />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 max-sm:px-3">
          <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
            <div>
              <p className="text-xs font-semibold uppercase text-muted">Command Center</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-text-strong">
                Octos Workspace
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Chat, generate decks, scaffold sites, and operate local voice
                workflows from one compact control surface.
              </p>
            </div>
            <WorkbenchStatusPill tone="accent">AI workbench</WorkbenchStatusPill>
          </header>

          <section>
            <WorkbenchSectionHeader
              title="Workspaces"
              description="Primary production surfaces"
            />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <WorkbenchRouteCard
                icon={MessageSquare}
                title="Start chat"
                description="Session workspace"
                to="/chat"
              />
              <WorkbenchRouteCard
                icon={Presentation}
                title="Slides"
                description="Deck workspace"
                to="/slides"
              />
              <WorkbenchRouteCard
                icon={Globe}
                title="Sites"
                description="Site workspace"
                to="/sites"
              />
            </div>
          </section>

          <section>
            <WorkbenchSectionHeader
              title="Utilities"
              description="Ambient display and hands-free voice"
            />
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <WorkbenchRouteCard
                icon={MonitorSmartphone}
                title="Home Assistant"
                description="Ambient display"
                to="/home"
              />
              <WorkbenchRouteCard
                icon={Mic}
                title="Voice"
                description="Hands-free session"
                onClick={() => {
                  // Unlock the Web Audio context inside this click gesture so
                  // the voice reply can play after the async response arrives.
                  unlockAudio();
                  navigate("/voice");
                }}
              />
            </div>
          </section>
        </div>
      </div>
    </WorkbenchPage>
  );
}
