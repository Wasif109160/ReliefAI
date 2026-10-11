import { getGeminiModel, isGeminiConfigured } from './client';

export interface IncidentContext {
  activeIncidentsCount: number;
  totalAffected: number;
  criticalPendingSOS: number;
  shelterOccupancyRate: number;
  weatherSummary?: string;
}

export async function generateEmergencySummaryWithAI(
  context: IncidentContext,
  targetAudience: 'command' | 'public' = 'command'
): Promise<string> {
  const model = getGeminiModel('gemini-1.5-flash');

  if (isGeminiConfigured && model) {
    try {
      const prompt = `You are ReliefAI Emergency Incident Commander. Generate a concise, high-impact ${targetAudience} situational emergency summary based on:
Active Incidents: ${context.activeIncidentsCount}
Total Affected: ${context.totalAffected}
Critical SOS in Queue: ${context.criticalPendingSOS}
Shelter Occupancy: ${context.shelterOccupancyRate}%
Weather Conditions: ${context.weatherSummary || 'Torrential rainfall, river cresting at 19.4 ft'}`;

      const res = await model.generateContent(prompt);
      return res.response.text();
    } catch (err) {
      console.warn('[Gemini Summary] API error, falling back to local executive summary:', err);
    }
  }

  if (targetAudience === 'command') {
    return `### 🚨 LIVE OPERATIONAL SITREP - ${new Date().toLocaleTimeString()}
**Priority Status: LEVEL 1 DISASTER RESPONSE ACTIVE**

1. **Incidents & Life Safety:**
   - **${context.activeIncidentsCount} major disaster sectors** actively tracked (Cascadia Flash Flood, Metro Faultline, Pine Ridge Wildfire).
   - **${context.criticalPendingSOS} critical SOS reports** requiring immediate water / hydraulic extraction.
   - Total population under active evacuation order: **${context.totalAffected.toLocaleString()} citizens**.

2. **Shelter & Logistics:**
   - Regional shelters currently operating at **${context.shelterOccupancyRate}% capacity**.
   - Primary logistics corridors along Highway 5 compromised; river staging active at Fluvial Ramp.

3. **Immediate Directives:**
   - Pre-position Swift Water Task Force B at Fluvial Balcony Sector.
   - Divert incoming evacuees toward Redwood Valley Shelter She-003.`;
  } else {
    return `### 📢 Emergency Public Safety Advisory
- **Immediate Warning:** Flash floodwaters in Sector 4 are rising rapidly. DO NOT walk or drive through flooded roads.
- **Shelters Open:** Safe evacuation facilities are open with warm meals and medical support. Check the **Shelter Finder** for live vacancy.
- **Request Rescue:** If trapped or injured, press the **SOS Dispatch** button to broadcast your GPS coordinates directly to first responders.`;
  }
}
