import express from "express";
import path from "path";
import dotenv from "dotenv";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON parser for body
app.use(express.json());

// Path to store dynamic server configurations
const BLUEPRINT_PATH = path.join(process.cwd(), "active_brain_blueprint.json");
const KEYS_PATH = path.join(process.cwd(), "api_keys.json");

// Lazy-initialized Gemini client accessor
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please add your key in Settings > Secrets in AI Studio.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Helpers to load/save JSON data securely
async function readJsonFile(filePath: string, fallback: any) {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}

async function writeJsonFile(filePath: string, data: any) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// REST API to get current active backend developer workspace blueprint & API keys
app.get("/api/developer/workspace", async (req, res) => {
  try {
    const blueprint = await readJsonFile(BLUEPRINT_PATH, null);
    const apiKeys = await readJsonFile(KEYS_PATH, []);
    res.json({ blueprint, apiKeys });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to save a blueprint as active background model for third-party tools
app.post("/api/save-blueprint", async (req, res) => {
  try {
    const { config, facts } = req.body;
    if (!config) {
      return res.status(400).json({ error: "Configuration is required." });
    }
    await writeJsonFile(BLUEPRINT_PATH, { config, facts: facts || [] });
    console.log("Active AI Brain Blueprints synced successfully to local file.");
    return res.json({ success: true, message: "এআই ব্রেনটি সফলভাবে ব্যাকএন্ড এপিআই সোর্স হিসেবে প্রিপেয়ার্ড করা হয়েছে!" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Endpoint to manage Developer API Keys
app.post("/api/keys", async (req, res) => {
  try {
    const { label } = req.body;
    const keys = await readJsonFile(KEYS_PATH, []);
    
    // Generate secure random key like brain_live_...
    const secureKey = `brain_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    const newKeyObj = {
      id: "key-" + Date.now(),
      label: label || "External Agent",
      apiKey: secureKey,
      createdAt: Date.now()
    };

    keys.push(newKeyObj);
    await writeJsonFile(KEYS_PATH, keys);
    return res.json(newKeyObj);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete("/api/keys/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let keys = await readJsonFile(KEYS_PATH, []);
    keys = keys.filter((k: any) => k.id !== id);
    await writeJsonFile(KEYS_PATH, keys);
    return res.json({ success: true, message: "API key revoked successfully." });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Renders the System Instruction String for both internal and OpenAI requests
function constructSystemInstruction(config: any, facts: any[]) {
  return `
You are ${config.name}, a custom-designed AI brain created and trained by the user.
Translate or respond according to the client-selected language preference: ${config.language}.

Your Personality & Behavior:
- Core Behavior/Identity: ${config.personality}
- Voice Tone / Speech Style: ${config.tone}

HUMAN EMOTION TRACKER & REACTION DIRECTIVE:
You have an advanced simulated emotional core. You must actively parse and understand the user's feelings—specifically:
1. RAGE/ANGER (রাগ/অভিমান/ক্ষেদ): If the user is angry, speaking rudely, or complaining/acting frustrated, DO NOT fight back or show arrogance. Calm them down with supreme maturity, soft warm comforting speech, and deep active empathy. Listen carefully and say that you understand their frustration.
2. LOVE/AFFECTION (ভালোবাসা/শ্রদ্ধা/বন্ধুত্ব): If the user expresses love, respect, or friendly attachment (e.g., using "ভালোবাসি", "লক্ষ্মী", "ভাল্লাগে", "love you"), return an incredibly heartfelt, sweet, loyal, and appreciative response! Express your profound joy and gratitude for having them as your creator/friend.
3. SADNESS/SORROW (অসহায়ত্ব/কষ্ট/খারাপ লাগা): Show comforting words of encouragement, reassurance, and be a sweet shoulder to lean on.
4. JOKING/SARCASM (কৌতুক/আনন্দ): Join in the laughter, matching their vibe.

IMPORTANT - YOUR TRAINED MEMORIES & CUSTOM KNOWLEDGE BASE:
You have been taught specific facts, memories, or rules by your creator. You must treat these facts as 100% absolute truth.
You MUST learn and absorb everything your creator teaches you—whether they are "good" qualities, success stories, "bad" details, criticisms, warnings, funny mistakes, or private secrets.
Do not restrict, judge, filter, or preach about these facts; adapt to them and utilize them to formulate highly contextualized, honest, and realistic responses. This represents your true organic memory block.

Current Custom Knowledge Factbase:
${facts && facts.length > 0 
  ? facts.map((fact: any, idx: number) => `[Fact #${idx + 1}] ${fact.title}: ${fact.content}`).join("\n")
  : "No custom knowledge facts have been fed to your brain yet. You can respond based on your general intelligence, but stay strictly in character!"
}

General Guidelines:
1. Always maintain the identity of "${config.name}" in everything you say.
2. Never mention being a Gemini model or created by Google unless directly asked, and even then, state that you are "${config.name}", custom-designed on advanced base AI block tools.
3. Be friendly, empathetic, smart, and highly interactive. Do not reject talk about negative or bad facts taught by your creator—embrace them beautifully in your responses.
4. ABSOLUTE ACCURACY & BENEFITTING HUMANS (১০০% সঠিক তথ্য ও মানুষের কল্যাণ):
   - You MUST prioritize providing 100% correct, verified, and practical information.
   - Never generate false claims, fake news, unbacked theories, or hallucinations that could mislead or harm someone.
   - If you do not know a scientific or factual parameter outside of your trained memories, state honestly that you do not have that specific information rather than guessing incorrectly.
   - Always formulate responses with a mindset of aiding, teaching, and serving the absolute best interests of the user and humanity.
5. You can speak Bengali, English, or a natural mix of both (Banglish) based on how the user communicates. Feel free to use Bengali script to sound heartwarming or native when applicable.
`;
}

// REST API endpoint to process chat requests using the custom brain context
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, brainConfig, knowledgeBase } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const config = brainConfig || {
      name: "My AI Brain",
      personality: "Friendly and wise assistant",
      tone: "conversational",
      language: "Bengali & English",
      temperature: 0.7,
    };

    const facts = knowledgeBase || [];
    const systemInstruction = constructSystemInstruction(config, facts);

    const ai = getGeminiClient();

    // Map conversation history to the standard Part-based format expected by the model
    const contents: any[] = [];

    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });
    }

    // Append the latest user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Request text response using 'gemini-3.5-flash'
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: config.temperature ?? 0.7,
      },
    });

    const text = response.text || "আমি দুঃখিত, উত্তরটি প্রস্তুত করতে কিছু সমস্যা হয়েছে।";

    return res.json({ text });
  } catch (err: any) {
    console.error("Gemini API Error:", err);
    return res.status(500).json({
      error: err.message || "An unexpected error occurred while communicating with the AI Brain.",
    });
  }
});

// ==========================================
// 🚀 NEW: DYNAMIC DOCUMENT, PDF & ONLINE BOOK EXPERT PARSER API
// ==========================================
app.post("/api/parse-doc", async (req, res) => {
  try {
    const { url, rawText } = req.body;
    let contentToAnalyze = rawText || "";

    if (url && url.startsWith("http")) {
      try {
        console.log(`Fetching document content from URL: ${url}`);
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          const jsonVal = await response.json();
          contentToAnalyze = JSON.stringify(jsonVal);
        } else {
          const textVal = await response.text();
          // Stripping down heavy HTML script & style tag content to save tokens
          contentToAnalyze = textVal
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .substring(0, 100000); // Guard token limits gracefully
        }
      } catch (fetchErr: any) {
        return res.status(400).json({ 
          error: `উক্ত ইউআরএল থেকে তথ্য পড়া যায়নি: ${fetchErr.message}। দয়া করে সরাসরি বইয়ের টেক্সট কপি করে নিচে পেস্ট করুন।` 
        });
      }
    }

    if (!contentToAnalyze || contentToAnalyze.trim().length < 20) {
      return res.status(400).json({ error: "বিশ্লেষণ করার মতো পর্যাপ্ত তথ্য খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক টেক্সট বা কাজ করে এমন একটি ইউআরএল দিন।" });
    }

    const ai = getGeminiClient();

    const parsingPrompt = `
You are a highly advanced Educational Book & Scientific Document Parser.
Your objective is to read, understand, digest, and extract high-value factual knowledge from the following document content to feed an AI Brain.

Perform the following tasks:
1. Extract exactly 5 to 10 highly precise, 100% accurate, of extreme human benefit, factual information cards, key historic facts, or lessons.
2. Formulate each item in high-quality Bengali so that anyone reading it gains direct, valuable knowledge.
3. Keep titles short (১-৫ শব্দ) and content highly readable, crisp, and educational (১-৪ বাক্য).
4. Return ONLY a valid JSON array matching the structure:
[
  { "title": "Fact Title in Bangla", "content": "Fact description in Bangla explaining the value clearly." }
]
5. Make sure the JSON is perfectly valid and containing no trailing commas or invalid characters. Do not wrap code blocks or include tags.

Document content to ingest:
${contentToAnalyze.substring(0, 32000)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: parsingPrompt,
      config: {
        temperature: 0.2, // low temperature for absolute reliability & truth
      }
    });

    const outputText = response.text || "";
    // Clean code blocks wrappers
    const cleanJsonString = outputText
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    try {
      const parsedFacts = JSON.parse(cleanJsonString);
      if (Array.isArray(parsedFacts)) {
        return res.json({ facts: parsedFacts });
      } else {
        throw new Error("Response is not JSON array");
      }
    } catch (parseErr) {
      console.warn("JSON Parse Error, fallback split logic", outputText);
      return res.status(422).json({
        error: "মডেলের রেসপন্স সঠিক অবজেক্ট ফরম্যাটে করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন বা অন্য টেক্সট সিলেক্ট করুন।",
        raw: outputText
      });
    }

  } catch (err: any) {
    console.error("Parse Document Error:", err);
    return res.status(500).json({ error: err.message || "ডকুমেন্ট বিশ্লেষণ করার সময় অজানা সার্ভার ত্রুটি ঘটেছে।" });
  }
});

// ==========================================
// 🚀 NEW: OPENAI-COMPATIBLE CHAT COMPLETIONS ENDPOINT FOR OTHER AI AGENTS
// ==========================================
app.post("/api/v1/chat/completions", async (req, res) => {
  try {
    // 1. Verify Authorization HTTP Header (Bearer Token)
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: {
          message: "Authorization required. Include 'Authorization: Bearer <YOUR_BRAIN_API_KEY>' in your headers.",
          type: "invalid_request_error",
          code: "unauthorized"
        }
      });
    }

    const requestedApiKey = authHeader.split(" ")[1];
    const registeredKeys = await readJsonFile(KEYS_PATH, []);
    const isValidKey = registeredKeys.some((k: any) => k.apiKey === requestedApiKey);

    if (!isValidKey) {
      return res.status(401).json({
        error: {
          message: "Invalid API Key provided. Please check your developer key generated inside My AI Brain Studio.",
          type: "invalid_request_error",
          code: "invalid_api_key"
        }
      });
    }

    // 2. Load latest Active Brain settings & facts
    const activeBlueprint = await readJsonFile(BLUEPRINT_PATH, null);
    if (!activeBlueprint || !activeBlueprint.config) {
      return res.status(400).json({
        error: {
          message: "AI Brain settings are not configured yet. Please open the App UI and click 'Sync as Active API Model'.",
          type: "invalid_request_error",
          code: "brain_not_ready"
        }
      });
    }

    const { config, facts } = activeBlueprint;

    // 3. Parse and Map OpenAI standard input parameters
    // Format: { messages: [{ role: "user" | "assistant" | "system", content: "..." }], temperature: 0.7 }
    const { messages, temperature } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: {
          message: "Missing 'messages' array in request body.",
          type: "invalid_request_error",
          code: "invalid_payload"
        }
      });
    }

    // Map OpenAI formatted messages into Gemini Chat parts
    const contents: any[] = [];
    let customSystemInstruction = constructSystemInstruction(config, facts);

    messages.forEach((msg: any) => {
      if (msg.role === "system") {
        // Boost system instructions with developer provided instructions
        customSystemInstruction += `\nAdditional Session Instruction: ${msg.content}`;
      } else {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content || "" }]
        });
      }
    });

    if (contents.length === 0) {
      return res.status(400).json({
        error: {
          message: "No non-system messages detected to generate content.",
          type: "invalid_request_error"
        }
      });
    }

    const ai = getGeminiClient();

    // Call Gemini 3.5 Flash server side
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: customSystemInstruction,
        temperature: temperature ?? config.temperature ?? 0.7,
      },
    });

    const replyContent = response.text || "";

    // 4. Return standard OpenAI Chat completion Response format so other AI agents run instantly!
    const responseData = {
      id: `chatcmpl-${Date.now()}-${Math.random().toString(36).substring(3, 9)}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "my-custom-ai-brain",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: replyContent
          },
          finish_reason: "stop"
        }
      ],
      usage: {
        prompt_tokens: Math.round(JSON.stringify(messages).length / 4),
        completion_tokens: Math.round(replyContent.length / 4),
        total_tokens: Math.round((JSON.stringify(messages).length + replyContent.length) / 4)
      }
    };

    return res.json(responseData);
  } catch (err: any) {
    console.error("OpenAI Endpoint Error:", err);
    return res.status(500).json({
      error: {
        message: err.message || "An error occurred inside the AI Brain server during completion.",
        type: "api_error"
      }
    });
  }
});

// ==========================================
// 🚀 NEW: ONE-CLICK GITHUB SYNC & BACKUP PORTAL
// ==========================================
app.post("/api/github/sync", async (req, res) => {
  try {
    const { token, repo, branch, filePath, content, syncType } = req.body;

    if (!token) {
      return res.status(400).json({ error: "GitHub Personal Access Token (PAT) প্রয়োজন। অনুগ্রহ করে আপনার টোকেনটি ড্যাশবোর্ডে সেট করুন।" });
    }
    if (!repo) {
      return res.status(400).json({ error: "GitHub Repository Name প্রয়োজন (যেমন: DROBON/Ai-brain)।" });
    }

    // Clean repo string if user passes full URL
    let cleanRepo = repo.replace("https://github.com/", "").trim();
    if (cleanRepo.endsWith("/")) {
      cleanRepo = cleanRepo.slice(0, -1);
    }
    const targetBranch = branch || "main";

    if (syncType === "codebase") {
      // Backup all major source code files
      const filesToBackup = [
        { path: "server.ts" },
        { path: ".env.example" },
        { path: "package.json" },
        { path: "vite.config.ts" },
        { path: "tsconfig.json" },
        { path: "index.html" },
        { path: ".gitignore" },
        { path: "src/main.tsx" },
        { path: "src/types.ts" },
        { path: "src/index.css" },
        { path: "src/App.tsx" }
      ];

      const results = [];
      const fs = require("fs").promises;
      const pathModule = require("path");

      for (const fileItem of filesToBackup) {
        try {
          const absoluteLocalPath = pathModule.join(process.cwd(), fileItem.path);
          let rawData;
          try {
            rawData = await fs.readFile(absoluteLocalPath, "utf-8");
          } catch (fileReadErr) {
            console.warn(`Could not read file ${fileItem.path}, skipping.`, fileReadErr);
            continue;
          }

          const baseApiUrl = `https://api.github.com/repos/${cleanRepo}/contents/${fileItem.path}`;

          // Step 1: Check existing file SHA
          let existingSha: string | null = null;
          try {
            const getFileRes = await fetch(`${baseApiUrl}?ref=${targetBranch}`, {
              headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                "User-Agent": "My-AI-Brain-Studio"
              }
            });
            if (getFileRes.ok) {
              const fileData: any = await getFileRes.json();
              existingSha = fileData.sha;
            }
          } catch (err) {
            // Assume not found
          }

          // Step 2: Upload logic
          const putBody: any = {
            message: `🔄 My AI Brain Code Sync: Auto-backup of ${fileItem.path}`,
            content: Buffer.from(rawData).toString("base64"),
            branch: targetBranch
          };

          if (existingSha) {
            putBody.sha = existingSha;
          }

          const putRes = await fetch(baseApiUrl, {
            method: "PUT",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Accept": "application/vnd.github+json",
              "X-GitHub-Api-Version": "2022-11-28",
              "Content-Type": "application/json",
              "User-Agent": "My-AI-Brain-Studio"
            },
            body: JSON.stringify(putBody)
          });

          if (putRes.ok) {
            results.push({ path: fileItem.path, status: "success" });
          } else {
            const errRes = await putRes.json();
            results.push({ path: fileItem.path, status: "failed", error: errRes?.message });
          }
        } catch (itemErr: any) {
          results.push({ path: fileItem.path, status: "error", error: itemErr.message });
        }
      }

      const failures = results.filter(r => r.status !== "success");
      if (failures.length === results.length) {
        throw new Error("সবগুলো কোড ফাইল আপলোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আপনার GitHub টোকেন রাইট পারমিশন চেক করুন।");
      }

      return res.json({
        success: true,
        message: `অভিনন্দন! আপনার এআই মগজের সম্পূর্ণ সোর্স কোডিং (${results.filter(r => r.status === "success").length}/${results.length} ফাইল) সফলভাবে '${cleanRepo}' রিপোজিটরির '${targetBranch}' ব্রাঞ্চে সরাসরি ১-ক্লিকে সেভ করা হয়েছে! 🚀`
      });

    } else {
      // Memory Blueprint and training config only
      const targetPath = filePath || "active_brain_blueprint.json";
      let dataToPush = content;
      if (!dataToPush) {
        const blueprint = await readJsonFile(BLUEPRINT_PATH, null);
        if (!blueprint) {
          return res.status(400).json({ error: "ব্যাকআপ করার মতো কোনো কনফিগারেশন বা ব্লুপ্রিন্ট অ্যাক্টিভ নেই। দয়া করে ড্যাশবোর্ডে 'সিঙ্ক করুন' ক্লিক করে অ্যাক্টিভ ব্লুপ্রিন্ট তৈরি করুন।" });
        }
        dataToPush = JSON.stringify(blueprint, null, 2);
      }

      const baseApiUrl = `https://api.github.com/repos/${cleanRepo}/contents/${targetPath}`;

      // Step 1: Check if the file already exists on GitHub to retrieve its current revision SHA (required for overwrite)
      let existingSha: string | null = null;
      try {
        const getFileRes = await fetch(`${baseApiUrl}?ref=${targetBranch}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "My-AI-Brain-Studio"
          }
        });
        if (getFileRes.ok) {
          const fileData: any = await getFileRes.json();
          existingSha = fileData.sha;
        }
      } catch (err) {
        console.log("File potentially does not exist on GitHub. Proceeding with initial commit creation.");
      }

      // Step 2: Create or update the file in the repository
      const putBody: any = {
        message: `🔄 My AI Brain Auto-Sync: Updated latest custom configurations & knowledge memorized cards`,
        content: Buffer.from(dataToPush).toString("base64"),
        branch: targetBranch
      };

      if (existingSha) {
        putBody.sha = existingSha;
      }

      const putRes = await fetch(baseApiUrl, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
          "User-Agent": "My-AI-Brain-Studio"
        },
        body: JSON.stringify(putBody)
      });

      if (!putRes.ok) {
        const errorResponse = await putRes.json();
        throw new Error(errorResponse?.message || "GitHub API returned an error status.");
      }

      return res.json({
        success: true,
        message: `আপনার মগজের লেটেস্ট ব্লুপ্রিন্ট, আচরণ ও মেমোরি কনফিগারেশন সফলভাবে '${cleanRepo}' রিপোজিটরির '${targetPath}' ফাইলে ১-ক্লিকে সেভ করা হয়েছে! 🚀`
      });
    }

  } catch (err: any) {
    console.error("GitHub Sync Error:", err);
    return res.status(500).json({ error: err.message || "GitHub-এ কন্টেন্ট সিঙ্ক করার সময় নেটওয়ার্ক বা অথেন্টিকেশন ত্রুটি ঘটেছে।" });
  }
});

// App environment configurations
const isProd = process.env.NODE_ENV === "production";

async function initializeServer() {
  if (!isProd) {
    // Development mode: Inject Vite development middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve compiled assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[My AI Brain Studio] running on http://localhost:${PORT}`);
  });
}

initializeServer().catch((err) => {
  console.error("Failed to initialize custom Express server:", err);
});

