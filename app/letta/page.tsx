'use server';

import { cookies } from 'next/headers';
import {
  convertToAiSdkMessage,
  lettaCloud,
  loadDefaultProject,
  loadDefaultTemplate,
} from '@letta-ai/vercel-ai-sdk-provider';
import { Chat } from './Chat';

async function getAgentId() {
  const cookieStore = cookies();
  const activeAgent = cookieStore.get('active-agent');

  if (activeAgent) {
    return activeAgent.value;
  }

  if (!loadDefaultTemplate) {
    throw new Error('Missing LETTA_DEFAULT_TEMPLATE_NAME environment variable');
  }

  const response = await lettaCloud.client.templates.createAgents(
    loadDefaultProject,
    loadDefaultTemplate,
  );

  return response.agents[0].id;
}

async function getExistingMessages(agentId: string) {
  return convertToAiSdkMessage(
    await lettaCloud.client.agents.messages.list(agentId),
    { allowMessageTypes: ['user_message', 'assistant_message'] },
  );
}

async function saveAgentIdCookie(agentId: string) {
  'use server';
  const cookieStore = cookies();
  await cookieStore.set('active-agent', agentId, { path: '/' });
}

export default async function Homepage() {
  const agentId = await getAgentId();
  const existingMessages = await getExistingMessages(agentId);

  return (
    <Chat
      existingMessages={existingMessages}
      saveAgentIdCookie={saveAgentIdCookie}
      agentId={agentId}
    />
  );
}
