import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ImageRequest {
  prompt: string;
  style?: string;
  aspectRatio?: string;
  quality?: string;
  count?: number;
}

interface StructuredSpec {
  subject: string;
  objects: string[];
  actions: string[];
  environment: string;
  background: string;
  composition: string;
  camera: string;
  lighting: string;
  style: string;
  colors: string[];
  mood: string;
  aspect_ratio: string;
  required_elements: string[];
  excluded_elements: string[];
  text_requirements: string[];
  quantities: string[];
  spatial_relationships: string[];
}

// ─── Prompt Interpreter ───────────────────────────────────────────
// Extracts structured meaning from the user's prompt without inventing details.

const STOP_WORDS = new Set([
  "a", "an", "the", "of", "with", "and", "for", "to", "in", "on", "at",
  "is", "are", "was", "were", "please", "create", "generate", "make",
  "show", "me", "picture", "image", "photo", "photograph", "drawing",
  "painting", "render", "depict", "illustrate", "that", "this", "it",
  "be", "being", "been", "has", "have", "had", "do", "does", "did",
  "will", "would", "could", "should", "can", "may", "might", "must",
]);

const STYLE_KEYWORDS: Record<string, string[]> = {
  "photorealistic": ["realistic", "real", "photograph", "photo", "lifelike"],
  "cinematic": ["cinematic", "movie", "film", "dramatic"],
  "3d": ["3d", "render", "blender", "octane", "cgi"],
  "illustration": ["illustration", "drawn", "drawing", "sketch"],
  "digital art": ["digital art", "concept art", "digital painting"],
  "minimalist": ["minimalist", "minimal", "clean", "simple"],
  "anime": ["anime", "manga", "cel shaded"],
  "watercolor": ["watercolor", "water colour", "aquarelle"],
  "oil painting": ["oil painting", "oil paint"],
  "cartoon": ["cartoon", "animated"],
  "fantasy": ["fantasy", "magical", "mythical"],
  "cyberpunk": ["cyberpunk", "neon", "futuristic"],
};

const CAMERA_KEYWORDS = [
  "low angle", "high angle", "bird's eye", "aerial", "close-up", "close up",
  "wide shot", "medium shot", "overhead", "from above", "from below",
  "first person", "third person", "drone shot", "pov",
];

const LIGHTING_KEYWORDS = [
  "sunset", "sunrise", "golden hour", "blue hour", "night", "daylight",
  "moonlight", "sunlight", "studio lighting", "natural light", "candlelight",
  "neon light", "soft light", "hard light", "backlit", "silhouette",
  "dramatic lighting", "ambient", "volumetric",
];

const MOOD_KEYWORDS = [
  "serene", "dramatic", "peaceful", "mysterious", "joyful", "melancholic",
  "epic", "cozy", "dark", "bright", "vibrant", "moody", "ethereal",
];

const SPATIAL_KEYWORDS = [
  "left", "right", "center", "foreground", "background", "behind",
  "in front of", "above", "below", "next to", "inside", "outside",
  "between", "surrounding", "on top of", "under", "over", "beneath",
];

const NUMBER_WORDS: Record<string, number> = {
  "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6,
  "seven": 7, "eight": 8, "nine": 9, "ten": 10,
};

