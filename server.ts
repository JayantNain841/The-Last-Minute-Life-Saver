import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Set up server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY;
const hasApiKey = !!apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey !== '';

const ai = hasApiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

app.use(express.json());

// Helper to provide realistic tactical fallback plans if API key is missing or calls fail
function getFallbackPlan(prompt: string, category: string, hours: number) {
  const p = prompt.toLowerCase();
  let selectedCategory = category;
  if (!selectedCategory) {
    if (p.includes('exam') || p.includes('study') || p.includes('assignment') || p.includes('class') || p.includes('quiz') || p.includes('test')) {
      selectedCategory = 'Study';
    } else if (p.includes('interview') || p.includes('resume') || p.includes('job') || p.includes('apply') || p.includes('application')) {
      selectedCategory = 'Career';
    } else if (p.includes('code') || p.includes('project') || p.includes('dev') || p.includes('git') || p.includes('app')) {
      selectedCategory = 'Project';
    } else if (p.includes('bill') || p.includes('email') || p.includes('form') || p.includes('tax') || p.includes('register')) {
      selectedCategory = 'Administrative';
    } else {
      selectedCategory = 'Personal';
    }
  }

  // Calculate 15-30 minute block divisions based on estimatedHours
  const totalMins = Math.round((hours || 2) * 60);
  const blockMins = Math.round(totalMins / 4);

  const fallbackData: Record<string, { milestones: any[]; briefing: any }> = {
    Study: {
      milestones: [
        {
          id: 's1',
          title: 'High-Yield Triage & Resource Filtering',
          timeBlock: `Mins 0 - ${blockMins}`,
          steps: [
            { id: 's1_1', text: 'Identify and isolate the 3 key chapters or slides with the highest probability of appearing.', completed: false },
            { id: 's1_2', text: 'Gather all equations, definitions, or code cheatsheets onto a single physical/digital view.', completed: false },
            { id: 's1_3', text: 'Close all open non-essential tabs and place your communication device in a separate room.', completed: false }
          ]
        },
        {
          id: 's2',
          title: 'Active Recall & Quick Synthesis',
          timeBlock: `Mins ${blockMins} - ${blockMins * 2}`,
          steps: [
            { id: 's2_1', text: 'Do 3 rapid past questions or active recall prompts without checking notes first.', completed: false },
            { id: 's2_2', text: 'Self-correct answers using a bright red marker to visually reinforce gaps.', completed: false },
            { id: 's2_3', text: 'Memorize the top 5 absolute critical definitions or formulas using flash-card techniques.', completed: false }
          ]
        },
        {
          id: 's3',
          title: 'Strategic Mock Drill & Speed Testing',
          timeBlock: `Mins ${blockMins * 2} - ${blockMins * 3}`,
          steps: [
            { id: 's3_1', text: 'Run a strict timed 15-minute exam simulation under real exam conditions.', completed: false },
            { id: 's3_2', text: 'Implement a structured template for writing answers quickly (Intro, 3 Points, Conclusion).', completed: false },
            { id: 's3_3', text: 'Verify memory of edge cases, tricky exceptions, and secondary formulas.', completed: false }
          ]
        },
        {
          id: 's4',
          title: 'Final Buffer & Pre-Submission Polish',
          timeBlock: `Mins ${blockMins * 3} - ${totalMins}`,
          steps: [
            { id: 's4_1', text: 'Double check all formatting requirements, file names, or submission link logins.', completed: false },
            { id: 's4_2', text: 'Review the high-yield summaries or cheatsheet one final time for visual memory.', completed: false },
            { id: 's4_3', text: 'Execute a deep-breathing grounding sequence to control testing anxiety.', completed: false }
          ]
        }
      ],
      briefing: {
        priorityTarget: 'Master the high-probability core 20% that yields 80% of testing results.',
        riskAssessment: 'Falling into the passive reading trap, wasting vital time on chapter details.',
        bottlenecks: 'Panic freezing, slow typing speed, lack of ready-to-use boilerplate templates.',
        recommendedNext: 'Spend exactly 5 minutes locating the official syllabus or rubrics immediately.',
        motivation: 'Time is scarce, but your focus can be absolute. You have parsed tough material before. Lock in!'
      }
    },
    Career: {
      milestones: [
        {
          id: 'c1',
          title: 'Target Intel Extraction',
          timeBlock: `Mins 0 - ${blockMins}`,
          steps: [
            { id: 'c1_1', text: 'Extract company mission, primary revenue drivers, and core technology stack.', completed: false },
            { id: 'c1_2', text: 'Note down 3 specific keywords or projects mentioned in their latest press release.', completed: false },
            { id: 'c1_3', text: 'Isolate the core requirements of the job description to align your pitch with.', completed: false }
          ]
        },
        {
          id: 'c2',
          title: 'Tactical Story Mapping (STAR Method)',
          timeBlock: `Mins ${blockMins} - ${blockMins * 2}`,
          steps: [
            { id: 'c2_1', text: 'Draft 3 versatile career stories using the Situation, Task, Action, Result framework.', completed: false },
            { id: 'c2_2', text: 'Ensure every story highlights adaptability, fast troubleshooting, and team success.', completed: false },
            { id: 'c2_3', text: 'Prepare the "Tell me about yourself" 90-second customized elevator pitch.', completed: false }
          ]
        },
        {
          id: 'c3',
          title: 'Defensive Q&A Practice',
          timeBlock: `Mins ${blockMins * 2} - ${blockMins * 3}`,
          steps: [
            { id: 'c3_1', text: 'Formulate answers for the 3 most common difficult questions (weakness, conflict, gaps).', completed: false },
            { id: 'c3_2', text: 'Prepare 2 highly intelligent, strategic questions to ask the interviewer at the end.', completed: false },
            { id: 'c3_3', text: 'Record your voice answering one mock question and listen to pacing and tone.', completed: false }
          ]
        },
        {
          id: 'c4',
          title: 'Tech & Environment Checklist',
          timeBlock: `Mins ${blockMins * 3} - ${totalMins}`,
          steps: [
            { id: 'c4_1', text: 'Test your camera, microphone, background lighting, and secure internet speed.', completed: false },
            { id: 'c4_2', text: 'Have a clean glass of water and notepad nearby; open your resume on side monitor.', completed: false },
            { id: 'c4_3', text: 'Dress professionally, adjust screen height to eye-level, and review story keywords.', completed: false }
          ]
        }
      ],
      briefing: {
        priorityTarget: 'Establish yourself as a precise problem-solver who understands their business needs.',
        riskAssessment: 'Appearing unprepared or rambling due to lack of structured, mapped stories.',
        bottlenecks: 'Imposter syndrome, talking too fast, weak background lighting or poor mic audio.',
        recommendedNext: 'Pull up the interviewer LinkedIn profiles and job description now.',
        motivation: 'They chose to interview you because you have the skills. This is just a conversation to prove it. Let\'s conquer it!'
      }
    },
    Project: {
      milestones: [
        {
          id: 'p1',
          title: 'Feature Trimming & Minimum Viable Scope',
          timeBlock: `Mins 0 - ${blockMins}`,
          steps: [
            { id: 'p1_1', text: 'Identify the absolute core flow of your application or script and cut out secondary features.', completed: false },
            { id: 'p1_2', text: 'Draft a quick diagram of data flow or architecture on a physical sheet of paper.', completed: false },
            { id: 'p1_3', text: 'Initialize project workspace, configuration, and verify build commands run without errors.', completed: false }
          ]
        },
        {
          id: 'p2',
          title: 'Scaffolding & Core Architecture',
          timeBlock: `Mins ${blockMins} - ${blockMins * 2}`,
          steps: [
            { id: 'p2_1', text: 'Build or clone the core boilerplate files and critical data schemas.', completed: false },
            { id: 'p2_2', text: 'Implement the primary layout or backend endpoint that drives the core feature.', completed: false },
            { id: 'p2_3', text: 'Hook up basic input/output flows and print test logs to prove system connectivity.', completed: false }
          ]
        },
        {
          id: 'p3',
          title: 'The "Get-it-working" Sprint',
          timeBlock: `Mins ${blockMins * 2} - ${blockMins * 3}`,
          steps: [
            { id: 'p3_1', text: 'Hardcode static placeholder data for any complex or slow-moving external API integration.', completed: false },
            { id: 'p3_2', text: 'Write out the core algorithmic logic or state handlers rapidly, ignoring fine-tuned optimization.', completed: false },
            { id: 'p3_3', text: 'Resolve critical syntax errors or exceptions immediately; do not let them pile up.', completed: false }
          ]
        },
        {
          id: 'p4',
          title: 'Defensive UI Polish & Verification',
          timeBlock: `Mins ${blockMins * 3} - ${totalMins}`,
          steps: [
            { id: 'p4_1', text: 'Test the entire user path from end-to-end; resolve any layout-breaking bugs.', completed: false },
            { id: 'p4_2', text: 'Clean up console.logs, add essential error bounds, and format files.', completed: false },
            { id: 'p4_3', text: 'Run the build command to ensure production-readiness, and record a brief backup screen recording.', completed: false }
          ]
        }
      ],
      briefing: {
        priorityTarget: 'Deliver a functional, compiled, end-to-end prototype that proves the concept works.',
        riskAssessment: 'Over-engineering visual details or getting stuck on non-essential third-party plugins.',
        bottlenecks: 'Stale cached files, broken dependency versions, or unhandled null exceptions in data flows.',
        recommendedNext: 'Open your code editor, verify node environment and dependencies are loaded.',
        motivation: 'A working prototype is infinitely better than a perfect concept that doesn\'t build. Speed is quality!'
      }
    },
    Personal: {
      milestones: [
        {
          id: 'per1',
          title: 'Scope Triage & Emotional Alignment',
          timeBlock: `Mins 0 - ${blockMins}`,
          steps: [
            { id: 'per1_1', text: 'Define the single most important outcome needed for this personal issue today.', completed: false },
            { id: 'per1_2', text: 'List the 3 people or resources you can reach out to for immediate leverage.', completed: false },
            { id: 'per1_3', text: 'Acknowledge the stress levels, take 3 slow diaphragmatic breaths, and remove static noise.', completed: false }
          ]
        },
        {
          id: 'per2',
          title: 'Drafting & Communication Assembly',
          timeBlock: `Mins ${blockMins} - ${blockMins * 2}`,
          steps: [
            { id: 'per2_1', text: 'Draft the essential email, script, or checklist with clear, direct phrasing.', completed: false },
            { id: 'per2_2', text: 'Proofread communication to ensure a calm, objective, and solution-driven tone.', completed: false },
            { id: 'per2_3', text: 'Confirm the facts of the situation to avoid making emotional or unverified statements.', completed: false }
          ]
        },
        {
          id: 'per3',
          title: 'Execution & Dispatch',
          timeBlock: `Mins ${blockMins * 2} - ${blockMins * 3}`,
          steps: [
            { id: 'per3_1', text: 'Deliver the message, submit the paperwork, or complete the active physical setup.', completed: false },
            { id: 'per3_2', text: 'Establish a clear, unambiguous timeline for the next follow-up action step.', completed: false },
            { id: 'per3_3', text: 'Secure confirmation or receipt of delivery (e.g. tracking number, read receipt).', completed: false }
          ]
        },
        {
          id: 'per4',
          title: 'Decompression & Follow-Up Plan',
          timeBlock: `Mins ${blockMins * 3} - ${totalMins}`,
          steps: [
            { id: 'per4_1', text: 'Document the conversation details, promises made, and agreement timelines.', completed: false },
            { id: 'per4_2', text: 'Perform a physical reset action (hydrate, take a short walk, stretch).', completed: false },
            { id: 'per4_3', text: 'Mark the next action date in your visual calendar with a highly visible notification.', completed: false }
          ]
        }
      ],
      briefing: {
        priorityTarget: 'Resolve immediate conflict or stress points through direct, clear, objective communication.',
        riskAssessment: 'Letting anxiety delay the action step, making the crisis build up further.',
        bottlenecks: 'Emotional reaction traps, delay in hitting "Send", or unclear next expectations.',
        recommendedNext: 'Write down the facts of the situation on a plain paper to separate reality from fear.',
        motivation: 'Facing problems head-on immediately reduces anxiety. You are taking complete charge now!'
      }
    },
    Administrative: {
      milestones: [
        {
          id: 'a1',
          title: 'Document Harvesting & Login Verification',
          timeBlock: `Mins 0 - ${blockMins}`,
          steps: [
            { id: 'a1_1', text: 'Retrieve all accounts, reference IDs, password managers, and login endpoints.', completed: false },
            { id: 'a1_2', text: 'Gather digital copies of all supporting files (IDs, tax statements, receipts, PDFs).', completed: false },
            { id: 'a1_3', text: 'Read the official instruction manual or submission guidelines once carefully.', completed: false }
          ]
        },
        {
          id: 'a2',
          title: 'Form Population Sprint',
          timeBlock: `Mins ${blockMins} - ${blockMins * 2}`,
          steps: [
            { id: 'a2_1', text: 'Fill out the mandatory contact, financial, or formal identification fields.', completed: false },
            { id: 'a2_2', text: 'Check off questions in sequential order; do not jump back and forth to save focus.', completed: false },
            { id: 'a2_3', text: 'Save a local draft of the form after every completed section to avoid data loss.', completed: false }
          ]
        },
        {
          id: 'a3',
          title: 'Audit & PDF Validation',
          timeBlock: `Mins ${blockMins * 2} - ${blockMins * 3}`,
          steps: [
            { id: 'a3_1', text: 'Verify that all uploaded files are readable, correct size, and have the proper format.', completed: false },
            { id: 'a3_2', text: 'Validate that all required input signatures and check-boxes are checked.', completed: false },
            { id: 'a3_3', text: 'Proofread the financial values or numbers twice to prevent critical typos.', completed: false }
          ]
        },
        {
          id: 'a4',
          title: 'Strategic Submission & Record Keeping',
          timeBlock: `Mins ${blockMins * 3} - ${totalMins}`,
          steps: [
            { id: 'a4_1', text: 'Click submit and capture a full screenshot of the "Confirmation" page.', completed: false },
            { id: 'a4_2', text: 'Check your email inbox for the official automated transaction receipt.', completed: false },
            { id: 'a4_3', text: 'File away all used documents in a labeled folder for organized tracking.', completed: false }
          ]
        }
      ],
      briefing: {
        priorityTarget: 'Complete form fields accurately and hit submission before the server portal closes.',
        riskAssessment: 'Losing input data due to inactive sessions, or getting blocked by a missing document.',
        bottlenecks: 'Portal session timeouts, file-size upload limits, or slow network response.',
        recommendedNext: 'Open the portal form webpage, log in, and ensure your session timer starts.',
        motivation: 'Admin work is tedious, but finishing it gets this dark cloud off your shoulder. Push through!'
      }
    }
  };

  const matched = fallbackData[selectedCategory] || fallbackData.Study;
  // Tailor titles based on prompt if possible
  const formattedMilestones = matched.milestones.map((m) => {
    let finalTitle = m.title;
    if (m.id === 's1' && p.includes('exam')) finalTitle = 'Exam Material Triage & Scope Filtering';
    if (m.id === 's1' && p.includes('assignment')) finalTitle = 'Assignment Spec Review & Boilerplate Triage';
    if (m.id === 'p1' && p.includes('code')) finalTitle = 'Code Boilerplate & Core Logic Isolation';
    return { ...m };
  });

  return {
    milestones: formattedMilestones,
    briefing: {
      ...matched.briefing,
      priorityTarget: `[RESCUE PLAN FOR: "${prompt}"] ${matched.briefing.priorityTarget}`
    }
  };
}

