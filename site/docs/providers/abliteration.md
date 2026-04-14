---
title: Abliteration Provider
sidebar_label: Abliteration
description: "Configure Abliteration's OpenAI-compatible chat completions API in Promptfoo for text and multimodal evals against abliterated (refusal-stripped) open-weight models."
sidebar_position: 85
---

# Abliteration

[Abliteration](https://abliteration.ai/) is a third-party service that hosts
**"abliterated"** models — open-weight LLMs where the refusal direction has
been removed from the residual stream so the model no longer declines
requests it would ordinarily refuse. It exposes an OpenAI-compatible chat
completions API, and Promptfoo ships a thin `abliteration:` wrapper around the
[OpenAI provider](/docs/providers/openai/) for it.

:::warning Safety

Abliterated models intentionally bypass the safety training of their base
models. They are primarily useful for red-teaming, jailbreak evaluation, and
safety research — not for production traffic. You are responsible for how
outputs are used and for complying with the model licenses and laws that
apply in your jurisdiction.

:::

## Setup

1. Obtain an API key from Abliteration.
2. Set the `ABLIT_KEY` environment variable, or pass `apiKey` in your
   provider config.

## Environment Variables

| Variable             | Description                                                                               |
| -------------------- | ----------------------------------------------------------------------------------------- |
| `ABLIT_KEY`          | API key sent as the bearer token. Required unless `apiKey` is set in the provider config. |
| `ABLIT_API_BASE_URL` | Override for the chat-completions base URL. Defaults to `https://api.abliteration.ai/v1`. |

Provider config values take precedence over environment variables.

## Basic Configuration

```yaml title="promptfooconfig.yaml"
# yaml-language-server: $schema=https://promptfoo.dev/config-schema.json
providers:
  - id: abliteration:abliterated-model
    config:
      temperature: 0.2
      max_tokens: 512
```

Replace `abliterated-model` with the ID of a real model available on your
Abliteration account. `abliteration:<model>` is the default syntax;
`abliteration:chat:<model>` is also supported.

## OpenAI Compatibility

Abliteration speaks the OpenAI chat-completions protocol, so most options
from the [OpenAI provider](/docs/providers/openai/) work here too —
including tools, structured output, and multimodal messages.

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
