"use client"

import React, { useState } from 'react';
import { Button} from '@/components/ui/button'

interface CommentPrediction {
  comment: string;
}

export default function PredictPage() {
  const [post, setPost] = useState<string>('');
  const [predictions, setPredictions] = useState<String[]>([]);

  const handlePostChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPost(event.target.value);
  };

  const handlePredict = async () => {
    const response = await fetch('/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ linkedInPost: post }),
    });
    const data = await response.json();
    setPredictions(data.predictedComments);
  };

  const handleSuggestReply = (commentId: number) => {
    // Implementation for suggesting a reply to a comment
    console.log('Suggest a reply for comment ID:', commentId);
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-3xl text-center font-bold mb-6">
        Predict Comments on Your LinkedIn Post
      </h1>
      <textarea 
        className="w-full h-40 p-3 border border-gray-300 rounded mb-4"
        value={post} 
        onChange={handlePostChange} 
        placeholder="Enter your LinkedIn post here"
      ></textarea>
      <Button 
        className="w-full py-2 px-4 bg-blue-500 text-white font-bold rounded hover:bg-blue-600"
        onClick={handlePredict}
      >
        Predict Comments
      </Button>
      <div className="mt-6 space-y-4">
        {predictions && predictions.map((comment, index) => (
          <div key={index} className="p-3 border border-gray-300 rounded">
            <p>{comment}</p>
            <Button 
              className="w-full mt-2 py-2 px-4 bg-green-500 text-white font-bold rounded hover:bg-green-600"
              onClick={() => handleSuggestReply(index)}
            >
              Suggest a Reply
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
