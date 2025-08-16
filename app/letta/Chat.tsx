'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useMemo, useRef } from 'react';
import type { Message } from '@ai-sdk/ui-utils';

interface ChatProps {
  agentId: string;
  existingMessages: Message[];
  saveAgentIdCookie: (agentId: string) => void;
}

export function Chat({
  agentId,
  existingMessages,
  saveAgentIdCookie,
}: ChatProps) {
  const agentIdSaved = useRef(false);

  useEffect(() => {
    if (agentIdSaved.current) return;
    agentIdSaved.current = true;
    saveAgentIdCookie(agentId);
  }, [agentId, saveAgentIdCookie]);

  const { messages, status, input, handleInputChange, handleSubmit } = useChat({
    body: { agentId },
    initialMessages: existingMessages,
    api: '/letta/api/chat',
  });

  const isLoading = useMemo(
    () => status === 'streaming' || status === 'submitted',
    [status],
  );

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div>Chatting with {agentId}</div>
      {messages.map((message) => (
        <div key={message.id} className="whitespace-pre-wrap">
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.parts.map((part) => {
            switch (part.type) {
              case 'text':
                return <div key={message.id}>{part.text}</div>;
            }
          })}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        {isLoading && (
          <div className="flex items-center justify-center w-full h-12">
            Streaming...
          </div>
        )}
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          disabled={status !== 'ready'}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
