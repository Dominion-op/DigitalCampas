import { Device, DeviceType, ContentItem, ContentType, Priority, Notice } from './types';

export const MOCK_DEVICES: Device[] = [
  { id: 'tv-101', name: 'Main Lobby Display', location: 'Main Entrance', type: DeviceType.COMMON_AREA, status: 'ONLINE', lastPing: Date.now() },
  { id: 'tv-102', name: 'Student Cafeteria', location: 'Canteen', type: DeviceType.COMMON_AREA, status: 'ONLINE', lastPing: Date.now() },
  { id: 'tv-201', name: 'CS Lecture Hall A', location: 'Room 304', type: DeviceType.CLASSROOM, status: 'ONLINE', lastPing: Date.now() },
  { id: 'tv-202', name: 'Bio Lab', location: 'Room 201', type: DeviceType.CLASSROOM, status: 'OFFLINE', lastPing: Date.now() },
  { id: 'tv-301', name: 'Admin Office', location: 'Registrar', type: DeviceType.OFFICE, status: 'ONLINE', lastPing: Date.now() },
];

export const MOCK_CONTENT: ContentItem[] = [
  {
    id: 'c-1',
    type: ContentType.IMAGE,
    title: 'Welcome Week',
    data: 'https://picsum.photos/1920/1080',
    priority: Priority.NORMAL,
    durationSeconds: 10,
    targetDeviceIds: [],
    targetGroups: [],
    createdAt: Date.now()
  },
  {
    id: 'c-2',
    type: ContentType.TEXT,
    title: 'Library Hours',
    data: 'The library will remain open until 10 PM this week for exam preparation.',
    priority: Priority.NORMAL,
    durationSeconds: 15,
    targetDeviceIds: [],
    targetGroups: [DeviceType.COMMON_AREA],
    createdAt: Date.now()
  },
  {
    id: 'c-3',
    type: ContentType.BIRTHDAY,
    title: 'Happy Birthday',
    data: 'Happy Birthday to Prof. Alan Turing and Student Alice Smith!',
    priority: Priority.NORMAL,
    durationSeconds: 8,
    targetDeviceIds: [],
    targetGroups: [],
    createdAt: Date.now()
  }
];

export const MOCK_NOTICES: Notice[] = [
  { id: 'n-1', text: 'Registration for Spring Semester ends tomorrow at 5 PM.', isActive: true, isUrgent: true },
  { id: 'n-2', text: 'Chess Club meeting in Room 102 at 4 PM.', isActive: true, isUrgent: false },
];
