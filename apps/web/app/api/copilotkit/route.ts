import {
    CopilotRuntime,
    GroqAdapter,
    copilotRuntimeNextJSAppRouterEndpoint,
  } from "@copilotkit/runtime";
  import Groq from "groq-sdk";
  import { NextRequest } from "next/server";
  
  const groq = new Groq({ apiKey: process.env["GROQ_API_KEY"] });
  
  const copilotKit = new CopilotRuntime();
  
  const serviceAdapter = new GroqAdapter({
    // Add a description to the @ts-expect-error
    // @ts-expect-error - Next.js special import for optimizing fonts
    groq,
    model: "gemma2-9b-it",
  });
  
  export const POST = async (req: NextRequest) => {
    const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
      runtime: copilotKit,
      serviceAdapter,
      endpoint: "/api/copilotkit",
    });
  
    return handleRequest(req);
  };