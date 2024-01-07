
import { Tokens } from 'ai/react';
import { redirect } from 'next/navigation'
import React, { useState } from 'react';
import { IdeaGenerator } from '@/components/idea-generator2'

import { auth } from '@/auth'

export default async function IdeaGeneratorPage() {

  const session = await auth();

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



