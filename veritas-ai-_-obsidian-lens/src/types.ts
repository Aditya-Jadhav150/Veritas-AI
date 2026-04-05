export interface AnalysisResult {
  status: 'REAL' | 'SYNTHETIC' | 'INCONCLUSIVE';
  integrityLevel: string;
  confidenceScore: number;
  artifactDetection: string;
  lightingConsistency: string;
  semanticLogic: string;
  timestamp: string;
  thumbnail?: string;
}

export interface ImageAsset {
  url: string;
  name: string;
  size: string;
  type: string;
}
