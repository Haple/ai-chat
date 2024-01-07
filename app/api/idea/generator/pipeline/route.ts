

import { auth } from '@/auth'
import { RunPipelineRequestDTO, runPipelineStep, savePipelineStepResult } from '@/app/idea/generator2/actions';
import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';
import { ChatCompletionChunk } from 'openai/resources';
import { Stream } from 'openai/streaming';


export async function POST(req: Request,) {
  const json = await req.json();
  const payload: RunPipelineRequestDTO = json;

  const userId = (await auth())?.user.id

  if (!userId) {
    return new Response('Unauthorized', {
      status: 401
    })
  }

  const stream = await runPipelineStep(payload);

  // let responseStream = new TransformStream();
  // const writer = responseStream.writable.getWriter();
  // let result = "";

  // Process the stream asynchronously
  // (async () => {
  //   for await (const chunk of stream) {
  //     const content = chunk.choices[0]?.delta?.content || "";
  //     result+= content ;
  //     await writer.write(`data: ${content || ""}\n\n`);
  //   }
  //   writer.close();

  //   await savePipelineStepResult({
  //     pipelineId: payload.pipelineId,
  //     step: payload.step,
  //     output: result
  //   })
  // })();


  return new Response(stream);
}




// reader.read().then(function processChunk({ value, done }) {

//   if (done) {
//     savePipelineStepResult({
//       pipelineId: payload.pipelineId,
//       step: payload.step,
//       output: result
//     });
//     return;
//   }

//     result += textDecoder.decode(value);

//     // result += value;
//     writer.write(`data: ${value}\n\n`);
//     reader.read().then(processChunk)
// });

// while (!done) {
//   const { value, done: readDone } = await reader.read();
//   done = readDone;

//   if (value) {
//     result += new TextDecoder().decode(value);

//     writer.write(`data: ${value}\n\n`);
//   }
// }
