// ============================================================
// MEDUSA — Tipos compartilhados
// ============================================================

export type EnergyLevel = 1 | 2 | 3;
export type MessageRole = 'user' | 'assistant';

export interface Memory {
  padroes: string[];
  gatilhos: string[];
  funcionou: string[];
  nao_funcionou: string[];
  contexto: string[];
}

export interface Message {
  role: MessageRole;
  content: string;
}

export interface Session {
  id: string;
  user_id: string;
  energy_level: EnergyLevel;
  started_at: string;
  ended_at?: string;
  summary?: string;
  messages?: Message[];
}

export interface OnboardingData {
  // Bloco 1: Identidade
  name?: string;
  pronouns?: string;
  // Bloco 2: Perfil cognitivo
  conditions?: string[];
  cognitive_style?: string;
  // Bloco 3: Contexto profissional
  profession?: string;
  work_style?: string;
  // Bloco 4: Padrões de energia
  peak_hours?: string;
  low_hours?: string;
  // Bloco 5: Objetivos e padrões a evitar
  main_goal?: string;
  avoid_patterns?: string[];
}

export interface User {
  id: string;
  device_id: string;
  created_at: string;
  updated_at: string;
}

// Payload enviado ao claude-proxy
export interface ClaudeProxyRequest {
  model: string;
  max_tokens: number;
  system: string;
  messages: Message[];
}

// Resposta do claude-proxy (formato Anthropic)
export interface ClaudeProxyResponse {
  content: Array<{ type: 'text'; text: string }>;
  model: string;
  usage: { input_tokens: number; output_tokens: number };
}
