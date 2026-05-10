import { ProviderRuleEngine, ToolId } from '../types';
import { githubCopilotProvider } from './github_copilot';
import { cursorProvider } from './cursor';
import { claudeProvider } from './claude';
import { chatgptProvider } from './chatgpt';
import { anthropicApiProvider } from './anthropic_api';
import { openaiApiProvider } from './openai_api';
import { geminiProvider } from './gemini';
import { windsurfProvider } from './windsurf';
import { v0Provider } from './v0';

export const providers: Record<ToolId, ProviderRuleEngine> = {
  github_copilot: githubCopilotProvider,
  cursor: cursorProvider,
  claude: claudeProvider,
  chatgpt: chatgptProvider,
  anthropic_api: anthropicApiProvider,
  openai_api: openaiApiProvider,
  gemini: geminiProvider,
  windsurf: windsurfProvider,
  v0: v0Provider,
};
