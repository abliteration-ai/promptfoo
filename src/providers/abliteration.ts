import { OpenAiChatCompletionProvider } from './openai/chat';

import type { EnvOverrides } from '../types/env';
import type { ApiProvider, ProviderOptions } from '../types/index';

const ABLITERATION_API_BASE_URL = 'https://api.abliteration.ai/v1';

export class AbliterationProvider extends OpenAiChatCompletionProvider {
  constructor(modelName: string, providerOptions: ProviderOptions = {}) {
    super(modelName, {
      ...providerOptions,
      config: {
        ...providerOptions.config,
        apiBaseUrl: providerOptions.config?.apiBaseUrl || ABLITERATION_API_BASE_URL,
        apiKeyEnvar: 'ABLIT_KEY',
      },
    });
  }

  id(): string {
    return `abliteration:${this.modelName}`;
  }

  toString(): string {
    return `[Abliteration Provider ${this.modelName}]`;
  }

  toJSON() {
    return {
      provider: 'abliteration',
      model: this.modelName,
      config: {
        ...this.config,
        ...(this.config.apiKey && { apiKey: undefined }),
      },
    };
  }
}

export function createAbliterationProvider(
  providerPath: string,
  options: {
    config?: ProviderOptions;
    id?: string;
    env?: EnvOverrides;
  } = {},
): ApiProvider {
  const splits = providerPath.split(':');
  const modelName = splits[1] === 'chat' ? splits.slice(2).join(':') : splits.slice(1).join(':');

  if (!modelName) {
    throw new Error(
      'Abliteration provider requires a model name. Use format: abliteration:<model_name> or abliteration:chat:<model_name>',
    );
  }

  const providerOptions = options.config || {};

  return new AbliterationProvider(modelName, {
    ...providerOptions,
    id: options.id ?? providerOptions.id,
    env: options.env ?? providerOptions.env,
  });
}
