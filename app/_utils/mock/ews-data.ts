import { IIncidentLog } from "../types/ews";

// Jember area coordinates
const JEMBER_LOCATIONS = [
  { latitude: -8.172380, longitude: 113.702588, district: "Kaliwates", address: "Jl. Gajah Mada No. 233, Kaliwates" },
  { latitude: -8.184859, longitude: 113.668811, district: "Sumbersari", address: "Jl. Kalimantan No.37, Sumbersari" },
  { latitude: -8.166498, longitude: 113.722759, district: "Patrang", address: "Jl. Mastrip No. 49, Patrang" },
  { latitude: -8.159021, longitude: 113.713175, district: "Jemberlor", address: "Jl. Letjen Panjaitan No. 55, Jemberlor" },
  { latitude: -8.192226, longitude: 113.669716, district: "Kebonsari", address: "Perumahan Kebonsari Indah, Blok C-15" },
];

// Generate mock incident log
export const generateMockIncident = (override: Partial<IIncidentLog> = {}): IIncidentLog => {
  const locationIndex = Math.floor(Math.random() * JEMBER_LOCATIONS.length);
  const location = JEMBER_LOCATIONS[locationIndex];
  const priorityOptions = ['high', 'medium', 'low'] as const;
  const priority = override.priority || priorityOptions[Math.floor(Math.random() * priorityOptions.length)];
  
  const reporters = [
    { id: "USR001", name: "Budi Santoso", phone: "081234567890" },
    { id: "USR002", name: "Dewi Putri", phone: "085678901234" },
    { id: "USR003", name: "Ahmad Rizki", phone: "087890123456" },
    { id: "USR004", name: "Siti Nurhaliza", phone: "089012345678" }
  ];
  
  const reporterIndex = Math.floor(Math.random() * reporters.length);

  return {
    id: override.id || `INC${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    timestamp: override.timestamp || new Date(),
    location: override.location || {
      latitude: location.latitude + (Math.random() * 0.01 - 0.005),
      longitude: location.longitude + (Math.random() * 0.01 - 0.005),
      address: location.address,
      district: location.district
    },
    status: override.status || 'active',
    reporter: override.reporter || reporters[reporterIndex],
    description: override.description || "Panic button activated",
    category: override.category || "Emergency Alert",
    priority,
    response_time: override.response_time,
  };
};

// List of mock incidents (initially empty)
export const mockIncidents: IIncidentLog[] = [];

// Add a new incident to the mock data
export const addMockIncident = (incident: Partial<IIncidentLog> = {}): IIncidentLog => {
  const newIncident = generateMockIncident(incident);
  mockIncidents.push(newIncident);
  return newIncident;
};

// Get all incidents
export const getAllIncidents = (): IIncidentLog[] => {
  return [...mockIncidents];
};

// Get active incidents
export const getActiveIncidents = (): IIncidentLog[] => {
  return mockIncidents.filter(incident => incident.status === 'active');
};

// Resolve an incident
export const resolveIncident = (id: string): IIncidentLog | undefined => {
  const incident = mockIncidents.find(inc => inc.id === id);
  if (incident) {
    incident.status = 'resolved';
    incident.response_time = Math.floor(Math.random() * 300) + 60; // 1-5 minutes response time
  }
  return incident;
};
