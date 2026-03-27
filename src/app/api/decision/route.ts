import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.featherless.ai/v1",
  apiKey: process.env.FEATHERLESS_API_KEY || "dummy", 
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const candidateId = searchParams.get('id');

  if (!candidateId) {
    return NextResponse.json({ success: false, error: "Missing candidate ID" }, { status: 400 });
  }
  
  // Base structure to return
  const resultData = {
    score: 87,
    decision: "STRONG HIRE",
    insights: [
      { label: "Technical Consistency", value: "High", desc: "Frequent open source contributions and clean code structure in portfolio projects." },
      { label: "Problem Solving", value: "Exceptional", desc: "Demonstrated a structured approach with clear trade-off analysis during the adaptive interview." },
      { label: "Growth Trajectory", value: "Steep", desc: "Rapid adoption of modern tech stacks in recent side projects." },
    ],
    agents: [
      {
        role: "Technical Lead",
        name: "Agent Alan",
        verdict: "Hire",
        color: "blue",
        reasoning: "The candidate showed excellent depth when discussing microservices and database bottlenecks. Their portfolio code is modular and well-tested. A strong addition to the engineering team.",
      },
      {
        role: "Culture & Product",
        name: "Agent Grace",
        verdict: "Strong Hire",
        color: "purple",
        reasoning: "Communication was clear, engaging, and empathetic. Their side projects demonstrate a strong product sense and user-centric thinking, aligning perfectly with our core values.",
      },
      {
        role: "Risk Evaluator",
        name: "Agent Ada",
        verdict: "Leaning Hire",
        color: "amber",
        reasoning: "Slight concern on deep infrastructure scaling experience out-of-the-box, but given their fast learning curve on GitHub, this is a minor risk that can be mitigated with proper onboarding.",
      }
    ]
  };

  if (process.env.FEATHERLESS_API_KEY && process.env.FEATHERLESS_API_KEY !== 'your_featherless_api_key_here') {
    try {
      // In a real app, we would dynamically pull the database transcript here.
      // For this demo, we establish the candidate's base profile and simulate 3 independent LLM calls for the panel simulation.
      const basePrompt = "You are evaluating a candidate based on their interview transcript to be a Senior Software Engineer. The candidate handled questions on microservices well but lacked deep massive-scale infrastructure experience out of the box. They are a fast learner with great product sense.";
      
      const [techLead, culture, risk] = await Promise.all([
        openai.chat.completions.create({
          model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
          messages: [{ role: "system", content: "You are the Technical Lead hiring manager for a rapidly scaling startup. Evaluate purely on scalable architecture, code quality, and technical depth. Provide a 2 sentence reasoning for why you think they should be hired based on the prompt." }, { role: "user", content: basePrompt }]
        }),
        openai.chat.completions.create({
          model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
          messages: [{ role: "system", content: "You are the Product & Culture Evaluator for a rapidly scaling startup. Evaluate purely on communication, user empathy, and product sense. Provide a 2 sentence reasoning for why you think they should be hired based on the prompt." }, { role: "user", content: basePrompt }]
        }),
        openai.chat.completions.create({
          model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
          messages: [{ role: "system", content: "You are the Risk Evaluator. Evaluate purely on potential red flags, onboarding risks, and knowledge gaps. Provide a 2 sentence reasoning for the risks you've identified based on the prompt." }, { role: "user", content: basePrompt }]
        })
      ]);

      resultData.agents[0].reasoning = techLead.choices[0]?.message?.content || resultData.agents[0].reasoning;
      resultData.agents[1].reasoning = culture.choices[0]?.message?.content || resultData.agents[1].reasoning;
      resultData.agents[2].reasoning = risk.choices[0]?.message?.content || resultData.agents[2].reasoning;
      
    } catch (e) {
      console.warn("Featherless AI simulation failed, falling back to mock", e);
    }
  } else {
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  return NextResponse.json({
    success: true,
    data: resultData
  });
}