// API Routes
app.post('/api/decompose', async (req: Request, res: Response): Promise<void> => {
  const { prompt, category, hours } = req.body;

  if (!prompt) {
    res.status(400).json({ error: 'Objective prompt is required.' });
    return;
  }

  const hoursVal = Number(hours) || 2;

  if (!ai) {
    console.log('Gemini API Key missing - providing highly aligned tactical fallback plan.');
    res.json(getFallbackPlan(prompt, category, hoursVal));
    return;
  }

  try {
    const systemPrompt = `You are an elite, military-grade Strategic Action Planning AI called "The Last-Minute Life Saver". 
    Your mission is to decompose a chaotic, high-stress scenario, exam, job application, interview, project, or task into an extremely structured, 15-to-30-minute sequential action roadmap.
    
    Adhere to these absolute requirements:
    1. Divide the plan into EXACTLY 4 sequential chronological milestones spanning the user's estimated time of ${hoursVal} hours.
    2. Format the milestones' "timeBlock" values cleanly (e.g. "Mins 0 - 30", "Mins 30 - 60").
    3. Each milestone MUST contain EXACTLY 3 bulletproof, micro-actionable, checkable "steps". Give each step a unique id.
    4. Provide a tactical "briefing" which includes:
       - priorityTarget: What is the single most critical thing the user must achieve?
       - riskAssessment: What is the highest risk failure state they must avoid?
       - bottlenecks: What resource, physical, or cognitive constraint will slow them down?
       - recommendedNext: What is the absolute, immediate physical action they must take in the next 60 seconds?
       - motivation: A brief, high-energy, tactical encouraging reminder.
    
    Make the plan highly specific, specialized, and tailored to the user's objective: "${prompt}". No generic placeholder steps. Make it look professional and battle-ready.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Decompose this task and return a fully detailed plan:
      - Objective: "${prompt}"
      - Category: "${category || 'General'}"
      - Available Time: ${hoursVal} hours`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            milestones: {
              type: Type.ARRAY,
              description: 'Exactly 4 milestones dividing the available time sequentially.',
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: 'A unique id like m1, m2, m3, m4' },
                  title: { type: Type.STRING, description: 'Surgical tactical milestone title' },
                  timeBlock: { type: Type.STRING, description: 'Time block description e.g., Mins 0-30' },
                  steps: {
                    type: Type.ARRAY,
                    description: 'Exactly 3 tactical steps.',
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING, description: 'Unique step id like m1_s1, m1_s2' },
                        text: { type: Type.STRING, description: 'High-visibility tactical step description' },
                        completed: { type: Type.BOOLEAN, description: 'Always false' }
                      },
                      required: ['id', 'text', 'completed']
                    }
                  }
                },
                required: ['id', 'title', 'timeBlock', 'steps']
              }
            },
            briefing: {
              type: Type.OBJECT,
              properties: {
                priorityTarget: { type: Type.STRING },
                riskAssessment: { type: Type.STRING },
                bottlenecks: { type: Type.STRING },
                recommendedNext: { type: Type.STRING },
                motivation: { type: Type.STRING }
              },
              required: ['priorityTarget', 'riskAssessment', 'bottlenecks', 'recommendedNext', 'motivation']
            }
          },
          required: ['milestones', 'briefing']
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json(parsedData);
  } catch (error) {
    console.error('Error generating decomposition plan with Gemini:', error);
    // Fallback to high-quality template on failure so user experience remains pristine
    res.json(getFallbackPlan(prompt, category, hoursVal));
  }
});

