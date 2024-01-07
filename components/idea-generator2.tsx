
'use client';

import React, { useState } from 'react';
import { createPipeline, runPipelineStep } from '@/app/idea/generator2/actions';
import { useRouter } from 'next/navigation';



export interface IdeaGeneratorProps extends React.ComponentProps<'div'> {
  userId: string,
}


export function IdeaGenerator({ userId, }: IdeaGeneratorProps) {
  const router = useRouter();

  const [userInput, setUserInput] = useState({ skills: '', pastExperiences: '' });
  const [loading, setLoading] = useState(false);
  const [pipelineId, setPipelineId] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [answer, setAnswer] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput({ ...userInput, [e.target.name]: e.target.value });
  };

  const runPipelineStep = async ({ pipelineIdParam }: { pipelineIdParam?: string }) => {
    const step = currentStep;
    setCurrentStep(currentStep + 1);

    const pipelineResponse: Response = await fetch(`/api/idea/generator/pipeline`,
      {
        method: "POST",
        body: JSON.stringify({
          pipelineId: pipelineIdParam || pipelineId,
          step,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const reader = pipelineResponse.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      setAnswer((prev) => prev + chunkValue);
    }
  }

  const handleStart = async () => {
    setLoading(true);

    try {

      const { pipelineId } = await createPipeline({
        userId,
        userInput
      });

      setPipelineId(pipelineId);

      await runPipelineStep({pipelineIdParam: pipelineId});
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  const handleContinue = async () => {
    setLoading(true);

    setAnswer('');

    try {

      await runPipelineStep({});

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

      {answer &&
        <div>
          Answer:
          <p>
            {answer}
          </p>

          {currentStep <= 9 && (
            <button onClick={handleContinue}>Continue</button>
          )}
        </div>
      }
    </div>
  );
}