function interpretPrompt(prompt: string, styleSelection: string): StructuredSpec {
  const lower = prompt.toLowerCase().trim();

  const excluded_elements: string[] = [];
  const negativePatterns = [
    /\bno\s+([\w\s]+?)(?=[,;.!?]|$)/g,
    /\bwithout\s+(?:any\s+)?([\w\s]+?)(?=[,;.!?]|$)/g,
    /\bexcluding\s+([\w\s]+?)(?=[,;.!?]|$)/g,
  ];
  for (const pattern of negativePatterns) {
    let match;
    while ((match = pattern.exec(lower)) !== null) {
      const excluded = match[1].trim();
      if (excluded && excluded.length > 1) {
        excluded_elements.push(excluded);
      }
    }
  }

  const text_requirements: string[] = [];
  const quotePattern = /["']([^"']{2,})["']/g;
  let qMatch;
  while ((qMatch = quotePattern.exec(prompt)) !== null) {
    text_requirements.push(qMatch[1]);
  }
  const sayingPattern = /(?:saying|reads?|text|with text|displaying|reading)\s*[:\-]?\s*["']?([^"'.,;!?]{2,})["']?/gi;
  while ((qMatch = sayingPattern.exec(prompt)) !== null) {
    const text = qMatch[1].trim().replace(/["']/g, "");
    if (text && !text_requirements.includes(text)) {
      text_requirements.push(text);
    }
  }

  const quantities: string[] = [];
  const numberPattern = /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\s+([a-z]+)/gi;
  let nMatch;
  while ((nMatch = numberPattern.exec(lower)) !== null) {
    const num = nMatch[1];
    const obj = nMatch[2];
    const numVal = NUMBER_WORDS[num] || parseInt(num);
    if (numVal && numVal <= 20 && !STOP_WORDS.has(obj)) {
      quantities.push(`exactly ${numVal} ${obj}`);
    }
  }

  const spatial_relationships: string[] = [];
  for (const spatial of SPATIAL_KEYWORDS) {
    if (lower.includes(spatial)) {
      spatial_relationships.push(spatial);
    }
  }

  const colorList = [
    "red", "blue", "green", "yellow", "orange", "purple", "pink", "black",
    "white", "grey", "gray", "brown", "cyan", "magenta", "teal", "navy",
    "maroon", "gold", "silver", "bronze", "beige", "ivory", "crimson",
    "emerald", "sapphire", "ruby", "amber", "lavender", "turquoise",
    "neon blue", "neon red", "neon green", "neon purple",
    "dark blue", "dark red", "dark green", "light blue", "light green",
    "light grey", "light gray", "dark grey", "dark gray",
    "black and white", "monochrome",
  ];
  const colors: string[] = [];
  for (const color of colorList) {
    if (lower.includes(color)) {
      colors.push(color);
    }
  }

  let camera = "";
  for (const cam of CAMERA_KEYWORDS) {
    if (lower.includes(cam)) {
      camera = cam;
      break;
    }
  }

  let lighting = "";
  for (const light of LIGHTING_KEYWORDS) {
    if (lower.includes(light)) {
      lighting = lighting ? `${lighting}, ${light}` : light;
    }
  }

  let mood = "";
  for (const m of MOOD_KEYWORDS) {
    if (lower.includes(m)) {
      mood = m;
      break;
    }
  }

  let detectedStyle = "";
  for (const [styleName, keywords] of Object.entries(STYLE_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        detectedStyle = styleName;
        break;
      }
    }
    if (detectedStyle) break;
  }

  const style = styleSelection || detectedStyle || "";

  const environmentKeywords = [
    "beach", "ocean", "sea", "mountain", "forest", "city", "desert",
    "jungle", "savanna", "savannah", "office", "bedroom", "living room",
    "kitchen", "street", "tokyo", "paris", "london", "new york",
    "mars", "space", "studio", "garden", "park", "lake", "river",
    "cliff", "valley", "cave", "island", "underwater", "sky", "field",
    "meadow", "countryside", "rooftop", "balcony", "restaurant", "cafe",
    "laboratory", "factory", "warehouse", "church", "castle", "palace",
    "hospital", "school", "library", "gym", "stadium", "arena",
    "african savanna", "futuristic office", "glass house", "modern house",
  ];
  let environment = "";
  for (const env of environmentKeywords) {
    if (lower.includes(env)) {
      environment = env;
      break;
    }
  }

  const subject = prompt.trim();

  const required_elements: string[] = [];
  const entityPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
  let eMatch;
  const seen = new Set<string>();
  let workingPrompt = prompt;
  while ((eMatch = workingPrompt.match(entityPattern))) {
    const entity = eMatch[1];
    if (!seen.has(entity) && entity.length > 2) {
      seen.add(entity);
      required_elements.push(entity);
    }
    workingPrompt = workingPrompt.substring(eMatch.index! + eMatch[0].length);
  }

  return {
    subject,
    objects: [],
    actions: [],
    environment,
    background: "",
    composition: "",
    camera,
    lighting,
    style,
    colors,
    mood,
    aspect_ratio: "",
    required_elements,
    excluded_elements,
    text_requirements,
    quantities,
    spatial_relationships,
  };
}

// ─── Prompt Optimizer ─────────────────────────────────────────────

const STYLE_ENHANCERS: Record<string, string> = {
  "Photorealistic": "photorealistic, ultra-detailed, realistic photography, 8k resolution, sharp focus",
  "Cinematic": "cinematic composition, dramatic cinematic lighting, film still, anamorphic lens, color graded",
  "3D": "high-quality 3D render, octane render, physically based rendering, detailed textures",
  "Illustration": "detailed digital illustration, fine art, clean linework, professional illustration",
  "Digital art": "digital art, concept art, trending on artstation, highly detailed, vibrant",
  "Minimalist": "minimalist composition, clean design, simple elegant aesthetic, negative space",
  "Product photography": "professional product photography, studio lighting, softbox, high-end commercial",
  "Anime": "anime art style, cel shading, studio quality, detailed anime illustration",
  "watercolor": "watercolor painting, soft washes, paper texture, artistic watercolor",
  "oil painting": "oil painting, visible brushstrokes, rich textures, classical painting",
  "cartoon": "cartoon style, bold outlines, flat colors, animated style",
  "fantasy": "fantasy art, magical atmosphere, epic fantasy, detailed fantasy illustration",
  "cyberpunk": "cyberpunk aesthetic, neon lights, futuristic, dystopian, high-tech low-life",
};

const QUALITY_ENHANCERS: Record<string, string> = {
  "Standard": "good quality, clear detail",
  "High": "high quality, fine detail, professional",
  "Ultra": "ultra high quality, maximum detail, masterpiece, best quality, 8k",
};

function optimizePrompt(spec: StructuredSpec, originalPrompt: string, quality: string): string {
  const parts: string[] = [];

  parts.push(originalPrompt.trim());

  if (spec.style && STYLE_ENHANCERS[spec.style]) {
    parts.push(STYLE_ENHANCERS[spec.style]);
  } else if (spec.style) {
    parts.push(spec.style);
  }

  if (spec.environment) {
    parts.push(`set in ${spec.environment}`);
  }

  if (spec.camera) {
    parts.push(`${spec.camera} perspective`);
  }

  if (spec.lighting) {
    parts.push(`${spec.lighting} lighting`);
  }

  if (spec.colors.length > 0) {
    const uniqueColors = [...new Set(spec.colors)];
    parts.push(`featuring ${uniqueColors.join(", ")} colors`);
  }

  if (spec.mood) {
    parts.push(`${spec.mood} mood`);
  }

  if (spec.quantities.length > 0) {
    parts.push(spec.quantities.join(", "));
  }

  if (spec.spatial_relationships.length > 0) {
    const uniqueSpatial = [...new Set(spec.spatial_relationships)];
    parts.push(`maintaining spatial arrangement: ${uniqueSpatial.join(", ")}`);
  }

  if (spec.text_requirements.length > 0) {
    for (const text of spec.text_requirements) {
      parts.push(`the text "${text}" must be clearly visible, legible, and exactly as written — do not alter spelling or wording`);
    }
  }

  if (spec.excluded_elements.length > 0) {
    const exclusions = spec.excluded_elements.map((e) => `no ${e}`).join(", ");
    parts.push(exclusions);
  }

  if (quality && QUALITY_ENHANCERS[quality]) {
    parts.push(QUALITY_ENHANCERS[quality]);
  } else {
    parts.push("high quality, detailed");
  }

  return parts.join(", ");
}

// ─── Prompt Validation ─────────────────────────────────────────────

function validatePrompt(original: string, optimized: string): { valid: boolean; missing: string[] } {
  const missing: string[] = [];
  const lowerOpt = optimized.toLowerCase();

  const colorPattern = /\b(red|blue|green|yellow|orange|purple|pink|black|white|grey|gray|brown|cyan|magenta|teal|navy|gold|silver|crimson|emerald|sapphire|ruby|amber)\b/gi;
  const origColors = new Set<string>();
  let cMatch;
  while ((cMatch = colorPattern.exec(original.toLowerCase())) !== null) {
    origColors.add(cMatch[1]);
  }
  for (const color of origColors) {
    if (!lowerOpt.includes(color)) {
      missing.push(`color: ${color}`);
    }
  }

  const numberPattern = /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)\b/gi;
  const origNumbers = new Set<string>();
  while ((cMatch = numberPattern.exec(original.toLowerCase())) !== null) {
    origNumbers.add(cMatch[1]);
  }
  for (const num of origNumbers) {
    if (!lowerOpt.includes(num)) {
      missing.push(`quantity: ${num}`);
    }
  }

  const quotePattern = /["']([^"']{2,})["']/g;
  while ((cMatch = quotePattern.exec(original)) !== null) {
    if (!optimized.includes(cMatch[1])) {
      missing.push(`text: "${cMatch[1]}"`);
    }
  }

  return { valid: missing.length === 0, missing };
}

