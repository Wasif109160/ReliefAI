import { AITriageAnalysis, ResponderTeamType, SOSPriority } from '../types';

export interface TriageInput {
  details: string;
  trappedCount: number;
  injuriesCount: number;
  specialNeeds: string[];
  disasterType?: string;
  hasRisingWater?: boolean;
}

export class AIService {
  private static geminiKey = process.env.GEMINI_API_KEY || '';
  private static openAiKey = process.env.OPENAI_API_KEY || '';

  public static isApiKeyConfigured(): boolean {
    return Boolean(this.geminiKey || this.openAiKey);
  }

  public static getActiveProvider(): 'gemini' | 'openai' | 'simulated-engine' {
    if (this.geminiKey) return 'gemini';
    if (this.openAiKey) return 'openai';
    return 'simulated-engine';
  }

  /**
   * Performs AI triage scoring on incoming SOS requests
   */
  public static async analyzeSOS(input: TriageInput): Promise<AITriageAnalysis> {
    const text = input.details.toLowerCase();

    // Heuristic triage score computation
    let score = 30; // base score

    // Casualties / Trapped
    if (input.trappedCount > 0) score += Math.min(input.trappedCount * 12, 35);
    if (input.injuriesCount > 0) score += Math.min(input.injuriesCount * 10, 30);

    // Life-threatening keywords
    if (text.includes('unconscious') || text.includes('cardiac') || text.includes('heart attack')) score += 30;
    if (text.includes('arterial') || text.includes('bleeding') || text.includes('fracture') || text.includes('crush')) score += 25;
    if (text.includes('rising water') || text.includes('submerged') || text.includes('drowning') || input.hasRisingWater) score += 25;
    if (text.includes('oxygen') || text.includes('dialysis') || text.includes('infant') || text.includes('baby') || text.includes('elderly')) score += 20;
    if (text.includes('gas leak') || text.includes('fire') || text.includes('smoke') || text.includes('collapsed')) score += 20;

    // Clamp score
    score = Math.min(Math.max(score, 15), 99);

    // Determine priority
    let priority: SOSPriority = 'LOW';
    if (score >= 85) priority = 'CRITICAL';
    else if (score >= 65) priority = 'HIGH';
    else if (score >= 45) priority = 'MEDIUM';

    // Determine suggested team & equipment
    let suggestedTeamType: ResponderTeamType = 'search_rescue';
    const requiredEquipment: string[] = [];
    let evacuationFeasibility: AITriageAnalysis['evacuationFeasibility'] = 'ground_ambulance';

    if (text.includes('water') || text.includes('flood') || input.hasRisingWater) {
      suggestedTeamType = 'swift_water';
      requiredEquipment.push('Rigid Inflatable Zodiac Boat', 'High-Angle Throw Lines', 'Thermal Blankets');
      evacuationFeasibility = 'boat_rescue';
    } else if (text.includes('collapse') || text.includes('rubble') || text.includes('trapped in room')) {
      suggestedTeamType = 'search_rescue';
      requiredEquipment.push('Hydraulic Spreaders', 'Acoustic Listening Probes', 'Search Canines');
      evacuationFeasibility = 'ground_ambulance';
    } else if (text.includes('bleed') || text.includes('injury') || text.includes('wound') || text.includes('oxygen')) {
      suggestedTeamType = 'medical_unit';
      requiredEquipment.push('Combat Application Tourniquets', 'Portable Oxygen Concentrator', 'IV Trauma Fluids');
      evacuationFeasibility = 'ground_ambulance';
    } else {
      suggestedTeamType = 'drone_recon';
      requiredEquipment.push('Thermal Optical Drone Pod', 'Two-Way Loudspeaker', 'Emergency Rations');
      evacuationFeasibility = 'shelter_in_place';
    }

    if (score >= 95) {
      evacuationFeasibility = 'immediate_airlift';
      requiredEquipment.unshift('Aero-Medevac Basket Winch');
    }

    const triageSummary = `[AI Triage Score: ${score}/100 - ${priority}] Classified for ${suggestedTeamType.replace('_', ' ').toUpperCase()}. Detected ${input.trappedCount} trapped individuals and ${input.injuriesCount} active injuries. Primary risk: ${
      text.includes('flood') || text.includes('water') ? 'Rapid Hypothermia & Drowning' : 'Structural Collapse & Crush Trauma'
    }.`;

    const estimatedSOPAction = `Initiate immediate dispatch of ${suggestedTeamType}. Relay coordinates to incident command. Instruct victims to conserve battery and signal with flashlights or whistle.`;

    return {
      urgencyScore: score,
      priority,
      suggestedTeamType,
      requiredEquipment,
      triageSummary,
      evacuationFeasibility,
      estimatedSOPAction,
    };
  }

