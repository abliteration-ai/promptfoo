import { describe, expect, it } from 'vitest';
import {
  AbliterationProvider,
  createAbliterationProvider,
} from '../../src/providers/abliteration';

describe('AbliterationProvider', () => {
  it('uses Abliteration defaults', () => {
    const provider = new AbliterationProvider('abliterated-model');

    expect(provider.id()).toBe('abliteration:abliterated-model');
    expect(provider.toString()).toBe('[Abliteration Provider abliterated-model]');
    expect(provider.config.apiBaseUrl).toBe('https://api.abliteration.ai/v1');
    expect(provider.config.apiKeyEnvar).toBe('ABLIT_KEY');
  });

  it('allows overriding the API base URL', () => {
    const provider = new AbliterationProvider('abliterated-model', {
      config: {
        apiBaseUrl: 'https://example.com/v1',
      },
    });

    expect(provider.config.apiBaseUrl).toBe('https://example.com/v1');
  });

  it('hides apiKey in JSON output', () => {
    const provider = new AbliterationProvider('abliterated-model', {
      config: {
        apiKey: 'secret',
      },
    });

    expect(provider.toJSON()).toEqual({
      provider: 'abliteration',
      model: 'abliterated-model',
      config: {
        apiBaseUrl: 'https://api.abliteration.ai/v1',
        apiKey: undefined,
        apiKeyEnvar: 'ABLIT_KEY',
      },
    });
  });
});

describe('createAbliterationProvider', () => {
  it('creates a provider from the default syntax', () => {
    const provider = createAbliterationProvider('abliteration:abliterated-model');

    expect(provider).toBeInstanceOf(AbliterationProvider);
    expect(provider.id()).toBe('abliteration:abliterated-model');
  });

  it('supports the chat alias', () => {
    const provider = createAbliterationProvider('abliteration:chat:abliterated-model');

    expect(provider).toBeInstanceOf(AbliterationProvider);
    expect(provider.id()).toBe('abliteration:abliterated-model');
  });

  it('supports model names with colons', () => {
    const provider = createAbliterationProvider('abliteration:chat:org:model:name');

    expect(provider.id()).toBe('abliteration:org:model:name');
  });

  it('throws when the model name is missing', () => {
    expect(() => createAbliterationProvider('abliteration:chat')).toThrow(
      'Abliteration provider requires a model name. Use format: abliteration:<model_name> or abliteration:chat:<model_name>',
    );
  });
});
