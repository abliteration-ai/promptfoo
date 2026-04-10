---
sidebar_label: Abliteration
description: "Use Abliteration's OpenAI-compatible chat completions API for text and multimodal evals"
---

# Abliteration

[Abliteration](https://abliteration.ai/) exposes an OpenAI-compatible chat completions API, so promptfoo can use it through a dedicated `abliteration:` provider.

## Setup

1. Get an API key from Abliteration.
2. Set the `ABLIT_KEY` environment variable or provide `apiKey` in your provider config.

## Basic Configuration

```yaml title="promptfooconfig.yaml"
# yaml-language-server: $schema=https://promptfoo.dev/config-schema.json
providers:
  - id: abliteration:abliterated-model
    config:
      temperature: 0.2
      max_tokens: 512
```

`abliteration:<model>` is the default syntax. `abliteration:chat:<model>` is also supported.

## OpenAI Compatibility

Abliteration uses the same request shape as OpenAI chat completions. Most options from the [OpenAI provider](/docs/providers/openai/) work here too, including tools, structured output, and multimodal messages.

## Multimodal Example

```json title="prompt.json"
[
  {
    "role": "user",
    "content": [
      { "type": "text", "text": "{{question}}" },
      {
        "type": "image_url",
        "image_url": { "url": "https://abliteration.ai/stonehenge.jpg" }
      }
    ]
  }
]
```

```yaml title="promptfooconfig.yaml"
# yaml-language-server: $schema=https://promptfoo.dev/config-schema.json
prompts:
  - file://prompt.json

providers:
  - id: abliteration:abliterated-model

tests:
  - vars:
      question: "What's in this image?"
```
