# AI Models & Capabilities

## Supported Models

Gary8 integrates with a select range of AI models from Google, Anthropic, and OpenAI to ensure optimal performance for different tasks.
The system intelligently selects the most appropriate model based on task complexity, context length, and specific requirements.

<!-- markdownlint-disable MD013 -->
| Name | Provider | Parameters | Context Window | Max Output | Release Date | Key Strengths | Input | Output | Pricing | Knowledge Cutoff | Documentation |
|------|----------|------------|---------------|------------|--------------|---------------|-------|--------|---------|------------------|---------------|
| claude-3-5-sonnet-latest | Anthropic | Not disclosed | 200K | Not specified | 2024-04 | Former most intelligent code model, text/image input | Not specified | Not specified | Not specified | Not specified | [Docs](https://docs.anthropic.com/en/docs/about-claude) |
| claude-3-5-haiku-latest | Anthropic | Not disclosed | 200K | Not specified | 2024-07 | Fastest Claude 3.5 model | Not specified | Not specified | Not specified | Not specified | [Docs](https://docs.anthropic.com/en/docs/about-claude) |
| claude-3-7-sonnet-20250219 | Anthropic | Not disclosed | 200K | 8192 | 2025-02 | Most intelligent model, text/image input, coding, agentic tools | Not specified | Not specified | Not specified | Not specified | [Docs](https://docs.anthropic.com/en/docs/about-claude) |
| gemini-2.5-pro-preview-03-25 | Google | Not disclosed | 1M | 64,000 | 2025-03-25 | State-of-the-art thinking model, reasoning over complex problems in code, math, STEM | Text, Image, Video, Audio | Text | Not specified | Not specified | [Docs](https://ai.google.dev/gemini-api/docs/models#gemini-2.5-pro-preview-03-25) |
| gemini-2.5-flash-preview-04-17 | Google | Not disclosed | 1M | 64,000 | 2025-04-17 | Fast and efficient model, hybrid reasoning capabilities | Text, Image, Video, Audio | Text | Not specified | Not specified | [Docs](https://ai.google.dev/gemini-api/docs/models#gemini-2.5-flash-preview-04-17) |
| gemini-2.5-pro-exp-03-25 | Google | Not disclosed | 1M | 64,000 | 2025-03-25 | State-of-the-art thinking model, reasoning over complex problems in code, math, STEM | Not specified | Not specified | Not specified | Not specified | [Docs](https://ai.google.dev/gemini-api/docs/models#gemini-2.5-pro-exp-03-25) |
| gemini-2.0-flash | Google | Not disclosed | 1M | Not specified | 2025-01-30 | General-purpose model, fast and efficient | Not specified | Not specified | Not specified | Not specified | [Docs](https://cloud.google.com/vertex-ai/docs/gemini) |
| gemini-2.0-flash-thinking-exp | Google | Not disclosed | 1M | 64,000 | 2025-02-05 | Advanced reasoning capabilities, shows thought process | Not specified | Not specified | Not specified | Not specified | [Docs](https://ai.google.dev/gemini-api/docs/thinking) |
| gemini-2.0-pro-experimental | Google | Not disclosed | 2M | Not specified | 2025-02-05 | Best-in-class coding performance, complex prompts | Not specified | Not specified | Not specified | Not specified | [Docs](https://cloud.google.com/vertex-ai/docs/gemini) |
| gemini-2.0-flash-lite | Google | Not disclosed | 1M | Not specified | 2025-02-05 | Cost-efficient model for real-time interactions | Not specified | Not specified | Not specified | Not specified | [Docs](https://cloud.google.com/vertex-ai/docs/gemini) |
| chatgpt-4.1 | OpenAI | Not disclosed | 1,047,576 | 32,768 | 2025-04 | Improved reasoning and creativity over GPT-4 | Text, Image | Text | $2 + $8 (Input + Output) | Jun 01, 2024 | [Docs](https://platform.openai.com/docs/models#gpt-4-1) |
| o1 | OpenAI | Not disclosed | 200,000 | >100,000 | 2024-12 | Complex reasoning capabilities | Text, Image | Text | $15 - $60 (Input : Output) | Oct 01, 2023 | [Docs](https://platform.openai.com/docs/models#o1) |
| o1-mini | OpenAI | Not disclosed | 128K | 65,536 | 2024-09 | Fast reasoning for specialized tasks | Not specified | Not specified | Not specified | Not specified | [Docs](https://platform.openai.com/docs/models#o1-mini) |
| o3-mini-2025-01-31 | OpenAI | Not disclosed | 200K | 100K | 2025-01-31 | Small reasoning model for STEM tasks | Not specified | Not specified | Not specified | Not specified | [Docs](https://platform.openai.com/docs/models#o3-mini) |
| gpt-4o-realtime-preview | OpenAI | Not disclosed | 128K | 4096 | Current | Real-time audio/text input | Not specified | Not specified | Not specified | Not specified | [Docs](https://platform.openai.com/docs/models#gpt-4o-realtime) |
| gpt-4.1-mini | OpenAI | Not disclosed | 1,047,576 | 32,768 | 2025-04 | Compact chat variant for discussion | Text, Image | Text | $0.4 : $1.6 (Input : Output) | Jun 01, 2024 | [Docs](https://platform.openai.com/docs/models#gpt-4-1-mini) |
| o4-mini | OpenAI | Not disclosed | 200,000 | >100,000 | 2025-03 | Faster, more affordable reasoning model | Text, Image | Text | $1.1 - $4.4 (Input + Output) | Jun 01, 2024 | [Docs](https://platform.openai.com/docs/models#o4-mini) |
| o3 | OpenAI | Not disclosed | 200,000 | >10,000 | 2025-03 | Most powerful reasoning model | Text, Image | Text | $10 - $40 (Input + Output) | Jun 01, 2024 | [Docs](https://platform.openai.com/docs/models#o3) |
| o1-pro | OpenAI | Not disclosed | 200K | 100K | 2025-04 | Pro performance variant for demanding tasks | Not specified | Not specified | Not specified | Not specified | [Docs](https://platform.openai.com/docs/models#o1-pro) |
| llama-3.3 | Meta | Not disclosed | 200K | Not specified | 2025-02 | State-of-the-art open-source LLaMA model | Not specified | Not specified | Not specified | Not specified | [Docs](https://ai.meta.com/llama/docs/models#llama-3-3) |
| grok-3 | xAI | Not disclosed | 131,072 | Not specified | 2025-01 | Fast reasoning model from xAI | Not specified | Not specified | Input: $3.00/M tokens, Output: $15.00/M tokens | Not specified | [Docs](https://x.ai/docs/models#grok-3) |
| grok-3-mini | xAI | Not disclosed | 131,072 | 16,384 | 2025-03 | Cost-effective reasoning and coding tasks | Not specified | Not specified | Input: $0.30/M tokens, Output: $0.50/M tokens | Not specified | [Docs](https://docs.x.ai/docs/models#models-and-pricing) |
| gpt-4.1-nano | OpenAI | Not disclosed | 1,047,576 | >32,768 | 2025-04 | Fastest, most cost-effective GPT-4.1 model | Text, Image | Text | $0.1 - $0.4 (Input : Output) | Jun 01, 2024 | [Docs](https://platform.openai.com/docs/models#gpt-4-1-nano) |
| compound-beta | Groq | Not disclosed | 128K | 32,768 | 2025-04 | Advanced agentic capabilities with tool use | Not specified | Not specified | Not specified | Not specified | [Docs](https://console.groq.com/docs/agentic-tooling/compound-beta) |
<!-- markdownlint-enable MD013 -->

> **Note:** Gemini 2.5 Pro Preview 03-25 and Gemini 2.5 Flash Preview 04-17 have been added, with expanded input/output capabilities (text, image, video, audio) as per the latest Google AI documentation.

## Model Table Summary & Recommendations

To provide a useful, helpful, and actionable answer, here is a summary of the key points from the updated table and recent search results:

- The updated table includes 21 AI models from various providers, with specifications such as context windows, max output tokens, release dates, key strengths, input/output capabilities, pricing, and knowledge cutoff dates.

### Key Takeaways

1. **Context Windows**: Some models now support much larger context windows. Notably, `chatgpt-4.1`, `gpt-4.1-mini`, and `gpt-4.1-nano` support up to 1,047,576 tokens (~1M).
2. **Max Output Tokens**: `chatgpt-4.1` and `gpt-4.1-mini` now support up to 32,768 output tokens.
3. **Pricing**: Pricing formats have been updated for some models. For example, `grok-3` and `grok-3-mini` use a $X/M tokens (input) and $Y/M tokens (output) format, while others use a range-based format.
4. **Knowledge Cutoff Dates**: Some models have updated knowledge cutoff dates. For example, `o1` is Oct 01, 2023, and `chatgpt-4.1`, `o4-mini`, `o3`, `gpt-4.1-mini`, and `gpt-4.1-nano` are Jun 01, 2024.

### Actionable Recommendations

1. **Choose the right model**: Select a model that aligns with your needs—consider context window, max output, pricing, and knowledge cutoff.
2. **Consider the GPT-4.1 family**: `chatgpt-4.1`, `gpt-4.1-mini`, and `gpt-4.1-nano` offer improved reasoning, creativity, and affordability, with large context windows.
3. **Evaluate pricing**: Review input/output costs and any additional fees or discounts for each model.
4. **Check knowledge cutoff**: Make sure the model's knowledge cutoff date is suitable for your use case, especially if you need up-to-date information.

### GPT-4.1 Model Family Overview

- **GPT-4.1**: Flagship model with best overall performance in coding, instruction following, and long-context processing.
- **GPT-4.1 Mini**: More affordable and efficient, ideal for budget-conscious developers.
- **GPT-4.1 Nano**: Smallest and most cost-effective, designed for high-speed and affordability, with a context window up to 1M tokens.

#### Key Specifications

- **Context Window**: All three support up to 1 million tokens.
- **Max Output Tokens**: GPT-4.1 and Mini output up to 32,768 tokens.
- **Pricing**:
   - GPT-4.1: $2 (input) + $8 (output)
   - GPT-4.1 Mini: $0.4 (input) + $1.6 (output)
   - GPT-4.1 Nano: $0.1 (input) + $0.4 (output)

By considering these key specifications and the updated table, you can make informed decisions when selecting an AI model for your specific use case.

## Model Selection Criteria

The Monkey system uses a sophisticated routing mechanism to select the most appropriate model for each task. The selection criteria include:

### Task Complexity

- **Chat & Discussion**: Interactive chat & discussion tasks use models like llama-3.3, gpt-4.1-mini, or claude-3-5-haiku-latest.
- **Standard Tasks**: General coding, explanations, and typical development tasks use balanced models like chatgpt-4.1.
- **Advanced Tasks**: Complex reasoning, architecture design, and sophisticated problem-solving use powerful models like o1-pro, grok-3, or claude-3-7-sonnet.
- **Specialized Tasks**: Domain-specific tasks like mathematical proofs or research analysis use specialized models like gemini-2.0-pro-experimental.

### Context Length Requirements

- **Short Context**: Tasks that don't require extensive context use models with smaller context windows to optimize performance.
- **Medium Context**: Development tasks with moderate context requirements use models with 128K-200K token context windows.
- **Long Context**: Tasks involving large codebases or extensive documentation use models with 1M+ token context windows like gemini-2.0-flash-thinking-exp.

### Performance Characteristics

- **Speed Priority**: When response time is critical, the system selects faster models like gpt-4o-mini or claude-3-5-haiku-latest.
- **Quality Priority**: When response quality is paramount, the system selects more powerful models like claude-3-7-sonnet or o1.
- **Cost Efficiency**: For routine tasks where cost efficiency is important, the system selects models like gemini-2.0-flash-lite.

### Model Tiers

- **Premium Tier**: claude-3-7-sonnet, gemini-2.5-pro-exp-03-25, grok-3-beta
- **Advanced Tier**: o3, chatgpt-4.1, gemini-2.0-pro-experimental, grok-3-mini-beta, compound-beta (groq)
- **Standard Tier**: o1-pro, gemini-2.0-flash-thinking-exp, claude-3-5-sonnet-latest,
- **Efficient Tier**: o1-mini, o3-mini, grok-3-mini, gpt-4.1-mini, gemini-2.0-flash
- **Fast Response Tier**: gpt-4.1-nano, llama-3.3-70b-versatile, claude-3-5-haiku-20241022

## Integration Patterns

Gary8 uses several integration patterns to work with these models:

1. **Direct API Integration**: For primary providers like OpenAI, Anthropic, and Google.
2. **Proxy Services**: For specialized models or when direct integration isn't available.
3. **Local Models**: For certain tasks that can be handled locally without external API calls.

## Context Window Management

To effectively manage context windows, especially for large projects, Monkey implements:

1. **Context Pruning**: Automatically removing less relevant information when approaching context limits.
2. **Summarization**: Creating concise summaries of lengthy discussions or documentation.
3. **Chunking**: Breaking large tasks into smaller, manageable pieces that fit within context windows.
4. **Memory Management**: Storing important context in vector databases for retrieval when needed.
