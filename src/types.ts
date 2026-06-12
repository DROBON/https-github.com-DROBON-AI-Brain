export interface BrainConfig {
  name: string;
  personality: string;
  tone: string;
  language: string;
  accentColor: string; // 'indigo', 'emerald', 'amber', 'rose', 'violet', 'cyan'
  iconName: string; // 'brain', 'sparkles', 'terminal', 'atom', 'zap', 'heart'
  temperature: number;
}

export interface KnowledgeFact {
  id: string;
  title: string;
  content: string;
  createdAt: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
