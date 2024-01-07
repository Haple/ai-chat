
import { Tokens } from 'ai/react';
import { redirect } from 'next/navigation'
import React, { useState } from 'react';
import { IdeaGenerator } from '@/components/idea-generator2'

import { auth } from '@/auth'
import { runPipelineStep } from './actions';

export interface IdeaGeneratorPageProps extends React.ComponentProps<'div'> {

  searchParams:{
    pipelineId?: string,
    currentStep: string,
  }
}

export default async function IdeaGeneratorPage({ searchParams:{pipelineId, currentStep = '0'}, children }: IdeaGeneratorPageProps) {

  const session = await auth();
  const parsedCurrentStep = parseInt(currentStep);

  if (!session?.user) {
    redirect(`/sign-in?next=/idea/generator`);
  }

  const userId = session.user.id;

  return (
    <>
      <IdeaGenerator userId={userId}/>
    </>
  );
}



