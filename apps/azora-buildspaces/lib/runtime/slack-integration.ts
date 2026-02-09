/**
 * Slack Integration Service
 * Sends workflow notifications to Slack channels
 */

export interface SlackMessage {
  channel?: string;
  text?: string;
  blocks?: Array<{
    type: string;
    text?: { type: string; text: string };
    fields?: Array<{ type: string; text: string }>;
    image_url?: string;
    alt_text?: string;
  }>;
  attachments?: Array<{
    color?: string;
    title?: string;
    text?: string;
    fields?: Array<{ title: string; value: string; short?: boolean }>;
    image_url?: string;
  }>;
}

export interface SlackResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp?: string;
}

/**
 * Send message to Slack
 */
export async function sendSlackMessage(
  webhook: string,
  message: SlackMessage
): Promise<SlackResult> {
  try {
    if (!webhook) {
      throw new Error('No Slack webhook URL provided');
    }

    const response = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Slack API error: ${error}`);
    }

    return {
      success: true,
      messageId: message.text || 'unknown',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Format workflow status as Slack message
 */
export function formatWorkflowStatus(
  workflowName: string,
  status: 'started' | 'completed' | 'failed',
  details?: Record<string, unknown>
): SlackMessage {
  const colorMap = {
    started: '#0099ff',
    completed: '#00cc00',
    failed: '#ff0000',
  };

  const titleMap = {
    started: '▶️ Workflow Started',
    completed: '✅ Workflow Completed',
    failed: '❌ Workflow Failed',
  };

  return {
    attachments: [
      {
        color: colorMap[status],
        title: titleMap[status],
        fields: [
          {
            title: 'Workflow',
            value: workflowName,
            short: true,
          },
          {
            title: 'Timestamp',
            value: new Date().toISOString(),
            short: true,
          },
          ...(details
            ? Object.entries(details).map(([key, value]) => ({
                title: key.charAt(0).toUpperCase() + key.slice(1),
                value: String(value),
                short: true,
              }))
            : []),
        ],
      },
    ],
  };
}

/**
 * Format agent execution as Slack message
 */
export function formatAgentExecution(
  agentName: string,
  result: 'success' | 'failed',
  output?: string
): SlackMessage {
  return {
    attachments: [
      {
        color: result === 'success' ? '#00cc00' : '#ff0000',
        title: `Agent: ${agentName}`,
        text: result === 'success' ? '✅ Execution successful' : '❌ Execution failed',
        fields: output
          ? [
              {
                title: 'Output',
                value: output.substring(0, 500), // Truncate if too long
                short: false,
              },
            ]
          : undefined,
      },
    ],
  };
}
