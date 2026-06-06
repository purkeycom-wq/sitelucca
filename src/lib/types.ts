// Contratos compartilhados entre dados (Windsor), IA (Bispo) e UI.

export type MetricFormat =
  | "currency"
  | "currency2"
  | "number"
  | "percent"
  | "ratio";

export interface DailyMetric {
  date: string; // YYYY-MM-DD
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  leads: number;
  conversions: number;
  revenue: number;
}

export interface KpiDefinition {
  key: string;
  label: string;
  format: MetricFormat;
  /** true quando "menor é melhor" (CPC, CPL, CPA, CPM). */
  lowerIsBetter?: boolean;
}

export interface KpiValue {
  key: string;
  label: string;
  format: MetricFormat;
  current: number;
  previous: number;
  changePct: number;
  /** direção positiva para o negócio (verde) ou negativa (vermelho). */
  trend: "up" | "down" | "flat";
  isGood: boolean;
  /** série para o sparkline. */
  series: number[];
}

export interface SocialPoint {
  date: string;
  followers: number;
  followersGained: number;
  reach: number;
  impressions: number;
  engagement: number;
  engagementRate: number;
  shares: number;
  saves: number;
  profileVisits: number;
  profileClicks: number;
}

export interface ContentPiece {
  id: string;
  type: "REEL" | "STORY" | "CAROUSEL" | "POST";
  caption: string;
  thumbnailUrl: string | null;
  publishedAt: string;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  retention: number; // 0-100
  followersGained: number;
}

export type InsightSeverity = "INFO" | "POSITIVE" | "WARNING" | "CRITICAL";

export interface BispoInsight {
  id: string;
  severity: InsightSeverity;
  metric: string;
  delta: number | null;
  what: string;
  why: string;
  impact: string;
  action: string;
}

export interface BispoRecommendation {
  id: string;
  channel: "Instagram" | "Meta Ads" | "Google Ads" | "Geral";
  title: string;
  body: string;
  priority: number; // 1 = mais alta
  impactScore: number; // 0-100
  effort: "low" | "medium" | "high";
}

export type ScoreStatus = "EXCELLENT" | "ATTENTION" | "CRITICAL";

export interface BispoScore {
  content: number;
  growth: number;
  traffic: number;
  conversion: number;
  engagement: number;
  overall: number;
  status: ScoreStatus;
  reasoning: string;
}

export interface DashboardPayload {
  client: { id: string; name: string };
  period: { start: string; end: string; days: number };
  source: "live" | "mock";
  kpis: KpiValue[];
  timeseries: DailyMetric[];
  social: SocialPoint[];
  content: ContentPiece[];
}

export interface IntelligencePayload {
  source: "live" | "mock";
  score: BispoScore;
  insights: BispoInsight[];
  recommendations: BispoRecommendation[];
}
