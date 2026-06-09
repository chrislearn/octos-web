export interface LlmProvider {
  id: string;
  name: string;
  envKey: string;
  defaultBaseUrl?: string;
  models: { id: string; name: string }[];
}

export const LLM_PROVIDERS: LlmProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    envKey: "OPENAI_API_KEY",
    models: [
      { id: "gpt-5", name: "GPT-5" },
      { id: "gpt-5.3-codex", name: "GPT-5.3 Codex" },
      { id: "gpt-5.1-codex", name: "GPT-5.1 Codex" },
      { id: "gpt-4o", name: "GPT-4o" },
      { id: "gpt-4o-mini", name: "GPT-4o Mini" },
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    envKey: "ANTHROPIC_API_KEY",
    models: [
      { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4" },
      { id: "claude-haiku-4-5", name: "Claude Haiku 4.5" },
    ],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    envKey: "DEEPSEEK_API_KEY",
    models: [
      { id: "deepseek-v3.2", name: "DeepSeek V3.2" },
      { id: "deepseek-chat", name: "DeepSeek Chat" },
      { id: "deepseek-r1", name: "DeepSeek R1" },
    ],
  },
  {
    id: "google",
    name: "Google Gemini",
    envKey: "GEMINI_API_KEY",
    models: [
      { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro" },
      { id: "gemini-3-flash-preview", name: "Gemini 3 Flash" },
    ],
  },
  {
    id: "groq",
    name: "Groq",
    envKey: "GROQ_API_KEY",
    models: [{ id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B" }],
  },
  {
    id: "ollama",
    name: "Ollama (Local)",
    envKey: "",
    defaultBaseUrl: "http://localhost:11434",
    models: [],
  },
  { id: "dashscope", name: "DashScope", envKey: "DASHSCOPE_API_KEY", models: [] },
  { id: "nvidia", name: "NVIDIA", envKey: "NVIDIA_API_KEY", models: [] },
  {
    id: "minimax",
    name: "MiniMax",
    envKey: "MINIMAX_API_KEY",
    models: [
      { id: "MiniMax-M2.7", name: "MiniMax M2.7" },
      { id: "MiniMax-M2.5", name: "MiniMax M2.5" },
    ],
  },
  { id: "zhipu", name: "Zhipu (GLM)", envKey: "ZHIPU_API_KEY", models: [] },
  { id: "moonshot", name: "Moonshot", envKey: "MOONSHOT_API_KEY", models: [] },
  { id: "perplexity", name: "Perplexity", envKey: "PERPLEXITY_API_KEY", models: [] },
  {
    id: "mistral",
    name: "Mistral",
    envKey: "MISTRAL_API_KEY",
    models: [{ id: "mistral-large-2512", name: "Mistral Large" }],
  },
  { id: "openrouter", name: "OpenRouter", envKey: "OPENROUTER_API_KEY", models: [] },
  {
    id: "vllm",
    name: "vLLM",
    envKey: "VLLM_API_KEY",
    defaultBaseUrl: "http://localhost:8000",
    models: [],
  },
  { id: "__custom_family__", name: "Custom Provider", envKey: "", models: [] },
];

/** Find provider by ID, falling back to custom */
export function findProvider(id: string): LlmProvider | undefined {
  return LLM_PROVIDERS.find((p) => p.id === id);
}

/** Whether this provider should show a base URL field */
export function showsBaseUrl(provider: LlmProvider): boolean {
  return (
    provider.id === "ollama" ||
    provider.id === "vllm" ||
    provider.id === "__custom_family__"
  );
}
