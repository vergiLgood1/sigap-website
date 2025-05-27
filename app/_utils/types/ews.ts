export interface IEWSLocation {
  latitude: number;
  longitude: number;
  address?: string;
  district?: string;
}

export interface IIncidentLog {
  id: string;
  timestamp: Date;
  location: IEWSLocation;
  status: 'active' | 'resolved' | 'false_alarm';
  reporter: {
    id: string;
    name: string;
    phone?: string;
  };
  description?: string;
  category?: string;
  priority: 'high' | 'medium' | 'low';
  response_time?: number; // in seconds
}

export type EWSStatus = 'idle' | 'alert' | 'responding';
