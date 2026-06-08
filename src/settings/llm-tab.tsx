import { useState, useEffect } from "react";
import { Cpu, Save, Loader2, Check, RotateCcw } from "lucide-react";
import {
  getProfile,
  updateProfile,
  type LlmConfig,
} from "./settings-api";

interface LlmTabProps {
  profileId: string;
}

const DEFAULT_LLM_CONFIG: LlmConfig = {
  model: "",
  temperature: 0.7,
  max_tokens: 4096,
  system_prompt: "",
};

export function LlmTab({ profileId }: LlmTabProps) {
  const [config, setConfig] = useState<LlmConfig>(DEFAULT_LLM_CONFIG);
  const [originalConfig, setOriginalConfig] = useState<LlmConfig>(DEFAULT_LLM_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProfile(profileId).then((data) => {
      if (cancelled) return;
      const llm = data?.profile?.llm_config ?? DEFAULT_LLM_CONFIG;
      setConfig({ ...DEFAULT_LLM_CONFIG, ...llm });
      setOriginalConfig({ ...DEFAULT_LLM_CONFIG, ...llm });
      setLoading(false);
      setError(null);
    });
    return () => { cancelled = true; };
  }, [profileId]);

  const isDirty = JSON.stringify(config) !== JSON.stringify(originalConfig);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const result = await updateProfile(profileId, { llm_config: config });
    setSaving(false);
    if (result) {
      const llm = result.profile?.llm_config ?? config;
      setOriginalConfig({ ...DEFAULT_LLM_CONFIG, ...llm });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setError("Failed to update LLM config. The server may not support this endpoint yet.");
    }
  };

  const handleReset = () => {
    setConfig({ ...originalConfig });
  };

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
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Cpu size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-strong">LLM Configuration</h3>
            <p className="text-xs text-muted">Configure the language model for this profile</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Model */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Model
            </label>
            <input
              type="text"
              value={config.model ?? ""}
              onChange={(e) => setConfig((c) => ({ ...c, model: e.target.value }))}
              placeholder="e.g. gpt-4o, claude-sonnet-4-20250514"
              className="w-full rounded-xl bg-surface-container px-4 py-3 text-sm text-text placeholder-muted/50 outline-none border border-transparent focus:border-accent/30 transition"
            />
          </div>

          {/* Temperature */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-muted">Temperature</label>
              <span className="text-xs font-mono text-accent">{config.temperature?.toFixed(2) ?? "0.70"}</span>
            </div>
            <input
              type="range"
              min={0}
              max={2}
              step={0.05}
              value={config.temperature ?? 0.7}
              onChange={(e) => setConfig((c) => ({ ...c, temperature: parseFloat(e.target.value) }))}
              className="w-full accent-accent"
            />
            <div className="mt-1 flex justify-between text-[10px] text-muted/60">
              <span>Precise (0)</span>
              <span>Balanced (1)</span>
              <span>Creative (2)</span>
            </div>
          </div>

          {/* Max tokens */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Max Tokens
            </label>
            <input
              type="number"
              min={256}
              max={128000}
              step={256}
              value={config.max_tokens ?? 4096}
              onChange={(e) => setConfig((c) => ({ ...c, max_tokens: parseInt(e.target.value) || 4096 }))}
              className="w-full rounded-xl bg-surface-container px-4 py-3 text-sm text-text placeholder-muted/50 outline-none border border-transparent focus:border-accent/30 transition"
            />
          </div>

          {/* System prompt */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              System Prompt
            </label>
            <textarea
              value={config.system_prompt ?? ""}
              onChange={(e) => setConfig((c) => ({ ...c, system_prompt: e.target.value }))}
              placeholder="Optional system prompt override..."
              rows={4}
              className="w-full resize-y rounded-xl bg-surface-container px-4 py-3 text-sm text-text placeholder-muted/50 outline-none border border-transparent focus:border-accent/30 transition"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-dim disabled:opacity-30 transition"
          >
            {saving ? (
              <Loader2 size={14} className="animate-spin" />
            ) : saved ? (
              <Check size={14} />
            ) : (
              <Save size={14} />
            )}
            {saved ? "Saved" : "Save Changes"}
          </button>
          {isDirty && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-muted hover:text-text-strong hover:border-accent/30 transition"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          )}
          {error && (
            <span className="text-xs text-red-400">{error}</span>
          )}
        </div>
      </div>
    </div>
  );
}
