import { AISeverityClassification, SeverityLevel } from '../types';
import { getGeminiModel, isGeminiConfigured } from './client';

export interface SeverityInput {
  description: string;
  trappedCount: number;
  injuredCount: number;
  needsBoat: boolean;
  needsMedical: boolean;
  disasterType?: string;
}

export async function classifySeverityWithAI(input: SeverityInput): Promise<AISeverityClassification> {
  const model = getGeminiModel('gemini-1.5-flash');

  if (isGeminiConfigured && model) {
    try {
      const prompt = `Classify disaster SOS report severity:
Description: ${input.description}
Trapped count: ${input.trappedCount}
Injured count: ${input.injuredCount}
Needs boat: ${input.needsBoat}
Needs medical: ${input.needsMedical}

Return strictly JSON:
{
  "score": number between 0 and 100,
  "level": "critical" | "high" | "moderate" | "low",
  "urgencyReason": "string explanation",
  "requiredRescueUnits": ["Unit 1", "Unit 2"],
  "estimatedSOP": "Operational SOP summary"
}`;

      const res = await model.generateContent(prompt);
      const text = res.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(text);

      return {
        score: Math.min(Math.max(Number(parsed.score || 70), 10), 100),
        level: (parsed.level || 'high') as SeverityLevel,
        urgencyReason: parsed.urgencyReason || 'Urgent incident requiring emergency response.',
        requiredRescueUnits: parsed.requiredRescueUnits || ['Paramedic Unit', 'Search and Rescue'],
        estimatedSOP: parsed.estimatedSOP || 'Dispatch first available rescue squad.',
      };
    } catch (err) {
      console.warn('[Gemini Severity Classification] Live call failed, using heuristic fallback:', err);
    }
  }

  // Heuristic rule-based calculation
  let score = 35;
  if (input.trappedCount > 0) score += Math.min(input.trappedCount * 12, 35);
  if (input.injuredCount > 0) score += Math.min(input.injuredCount * 10, 30);
  if (input.needsBoat) score += 20;
  if (input.needsMedical) score += 15;

  const text = input.description.toLowerCase();
  if (text.includes('unconscious') || text.includes('bleeding') || text.includes('crush')) score += 20;
  if (text.includes('oxygen') || text.includes('infant') || text.includes('elderly')) score += 15;

  score = Math.min(Math.max(score, 15), 99);

  let level: SeverityLevel = 'low';
  if (score >= 85) level = 'critical';
  else if (score >= 65) level = 'high';
  else if (score >= 45) level = 'moderate';

  const requiredRescueUnits: string[] = [];
  if (input.needsBoat || text.includes('water') || text.includes('flood')) {
    requiredRescueUnits.push('Swift Water Rescue Task Force', 'Inflatable Zodiac Crew');
  }
  if (input.needsMedical || input.injuredCount > 0) {
    requiredRescueUnits.push('Field Trauma Paramedic Unit', 'Advanced Life Support Medevac');
  }
  if (input.trappedCount > 0 || text.includes('collapse')) {
    requiredRescueUnits.push('Urban Search & Rescue (USAR) Canine Squad', 'Hydraulic Extrication Team');
  }
  if (requiredRescueUnits.length === 0) {
    requiredRescueUnits.push('Rapid Response Volunteer Unit', 'Mobile Shelter Patrol');
  }

  const urgencyReason = `[Severity Score: ${score}/100 - ${level.toUpperCase()}] Incident involves ${input.trappedCount} trapped persons and ${input.injuredCount} casualties. Immediate dispatch recommended.`;
  const estimatedSOP = `Authorize priority-1 dispatch for ${requiredRescueUnits[0]}. Instruct victims to conserve mobile battery and maintain elevated position.`;

  return {
    score,
    level,
    urgencyReason,
    requiredRescueUnits,
    estimatedSOP,
  };
}
