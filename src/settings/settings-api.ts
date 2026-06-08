import { request } from "@/api/client";

// ── Types ──────────────────────────────────────────────

export interface ProfileSummary {
  id: string;
  name: string;
  username?: string;
  parent_id?: string | null;
}

export interface ProfileDetail {
  profile: {
    id: string;
    name: string;
    username?: string;
    parent_id?: string | null;
    llm_config?: LlmConfig;
    created_at?: string;
  };
}

export interface LlmConfig {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  system_prompt?: string;
}

export interface SkillInfo {
  name: string;
  enabled: boolean;
  description?: string;
  version?: string;
}

export interface ChannelInfo {
  id: string;
  kind: string;
  name: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}

// ── API calls ──────────────────────────────────────────

export async function listProfiles(): Promise<ProfileSummary[]> {
  try {
    const resp = await request<{ profiles: ProfileSummary[] }>("/api/profiles");
    return resp.profiles ?? [];
  } catch {
    return [];
  }
}

export async function getProfile(id: string): Promise<ProfileDetail | null> {
  try {
    return await request<ProfileDetail>(`/api/profiles/${encodeURIComponent(id)}`);
  } catch {
    return null;
  }
}

export async function updateProfile(
  id: string,
  patch: { name?: string; llm_config?: Partial<LlmConfig> },
): Promise<ProfileDetail | null> {
  try {
    return await request<ProfileDetail>(`/api/profiles/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(patch),
    });
  } catch {
    return null;
  }
}

export async function getProfileSkills(id: string): Promise<SkillInfo[]> {
  try {
    const resp = await request<{ skills: SkillInfo[] }>(
      `/api/profiles/${encodeURIComponent(id)}/skills`,
    );
    return resp.skills ?? [];
  } catch {
    return [];
  }
}

export async function getProfileChannels(id: string): Promise<ChannelInfo[]> {
  try {
    const resp = await request<{ channels: ChannelInfo[] }>(
      `/api/profiles/${encodeURIComponent(id)}/channels`,
    );
    return resp.channels ?? [];
  } catch {
    return [];
  }
}