// ─── Aspect Ratio Dimensions ──────────────────────────────────────

function getAspectDims(ratio: string): { width: number; height: number } {
  switch (ratio) {
    case "1:1": return { width: 768, height: 768 };
    case "16:9": return { width: 1024, height: 576 };
    case "9:16": return { width: 576, height: 1024 };
    case "4:3": return { width: 1024, height: 768 };
    case "3:2": return { width: 900, height: 600 };
    case "3:4": return { width: 768, height: 1024 };
    case "2:3": return { width: 600, height: 900 };
    default: return { width: 768, height: 768 };
  }
}

function getQualityDims(base: { width: number; height: number }, quality: string): { width: number; height: number } {
  if (quality === "Ultra") {
    return { width: base.width * 2, height: base.height * 2 };
  }
  if (quality === "High") {
    return { width: Math.round(base.width * 1.5), height: Math.round(base.height * 1.5) };
  }
  return base;
}

// ─── Main Handler ──────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: ImageRequest = await req.json();
    const {
      prompt,
      style = "Photorealistic",
      aspectRatio = "1:1",
      quality = "High",
      count = 1,
    } = body;

    if (!prompt || !prompt.trim()) {
      return new Response(
        JSON.stringify({ error: "A prompt is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (count < 1 || count > 4) {
      return new Response(
        JSON.stringify({ error: "Count must be between 1 and 4." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const spec = interpretPrompt(prompt, style);

    let optimizedPrompt = optimizePrompt(spec, prompt, quality);

    const validation = validatePrompt(prompt, optimizedPrompt);
    if (!validation.valid) {
      optimizedPrompt = `${optimizedPrompt}, ${validation.missing.join(", ")}`;
    }

    const baseDims = getAspectDims(aspectRatio);
    const dims = getQualityDims(baseDims, quality);

    const images: Array<{ url: string; seed: number }> = [];
    for (let i = 0; i < count; i++) {
      const seed = Math.floor(Math.random() * 10000000) + i;
      const encodedPrompt = encodeURIComponent(optimizedPrompt);
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dims.width}&height=${dims.height}&seed=${seed}&nologo=true`;
      images.push({ url, seed });
    }

    let reachable = true;
    try {
      const checkResp = await fetch(images[0].url, { method: "GET", redirect: "follow" });
      if (!checkResp.ok) {
        reachable = false;
      }
    } catch {
      reachable = false;
    }

    if (!reachable) {
      return new Response(
        JSON.stringify({
          error: "Image generation failed. The image service could not process your request. Please try again.",
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        images,
        optimizedPrompt,
        originalPrompt: prompt,
        spec,
        model: "pollinations-flux",
        aspectRatio,
        quality,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "An unexpected error occurred.";
    return new Response(
      JSON.stringify({ error: `Image generation failed: ${message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
