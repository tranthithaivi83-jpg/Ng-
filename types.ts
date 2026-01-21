
export enum Severity {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export interface SafetyIssue {
  issue_name: string;
  severity: Severity;
  status: string;
  risk: string;
  remedy: string;
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
}

export interface AnalysisResult {
  issues: SafetyIssue[];
  summary: string;
}
