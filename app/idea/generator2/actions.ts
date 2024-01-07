'use server';

import { OpenAIStream } from 'ai';
import OpenAI from 'openai';
import { ChatCompletionChunk, ChatCompletionMessageParam } from 'openai/resources';
import prisma from 'lib/prisma';
import { IdeaPipeline } from '@prisma/client';
import { Stream } from 'openai/streaming';
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

type UserInput = {
  skills?: string;
  pastExperiences?: string;
}

type CreatePipelineRequestDTO = {
  userId: string,
  userInput: UserInput,
}

type CreatePipelineResponseDTO = {
  pipelineId: string,
}

export async function createPipeline(
  { userId, userInput: { skills, pastExperiences } }: CreatePipelineRequestDTO
): Promise<CreatePipelineResponseDTO> {

  const pipeline = await prisma.ideaPipeline.create({
    data: {
      userId,
      skills,
      pastExperiences,
    }
  });

  return {
    pipelineId: pipeline.id
  }
}

export type RunPipelineRequestDTO = {
  pipelineId: string,
  step: number,
}

export async function runPipelineStep({ pipelineId, step }: RunPipelineRequestDTO): Promise<ReadableStream> {

  const pipeline = await prisma.ideaPipeline.findUniqueOrThrow({ where: { id: pipelineId } });

  const userInput: UserInput = {
    skills: pipeline.skills || 'No skills specified',
    pastExperiences: pipeline.pastExperiences || 'No past experiences specified'
  };

  const previousSteps = await prisma.ideaPipelineStep.findMany({ where: { pipelineId: pipeline.id } });

  const previousMessages: ChatCompletionMessageParam[] = previousSteps.map(step => ({ content: step.output, role: "assistant" }));

  const messages: ChatCompletionMessageParam[] = [
    {
      content: 'Act as a YC Combinator experienced founder that helps potential startup founders find an idea that matches with their experiences and skills.',
      role: 'system'
    },
    ...previousMessages,
    {
      content: getPromptForStep(step, userInput),
      role: 'user'
    }
  ];

  console.log("AHA messages: " + JSON.stringify(messages));
  

  const openaiResponse = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: messages,
    temperature: 0.7,
    stream: true
  });

  let finalResult = "";

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of openaiResponse) {

        const data = chunk.choices[0]?.delta?.content || "";

        controller.enqueue(data);
        finalResult += data;
      }

      await savePipelineStepResult({
        pipelineId: pipelineId,
        step: step,
        output: finalResult
      });

      controller.close();
    },
  });


  return stream;
}

export type SavePipelineStepResultRequestDTO = {
  pipelineId: string,
  step: number,
  output: string
}

export async function savePipelineStepResult({ pipelineId, step, output }: SavePipelineStepResultRequestDTO): Promise<void> {
  await prisma.ideaPipelineStep.create({
    data: {
      output,
      stepNumber: step,
      pipelineId,
    }
  });

}


function getPromptForStep(step: number, userInput: UserInput) {
  switch (step) {
    case 1:
      return `
          - Identify an industry or sector where the user's skills and experiences can be most effectively utilized.
          - Your answer MUST be brief.
  
          ###SKILLS###
          ${userInput.skills}
  
          ###PAST EXPERIENCES###
          ${userInput.pastExperiences}
        `;
    case 2:
      return `
          Identify a significant problem or need in the chosen industry that aligns with user's skills and requires an innovative solution.
        `;
    case 3:
      return `
          Generate a single innovative startup idea in the chosen industry that addresses the identified problem, utilizes the user's skills and 
          experiences, and is distinct from current market solutions.
        `;
    case 4:
      return `
          Evaluate the viability of the proposed startup idea. Consider market demand, potential challenges, and unique value proposition. 
          Suggest improvements or refinements based on this evaluation.
        `;
    case 5:
      return `
          Suggest a viable business model for the startup idea, considering market trends and competition.
        `;
    case 6:
      return `
          Identify the target customer for the startup idea and articulate the idea's unique value proposition for this customer segment.
        `;
    case 7:
      return `
          Assess the feasibility and potential risks of the startup idea, including market, financial, and operational aspects.
        `;
    case 8:
      return `
          Outline a plan for executing the startup idea, including steps for market entry, initial marketing strategy, resource requirements, 
          and success milestones.
        `;
    case 9:
      return `
          Create a concise summary and presentation format for the startup idea, including problem-solution fit, business model, target customer, 
          value proposition, feasibility assessment, and execution plan.
        `;
    default:
      return "End of pipeline";
  }
}