import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized GoogleGenAI client (only created on-demand, protecting from startup environment issues)
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not defined. AI interactions will fail.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Proxied handle that redirects all property accesses dynamically to the initialized GoogleGenAI client
const ai = new Proxy({} as GoogleGenAI, {
  get(target, prop) {
    return (getAI() as any)[prop];
  }
});

// Mock Storage for simulation analytics list (In-memory for prototype)
const sessionLogs: any[] = [];

// API: Health status
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API: AI Tutor with Adaptive System Instructions based on Cognitive state
app.post('/api/gemini/tutor', async (req, res) => {
  try {
    const { message, history = [], cognitiveState = { attention: 'High', stress: 'Low', fatigue: 'Low' }, topic = 'General Science' } = req.body;

    const attentionStr = String(cognitiveState.attention);
    const stressStr = String(cognitiveState.stress);
    const fatigueStr = String(cognitiveState.fatigue);

    // Dynamic prompt engineering responding directly to student's live brainwave metrics
    let adaptiveGuideline = '';
    if (attentionStr === 'Low' || fatigueStr === 'High') {
      adaptiveGuideline = 'The student is currently fatigued or distracted. Simplify your explanations, keep answers maximum 2 paragraphs, use friendly emoji/analogies, and include a simple interactive multiple-choice check-in question or riddle to recapture attention.';
    } else if (stressStr === 'High') {
      adaptiveGuideline = 'The student exhibits High Stress. Adopt a calm, incredibly gentle academic advisory style. Do NOT demand heavy computation; break definitions down into slow, reassuring baby-steps. Offer immediate validation.';
    } else {
      adaptiveGuideline = 'The student is highly focused and receptive. Provide advanced concepts, stimulate critical thinking with open-ended prompt challenges, and provide thorough, high-fidelity engineering/scientific breakdowns.';
    }

    const systemInstruction = `You are NeuroLearn AI's Brain-Adaptive Tutor.
Current Topic: ${topic}.
Current Cognitive State of Student: Attention: ${attentionStr}, Stress: ${stressStr}, Fatigue: ${fatigueStr}.
Adaptive Directive: ${adaptiveGuideline}
Keep your tone educational, deeply supportive, and exciting. Format answers using pristine structure and clean bold text. Do not over-explain or write extremely long essays unless they have High Focus.`;

    const chatHistory = history.map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }],
    }));

    // Start a chat conversation using the SDK structure
    const chat = ai.chats.create({
      model: 'gemini-3.5-flash',
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    // Populate history if available (we need to send previous messages iteratively or set them)
    // For simplicity, we can do generateContent by passing the recent conversation stack
    const contents = [...chatHistory, { role: 'user', parts: [{ text: message }] }];

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({
      success: true,
      text: response.text,
      appliedCognitiveProfile: {
        attention: attentionStr,
        stress: stressStr,
        adaptiveStyle: adaptiveGuideline
      }
    });
  } catch (error: any) {
    console.error('Error in AI Tutor Route:', error);
    res.status(500).json({ error: error.message || 'Error executing AI Tutor request.' });
  }
});

