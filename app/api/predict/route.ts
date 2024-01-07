import OpenAI from 'openai'

import { auth } from '@/auth'
import { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat/completions'
import { Completions } from 'openai/resources'

export const runtime = 'edge'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})


export async function POST(req: Request) {
    const json = await req.json()
    const { linkedInPost, previewToken } = json
    const userId = (await auth())?.user.id

    if (!userId) {
        return new Response('Unauthorized', {
            status: 401
        })
    }

    if (previewToken) {
        openai.apiKey = previewToken
    }

    const tools: ChatCompletionTool[] = [
        {
            "type": "function",
            "function": {
                "name": "savePredictedComments",
                "description": "Save the predicted comments that LinkedIn users can comment on a given post",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "comments": {
                            "type": "array",
                            "description": "The predicted comments",
                            "items": {
                                "type": "string"
                            }
                        },
                    },
                    "required": ["comments"],
                },
            }
        }
    ];
    const temp: ChatCompletionMessageParam[] = [
        { role: "system", content: "Your job is to predict how people will react to my post on LinkedIn. Make a list of potential comments people may make. The comments should use critical thinking and should include great questions. Some questions should even include hard questions that I need to prepare myself to." },
        { role: "user", content: `This is the LinkedIn post: ${linkedInPost}` }
    ];

    const res = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: temp,
        temperature: 0.7,
        stream: false,
        tools: tools,
        tool_choice: { type: "function", function: { name: "savePredictedComments" } }
    })

    const toolCalls = res.choices[0]?.message?.tool_calls

    if (toolCalls) {
        const functionArguments = toolCalls[0].function.arguments

        const predictedComments: {
            comments: string[];
        } = JSON.parse(functionArguments);

        console.log("AHA! " + functionArguments)

        return new Response(JSON.stringify({
            predictedComments: predictedComments.comments,
        }), {
            status: 200,
        })
    } else {

        return new Response(JSON.stringify({
            error: "Unable to predict",
        }), {
            status: 500,
        })
    }


}
