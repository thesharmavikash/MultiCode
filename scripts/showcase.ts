/**
 * Param AGIO - Provider Showcase Script
 * This script tests connectivity across all 7 supported AuthTypes.
 */

import { 
  createContentGenerator, 
  AuthType, 
  Config
} from '../packages/core/src/index.js';
import { loadSettings } from '../packages/cli/src/config/settings.js';

async function testProvider(name: string, authType: AuthType, model: string) {
  console.log(`\n[Testing] ${name} (${authType})...`);
  
  try {
    const settings = await loadSettings();
    const config = new Config(process.cwd(), settings.merged);
    
    // Attempt to create the generator
    const generator = await createContentGenerator({
      authType,
      model,
    }, config, true);

    const response = await generator.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Respond with the word: ONLINE' }] }]
    }, 'showcase-id');

    console.log(`✅ Success: ${response.candidates?.[0]?.content?.parts?.[0]?.text?.trim()}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('Missing API key') || message.includes('credentials expired')) {
      console.log(`⚠️  Skipped: Credentials not found for ${name}.`);
    } else {
      console.log(`❌ Failed: ${message}`);
    }
  }
}

async function runShowcase() {
  console.log("==========================================");
  console.log("   PARAM AGIO PROVIDER SHOWCASE (v41.0)   ");
  console.log("==========================================\n");

  // 1. Param (Native)
  await testProvider("Param Native", AuthType.PARAM_OAUTH, "qwen3.5-plus");

  // 2. OpenAI Standard
  await testProvider("OpenAI (Standard)", AuthType.USE_OPENAI, "gpt-4o");

  // 3. OpenAI OAuth
  await testProvider("OpenAI (OAuth)", AuthType.OPENAI_OAUTH, "gpt-4o");

  // 4. Anthropic Standard
  await testProvider("Anthropic (Standard)", AuthType.USE_ANTHROPIC, "claude-3-5-sonnet");

  // 5. Anthropic OAuth
  await testProvider("Anthropic (OAuth)", AuthType.ANTHROPIC_OAUTH, "claude-3-5-sonnet");

  // 6. Google Gemini
  await testProvider("Google Gemini", AuthType.USE_GEMINI, "gemini-1.5-pro");

  // 7. Vertex AI
  await testProvider("Google Vertex AI", AuthType.USE_VERTEX_AI, "gemini-1.5-pro");

  console.log("\n==========================================");
  console.log("Showcase Complete.");
}

runShowcase().catch(console.error);
