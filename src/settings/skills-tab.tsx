import { useState, useEffect } from "react";
import { Puzzle, Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { getProfileSkills, type SkillInfo } from "./settings-api";

interface SkillsTabProps {
  profileId: string;
}

export function SkillsTab({ profileId }: SkillsTabProps) {
  const [skills, setSkills] = useState<SkillInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSkills = (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    getProfileSkills(profileId).then((data) => {
      setSkills(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadSkills();
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
              <Puzzle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-strong">Installed Skills</h3>
              <p className="text-xs text-muted">
                {skills.length > 0
                  ? `${skills.length} skill${skills.length === 1 ? "" : "s"} installed`
                  : "Skills extend agent capabilities"}
              </p>
            </div>
          </div>
          <button
            onClick={() => loadSkills(false)}
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

        {skills.length === 0 ? (
          <div className="rounded-xl bg-surface-dark/50 px-6 py-10 text-center">
            <Puzzle size={32} className="mx-auto mb-3 text-muted/40" />
            <p className="text-sm text-muted">No skills installed yet</p>
            <p className="mt-1 text-xs text-muted/60">
              Skills will appear here once configured on the server
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className="flex items-center gap-4 rounded-xl bg-surface-container/60 px-4 py-3.5 border border-transparent hover:border-border transition"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-strong truncate">
                      {skill.name}
                    </span>
                    {skill.version && (
                      <span className="shrink-0 rounded-md bg-surface-dark/60 px-1.5 py-0.5 text-[10px] font-mono text-muted">
                        v{skill.version}
                      </span>
                    )}
                  </div>
                  {skill.description && (
                    <p className="mt-0.5 text-xs text-muted truncate">
                      {skill.description}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  {skill.enabled ? (
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
