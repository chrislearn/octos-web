import { useState, useEffect } from "react";
import { Radio, Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { getProfileChannels, type ChannelInfo } from "./settings-api";

interface ChannelsTabProps {
  profileId: string;
}

const CHANNEL_ICONS: Record<string, string> = {
  web: "Web",
  discord: "Discord",
  slack: "Slack",
  telegram: "Telegram",
  email: "Email",
  api: "API",
};

export function ChannelsTab({ profileId }: ChannelsTabProps) {
  const [channels, setChannels] = useState<ChannelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChannels = (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    getProfileChannels(profileId).then((data) => {
      setChannels(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadChannels();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={20} className="animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass-section rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Radio size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-strong">Channels</h3>
              <p className="text-xs text-muted">
                {channels.length > 0
                  ? `${channels.length} channel${channels.length === 1 ? "" : "s"} configured`
                  : "Communication channels for the agent"}
              </p>
            </div>
          </div>
          <button
            onClick={() => loadChannels(false)}
            className="glass-icon-button rounded-xl p-2.5"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {channels.length === 0 ? (
          <div className="rounded-xl bg-surface-dark/50 px-6 py-10 text-center">
            <Radio size={32} className="mx-auto mb-3 text-muted/40" />
            <p className="text-sm text-muted">No channels configured</p>
            <p className="mt-1 text-xs text-muted/60">
              Channels will appear here once set up on the server
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center gap-4 rounded-xl bg-surface-container/60 px-4 py-3.5 border border-transparent hover:border-border transition"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-dark/60 text-xs font-bold uppercase text-muted">
                  {CHANNEL_ICONS[channel.kind]?.charAt(0) ?? channel.kind.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-strong truncate">
                      {channel.name}
                    </span>
                    <span className="shrink-0 rounded-md bg-surface-dark/60 px-1.5 py-0.5 text-[10px] font-medium text-muted uppercase tracking-wider">
                      {CHANNEL_ICONS[channel.kind] ?? channel.kind}
                    </span>
                  </div>
                </div>
                <div className="shrink-0">
                  {channel.enabled ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-green-400">
                      <CheckCircle2 size={14} />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted/60">
                      <XCircle size={14} />
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
