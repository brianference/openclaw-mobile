import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

interface ChatRequest {
  messages: { role: string; content: string }[];
  conversationId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid authorization" }),
        { status: 401, headers: jsonHeaders }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: jsonHeaders }
      );
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: profile } = await adminClient
      .from("profiles")
      .select("credits, subscription_tier")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: jsonHeaders }
      );
    }

    const isPremium = profile.subscription_tier === "premium";
    if (!isPremium && profile.credits < 1) {
      return new Response(
        JSON.stringify({
          error: "Insufficient credits",
          credits: 0,
          tier: profile.subscription_tier,
        }),
        { status: 402, headers: jsonHeaders }
      );
    }

    let body: ChatRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const { messages, conversationId } = body;

    if (!messages || !Array.isArray(messages) || !conversationId) {
      return new Response(
        JSON.stringify({ error: "Missing messages array or conversationId" }),
        { status: 400, headers: jsonHeaders }
      );
    }

    if (messages.length > 50) {
      return new Response(
        JSON.stringify({ error: "Too many messages in request" }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const systemPrompt = {
      role: "system",
      content:
        "You are OpenClaw AI, an intelligent, helpful assistant. Be concise, direct, and helpful. Format responses with markdown when useful (code blocks, lists, bold). Keep responses under 500 words unless the user asks for more detail.",
    };

    const recentMessages = messages
      .slice(-10)
      .map((m: { role: string; content: string }) => ({
        role: String(m.role).slice(0, 20),
        content: String(m.content).slice(0, 4000),
      }));

    const aiResponse = await generateResponse([systemPrompt, ...recentMessages]);

    if (!isPremium) {
      await adminClient
        .from("profiles")
        .update({ credits: Math.max(0, profile.credits - 1) })
        .eq("id", user.id);
    }

    const { data: savedMsg } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: "assistant",
        content: aiResponse,
      })
      .select()
      .maybeSingle();

    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);

    return new Response(
      JSON.stringify({
        message: savedMsg,
        content: aiResponse,
        credits: isPremium ? -1 : Math.max(0, profile.credits - 1),
        tier: profile.subscription_tier,
      }),
      { headers: jsonHeaders }
    );
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: jsonHeaders }
    );
  }
});

async function generateResponse(
  messages: { role: string; content: string }[]
): Promise<string> {
  const lastUserMsg = messages.filter((m) => m.role === "user").pop();
  const input = lastUserMsg?.content.toLowerCase() || "";

  if (
    input.includes("hello") ||
    input.includes("hi") ||
    input.includes("hey")
  ) {
    return "Hello! I'm **OpenClaw AI**, your intelligent assistant. Here's what I can help with:\n\n- **Coding** -- debug, explain, or write code\n- **Writing** -- draft, edit, or brainstorm content\n- **Analysis** -- research, summarize, or compare topics\n- **Planning** -- organize tasks and ideas\n\nWhat would you like to work on?";
  }

  if (input.includes("help")) {
    return "Here's a quick guide to **OpenClaw Mobile**:\n\n1. **Chat** -- Talk with me about anything\n2. **Board** -- Kanban board for task management\n3. **Brain** -- Capture ideas, notes, and research\n4. **Vault** -- Securely store API keys and passwords\n\nEach chat costs **1 credit**. You can see your balance in Settings.\n\nWhat can I help you with?";
  }

  if (
    input.includes("code") ||
    input.includes("programming") ||
    input.includes("function")
  ) {
    return "I'd be happy to help with code! Here are some things I can do:\n\n```typescript\n// I can write code snippets\nconst greet = (name: string) => `Hello, ${name}!`;\n```\n\n- **Debug** issues in your code\n- **Explain** complex concepts\n- **Generate** boilerplate and templates\n- **Review** code for best practices\n\nShare your code or describe what you need!";
  }

  if (
    input.includes("weather") ||
    input.includes("time") ||
    input.includes("date")
  ) {
    return `The current server time is **${new Date().toISOString().split("T")[0]}**.\n\nFor real-time weather data, connect an OpenClaw gateway with the \`weather\` skill enabled. You can configure this in **Settings > Gateway**.`;
  }

  if (input.includes("thank")) {
    return "You're welcome! Let me know if there's anything else I can help with.";
  }

  const wordCount = input.split(/\s+/).length;
  if (wordCount < 4) {
    return `I received your message: *"${lastUserMsg?.content}"*\n\nCould you provide more detail so I can give you a better response? For example:\n\n- Ask a specific question\n- Describe a problem you're facing\n- Share code you need help with`;
  }

  return `Thanks for your message! I've analyzed your request about: *"${lastUserMsg?.content.slice(0, 80)}${(lastUserMsg?.content.length || 0) > 80 ? "..." : ""}"*\n\nThis is a **demo response** from OpenClaw AI. To get full AI capabilities:\n\n1. Connect to an **OpenClaw Gateway** in Settings\n2. Configure your preferred AI model (GPT-4, Claude, etc.)\n3. Each message costs **1 credit**\n\nYour remaining credits will be updated after this response.`;
}
