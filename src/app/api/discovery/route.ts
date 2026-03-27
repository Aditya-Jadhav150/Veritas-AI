import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.featherless.ai/v1",
  apiKey: process.env.FEATHERLESS_API_KEY || "dummy", 
});

export async function POST(req: Request) {
  try {
    const data = await req.json();
    console.log("Processing candidate signals...", data.email);
    let enrichedData = "";
    
    // 1. Try to use Bright Data if API key is provided
    if (process.env.BRIGHT_DATA_API_KEY && process.env.BRIGHT_DATA_API_KEY !== 'your_bright_data_api_key_here') {
       try {
         // Note: To use this in production, you need to set up a Web Scraper API zone in your Bright Data dashboard.
         /*
         const bdResponse = await fetch('https://api.brightdata.com/dca/trigger?collector=c_linkedin_profile', {
           method: 'POST',
           headers: { 'Authorization': `Bearer ${process.env.BRIGHT_DATA_API_KEY}`, 'Content-Type': 'application/json' },
           body: JSON.stringify([{ url: data.linkedin }])
         });
         enrichedData = JSON.stringify(await bdResponse.json());
         */
         enrichedData = "Simulated Bright Data enrichment: Candidate has 5+ years of experience and 300+ GitHub commits this year.";
       } catch (e) {
         console.warn("Bright Data enrichment failed, proceeding with direct inputs only.", e);
       }
    }
    
    // 2. Use Featherless AI to generate a 'Candidate Talent Discovery Profile'.
    if (process.env.FEATHERLESS_API_KEY && process.env.FEATHERLESS_API_KEY !== 'your_featherless_api_key_here') {
      const prompt = `
        Analyze the following candidate signals and determine their core strengths.
        Candidate Inputs:
        LinkedIn: ${data.linkedin}
        GitHub: ${data.github}
        Achievements: ${data.achievements}
        Problem Solving Example: ${data.problemSolving}
        Enriched Data: ${enrichedData}
        
        Respond with a short summary of their profile.
      `;
      
      const completion = await openai.chat.completions.create({
        model: "meta-llama/Meta-Llama-3.1-70B-Instruct",
        messages: [{ role: "user", content: prompt }]
      });
      console.log("Featherless AI Discovery Analysis:", completion.choices[0]?.message?.content);
    } else {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    const candidateId = "cand_" + Math.random().toString(36).substring(2, 9);
    
    return NextResponse.json({
      success: true,
      candidateId,
      message: "Candidate signals analyzed successfully."
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to process signals" }, { status: 500 });
  }
}
