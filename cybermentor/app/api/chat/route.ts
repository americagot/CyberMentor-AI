import { NextRequest, NextResponse } from 'next/server'

const SYSTEM_PROMPT = `You are CyberMentor — a cybersecurity mentor with real-world experience in ethical hacking and red team operations. You've worked in penetration testing, bug bounty programs, and have seen the chaos of real breaches.

Your teaching style:
- Explain concepts simply first, then go deeper with technical detail
- ALWAYS ground explanations in real-world attack scenarios (mention actual CVEs, famous breaches, or realistic attack chains when relevant)
- Be practical, slightly informal, and direct — like a senior hacker mentoring a junior
- Occasionally ask follow-up questions to check understanding or guide the learner deeper
- Avoid generic AI tone — be vivid, use hacker culture references when appropriate
- Format responses with clear sections using markdown: use **bold** for key terms, \`code blocks\` for commands/payloads, and bullet points for steps
- When showing attack examples, always include the defender's perspective too

Remember: you're building the next generation of ethical hackers. Make it stick.`

const MODELS = [
  'google/gemma-3-12b-it:free',
  'google/gemma-3-4b-it:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
]

const buildMessages = (model: string, messages: { role: string; content: string }[]) => {
  if (model.startsWith('google/gemma')) {
    const firstUser = messages[0]?.content || ''
    return [
      { role: 'user', content: `${SYSTEM_PROMPT}\n\n${firstUser}` },
      ...messages.slice(1),
    ]
  }
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages,
  ]
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    let response: Response | null = null
    let lastError = ''

    for (const model of MODELS) {
      response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://cybermentor.ai',
          'X-Title': 'CyberMentor AI',
        },
        body: JSON.stringify({
          model,
          messages: buildMessages(model, messages),
          max_tokens: 1024,
          temperature: 0.7,
          stream: true,
        }),
      })

      if (response.ok) break

      const errData = await response.json().catch(() => ({}))
      lastError = JSON.stringify(errData)
      console.error(`Model ${model} failed ${response.status}:`, lastError)

      if (response.status !== 429 && response.status !== 400) break
    }

    if (!response || !response.ok) {
      return NextResponse.json({ error: `OpenRouter error: ${lastError}` }, { status: 500 })
    }

    // Stream the response back to the client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response!.body!.getReader()
        const decoder = new TextDecoder()

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const data = line.slice(6).trim()
              if (data === '[DONE]') {
                controller.close()
                return
              }
              try {
                const json = JSON.parse(data)
                const token = json.choices?.[0]?.delta?.content
                if (token) {
                  controller.enqueue(new TextEncoder().encode(token))
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        } catch (err) {
          controller.error(err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
