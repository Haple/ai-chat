
'use client';

import React, { useState } from 'react';
import { createPipeline } from '@/app/idea/generator/actions';
import { useRouter } from 'next/navigation';



export interface IdeaGeneratorProps extends React.ComponentProps<'div'> {
  userId: string,
  pipelineId?: string,
  currentStep: number,
  children: React.ReactNode
}


export function IdeaGenerator({ userId, pipelineId, currentStep, children }: IdeaGeneratorProps) {
  const router = useRouter();

  const [userInput, setUserInput] = useState({ skills: '', pastExperiences: '' });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput({ ...userInput, [e.target.name]: e.target.value });
  };

  const handleStart = async () => {
    setLoading(true);

    try {

      const { pipelineId } = await createPipeline({
        userId,
        userInput
      });

      router.push(`/idea/generator?pipelineId=${pipelineId}&currentStep=1`);

    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const handleContinue= async () => {
    setLoading(true);

    try {

      router.push(`/idea/generator?pipelineId=${pipelineId}&step=${currentStep+1}`);

    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div>
      <input
        type="text"
        name="skills"
        value={userInput.skills}
        onChange={handleInputChange}
        placeholder="Your skills"
      />
      <input
        type="text"
        name="pastExperiences"
        value={userInput.pastExperiences}
        onChange={handleInputChange}
        placeholder="Your past experiences"
      />
      <button onClick={handleStart}>Start Idea Generation</button>

      {loading && <p>Thinking...</p>}


      {children && (
        <div>
          {children}

          {currentStep <= 9 && (
            <button onClick={handleContinue}>Continue</button>
          )}
        </div>
      )}
    </div>
  );
}



