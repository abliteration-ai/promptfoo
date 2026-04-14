# provider-abliteration (Abliteration)

You can run this example with:

```bash
npx promptfoo@latest init --example provider-abliteration
cd provider-abliteration
```

## Prerequisites

- An [Abliteration](https://abliteration.ai/) account and API key.
- At least one model ID available on that account.

## Setup

1. Set your API key:

   ```bash
   export ABLIT_KEY=your-key-here
   ```

2. Open `promptfooconfig.yaml` and replace the placeholder
   `abliterated-model` with a real model ID from your Abliteration
   dashboard. Running the example without this step will fail with a
   provider error.

## Run

```bash
promptfoo eval
```

See [the Abliteration provider docs](https://www.promptfoo.dev/docs/providers/abliteration/)
for safety context and additional configuration options.
