import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { disableCache, enableCache, fetchWithCache } from '../../src/cache';
import { AbliterationProvider, createAbliterationProvider } from '../../src/providers/abliteration';
import { mockProcessEnv } from '../util/utils';

vi.mock('../../src/cache', async (importOriginal) => {
  return {
    ...(await importOriginal()),
    fetchWithCache: vi.fn(),
    enableCache: vi.fn(),
    disableCache: vi.fn(),
  };
});

const mockFetchWithCache = vi.mocked(fetchWithCache);
let restoreEnv: (() => void) | undefined;

function mockAbliterationEnv(overrides: Record<string, string | undefined> = {}) {
  restoreEnv?.();
  restoreEnv = mockProcessEnv({
    ABLIT_API_BASE_URL: undefined,
    ABLIT_KEY: 'test-ablit-key',
    ...overrides,
  });
}

describe('AbliterationProvider', () => {
  beforeEach(() => {
    disableCache();
    mockAbliterationEnv();
  });

  afterEach(() => {
    enableCache();
    restoreEnv?.();
    restoreEnv = undefined;
    vi.resetAllMocks();
  });

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

  it('uses the environment base URL when config does not override it', () => {
    mockAbliterationEnv({
      ABLIT_API_BASE_URL: 'https://env.example.com/v1',
    });

    const provider = new AbliterationProvider('abliterated-model');

    expect(provider.config.apiBaseUrl).toBe('https://env.example.com/v1');
  });

  it('treats empty API base URLs as unset', () => {
    mockAbliterationEnv({
      ABLIT_API_BASE_URL: '',
    });

    const providerFromEmptyEnv = new AbliterationProvider('abliterated-model');
    expect(providerFromEmptyEnv.config.apiBaseUrl).toBe('https://api.abliteration.ai/v1');

    mockAbliterationEnv({
      ABLIT_API_BASE_URL: 'https://env.example.com/v1',
    });

    const providerFromEmptyConfig = new AbliterationProvider('abliterated-model', {
      config: {
        apiBaseUrl: '',
      },
    });

    expect(providerFromEmptyConfig.config.apiBaseUrl).toBe('https://env.example.com/v1');
  });

  it('redacts apiKey in JSON output even when it is falsy', () => {
    const provider = new AbliterationProvider('abliterated-model', {
      config: {
        apiKey: '',
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

  it('calls the API successfully', async () => {
    mockFetchWithCache.mockResolvedValue({
      data: {
        choices: [{ message: { content: 'Abliterated output' } }],
        usage: { total_tokens: 12, prompt_tokens: 7, completion_tokens: 5 },
      },
      cached: false,
      status: 200,
      statusText: 'OK',
    });

    const provider = new AbliterationProvider('abliterated-model');
    const result = await provider.callApi(
      JSON.stringify([{ role: 'user', content: 'Describe the image' }]),
    );

    expect(mockFetchWithCache).toHaveBeenCalledWith(
      'https://api.abliteration.ai/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-ablit-key',
          'Content-Type': 'application/json',
        }),
      }),
      expect.any(Number),
      'json',
      undefined,
      undefined,
    );
    expect(result.output).toBe('Abliterated output');
    expect(result.tokenUsage).toEqual({ total: 12, prompt: 7, completion: 5, numRequests: 1 });
  });

  it('surfaces client errors', async () => {
    mockFetchWithCache.mockResolvedValue({
      data: { error: { message: 'Bad request' } },
      cached: false,
      status: 400,
      statusText: 'Bad Request',
      headers: {},
    });

    const provider = new AbliterationProvider('abliterated-model');
    const result = await provider.callApi('Test prompt');

    expect(result.error).toContain('API error: 400 Bad Request');
    expect(result.metadata?.http?.status).toBe(400);
  });

  it('surfaces rate limit errors', async () => {
    mockFetchWithCache.mockResolvedValue({
      data: { error: { message: 'Too many requests' } },
      cached: false,
      status: 429,
      statusText: 'Too Many Requests',
      headers: { 'retry-after': '60' },
    });

    const provider = new AbliterationProvider('abliterated-model');
    const result = await provider.callApi('Test prompt');

    expect(result.error).toContain('API error: 429 Too Many Requests');
    expect(result.metadata?.http?.status).toBe(429);
    expect(result.metadata?.http?.headers).toEqual({ 'retry-after': '60' });
  });

  it('surfaces server errors', async () => {
    mockFetchWithCache.mockResolvedValue({
      data: { error: { message: 'Internal server error' } },
      cached: false,
      status: 500,
      statusText: 'Internal Server Error',
      headers: {},
    });

    const provider = new AbliterationProvider('abliterated-model');
    const result = await provider.callApi('Test prompt');

    expect(result.error).toContain('API error: 500 Internal Server Error');
    expect(result.metadata?.http?.status).toBe(500);
  });

  it('requires an API key at request time', async () => {
    const provider = new AbliterationProvider('abliterated-model');
    vi.spyOn(provider, 'getApiKey').mockReturnValue(undefined);

    await expect(provider.callApi('Test prompt')).rejects.toThrow(
      'API key is not set. Set the ABLIT_KEY environment variable or add `apiKey` to the provider config.',
    );
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

  it('throws when the default syntax is missing a model name', () => {
    expect(() => createAbliterationProvider('abliteration:')).toThrow(
      'Abliteration provider requires a model name. Use format: abliteration:<model_name> or abliteration:chat:<model_name>',
    );
  });
});
