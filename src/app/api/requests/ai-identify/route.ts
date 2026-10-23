import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { serverAdminTracker } from "@/lib/server-admin-tracker";

interface CatalogContextItem {
  productId: string;
  name: string;
  category: string;
  unit: string;
  source?: string;
}

interface AIIdentifyResponse {
  productId: string;
  productName: string;
  category: string;
  unit: string;
  confidence: number;
  matchSource: "my_list" | "catalogue" | "detected";
  description: string;
}

// In-memory cache for the complete 6,795-item IMPA catalog
let cachedImpaCatalogCsv: string | null = null;
let cachedImpaItemCount = 0;
let cachedImpaItemMap: Map<string, { code: string; name: string; unit: string; category: string }> | null = null;

function loadFullImpaCatalog(): {
  csv: string;
  count: number;
  itemMap: Map<string, { code: string; name: string; unit: string; category: string }>;
} {
  if (cachedImpaCatalogCsv && cachedImpaItemMap) {
    return {
      csv: cachedImpaCatalogCsv,
      count: cachedImpaItemCount,
      itemMap: cachedImpaItemMap,
    };
  }

  try {
    const csvPath = path.join(process.cwd(), "public", "impa.csv");
    if (fs.existsSync(csvPath)) {
      const raw = fs.readFileSync(csvPath, "utf-8");
      const lines = raw.trim().split(/\r?\n/);
      // Skip header line
      const dataLines = lines.slice(1);
      cachedImpaItemCount = dataLines.length;
      cachedImpaCatalogCsv = dataLines.join("\n");

      const map = new Map<string, { code: string; name: string; unit: string; category: string }>();
      for (const line of dataLines) {
        const parts = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map((p) => p.replace(/^"|"$/g, "").trim()) ?? [];
        if (parts.length >= 2) {
          const [code, name, unit = "PCS", category = "other"] = parts;
          map.set(code, { code, name, unit, category });
        }
      }
      cachedImpaItemMap = map;

      return {
        csv: cachedImpaCatalogCsv,
        count: cachedImpaItemCount,
        itemMap: cachedImpaItemMap,
      };
    }
  } catch (err) {
    console.error("Failed to load public/impa.csv:", err);
  }

  return {
    csv: "",
    count: 0,
    itemMap: new Map(),
  };
}

/**
 * Discovers and prioritizes models supported by this specific Google API key
 */