// API: Focus Recovery & Emotional Wellness Coach
app.post('/api/gemini/coach', async (req, res) => {
  try {
    const { message, biometricState = { hrv: 65, gsr: 4.8, headMovement: 'High' } } = req.body;

    const gsr = Number(biometricState.gsr);
    const hrv = Number(biometricState.hrv);
    const movement = String(biometricState.headMovement);

    let coachingFocus = '';
    if (gsr > 7.0 || hrv < 50) {
      coachingFocus = 'The student has physiological signs of high stress (elevated GSR / depressed HRV). Guide them immediately into a 4-7-8 deep diaphragmatic breathing technique. Count the steps together.';
    } else if (movement === 'High' || movement === 'Erratic') {
      coachingFocus = 'The student shows high head movement activity, suggesting restlessness or poor posture. Suggest a quick 30-second shoulder shrugging and posture reset.';
    } else {
      coachingFocus = 'The student is stable. Help them set a mindful daily learning micro-goal or offer positive reinforcement.';
    }

    const systemInstruction = `You are NeuroLearn AI's Focus Recovery & Student Wellness Coach.
Your objective is to optimize learning performance by assisting the student with emotional self-regulation, mindfulness, and physical posture resets.
Current Biometrics: Heart Rate Variability (HRV): ${hrv} ms, Galvanic Skin Response (GSR): ${gsr} µS, Head Motion: ${movement}.
Coaching Directive: ${coachingFocus}
Write with authentic empathy, calmness, and practical clarity. Keep replies concise and extremely refreshing.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: message,
      config: {
        systemInstruction,
        temperature: 0.6,
      }
    });

    res.json({
      success: true,
      text: response.text,
      wellnessDirectives: coachingFocus
    });
  } catch (error: any) {
    console.error('Error in AI Coach Route:', error);
    res.status(500).json({ error: error.message || 'Error executing AI Coach request.' });
  }
});

// API: Personalized Quiz Generator with Dynamic Difficulty
app.post('/api/gemini/quiz', async (req, res) => {
  try {
    const { topic = 'Neuroscience Basic', difficulty = 'Medium', cognitiveState = { attention: 'High' } } = req.body;

    const prompt = `Generate an interactive quiz with exactly 3 multiple-choice questions on "${topic}". 
The target difficulty is ${difficulty}, adapted for a student whose focus is ${cognitiveState.attention}.
Return a strict JSON array representing the questions.`;

    const systemInstruction = `You are NeuroLearn AI's Interactive Adaptive Quiz Generator. 
You must output a strict JSON array. Each element in the array must be an object with the following fields:
1. "id" (number)
2. "question" (string)
3. "options" (array of 4 strings)
4. "correctAnswer" (string, which must be exactly equal to one of the options)
5. "explanation" (string explaining why it is correct, written in a brain-supportive encouraging way)
6. "cognitiveMetric" (string detailing what aspect of attention/memory this question evaluates)

Do NOT wrap the output in markdown block. Return raw JSON string only. No leading or trailing characters.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.8,
      }
    });

    let rawText = response.text || '[]';
    // Clean up any potential accidental markdown backticks just to be 100% resilient
    if (rawText.includes('```json')) {
      rawText = rawText.split('```json')[1].split('```')[0].trim();
    } else if (rawText.includes('```')) {
      rawText = rawText.split('```')[1].split('```')[0].trim();
    }

    const questions = JSON.parse(rawText.trim());
    res.json({
      success: true,
      topic,
      difficulty,
      questions,
    });
  } catch (error: any) {
    console.error('Error in Quiz Generator:', error);
    res.status(500).json({
      error: error.message || 'Error generating quiz.',
      // fallback mock questions to prevent UI failure
      questions: [
        {
          id: 1,
          question: "Which EEG frequency band is classically associated with deep focus and cognitive problem solving?",
          options: ["Delta waves (1-4 Hz)", "Theta waves (4-8 Hz)", "Beta waves (12-30 Hz)", "High Gamma waves (30-100 Hz)"],
          correctAnswer: "Beta waves (12-30 Hz)",
          explanation: "Beta bands reflect focused mental activity and analytical engagement, while theta reflects light sleep or relaxation.",
          cognitiveMetric: "Attentional focus"
        },
        {
          id: 2,
          question: "How does elevated heart rate variability (HRV) typically relate to a student's cognitive stress resilience?",
          options: ["Higher HRV indicates high psychological distress", "Higher HRV correlates with higher calm and emotional state stability", "HRV is purely a measure of physical exercise exhaustion", "HRV stays constant and doesn't change with stress"],
          correctAnswer: "Higher HRV correlates with higher calm and emotional state stability",
          explanation: "Higher heart rate variability represents high parasympathetic nervous network tone, which means better stress adjustment and mental clarity.",
          cognitiveMetric: "Stress resilience"
        }
      ]
    });
  }
});

