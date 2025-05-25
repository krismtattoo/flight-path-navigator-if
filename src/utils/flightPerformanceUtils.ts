
import { FlightTrackPoint } from '@/services/flight';

export interface PerformanceData {
  time: string;
  altitude: number;
  speed: number;
  verticalSpeed: number;
  heading: number;
}

// Generate performance data from flight track points
export function generatePerformanceFromTrack(trackPoints: FlightTrackPoint[] | undefined): PerformanceData[] {
  // Early return with proper null/undefined checks
  if (!trackPoints || !Array.isArray(trackPoints) || trackPoints.length === 0) {
    console.log(`📊 No track points available, generating mock flight data`);
    return generateMockFlightData();
  }

  console.log(`📊 Generating performance data from ${trackPoints.length} track points`);

  // Sort by timestamp to ensure chronological order
  const sortedPoints = [...trackPoints].sort((a, b) => a.timestamp - b.timestamp);
  
  const performanceData: PerformanceData[] = [];
  
  for (let i = 0; i < sortedPoints.length; i++) {
    const point = sortedPoints[i];
    const prevPoint = i > 0 ? sortedPoints[i - 1] : null;
    
    // Calculate vertical speed (feet per minute)
    let verticalSpeed = 0;
    if (prevPoint && point.timestamp !== prevPoint.timestamp) {
      const timeDiffMinutes = (point.timestamp - prevPoint.timestamp) / (1000 * 60);
      const altitudeDiff = point.altitude - prevPoint.altitude;
      verticalSpeed = timeDiffMinutes > 0 ? altitudeDiff / timeDiffMinutes : 0;
    }
    
    // Calculate ground speed (approximate from position changes)
    let speed = 0;
    if (prevPoint && point.timestamp !== prevPoint.timestamp) {
      const timeDiffHours = (point.timestamp - prevPoint.timestamp) / (1000 * 60 * 60);
      if (timeDiffHours > 0) {
        // Rough distance calculation (not accurate for long distances but good enough)
        const latDiff = point.latitude - prevPoint.latitude;
        const lonDiff = point.longitude - prevPoint.longitude;
        const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff) * 69; // Convert to miles (rough)
        speed = distance / timeDiffHours; // Speed in mph, convert to knots
        speed = speed * 0.868976; // Convert mph to knots
      }
    }
    
    // Format time for display
    const date = new Date(point.timestamp);
    const timeString = date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
    
    performanceData.push({
      time: timeString,
      altitude: point.altitude || 0,
      speed: Math.max(0, speed),
      verticalSpeed: Math.max(-3000, Math.min(3000, verticalSpeed)), // Clamp to realistic values
      heading: 0 // We don't have heading data in track points
    });
  }
  
  console.log(`📊 Generated ${performanceData.length} performance data points`);
  return performanceData;
}

// Fallback mock data for when no track data is available
function generateMockFlightData(): PerformanceData[] {
  console.log(`📊 Generating mock flight data (no track data available)`);
  
  const data: PerformanceData[] = [];
  const totalMinutes = 180; // 3 hour flight
  const startTime = Date.now() - (totalMinutes * 60 * 1000);
  
  for (let i = 0; i <= totalMinutes; i += 2) { // Every 2 minutes
    const currentTime = startTime + (i * 60 * 1000);
    const timeString = new Date(currentTime).toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    let altitude = 0;
    let speed = 0;
    let verticalSpeed = 0;
    
    // Realistic flight phases
    if (i <= 20) {
      // Takeoff and initial climb (0-20 min)
      altitude = Math.pow(i / 20, 1.5) * 35000;
      speed = 150 + (i / 20) * 300;
      verticalSpeed = 2000 - (i / 20) * 1800;
    } else if (i <= 160) {
      // Cruise (20-160 min)
      altitude = 35000 + Math.sin((i - 20) / 20) * 2000;
      speed = 450 + Math.sin((i - 20) / 15) * 50;
      verticalSpeed = Math.sin((i - 20) / 30) * 200;
    } else {
      // Descent and approach (160-180 min)
      const descentProgress = (i - 160) / 20;
      altitude = 35000 * (1 - Math.pow(descentProgress, 2));
      speed = 450 - descentProgress * 200;
      verticalSpeed = -1500 * descentProgress;
    }
    
    data.push({
      time: timeString,
      altitude: Math.max(0, altitude),
      speed: Math.max(0, speed),
      verticalSpeed: Math.max(-2500, Math.min(2500, verticalSpeed)),
      heading: (i * 2) % 360
    });
  }
  
  return data;
}