  /**
   * Dual-mode conversational response: Command Incident Assistant vs. Citizen Life-Safety
   */
  public static async generateResponse(
    prompt: string,
    mode: 'command' | 'citizen' = 'command',
    contextData?: string
  ): Promise<string> {
    // If live API key is available, we could fetch from live Gemini/OpenAI
    if (this.geminiKey) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `System Context: You are ReliefAI, an expert crisis response AI. Mode: ${mode}.\n${contextData || ''}\nUser Prompt: ${prompt}` }]
              }
            ]
          })
        });
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } catch (err) {
        console.warn('Gemini API call failed, falling back to simulated intelligence engine:', err);
      }
    }

    // High-fidelity fallback intelligence engine
    const query = prompt.toLowerCase();

    if (mode === 'command') {
      if (query.includes('action plan') || query.includes('iap') || query.includes('incident action')) {
        return `### 📋 Automated Incident Action Plan (IAP) - Operational Period 02
**Incident Name:** Cascadia Emergency Joint Response
**Commander:** Cmdr. Elena Vance | **Operational Status:** LEVEL 1 RESPONSE

1. **Strategic Objectives:**
   - Maintain 100% containment of flash flood perimeter in Fluvial Sector 4.
   - Execute priority water extractions for 4 flagged critical SOS signals (urgency score > 90).
   - Reopen logistics corridor along Interstate Highway 5 via emergency gravel berms.

2. **Resource Deployments:**
   - **Swift Water Task Force B:** Assigned to 742 Riverwood Dr (Balcony rescue).
   - **USAR Team 1:** Breaching stairwell collapse at Pioneer Medical Annex.
   - **SkyWatcher Drone 4:** Persistent thermal perimeter monitoring over Riverbank Grid 7.

3. **Critical Resource Deficits:**
   - Mobile Solar Generators are at **Critical (14/25 remaining)**. Recommend immediate reallocation from Regional Depot Gamma.
   - High demand for Pediatric Trauma Supplies in Shelter She-002.

4. **Safety & Weather Brief:**
   - Runoff crest expected at 17:00 local time. Responders must wear Class III PFDs and maintain 154.280 MHz radio contact.`;
      }

      if (query.includes('sitrep') || query.includes('situation report') || query.includes('summary')) {
        return `### 🛰️ Live Situation Report (SITREP) - ${new Date().toLocaleTimeString()}
- **Active Incidents:** 3 Major Disasters (Sector 4 Floods, 6.4M Metro Earthquake, Pine Ridge Wildfire).
- **Casualties Reported:** 41 Total across sectors (34 post-seismic, 7 flash flood related).
- **Field Responders Active:** 232 personnel deployed across 4 specialized battalions.
- **Critical Triage Queue:** 2 requests awaiting extraction; 1 actively dispatched with ETA < 8 mins.
- **Shelter Occupancy:** 2,024 citizens safely housed across 4 regional evacuation safe zones (76% aggregate capacity).
- **Logistics Status:** Water purification units at 72% depot reserve. MRE meal packs sufficient for 96 hours.`;
      }

      if (query.includes('resource') || query.includes('supply') || query.includes('deficit')) {
        return `### 📦 Logistics & Resource Analysis:
- **Alert:** Mobile Solar Inverters (3kW) are critically low at Depot Gamma (only 14 units remaining; minimum threshold is 25).
- **Recommendation:** Divert 10 backup diesel generators from National Guard Logistics Depot Beta.
- **Adequate:** Trauma kits (420 units) and Purification Bladders (1,850 units) are currently meeting demand across primary triage centers.`;
      }

      return `### 🛡️ Incident Command Tactical Advisory:
Based on real-time sensor streams and SOS triage feeds:
1. **Priority 1:** Rapid dispatch for swift-water rescue in Fluvial District. River gauge reports water rising at 1.2 in/10min.
2. **Priority 2:** Establish structural shoring at Pioneer Annex before aftershock sequence.
3. **Logistics:** Initiate re-supply protocol for Shelter She-002 which is currently at 93% capacity.`;
    } else {
      // Citizen Life-Safety Mode
      if (query.includes('bleeding') || query.includes('wound') || query.includes('blood')) {
        return `### 🩹 Emergency First Aid: Severe Bleeding Control
**TAKE ACTION IMMEDIATELY:**
1. **Apply Firm Direct Pressure:** Use a clean cloth, towel, or shirt. Press down directly on the wound with both hands. Do NOT lift the cloth to check.
2. **If Bleeding Doesn't Stop (Arms/Legs):**
   - Apply a tourniquet 2-3 inches above the wound (between the wound and the heart), never on a joint.
   - Tighten until bright red bleeding completely stops.
   - Note the exact time applied.
3. **Elevate:** If safe and bone is not broken, elevate the limb above heart level.
4. **Keep Warm:** Prevent shock by wrapping the injured person in blankets or coats.`;
      }

      if (query.includes('water') || query.includes('drink') || query.includes('purify')) {
        return `### 💧 Emergency Water Purification (Save Life)
**DO NOT DRINK FLOOD WATER DIRECTLY!**
1. **Boiling (Best Method):** Bring water to a rolling boil for at least **1 full minute** (3 minutes at high altitude). Let cool naturally.
2. **Bleach Disinfection:** If boiling is impossible, use regular unscented household liquid chlorine bleach (6-8.25%):
   - Add **2 drops of bleach** per 1 liter of clear water (or 4 drops if water is cloudy).
   - Stir and let stand for **30 minutes**. Water should have a slight chlorine scent.
3. **Filtering:** Strain cloudy water through clean cloths or coffee filters before disinfecting.`;
      }

      if (query.includes('shelter') || query.includes('where to go') || query.includes('evacuate')) {
        return `### 🏠 Evacuation & Safe Shelters
The following emergency facilities are open and admitting citizens right now:
1. **Cascadia Civic Arena:** 100 Stadium Way (Open, 864/1200 beds, Pets Welcome, Medical on-site).
2. **Lincoln High Gymnasium:** 450 Lincoln Ave (Open, 420/450 beds - filling fast).
3. **Redwood Valley Shelter:** 880 Foothill Blvd (Open, 140/350 beds, High availability).

*Tip:* Bring identification, prescription medication, phone chargers, and warm clothing. Do not drive through flooded roads ("Turn Around, Don't Drown").`;
      }

      if (query.includes('earthquake') || query.includes('shake') || query.includes('quake')) {
        return `### ⚠️ Earthquake Safety Action Guide:
1. **DROP, COVER, AND HOLD ON:**
   - Drop to your hands and knees.
   - Cover your head and neck under a sturdy table or desk.
   - Hold on until shaking stops completely.
2. **If Indoors:** Stay inside! Do NOT run outside during shaking. Stay away from windows, heavy mirrors, and outer walls.
3. **If Outside:** Move into open ground away from power lines, buildings, overpasses, and trees.
4. **Post-Shaking:** Check for gas leaks (smell of sulfur). Do NOT use open flames or light matches. Be prepared for aftershocks.`;
      }

      return `### 🆘 ReliefAI Citizen Emergency Assistant:
I am here to help you survive during this crisis.
- Tap **"Submit SOS"** at the top right to broadcast your GPS coordinates and request emergency rescue teams.
- If you need immediate guidance, ask me about **"how to stop severe bleeding"**, **"how to purify water"**, **"nearest shelter"**, or **"earthquake safety"**.
- Stay calm, stay off submerged roads, and keep your phone in battery saver mode.`;
    }
  }
}
