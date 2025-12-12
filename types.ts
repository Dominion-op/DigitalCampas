export enum DeviceType {
  CLASSROOM = 'CLASSROOM',
  COMMON_AREA = 'COMMON_AREA',
  OFFICE = 'OFFICE'
}

export enum ContentType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  BIRTHDAY = 'BIRTHDAY',
  URL = 'URL'
}

export enum Priority {
  NORMAL = 'NORMAL',
  URGENT = 'URGENT'
}

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  data: string; // URL or text content
  priority: Priority;
  durationSeconds: number;
  startDate?: string;
  endDate?: string;
  targetDeviceIds: string[]; // Empty means all
  targetGroups: DeviceType[]; // Empty means all
  createdAt: number;
}

export interface Notice {
  id: string;
  text: string;
  isActive: boolean;
  isUrgent: boolean; // Urgent notices scroll even in classrooms
}

export interface Device {
  id: string;
  name: string;
  location: string;
  type: DeviceType;
  status: 'ONLINE' | 'OFFLINE';
  lastPing: number;
  currentContentId?: string | null; // Tracks what is currently on screen
}

export interface AppState {
  devices: Device[];
  contentPlaylist: ContentItem[];
  notices: Notice[];
  user: { isAuthenticated: boolean; name: string } | null;
}