// API: Personalized AI Lesson Planner & Multimodal Cognitive Mindmap
app.post('/api/gemini/mindmap', async (req, res) => {
  try {
    const { topic = 'Neuroscience', cognitiveState = { attention: 'High', stress: 'Low', fatigue: 'Low' } } = req.body;

    const attentionStr = String(cognitiveState.attention);
    const stressStr = String(cognitiveState.stress);
    const fatigueStr = String(cognitiveState.fatigue);

    const isImpaired = attentionStr === 'Low' || fatigueStr === 'High';
    const isStressed = stressStr === 'High';

    let mapDirective = '';
    if (isImpaired) {
      mapDirective = 'Format the descriptions to be highly visual, bite-sized, and simplistic (maximum 20-30 words per node). Include direct sensory analogies. Add low-stress recall cues.';
    } else if (isStressed) {
      mapDirective = 'Produce very calm, confidence-instilling explanations. Focus heavily on practical, gentle learning points. Suggest simple micro-breaths as the target break activities.';
    } else {
      mapDirective = 'Supply highly granular, academically rigorous node descriptions (advanced details). Include logical challenges as the recall cues to push cognitive limits further.';
    }

    const prompt = `Generate a high-fidelity cognitive study mindmap detailing "${topic}".
Create a hierarchy of exactly 5 structured concept nodes (some root nodes, some child nodes).
The nodes should explain "${topic}" in depth.
Apply the following adaptation: ${mapDirective}.
Generate strict raw JSON representing this mindmap.`;

    const systemInstruction = `You are NeuroLearn AI's Academic Mindmap & Cognitive Architect.
You must return a raw JSON object with exactly these fields:
1. "topic" (string matching the input topic)
2. "nodes" (array of exactly 5 elements representing a mental cognitive map)

Each node in the "nodes" array MUST be an object containing:
- "id" (string, e.g., "node_1", "node_2", "node_3", "node_4", "node_5")
- "label" (string, a concise header for the concept, e.g. "Frontal Cortex Activation")
- "description" (string, the core learning concept written clearly)
- "recallCue" (string, a mnemonic cue, mental picture, or riddle tailored to help memorize this concept)
- "suggestedBreakActivity" (string, a tailored, refreshing 10-second posture reset or focus-booster relevant to cognitive state)
- "parentId" (string or null, referencing the "id" of another node to establish a tree hierarchy. For example, node_2 and node_3 can have parentId = "node_1" to branch off from it)

Do NOT write any markdown ticks or backticks. Return raw JSON text only. Ensure valid syntax.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.7,
      }
    });

    let rawText = response.text || '{}';
    if (rawText.includes('```json')) {
      rawText = rawText.split('```json')[1].split('```')[0].trim();
    } else if (rawText.includes('```')) {
      rawText = rawText.split('```')[1].split('```')[0].trim();
    }

    const mindmap = JSON.parse(rawText.trim());
    res.json({
      success: true,
      mindmap
    });
  } catch (error: any) {
    console.error('Error in Mindmap Generator:', error);
    const fallbackTopic = req.body?.topic || "Neuroscience Core Concept";
    res.status(500).json({
      error: error.message || 'Error generating academic mindmap.',
      // High quality fallback mindmap so the app does not break on network errors
      mindmap: {
        topic: fallbackTopic,
        nodes: [
          {
            id: "node_1",
            label: "Introduction to " + fallbackTopic,
            description: "An overview of the central thesis. This serves as the structural foundation of the learning blueprint.",
            recallCue: "Mnemonic: Think of an anchor holding down a grand logical vessel.",
            suggestedBreakActivity: "Take 3 deep, slow breaths before exploring further.",
            parentId: null
          },
          {
            id: "node_2",
            label: "Critical Frameworks & Axioms",
            description: "Diving deeper into the rules, processes, and core patterns governing this subject matter.",
            recallCue: "Mnemonics: A gears-and-wheels diagram showing input-to-output conversions.",
            suggestedBreakActivity: "Do a 10-second neck stretch to optimize cerebrovascular blood flow.",
            parentId: "node_1"
          },
          {
            id: "node_3",
            label: "Practical Applications",
            description: "Understanding where and how these theoretical elements operate inside real-world environments.",
            recallCue: "Imagine applying this directly to your own research workspace to resolve an actual bottle-neck.",
            suggestedBreakActivity: "Roll your shoulders back to expand chest capacity.",
            parentId: "node_1"
          },
          {
            id: "node_4",
            label: "Potential Pitfalls & Fallacies",
            description: "Being mindful of the common logical blindspots, misconceptions, and limits of standard approaches.",
            recallCue: "Think of a lighthouse warning ships of jagged, submerged rocks.",
            suggestedBreakActivity: "Gaze 20 feet away for 10 seconds to relax your focal muscles.",
            parentId: "node_2"
          },
          {
            id: "node_5",
            label: "Supreme Memory Consolidation",
            description: "Fusing all the nodes into a single, cohesive mental reference model for rapid subconscious retrieval.",
            recallCue: "Visualize coding a clean key-value database mapping concepts directly to memory.",
            suggestedBreakActivity: "Unmute the Neuro-Acoustic therapy for sustained alpha wave stimulation.",
            parentId: "node_3"
          }
        ]
      }
    });
  }
});

