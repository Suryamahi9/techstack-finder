export interface Tech {
  name: string;
  category: string;
  type: "frontend" | "backend" | "infra";
  confidence: "high" | "medium" | "low";
  version?: string;
  via?: string;
}

export interface ScanSummary {
  total: number;
  categories: number;
  frontend: number;
  backend: number;
  infra: number;
}

export interface CveItem {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  url: string;
}

export interface CveSummary {
  totalCves: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  affected: Array<{
    name: string;
    version: string;
    cves: CveItem[];
  }>;
}

export interface DnsTls {
  dns?: {
    a: string[];
    aaaa: string[];
    cname: string[];
    ns: string[];
    mx: string[];
    txt: string[];
    dnssec: boolean;
  };
  tls?: {
    issuer: string;
    validFrom: string;
    validTo: string;
    daysRemaining: number;
    protocol: string;
    cipher: { name: string; bits: number };
    authorized: boolean;
  };
  cloudProvider?: string;
}

export interface ScanResult {
  site: {
    url: string;
    domain: string;
    title: string;
    favicon: string;
    scannedAt: string;
    statusCode: number;
    isPartialResult: boolean;
  };
  company: Record<string, any> | null;
  pageMetadata: Record<string, any>;
  seo: Record<string, any> | null;
  performance: Record<string, any> | null;
  security: Record<string, any> | null;
  a11y: Record<string, any> | null;
  technologies: Tech[];
  categories: Array<{
    category: string;
    technologies: Tech[];
  }>;
  techByType: {
    frontend: Tech[];
    backend: Tech[];
    infra: Tech[];
  };
  summary: ScanSummary;
  responseHeaders: {
    server: string | null;
    poweredBy: string | null;
    generator: string | null;
  };
  healthScore: number;
  dnsTls: DnsTls | null;
  adsTxt: any;
  gdpr: any;
  cveSummary: CveSummary;
  versionScores: Array<{
    name: string;
    version: string;
    freshness: { score: number; label: string };
  }>;
  impliedTechs: Array<{ name: string; confidence: string; source: string }>;
  canonicalTechs: any;
  industry: any;
  aiBuilders: any[];
  insights: any;
  partialResults: boolean;
}

export interface ScanOptions {
  url: string;
  headers?: Record<string, string>;
  cookies?: string;
  proxy?: string;
  timeout?: number;
}

export interface ClientOptions {
  apiKey?: string;
  baseUrl?: string;
}

export class TechStackFinder {
  private apiKey?: string;
  private baseUrl: string;

  constructor(options: ClientOptions = {}) {
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl || "https://techstack-finder.vercel.app").replace(/\/$/, "");
  }

  async scan(options: ScanOptions): Promise<ScanResult> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.apiKey) {
      headers["x-api-key"] = this.apiKey;
    }

    const res = await fetch(`${this.baseUrl}/api/scan`, {
      method: "POST",
      headers,
      body: JSON.stringify(options),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || `Scan failed (HTTP ${res.status})`);
    }

    return data as ScanResult;
  }

  badgeUrl(domain: string, theme: string = "dark"): string {
    return `${this.baseUrl}/api/badge?domain=${encodeURIComponent(domain)}&theme=${theme}&format=svg`;
  }

  reportUrl(domain: string): string {
    return `${this.baseUrl}/results?site=${encodeURIComponent(domain)}`;
  }

  async history(): Promise<any[]> {
    const headers: Record<string, string> = {};
    if (this.apiKey) {
      headers["x-api-key"] = this.apiKey;
    }

    const res = await fetch(`${this.baseUrl}/api/history`, { headers });
    const data = await res.json();
    return data.success ? data.history : [];
  }
}

export default TechStackFinder;
