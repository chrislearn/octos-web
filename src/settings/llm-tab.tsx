import { useState } from "react";
import {
  Cpu,
  Save,
  Loader2,
  Check,
  RotateCcw,
  Plug,
  Settings2,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { request } from "@/api/client";
import { updateMyProfile, type Profile } from "./settings-api";
import {
  LLM_PROVIDERS,
  findProvider,
  showsBaseUrl,
  type LlmProvider,
} from "./llm-providers";

/* ─── Props ─── */

interface LlmTabProps {
  profile: Profile;
  onProfileUpdated: (p: Profile) => void;
}

/* ─── Form State ─── */

interface LlmFormState {
  family_id: string;
  model_id: string;
  custom_family_id: string;
  custom_model_id: string;
  base_url: string;
  system_prompt: string;
  max_output_tokens: string;
  max_history: string;
  max_iterations: string;
  max_concurrent_sessions: string;
  browser_timeout_secs: string;
}

type TestStatus = "idle" | "testing" | "connected" | "failed";

/* ─── Helpers ─── */

function resolveProviderFromProfile(familyId: string): LlmProvider | undefined {
  return LLM_PROVIDERS.find((p) => p.id === familyId);
}

function profileToForm(profile: Profile): LlmFormState {
  const familyId = profile.config.llm.primary.family_id ?? "";
  const knownProvider = resolveProviderFromProfile(familyId);

  return {
    family_id: knownProvider ? familyId : familyId ? "__custom_family__" : "",
    model_id: knownProvider ? (profile.config.llm.primary.model_id ?? "") : "",
    custom_family_id: knownProvider ? "" : familyId,
    custom_model_id: knownProvider ? "" : (profile.config.llm.primary.model_id ?? ""),
    base_url: "",
    system_prompt: profile.config.gateway.system_prompt ?? "",
    max_output_tokens:
      profile.config.gateway.max_output_tokens != null
        ? String(profile.config.gateway.max_output_tokens)
        : "",
    max_history:
      profile.config.gateway.max_history != null
        ? String(profile.config.gateway.max_history)
        : "",
    max_iterations:
      profile.config.gateway.max_iterations != null
        ? String(profile.config.gateway.max_iterations)
        : "",
    max_concurrent_sessions:
      profile.config.gateway.max_concurrent_sessions != null
        ? String(profile.config.gateway.max_concurrent_sessions)
        : "",
    browser_timeout_secs:
      profile.config.gateway.browser_timeout_secs != null
        ? String(profile.config.gateway.browser_timeout_secs)
        : "",
  };
}

function optionalInt(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = parseInt(trimmed, 10);
  return Number.isNaN(n) ? null : n;
}

/* ─── Shared UI atoms ─── */

const inputClass =
  "w-full rounded-xl bg-surface-container px-4 py-3 text-sm text-text placeholder-muted/50 outline-none border border-transparent focus:border-accent/30 transition";
const selectClass =
  "w-full rounded-xl bg-surface-container px-4 py-3 text-sm text-text outline-none border border-transparent focus:border-accent/30 transition appearance-none cursor-pointer";
const labelClass = "mb-1.5 block text-xs font-medium text-muted";

/* ─── Component ─── */

export function LlmTab({ profile, onProfileUpdated }: LlmTabProps) {
  const [form, setForm] = useState<LlmFormState>(() => profileToForm(profile));
  const [original, setOriginal] = useState<LlmFormState>(() =>
    profileToForm(profile),
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<TestStatus>("idle");

  const isDirty = JSON.stringify(form) !== JSON.stringify(original);
  const isCustom = form.family_id === "__custom_family__";
  const selectedProvider = isCustom ? undefined : findProvider(form.family_id);
  const providerModels = selectedProvider?.models ?? [];
  const needsBaseUrl = selectedProvider
    ? showsBaseUrl(selectedProvider)
    : isCustom;

  /* ── Derived effective IDs (what we send to API) ── */
  const effectiveFamilyId = isCustom
    ? form.custom_family_id
    : form.family_id;
  const effectiveModelId = isCustom
    ? form.custom_model_id
    : form.model_id === "__custom__"
      ? form.custom_model_id
      : form.model_id;

  /* ── Provider change ── */
  const handleProviderChange = (newFamilyId: string) => {
    const provider = findProvider(newFamilyId);
    setForm((f) => ({
      ...f,
      family_id: newFamilyId,
      model_id: provider?.models[0]?.id ?? "",
      custom_family_id: "",
      custom_model_id: "",
      base_url: provider?.defaultBaseUrl ?? "",
    }));
    setTestStatus("idle");
  };

  /* ── Test Connection ── */
  const handleTestConnection = async () => {
    if (!effectiveFamilyId) return;
    setTestStatus("testing");
    try {
      const envKey = selectedProvider?.envKey || "";
      await request<{ ok: boolean }>("/api/my/test-provider", {
        method: "POST",
        body: JSON.stringify({
          provider: effectiveFamilyId,
          api_key_env: envKey || undefined,
        }),
      });
      setTestStatus("connected");
    } catch {
      setTestStatus("failed");
    }
    setTimeout(() => setTestStatus("idle"), 4000);
  };

  /* ── Save ── */
  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const result = await updateMyProfile({
      config: {
        llm: {
          primary: {
            family_id: effectiveFamilyId,
            model_id: effectiveModelId,
          },
          fallbacks: profile.config.llm.fallbacks,
        },
        gateway: {
          ...profile.config.gateway,
          system_prompt: form.system_prompt.trim() || null,
          max_output_tokens: optionalInt(form.max_output_tokens),
          max_history: optionalInt(form.max_history),
          max_iterations: optionalInt(form.max_iterations),
          max_concurrent_sessions: optionalInt(form.max_concurrent_sessions),
          browser_timeout_secs: optionalInt(form.browser_timeout_secs),
        },
      },
    });

    setSaving(false);
    if (result) {
      onProfileUpdated(result);
      const newForm = profileToForm(result);
      setForm(newForm);
      setOriginal(newForm);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setError("Failed to update LLM config.");
    }
  };

  const handleReset = () => {
    setForm({ ...original });
    setTestStatus("idle");
  };

  return (
    <div className="space-y-6">
      {/* ── Model Selection ── */}
      <div className="glass-section rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Cpu size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-strong">
              LLM Configuration
            </h3>
            <p className="text-xs text-muted">
              Select a provider and model for this profile
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Provider Family */}
          <div>
            <label className={labelClass}>Provider</label>
            <select
              value={form.family_id}
              onChange={(e) => handleProviderChange(e.target.value)}
              className={selectClass}
            >
              <option value="">Select a provider...</option>
              {LLM_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Custom provider ID (only when Custom selected) */}
          {isCustom && (
            <div>
              <label className={labelClass}>Custom Provider ID</label>
              <input
                type="text"
                value={form.custom_family_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, custom_family_id: e.target.value }))
                }
                placeholder="e.g. my-provider"
                className={inputClass}
              />
            </div>
          )}

          {/* Model selector (when provider has models) */}
          {!isCustom && providerModels.length > 0 && (
            <div>
              <label className={labelClass}>Model</label>
              <select
                value={form.model_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, model_id: e.target.value }))
                }
                className={selectClass}
              >
                {providerModels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
                <option value="__custom__">Custom model...</option>
              </select>
            </div>
          )}

          {/* Custom model input (custom provider, empty model list, or "Custom model..." chosen) */}
          {(isCustom ||
            (selectedProvider && providerModels.length === 0) ||
            form.model_id === "__custom__") && (
            <div>
              <label className={labelClass}>
                {isCustom || providerModels.length === 0
                  ? "Model ID"
                  : "Custom Model ID"}
              </label>
              <input
                type="text"
                value={form.custom_model_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, custom_model_id: e.target.value }))
                }
                placeholder="e.g. my-model-v2"
                className={inputClass}
              />
            </div>
          )}

          {/* Env key hint */}
          {selectedProvider?.envKey && (
            <div className="flex items-start gap-2 rounded-xl bg-surface-dark/50 px-4 py-3">
              <AlertCircle
                size={14}
                className="mt-0.5 shrink-0 text-amber-400"
              />
              <span className="text-xs text-muted">
                Requires{" "}
                <code className="rounded bg-surface-container px-1.5 py-0.5 font-mono text-[11px] text-text">
                  {selectedProvider.envKey}
                </code>{" "}
                in Environment Variables
              </span>
            </div>
          )}

          {/* Base URL (ollama / vllm / custom) */}
          {needsBaseUrl && (
            <div>
              <label className={labelClass}>Base URL</label>
              <input
                type="text"
                value={form.base_url}
                onChange={(e) =>
                  setForm((f) => ({ ...f, base_url: e.target.value }))
                }
                placeholder={
                  selectedProvider?.defaultBaseUrl ?? "https://api.example.com"
                }
                className={inputClass}
              />
            </div>
          )}

          {/* Test Connection */}
          {form.family_id && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleTestConnection}
                disabled={testStatus === "testing" || !effectiveFamilyId}
                className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted hover:text-text-strong hover:border-accent/30 disabled:opacity-30 transition"
              >
                {testStatus === "testing" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plug size={14} />
                )}
                {testStatus === "testing" ? "Testing..." : "Test Connection"}
              </button>
              {testStatus === "connected" && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-green-400">
                  <CheckCircle2 size={14} />
                  Connected
                </span>
              )}
              {testStatus === "failed" && (
                <span className="flex items-center gap-1.5 text-xs font-medium text-red-400">
                  <XCircle size={14} />
                  Connection failed
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Prompt & Output ── */}
      <div className="glass-section rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Settings2 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-strong">
              Prompt & Output
            </h3>
            <p className="text-xs text-muted">
              System prompt and output token limit
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {/* System prompt */}
          <div>
            <label className={labelClass}>System Prompt</label>
            <textarea
              value={form.system_prompt}
              onChange={(e) =>
                setForm((f) => ({ ...f, system_prompt: e.target.value }))
              }
              placeholder="Optional system prompt override..."
              rows={4}
              className="w-full resize-y rounded-xl bg-surface-container px-4 py-3 text-sm text-text placeholder-muted/50 outline-none border border-transparent focus:border-accent/30 transition"
            />
          </div>

          {/* Max Output Tokens */}
          <div>
            <label className={labelClass}>Max Output Tokens</label>
            <input
              type="number"
              min={256}
              max={128000}
              step={256}
              value={form.max_output_tokens}
              onChange={(e) =>
                setForm((f) => ({ ...f, max_output_tokens: e.target.value }))
              }
              placeholder="Leave empty for default"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* ── Gateway Advanced ── */}
      <div className="glass-section rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Settings2 size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-strong">
              Gateway Parameters
            </h3>
            <p className="text-xs text-muted">
              Advanced session and iteration limits
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Max History */}
          <div>
            <label className={labelClass}>Max History</label>
            <input
              type="number"
              min={1}
              max={200}
              value={form.max_history}
              onChange={(e) =>
                setForm((f) => ({ ...f, max_history: e.target.value }))
              }
              placeholder="Default"
              className={inputClass}
            />
          </div>

          {/* Max Iterations */}
          <div>
            <label className={labelClass}>Max Iterations</label>
            <input
              type="number"
              min={1}
              max={100}
              value={form.max_iterations}
              onChange={(e) =>
                setForm((f) => ({ ...f, max_iterations: e.target.value }))
              }
              placeholder="Default"
              className={inputClass}
            />
          </div>

          {/* Max Concurrent Sessions */}
          <div>
            <label className={labelClass}>Max Concurrent Sessions</label>
            <input
              type="number"
              min={1}
              max={50}
              value={form.max_concurrent_sessions}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  max_concurrent_sessions: e.target.value,
                }))
              }
              placeholder="Default"
              className={inputClass}
            />
          </div>

          {/* Browser Timeout */}
          <div>
            <label className={labelClass}>Browser Timeout (seconds)</label>
            <input
              type="number"
              min={5}
              max={600}
              value={form.browser_timeout_secs}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  browser_timeout_secs: e.target.value,
                }))
              }
              placeholder="Default"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3">
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
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    </div>
  );
}