async function discoverSupportedModels(apiKey: string, preferredModel = "gemini-3.5-flash-lite"): Promise<string[]> {
  const fallbackCandidates = [
    preferredModel,
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-lite-preview-02-05",
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro",
  ];

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      headers: { "x-goog-api-key": apiKey },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) {
      return Array.from(new Set(fallbackCandidates));
    }

    const data = await res.json();
    if (!Array.isArray(data.models) || data.models.length === 0) {
      return Array.from(new Set(fallbackCandidates));
    }

    // Extract names of models supporting generateContent
    const supported: string[] = data.models
      .filter((m: any) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes("generateContent"))
      .map((m: any) => String(m.name || "").replace(/^models\//, ""))
      .filter(Boolean);

    if (supported.length === 0) {
      return Array.from(new Set(fallbackCandidates));
    }

    // Sort order:
    // 1. Any model containing "3.5" or requested model
    // 2. Any model containing "flash-lite"
    // 3. Any model containing "flash"
    // 4. Any other supported model
    const prioritized: string[] = [];

    // Check if requested model or 3.5 is available
    for (const m of supported) {
      if (m.toLowerCase().includes("3.5") || m.toLowerCase() === preferredModel.toLowerCase()) {
        if (!prioritized.includes(m)) prioritized.push(m);
      }
    }

    // Next: flash-lite models
    for (const m of supported) {
      if (m.toLowerCase().includes("flash-lite")) {
        if (!prioritized.includes(m)) prioritized.push(m);
      }
    }

    // Next: general flash models (gemini-2.5-flash, gemini-2.0-flash, etc.)
    for (const m of supported) {
      if (m.toLowerCase().includes("flash")) {
        if (!prioritized.includes(m)) prioritized.push(m);
      }
    }

    // Next: remaining models
    for (const m of supported) {
      if (!prioritized.includes(m)) prioritized.push(m);
    }

    return prioritized;
  } catch {
    return Array.from(new Set(fallbackCandidates));
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  let userRank = "Chief Officer";
  let userName = "Furkan Pamuk";
  let userId = "usr_furkan";
  let vessel = "M/V Pacific Horizon";

  try {
    const body = await req.json().catch(() => ({}));
    const {
      image,
      catalogContext = [],
      preferredCategory = "all",
      googleApiKey: customGoogleKey,
      userApiKey,
      model: requestedModel = "gemini-3.5-flash-lite",
      currentUser,
    } = body;

    if (currentUser) {
      if (currentUser.id) userId = currentUser.id;
      if (currentUser.displayName || currentUser.name) userName = currentUser.displayName || currentUser.name;
      if (currentUser.rank) userRank = currentUser.rank;
      if (currentUser.vessel) vessel = currentUser.vessel;
    }

    // 1. Validate Image Payload
    if (!image || typeof image !== "string") {
      const errMessage = "Image payload is missing or invalid. Please capture or upload a valid photo.";
      serverAdminTracker.trackApiRequest({
        userId,
        userName,
        userRank,
        vessel,
        endpoint: "/api/requests/ai-identify",
        status: "failed",
        model: requestedModel,
        latencyMs: Date.now() - startTime,
        errorMessage: errMessage,
        authMethod: "None",
      });
      return NextResponse.json({ success: false, error: errMessage }, { status: 400 });
    }

    // Extract mime type and raw base64
    const matches = image.match(/^data:([A-Za-z0-9-+\/]+);base64,(.+)$/);
    const mimeType = matches ? matches[1] : "image/jpeg";
    const base64Data = matches ? matches[2] : image;

    // 2. Strict Authentication: Authenticate and process all requests via Google API Key
    const headerKey = req.headers.get("x-goog-api-key");
    const resolvedGoogleKey = (
      customGoogleKey ||
      userApiKey ||
      headerKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      ""
    ).trim();

    if (!resolvedGoogleKey) {
      const authError =
        "Authentication Required: A Google API key is required to authenticate and process AI vision requests. Please set GEMINI_API_KEY or GOOGLE_API_KEY in your environment, or enter your Google API key in the camera scanner settings.";

      serverAdminTracker.trackApiRequest({
        userId,
        userName,
        userRank,
        vessel,
        endpoint: "/api/requests/ai-identify",
        status: "failed",
        model: requestedModel,
        latencyMs: Date.now() - startTime,
        errorMessage: authError,
        authMethod: "Missing Google Key",
      });

      return NextResponse.json(
        {
          success: false,
          error: authError,
          code: "GOOGLE_API_KEY_REQUIRED",
          needsApiKey: true,
        },
        { status: 401 }
      );
    }

    // 3. Load ALL 6,795 items from the IMPA catalog database
    const { csv: fullCatalogCsv, count: totalCatalogCount, itemMap } = loadFullImpaCatalog();

    // Prepend active My List items if provided
    let myListContext = "";
    if (Array.isArray(catalogContext) && catalogContext.length > 0) {
      const myListLines = catalogContext.map(
        (item: CatalogContextItem) => `[MY_LIST_ITEM] ${item.productId},${item.name},${item.unit || "PCS"},${item.category || "other"}`
      );
      myListContext = `--- ACTIVE ITEMS FROM MY LIST (HIGH PRIORITY) ---\n${myListLines.join("\n")}\n\n`;
    }

    const totalContextItemsCount = totalCatalogCount + (catalogContext?.length || 0);

    const systemPrompt = `You are a certified marine store inspection AI for ships and ocean vessels.
You have been provided with the COMPLETE, OFFICIAL marine catalogue containing all ${totalCatalogCount} items plus the active store items from the vessel's 'My List'.

${myListContext}--- FULL MARINE CATALOGUE DATABASE (ALL ${totalCatalogCount} ITEMS: code,name,unit,category) ---
${fullCatalogCsv}
--- END OF FULL CATALOGUE (${totalCatalogCount} ITEMS) ---

IDENTIFICATION & MATCHING INSTRUCTIONS:
1. Visually inspect the provided photo of the ship equipment, deck store, engine spare part, tool, valve, pipe, shackle, safety equipment, galley provision, or stationery.
2. Search through the complete list of all ${totalCatalogCount} items above for the EXACT matching or most relevant marine store item.
3. Select the exact catalog product ID (IMPA code, e.g. "791821", "150281", "312328") and standard uppercase item name from the catalogue above.
4. If the item clearly matches an entry from 'My List', set matchSource to "my_list". If matched from the 6,795 catalogue items, set matchSource to "catalogue".
5. Preferred vessel department context: "${preferredCategory}".
6. If the photo does NOT contain any recognizable ship supply or marine product, set productId to "" and confidence to 0.0.
7. Return ONLY a single raw valid JSON object with NO markdown backticks and NO commentary.

REQUIRED JSON FORMAT:
{
  "productId": "string (the exact catalog IMPA code from the 6,795 items, or empty string if unidentifiable)",
  "productName": "string (standard uppercase item name from catalogue)",
  "category": "galley" | "stationery" | "spare-deck" | "spare-engine" | "other",
  "unit": "string (e.g. PCS, PRS, MTR, KG, SET, CAN)",
  "confidence": number (float between 0.0 and 1.0),
  "matchSource": "my_list" | "catalogue" | "detected",
  "description": "string (brief sentence describing the visual item identified)"
}`;

    // 4. Model Selection & Dynamic Discovery
    // Query Google API to get all available models for this key, prioritizing gemini-3.5-flash-lite
    const modelsToTry = await discoverSupportedModels(resolvedGoogleKey, requestedModel);

    let rawResult: AIIdentifyResponse | null = null;
    let successfulModel = requestedModel;
    let lastApiError = "";

    // Iterate through supported models
    for (const model of modelsToTry) {
      // Try v1beta first, then v1 if 404
      const apiVersions = ["v1beta", "v1"];
      let modelSucceeded = false;

      for (const apiVersion of apiVersions) {
        try {
          const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${resolvedGoogleKey}`;
          const payload = {
            contents: [
              {
                role: "user",
                parts: [
                  { text: systemPrompt },
                  {
                    inlineData: {
                      mimeType,
                      data: base64Data,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.1,
            },
          };

          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": resolvedGoogleKey,
            },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const errData = await res.json().catch(() => null);
            const errMsg = errData?.error?.message || `Google API status ${res.status}`;
            lastApiError = errMsg;

            if (res.status === 400 && errMsg.includes("API_KEY_INVALID")) {
              throw new Error(`Google API Key is invalid: ${errMsg}`);
            }
            // If model is not found in this version, continue to next version/model
            continue;
          }

          const data = await res.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!rawText) continue;

          const parsed = parseStrictJSON(rawText);
          if (parsed) {
            rawResult = parsed;
            successfulModel = model;
            modelSucceeded = true;
            break;
          }
        } catch (err: any) {
          lastApiError = err?.message || String(err);
          if (lastApiError.includes("API_KEY_INVALID")) break;
        }
      }

      if (modelSucceeded) break;
    }

    const latencyMs = Date.now() - startTime;

    // 5. Handle Failures Explicitly — NEVER DISPLAY RANDOM FALLBACK PRODUCTS
    if (!rawResult) {
      const explicitError = lastApiError
        ? `Google AI Processing Failed: ${lastApiError}. Please ensure your Google API key has access to Gemini Flash models and camera photo is clear.`
        : `Google AI models (${modelsToTry.slice(0, 3).join(", ")}) could not process the image. Please verify your Google API key.`;

      serverAdminTracker.trackApiRequest({
        userId,
        userName,
        userRank,
        vessel,
        endpoint: "/api/requests/ai-identify",
        status: "failed",
        model: successfulModel,
        latencyMs,
        errorMessage: explicitError,
        authMethod: "Google API Key (Authenticated)",
      });

      return NextResponse.json(
        {
          success: false,
          error: explicitError,
        },
        { status: 502 }
      );
    }

    // Check if the AI indicated unidentifiable product or very low confidence
    if (!rawResult.productId || rawResult.productId.trim() === "" || rawResult.confidence < 0.25) {
      const matchFailError =
        "Product Match Failed: The AI could not identify a valid catalog product from all 6,795 catalogue items in this image. Please ensure the store item or its part label is centered and well-lit, then retake the photo.";

      serverAdminTracker.trackApiRequest({
        userId,
        userName,
        userRank,
        vessel,
        endpoint: "/api/requests/ai-identify",
        status: "failed",
        model: successfulModel,
        latencyMs,
        errorMessage: matchFailError,
        authMethod: "Google API Key (Authenticated)",
      });

      return NextResponse.json(
        {
          success: false,
          error: matchFailError,
          rawDescription: rawResult.description || undefined,
        },
        { status: 422 }
      );
    }

    // 6. Validate and Format Recognized Item against the full 6,795 IMPA Catalog
    const validatedProduct = validateAgainstFullCatalog(rawResult, catalogContext, itemMap);

    // 7. Track Successful Request in Admin Tracker
    serverAdminTracker.trackApiRequest({
      userId,
      userName,
      userRank,
      vessel,
      endpoint: "/api/requests/ai-identify",
      status: "success",
      model: successfulModel,
      latencyMs,
      productId: validatedProduct.productId,
      productName: validatedProduct.productName,
      category: validatedProduct.category,
      authMethod: "Google API Key (Authenticated)",
    });

    return NextResponse.json({
      success: true,
      provider: "google_gemini",
      model: successfulModel,
      latencyMs,
      product: validatedProduct,
      catalogContextCount: totalContextItemsCount,
      authStatus: "Authenticated via Google API Key",
    });

  } catch (err: any) {
    const errorMsg = err?.message || "Internal server error during AI image analysis";
    serverAdminTracker.trackApiRequest({
      userId,
      userName,
      userRank,
      vessel,
      endpoint: "/api/requests/ai-identify",
      status: "failed",
      model: "gemini-3.5-flash-lite",
      latencyMs: Date.now() - startTime,
      errorMessage: errorMsg,
      authMethod: "Google API Key",
    });

    return NextResponse.json(
      {
        success: false,
        error: `AI Request Error: ${errorMsg}`,
      },
      { status: 500 }
    );
  }
}

/**
 * Parses JSON even if wrapped in markdown codeblocks
 */
function parseStrictJSON(text: string): AIIdentifyResponse | null {
  try {
    let clean = text.trim();
    if (clean.startsWith("```json")) {
      clean = clean.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (clean.startsWith("```")) {
      clean = clean.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    return JSON.parse(clean);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

/**
 * Validates and cross-checks the AI response against the complete 6,795-item catalog
 */
function validateAgainstFullCatalog(
  aiResult: any,
  myListContext: CatalogContextItem[],
  fullCatalogMap: Map<string, { code: string; name: string; unit: string; category: string }>
): AIIdentifyResponse {
  const rawId = String(aiResult?.productId || "").trim();
  let productName = String(aiResult?.productName || "STORE ITEM").trim().toUpperCase();
  let category = String(aiResult?.category || "other").toLowerCase();
  let unit = String(aiResult?.unit || "PCS").trim().toUpperCase();
  let confidence = Number(aiResult?.confidence) || 0.88;
  let matchSource: "my_list" | "catalogue" | "detected" = (aiResult.matchSource as any) || "catalogue";

  // 1. Check My List priority items first
  const matchedMyList = myListContext.find(
    (c) => c.productId.toLowerCase() === rawId.toLowerCase() || c.name.toLowerCase() === productName.toLowerCase()
  );

  if (matchedMyList) {
    matchSource = "my_list";
    productName = matchedMyList.name || productName;
    category = matchedMyList.category || category;
    unit = matchedMyList.unit || unit;
    confidence = Math.max(confidence, 0.95);
    return {
      productId: matchedMyList.productId,
      productName,
      category,
      unit: unit || "PCS",
      confidence: Math.min(1.0, Math.max(0.1, confidence)),
      matchSource,
      description: aiResult?.description || `Matched from active My List items.`,
    };
  }

  // 2. Cross-check against the full 6,795 IMPA database
  const matchedImpa = fullCatalogMap.get(rawId);
  if (matchedImpa) {
    matchSource = "catalogue";
    productName = matchedImpa.name || productName;
    category = matchedImpa.category || category;
    unit = matchedImpa.unit || unit;
    confidence = Math.max(confidence, 0.92);
  }

  return {
    productId: rawId,
    productName,
    category,
    unit: unit || "PCS",
    confidence: Math.min(1.0, Math.max(0.1, confidence)),
    matchSource,
    description: aiResult?.description || `Identified catalog item ID ${rawId} from 6,795 IMPA records.`,
  };
}
