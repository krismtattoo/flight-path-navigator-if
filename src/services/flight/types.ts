
// API key
export const API_KEY = "r8hxd0a54uoxrgj51ag5usiba3uls8ii";
export const BASE_URL = "https://api.infiniteflight.com/public/v2";

// Server types
export const SERVER_TYPES = {
  CASUAL: "Casual Server",
  TRAINING: "Training Server",
  EXPERT: "Expert Server"
};

// Types for API responses
export interface Flight {
  flightId: string;
  userId: string;
  callsign: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  heading: number;
  aircraft: string;
  livery: string;
  username: string;
  virtualOrganization?: string;
  lastReportTime: number;
  track: FlightTrackPoint[];
}

export interface FlightTrackPoint {
  latitude: number;
  longitude: number;
  altitude: number;
  timestamp: number;
}

export interface ServerInfo {
  id: string;
  name: string;
  maxUsers: number;
  userCount: number;
}

// Shared server ID mapping - using a let variable that can be modified
export let serverIdMap: Record<string, string> = {};
