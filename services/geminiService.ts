
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateProverbStory = async (proverb: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Tu esi latviešu folklorists un vieds stāstnieks. Izskaidro latviešu sakāmvārda vai teiciena "${proverb}" nozīmi. 
    1. Ko šis teiciens tieši nozīmē (skaidrojums)?
    2. Kāda ir tā izcelsme vai vēsturiskais fons latviešu zemnieku vai tautas dzīvē?
    3. Kā šo gudrību mēs varam piemērot mūsdienu dzīvē (darbā, attiecībās)?
    4. Uzraksti vienu ļoti īsu, aizkustinošu vai pamācošu stāstu (max 120 vārdi), kas ilustrē šo teicienu darbībā.
    Atbildi formātā JSON ar laukiem: definition, history, modernUsage, story.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          definition: { type: Type.STRING },
          history: { type: Type.STRING },
          modernUsage: { type: Type.STRING },
          story: { type: Type.STRING }
        },
        required: ["definition", "history", "modernUsage", "story"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateProverbIllustration = async (proverb: string, storyContext?: string, isSymbolic: boolean = false) => {
  const ai = getAI();
  
  let prompt = "";
  
  if (isSymbolic) {
    prompt = `Task: Create an artistic, metaphorical, and highly atmospheric visual representation of the Latvian proverb "${proverb}".
    
    CONCEPT: This should be a symbolic and associative image that captures the essence, spirit, and emotional depth of the proverb. 
    It can be poetic and evocative. Use visual metaphors that resonate with Latvian culture and nature.
    
    VISUAL STYLE: 
    - Ethereal oil painting with rich textures.
    - Atmospheric lighting (moody, poetic, or radiant).
    - Deep, resonant colors reflecting the natural world (amber, twilight blues, deep greens).
    - Avoid literal text or interface elements.`;
  } else {
    prompt = `Task: Create a realistic and narrative historical scene that brings to life the folk wisdom story: "${storyContext}".
    
    STORY CONTEXT: ${storyContext}
    
    CRITICAL INSTRUCTIONS:
    1. DEPICT REALISTIC EVENTS: Show a concrete moment of human action and interaction from the story. 
    2. NO SYMBOLISM: This must be a literal frame from a historical event. No magic, no glowing icons.
    3. HISTORICAL AUTHENTICITY: 19th-century Latvian setting. Traditional linen clothes, wooden farm buildings, period-accurate tools.
    4. CINEMATIC NARRATIVE: Focus on facial expressions and the physical reality of the situation.
    
    VISUAL STYLE: 
    - Realistic historical oil painting.
    - Earthy tones, natural daylight or firelight.
    - Chiaroscuro lighting to enhance the historical gravity.`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Neizdevās ģenerēt attēlu.");
};
