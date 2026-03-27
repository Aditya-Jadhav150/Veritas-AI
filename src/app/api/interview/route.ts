import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.featherless.ai/v1",
  apiKey: process.env.FEATHERLESS_API_KEY || "dummy", 
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;
    const isFinishing = messages.length >= 5;
    
    let aiResponse = "";
    
    if (isFinishing) {
      aiResponse = "Thank you for the detailed responses. That concludes our adaptive interview. The panel is now synthesizing their thoughts and independent evaluations.";
    } else if (process.env.FEATHERLESS_API_KEY && process.env.FEATHERLESS_API_KEY !== 'your_featherless_api_key_here') {
      // System prompt for the adaptive interviewer
      const systemMessage = {
        role: "system" as const,
        content: "You are an expert technical interviewer evaluating a candidate for a Senior Software Engineer position. Ask exactly ONE insightful follow-up question based on their previous answers. Be concise, direct, and slightly challenging. Do not break character."
      };
      
      const formattedMessages = messages.map((m: any) => ({ 
        role: m.role === "ai" ? "assistant" as const : "user" as const, 
        content: m.content 
      }));

      const completion = await openai.chat.completions.create({
        model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
        messages: [systemMessage, ...formattedMessages]
      });
      
      aiResponse = completion.choices[0]?.message?.content || "Could you elaborate further on that?";
    } else {
      // Fallback mock
      await new Promise(resolve => setTimeout(resolve, 2000));
      const lastCandidateMessage = messages[messages.length - 1].content.toLowerCase();
      if (lastCandidateMessage.includes("scale") || lastCandidateMessage.includes("performance")) {
        aiResponse = "That's an interesting perspective on scaling. In terms of database performance, how did you handle potential bottlenecks like slow queries or connection limits under load?";
      } else {
        aiResponse = "I see. Could you dive deeper into the specific trade-offs you considered when choosing that particular architecture over the alternatives?";
      }
    }
    
    return NextResponse.json({
      success: true,
      message: {
        id: Date.now().toString(),
        role: "ai",
        content: aiResponse,
      },
      isComplete: isFinishing
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to process interview response" }, { status: 500 });
  }
}