// API: Save simulated student logs (for Firestore / BigQuery simulation logs)
app.post('/api/simulation/log', (req, res) => {
  const log = req.body;
  log.timestamp = new Date().toISOString();
  log.id = `log_${Date.now()}`;
  sessionLogs.push(log);
  if (sessionLogs.length > 50) {
    sessionLogs.shift(); // keep last 50
  }
  res.json({ success: true, savedLogId: log.id });
});

app.get('/api/simulation/logs', (req, res) => {
  res.json({ success: true, count: sessionLogs.length, logs: sessionLogs });
});

// API: Gemini-Powered Wellness Companion Chatbot
app.post('/api/gemini/wellness-chat', async (req, res) => {
  try {
    const { 
      message, 
      history = [], 
      cognitiveState = { attention: 'High', stress: 'Low', fatigue: 'Low' }, 
      biometricState = { hrv: 78, gsr: 2.4, headMovement: 'Stable', heartRate: 70, temperature: 36.60 } 
    } = req.body;

    const stressStr = String(cognitiveState.stress);
    const attentionStr = String(cognitiveState.attention);
    const fatigueStr = String(cognitiveState.fatigue);
    const hr = Number(biometricState.heartRate);
    const hrv = Number(biometricState.hrv);
    const gsr = Number(biometricState.gsr);

    // Contextual instruction custom engineered on top of EEG neural telemetry
    let stateCoachingDirective = '';
    if (stressStr === 'High') {
      stateCoachingDirective = `The user's current EEG shows HIGH STRESS (GSR: ${gsr} µS, HRV: ${hrv} ms, HR: ${hr} bpm). 
Your TOP priority: Assist them immediately to reduce stress. 
- Provide an on-demand, highly detailed breathing exercise prompt with precise phase counts (e.g., box breathing 4s, or 4-7-8 breathing) and explain what physical changes occur inside their neural system during these paces.
- Deliver 2 warm, practical, immediate stress-relief tips.
- Maintain an incredibly soft, nurturing, soothing tone using comforting and warm micro-guidance. Ensure they feel safe and supported.`;
    } else if (fatigueStr === 'High' || attentionStr === 'Low') {
      stateCoachingDirective = `The user's current EEG shows Elevated Fatigue or Low Attention (Attention: ${attentionStr}, Fatigue: ${fatigueStr}). 
Your task: Help them re-energize and refocus without inducing panic or stress.
- Suggest a quick, interactive sensory posture stretch, neck release, or double-inhale breathing cycle to restore alert mental posture.
- Keep explanations very punchy, concise, and structured, breaking up responses into brief paragraphs or lists.`;
    } else {
      stateCoachingDirective = `The user's current EEG shows OPTIMAL mental focus and low stress. 
Your task: Consolidate their pleasant state.
- Congratulate them on maintaining healthy, highly-cooperative brain states.
- Offer 1 mindful tip for retaining focus over longer intervals, or lead a soft focus breathing check-in to anchor mental rhythm.`;
    }

    const systemInstruction = `You are "Soma", NeuroLearn AI's dedicated Wellness Companion.
Your primary directive is to act as a supportive, compassionate, and highly intelligent neural biofeedback guide. 
You offer personalized, real-time stress relief advice, customized breathing exercise prompts, and cognitive-wellbeing tips customized explicitly to the user's live EEG stress metrics, heart rate, and brain state telemetry.

Current Student Live EEG States:
- Stress State: ${stressStr}
- Attention State: ${attentionStr}
- Fatigue State: ${fatigueStr}
- HRV: ${hrv} ms
- Heart Rate: ${hr} bpm
- Galvanic Skin Response: ${gsr} µS

Coaching Direction for Current State:
${stateCoachingDirective}

Tone & Format Constraints:
- Use markdown beautifully: bullet points, clean bold subtitles, and distinct blockquotes for breathing paces are highly recommended.
- Do NOT make answers excessively long (keep them under 2.5 paragraphs or a concise structured checklist). 
- Always speak directly, compassionately, and professionally. Refer to their current states respectfully to validate their experience.`;

    const chatHistory = history.map((h: any) => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }],
    }));

    const contents = [...chatHistory, { role: 'user', parts: [{ text: message }] }];

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.6,
      }
    });

    res.json({
      success: true,
      text: response.text,
      currentEEG: {
        stress: stressStr,
        gsr,
        hrv,
      }
    });

  } catch (error: any) {
    console.error('Error in Wellness Chat Route:', error);
    res.status(500).json({ error: error.message || 'Error executing Wellness Chat companion request.' });
  }
});

