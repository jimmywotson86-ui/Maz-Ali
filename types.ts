
export interface VideoInfo {
  title: string;
  description: string;
  channelName: string;
  id: string;
  originalThumbnail: string;
}

export interface GenerationSettings {
  aspectRatio: "16:9" | "9:16" | "1:1" | "4:3" | "3:4";
  style: string;
  extraPrompt: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  READY_TO_GENERATE = 'READY_TO_GENERATE',
  GENERATING = 'GENERATING',
  ERROR = 'ERROR'
}
