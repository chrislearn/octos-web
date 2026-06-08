import { useState, useEffect } from "react";
import { User, Save, Loader2, Check } from "lucide-react";
import {
  getProfile,
  updateProfile,
  type ProfileDetail,
} from "./settings-api";

interface ProfileTabProps {
  profileId: string;
}

export function ProfileTab({ profileId }: ProfileTabProps) {
  const [profile, setProfile] = useState<ProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProfile(profileId).then((data) => {
      if (cancelled) return;
      setProfile(data);
      setName(data?.profile?.name ?? "");
      setLoading(false);
      setError(null);
    });
    return () => { cancelled = true; };
  }, [profileId]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    const result = await updateProfile(profileId, { name: name.trim() });
    setSaving(false);
    if (result) {
      setProfile(result);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      setError("Failed to update profile. The server may not support this endpoint yet.");
    }
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
      {/* Profile info card */}
      <div className="glass-section rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <User size={20} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-strong">Profile Information</h3>
            <p className="text-xs text-muted">Manage your profile details</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Profile ID (read-only) */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Profile ID
            </label>
            <div className="rounded-xl bg-surface-dark/50 px-4 py-3 text-sm text-muted font-mono">
              {profileId}
            </div>
          </div>

          {/* Name (editable) */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter display name"
              className="w-full rounded-xl bg-surface-container px-4 py-3 text-sm text-text placeholder-muted/50 outline-none border border-transparent focus:border-accent/30 transition"
            />
          </div>

          {/* Username (read-only if present) */}
          {profile?.profile?.username && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Username
              </label>
              <div className="rounded-xl bg-surface-dark/50 px-4 py-3 text-sm text-muted">
                {profile.profile.username}
              </div>
            </div>
          )}

          {/* Created at */}
          {profile?.profile?.created_at && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                Created
              </label>
              <div className="rounded-xl bg-surface-dark/50 px-4 py-3 text-sm text-muted">
                {new Date(profile.profile.created_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !name.trim() || name.trim() === profile?.profile?.name}
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
          {error && (
            <span className="text-xs text-red-400">{error}</span>
          )}
        </div>
      </div>
    </div>
  );
}