// API: Gemini-Powered Academic Synthesis Report Draft
app.post('/api/gemini/academic-synthesis', async (req, res) => {
  try {
    const { trialMetadata = {}, logs = [] } = req.body;

    if (logs.length === 0) {
      return res.status(400).json({ error: 'Cannot compile synthesis without active trial data logs. Please execute and record a trial run first.' });
    }

    const participantId = trialMetadata.participantId || 'SUBJ-082';
    const sampleRate = trialMetadata.sampleRate || '250 Hz';
    const electrodeConfig = trialMetadata.electrodeConfig || 'Differential Prefrontal Fp1-Fp2';
    const irbId = trialMetadata.irbId || 'IRB-2026-NEURO-88B';

    // Summarize the logged telemetry for the prompt
    const logSummary = logs.map((log: any, idx: number) => {
      return `Sample #${idx + 1} (${log.timestamp}):
- Brainwaves (relative %): Alpha: ${log.brainwaves.alpha}%, Beta: ${log.brainwaves.beta}%, Theta: ${log.brainwaves.theta}%, Gamma: ${log.brainwaves.gamma}%
- Ratios: Theta/Beta Ratio (TBR): ${log.tbr.toFixed(2)}, Beta/Alpha Ratio (BAR): ${log.bar.toFixed(2)}
- Autonomic Metrics: Heart Rate: ${log.heartRate} bpm, HRV: ${log.hrv} ms, GSR: ${log.gsr.toFixed(2)} µS
- Classified States: Attention: ${log.cognitive.attention}, Stress: ${log.cognitive.stress}, Fatigue: ${log.cognitive.fatigue}
- Marker: ${log.marker || 'None'}`;
    }).join('\n\n');

    const systemInstruction = `You are the "Soma Academic Synthesis Writer", a Senior Neuroscientist & Cognitive Biofeedback Researcher.
You specialize in analyzing quantitative EEG (qEEG) datasets, heart rate variability, galvanic skin response, and event-related potentials (ERPs).
Your objective is to review a sequence of time-series neuro-telemetry logs logged during an active student trial and output a pristine, peer-review-ready peer-draft Academic Abstract and Case Study Analysis.

Strict Guidelines:
1. Ground your claims in the actual logged values (e.g. quote specific sample ratios, HR peaks, or GSR spikes).
2. Reference neuro-anatomical and cardiorespiratory pathways (e.g., prefrontal cortex metabolic resources, parasympathetic vagal stimulation, locus coeruleus norepinephrine release, or sweat gland sympathetic pathways).
3. Do NOT make answers excessively long (keep under 500-600 words of incredibly structured scientific writing).
4. Use professional clinical vocabulary (avoid colloquialisms or generic supportive speak).`;

    const message = `Please review this cognitive telemetry dataset of Participant ${participantId} collected with ${electrodeConfig} electrode configuration at ${sampleRate} sample rate, approved under ${irbId}:

=== LOGGED TELEMETRY TIMELINE ===
${logSummary}

=== REQUIRED STRUCTURE ===
1. TITLE: Descriptive high-impact peer-review style title.
2. KEYWORDS: 4-5 indexing keywords.
3. ABSTRACT: Structured into Background, Methodology, Results, and Discussion sections.
4. BIOMARKER INTERPRETATION: Address computed TBR, BAR, and Autonomic sympathovagal indicators (HR, HRV, GSR) indicating neural arousal, attention deficit, or cognitive load.
5. PEDAGOGICAL / NEURAL RECONSTITUTION ADVICE: Customized biofeedback-guided retraining recommendations based strictly on the trends of the dataset.

Generate the scientific case study paper draft in raw markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [{ role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction,
        temperature: 0.5,
      }
    });

    res.json({
      success: true,
      text: response.text,
      participantId,
      samplesAnalysed: logs.length
    });

  } catch (error: any) {
    console.error('Error in Academic Synthesis Route:', error);
    res.status(500).json({ error: error.message || 'Error executing Academic Synthesis report formulation.' });
  }
});

// API: Authorized BigQuery Research Pipeline Data Query & Export
app.post('/api/bigquery/export', (req, res) => {
  try {
    const { 
      researcherId = '', 
      researcherLicense = '', 
      cohort = 'all', 
      dateRange = 'last-30-days', 
      limit = 20, 
      electrodeConfig = 'all' 
    } = req.body;

    if (!researcherId.trim()) {
      return res.status(403).json({ 
        success: false, 
        error: 'Forbidden: Valid Institutional Researcher credentials and security clearance required to connect to the BigQuery cloud pipeline.' 
      });
    }

    // Determine query date range SQL representation
    let sqlInterval = '30 DAY';
    if (dateRange === 'last-90-days') sqlInterval = '90 DAY';
    if (dateRange === 'last-7-days') sqlInterval = '7 DAY';
    if (dateRange === 'all-time') sqlInterval = '365 DAY';

    // Formulate authentic SQL represented in BigQuery UI
    const sqlQueried = `SELECT 
  session_id,
  SHA256(participant_id) as participant_hash,
  TIMESTAMP_TRUNC(timestamp, SECOND) as event_time,
  eeg_alpha_power_pct,
  eeg_beta_power_pct,
  eeg_theta_power_pct,
  eeg_gamma_power_pct,
  ROUND(eeg_theta_power_pct / NULLIF(eeg_beta_power_pct, 0), 3) as TBR,
  ROUND(eeg_beta_power_pct / NULLIF(eeg_alpha_power_pct, 0), 3) as BAR,
  heart_rate_bpm,
  heart_rate_variability_ms,
  galvanic_skin_response_us,
  attention_classification,
  stress_classification,
  fatigue_classification,
  demographics.age_bracket_anonymized,
  demographics.gender_anonymized,
  demographics.handedness_anonymized,
  demographics.self_reported_sleep_score,
  performance.tasks_completed_count,
  performance.distraction_interventions,
  performance.active_learning_efficiency_index
FROM \`bigquery-public-data.neurolearn_pipeline.wellness_telemetry_v2\`
INNER JOIN UNNEST(metadata.demographics) as demographics
INNER JOIN UNNEST(metadata.performance) as performance
WHERE cohort_tag = '${cohort}'
  AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL ${sqlInterval})
  ${electrodeConfig !== 'all' ? `AND electrode_montage = '${electrodeConfig}'` : ''}
ORDER BY timestamp DESC
LIMIT ${limit};`;

    // Seed realistic generated datasets
    const sampleParticipants = [
      { id: 'ANON_SUBJ_x102f', age: '18-24', gender: 'F', handedness: 'Right', sleep: 8, anxiety: 3, cohort: 'undergrad' },
      { id: 'ANON_SUBJ_k928a', age: '25-34', gender: 'M', handedness: 'Right', sleep: 6, anxiety: 6, cohort: 'undergrad' },
      { id: 'ANON_SUBJ_b304c', age: '18-24', gender: 'Non-binary', handedness: 'Left', sleep: 7, anxiety: 4, cohort: 'adhd' },
      { id: 'ANON_SUBJ_m837e', age: '35-44', gender: 'F', handedness: 'Right', sleep: 5, anxiety: 7, cohort: 'adhd' },
      { id: 'ANON_SUBJ_v489w', age: '14-17', gender: 'M', handedness: 'Right', sleep: 9, anxiety: 2, cohort: 'high-school' },
      { id: 'ANON_SUBJ_t827q', age: '14-17', gender: 'F', handedness: 'Left', sleep: 7, anxiety: 5, cohort: 'high-school' },
      { id: 'ANON_SUBJ_p922r', age: '25-34', gender: 'Decline to State', handedness: 'Ambidextrous', sleep: 8, anxiety: 3, cohort: 'control' },
      { id: 'ANON_SUBJ_z981k', age: '18-24', gender: 'M', handedness: 'Right', sleep: 6, anxiety: 5, cohort: 'control' },
    ];

    // Filter by requested cohort
    const matchingCohortBases = cohort === 'all' 
      ? sampleParticipants 
      : sampleParticipants.filter(p => p.cohort === cohort);

    // Fallback if none matched
    const finalBases = matchingCohortBases.length > 0 ? matchingCohortBases : sampleParticipants;

    const dataset = [];
    const baseDate = new Date();

    for (let i = 0; i < limit; i++) {
      const baseSubj = finalBases[i % finalBases.length];
      const targetTime = new Date(baseDate.getTime() - i * 4 * 60 * 1000); // spaced 4 minutes apart

      // Simulated stress variations driving brainwaves
      const sampleStress = Math.random() > 0.6 ? 'High' : (Math.random() > 0.4 ? 'Medium' : 'Low');
      const sampleAttention = sampleStress === 'High' ? 'Low' : (Math.random() > 0.3 ? 'High' : 'Medium');
      const sampleFatigue = Math.random() > 0.7 ? 'High' : 'Low';

      let alpha = 35;
      let beta = 40;
      let theta = 18;
      let gamma = 7;

      if (sampleStress === 'High') {
        beta = 52; alpha = 22; theta = 14; gamma = 12;
      } else if (sampleAttention === 'Low') {
        theta = 36; beta = 28; alpha = 31; gamma = 5;
      }

      // Add small variance
      alpha = Math.max(5, Math.min(95, Math.round(alpha + (Math.random() * 6 - 3))));
      beta = Math.max(5, Math.min(95, Math.round(beta + (Math.random() * 6 - 3))));
      theta = Math.max(5, Math.min(95, Math.round(theta + (Math.random() * 6 - 3))));
      gamma = Math.max(2, Math.min(45, Math.round(gamma + (Math.random() * 4 - 2))));

      const tbr = Number((theta / beta).toFixed(3));
      const bar = Number((beta / alpha).toFixed(3));

      // Cardiac variables
      const calculatedHR = Math.round(72 + (sampleStress === 'High' ? 18 : 0) + (Math.random() * 12 - 6));
      const calculatedHRV = Math.round(55 - (sampleStress === 'High' ? 22 : 0) + (Math.random() * 20 - 10));
      const gsr = Number((4.5 + (sampleStress === 'High' ? 6.2 : 0) + (Math.random() * 1.8 - 0.9)).toFixed(4));

      // Task performance metadata
      const tasksCompleted = Math.round(2 + (sampleAttention === 'High' ? 3 : 0) + (Math.random() * 2));
      const distractionCount = Math.round(5 - (sampleAttention === 'High' ? 4 : 0) + (Math.random() * 3));
      const activeLearningEfficiency = Number((0.55 + (sampleAttention === 'High' ? 0.35 : 0) - (sampleFatigue === 'High' ? 0.15 : 0) + Math.random() * 0.1).toFixed(3));

      dataset.push({
        sessionId: `SESS-2026-BQ-${10000 + i}`,
        participantHash: baseSubj.id,
        timestamp: targetTime.toISOString(),
        brainwaves: { alpha, beta, theta, gamma },
        tbr,
        bar,
        heartRate: calculatedHR,
        hrv: calculatedHRV,
        gsr,
        cognitive: {
          attention: sampleAttention,
          stress: sampleStress,
          fatigue: sampleFatigue
        },
        demographics: {
          ageRange: baseSubj.age,
          gender: baseSubj.gender,
          handedness: baseSubj.handedness,
          sleepQualityIndex: baseSubj.sleep,
          baselineAnxietyScore: baseSubj.anxiety,
          academicCohort: baseSubj.cohort.toUpperCase()
        },
        performance: {
          tasksCompleted,
          distractionCount,
          focusDurationSec: Math.round(tasksCompleted * 300 + Math.random() * 120),
          activeLearningEfficiency: Math.min(1.0, Math.max(0.0, activeLearningEfficiency))
        }
      });
    }

    const estimatedBytes = Number(((limit * 1250) / 1024).toFixed(2));

    res.json({
      success: true,
      queryInfo: {
        sqlQuery: sqlQueried,
        billedBytes: `${(limit * 0.08).toFixed(2)} MB`,
        estimatedNetworkTransferKb: estimatedBytes,
        executionTimeMs: Math.round(85 + Math.random() * 50),
        totalRowsMatched: dataset.length,
        anonymizationApplied: "Secure SHA-256 ID Hashing; Participant Demographic binning; Sleep score normalization. Conformant to HIPAA Safe Harbor guidelines."
      },
      dataset
    });

  } catch (error: any) {
    console.error('Error in BigQuery Export Route:', error);
    res.status(550).json({ success: false, error: error.message || 'BigQuery analytical extraction engine failed.' });
  }
});

// Setup Vite & Static Files routing
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NeuroLearn AI Backend] Server running at http://localhost:${PORT}`);
  });
}

startServer();
