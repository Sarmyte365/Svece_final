
export interface ProverbInterpretation {
  text: string;
  historicalContext: string;
  modernExample: string;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING_TEXT = 'LOADING_TEXT',
  LOADING_IMAGE = 'LOADING_IMAGE',
  ERROR = 'ERROR'
}
