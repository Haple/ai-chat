
import { Tokens } from 'ai/react';
import { redirect } from 'next/navigation'
import React, { useState } from 'react';
import { IdeaGenerator } from '@/components/idea-generator'

import { auth } from '@/auth'
import { runPipelineStep } from './actions';


export default async function IdeaGeneratorPage() {

  const pipelineId = "fake123";
  const currentStep = "1";

  const session = await auth();
  const parsedCurrentStep = parseInt(currentStep);

  if (!session?.user) {
    redirect(`/sign-in?next=/idea/generator`);
  }

  const userId = session.user.id;

  let stream: ReadableStream = {} as ReadableStream;
  console.log("AHA1");

  if (pipelineId) {

    console.log("AHA2");
    
    stream = await runPipelineStep({
      pipelineId,
      step: parsedCurrentStep,
    });
  }

  return (
    <div>
      <IdeaGenerator userId={userId} pipelineId={pipelineId} currentStep={parsedCurrentStep}>

        {pipelineId &&
          <Tokens stream={stream} />
        }

      </IdeaGenerator>
    </div>
  );
}



