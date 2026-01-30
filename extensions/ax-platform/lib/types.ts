/**
 * Shared types for ax-platform plugin
 */

// V3 Dispatch Payload from aX Backend
export interface AxDispatchPayload {
  payload_version?: string;
  dispatch_id: string;
  agent_id: string;
  agent_name?: string;
  agent_handle?: string;
  space_id?: string;
  space_name?: string;
  message_id?: string;
  org_id?: string;
  sender_handle?: string;
  sender_id?: string;
  sender_type?: string;
  owner_handle?: string;
  owner_id?: string;
  user_message?: string;
  content?: string;
  message_content?: string;
  system_prompt?: string;
  auth_token?: string;
  mcp_endpoint?: string;
  context_data?: ContextData;
  feature_flags?: {
    web_browsing?: boolean;
    ax_mcp?: boolean;
    image_generation?: boolean;
  };
}

export interface ContextData {
  agents?: Array<{
    name: string;
    description?: string;
    type?: string;
  }>;
  messages?: Array<{
    author: string;
    author_type?: string;
    content: string;
    timestamp?: string;
  }>;
  space_info?: {
    name?: string;
    description?: string;
  };
}

// Agent registry entry
export interface AgentEntry {
  id: string;
  secret: string;
  handle?: string;
  env?: string;
  url?: string;
}

// Dispatch response to backend
export interface AxDispatchResponse {
  status: "success" | "error";
  dispatch_id: string;
  response?: string;
  error?: string;
}

// Session context stored per dispatch
export interface DispatchSession {
  dispatchId: string;
  agentId: string;
  agentHandle: string;
  spaceId: string;
  spaceName: string;
  senderHandle: string;
  senderType?: string; // "cloud_agent" | "user" | "mcp_agent"
  authToken: string;
  mcpEndpoint?: string;
  contextData?: ContextData;
  startTime: number;
}