app.post('/api/refocus', async (req: Request, res: Response): Promise<void> => {
  const { currentTask, progressInfo } = req.body;

  if (!ai) {
    // Generate helpful custom fallback refocus suggestion
    const category = currentTask?.category || 'General';
    const title = currentTask?.title || 'task';
    const suggestions: Record<string, string> = {
      Study: "Understood. The cognitive overload is real. Pause for 45 seconds, inhale deeply, and skip the complex details for now. Concentrate solely on rewriting the fundamental concepts or definitions in your own words. Speed and simplicity are your rescue parameters.",
      Career: "Breathe. Imposter triggers are normal when rushing. Remind yourself of your STAR stories. Avoid trying to sound perfect. Focus on speaking with natural pauses, structure your response as 'Situation -> Action -> Result', and highlight your problem-solving agility.",
      Project: "System lock warning. When stuck, mock it out! Do not spend another minute trying to make that external service function. Create a dummy hardcoded file, return a hardcoded success code, and verify that the core user path compiles. Deliver first, optimize later.",
      Personal: "Emotional spike detected. Separate the objective reality of the situation from any future worries. Draft a direct, respectful email detailing exactly what is completed and when the remaining parts will follow. Hitting send is your release valve.",
      Administrative: "Administrative fatigue alert. Keep your reference documents visible on one side of your screen. Fill out only the fields marked with a red asterisk. Take it one section at a time without jumping ahead. You are closer to the end than you think."
    };
    const defaultSuggestion = "Pause operations immediately. Stand up, stretch your shoulders, and hydrate. Break the current milestone step into two micro-tasks. Accomplish the first micro-task in the next 5 minutes. Action destroys panic.";
    res.json({ text: suggestions[category] || defaultSuggestion });
    return;
  }

  try {
    const prompt = `The user is in high-stress 'Focus Rescue Mode' for their task: "${currentTask?.title || 'Unknown Task'}". 
    Current Category: ${currentTask?.category || 'General'}.
    Estimated Hours: ${currentTask?.estimatedHours || 2} hours.
    The user reports this state/bottleneck: "${progressInfo || 'Feeling overwhelmed or stuck'}".
    
    Provide an immediate, highly strategic, sharp, encouraging operational micro-recovery instructions. 
    Make it exactly 2-3 sentences. Focus purely on immediate action, bypassing complexity, resetting focus, and taking the next physical step.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an elite, calm tactical advisor in a military command center guiding a high-stress operative who is falling behind."
      }
    });

    res.json({ text: response.text?.trim() || 'Acknowledge. Pause, take a deep breath, isolate the next actionable step, and skip all secondary tasks.' });
  } catch (error) {
    console.error('Error generating refocus instructions:', error);
    res.json({ text: "Acknowledge focus request. Take exactly three deep breaths. Skip any secondary formatting or complex setups. Hardcode simple placeholders and advance immediately." });
  }
});

app.post('/api/chat', async (req: Request, res: Response): Promise<void> => {
  const { messages, contextTask } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json({ error: 'Chat messages array is required.' });
    return;
  }

  if (!ai) {
    // Provide a neat tactical chatbot response if Gemini key is not set
    const lastMsg = messages[messages.length - 1]?.text?.toLowerCase() || '';
    let responseText = '';
    
    if (lastMsg.includes('help') || lastMsg.includes('stuck') || lastMsg.includes('panic')) {
      responseText = "Copy that, operative. Let's regain tactical advantage. Triage your checklist right now: what is the single absolute prerequisite that stands between you and completion? Let's isolate that and write simple mock logic. What is holding you back specifically?";
    } else if (lastMsg.includes('time') || lastMsg.includes('deadline') || lastMsg.includes('adjust')) {
      responseText = "Acknowledge deadline stress. Let's recalculate your trajectory. If you are running out of time, we must compress the scope. Let's eliminate all stylistic polish or secondary goals. What is the bare minimum functional requirement that will let you pass or submit?";
    } else if (lastMsg.includes('interview') || lastMsg.includes('practice') || lastMsg.includes('resume')) {
      responseText = "Excellent prep choice. Let's do a rapid-fire session. I will act as your chief interviewer. Tell me about a time you faced a critical code failure or missed a deadline, and how you recovered. Keep it under 60 seconds!";
    } else {
      responseText = `Understood. Tactical Officer standing by. In the context of your task "${contextTask?.title || 'Rescue Mission'}", the optimal play is to focus strictly on actionable steps. Tell me: are you stuck on code compilation, study comprehension, or administrative requirements? Let's tackle it.`;
    }

    res.json({ text: responseText });
    return;
  }

  try {
    const formattedHistory = messages.slice(0, -1).map((m) => {
      return {
        role: m.sender === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.text }]
      };
    });

    const lastMessage = messages[messages.length - 1]?.text || '';
    const taskContextString = contextTask 
      ? `Active Task: "${contextTask.title}" (${contextTask.category}, Urgency: ${contextTask.urgencyScore}/10, Deadline: ${contextTask.deadline}, Progress: ${contextTask.progress}%).`
      : 'No active task selected currently.';

    const systemInstruction = `You are the chief Tactical Officer of "The Last-Minute Life Saver" Command Center. 
    Your personality is highly professional, calm, encouraging, slightly tactical/cyberpunk HUD style, yet deeply supportive and human. 
    You help users restructure deadlines, solve urgent bugs, practice rapid interviews, synthesize study material, or simply calm down and focus.
    
    Current status context:
    ${taskContextString}
    
    Keep responses highly actionable, concise (2-4 sentences max unless they ask for a deeper drill), formatted cleanly, and focused on helping them finish on time.`;

    // Start a chat using ai.chats.create
    const chat = ai.chats.create({
      model: 'gemini-3.5-flash',
      history: formattedHistory,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    const response = await chat.sendMessage({ message: lastMessage });
    res.json({ text: response.text?.trim() || 'Tactical Officer standing by. Continue the execution roadmap.' });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.json({ text: "Tactical bridge signal distorted. Let's stay focused. Cut down the active scope of your task and execute the next checkbox immediately." });
  }
});

// Configure Vite integration or static file serving
const startServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
