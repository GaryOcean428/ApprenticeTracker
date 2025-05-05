export class Together {
  private apiKey: string;
  private baseUrl = 'https://api.together.xyz/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  chat = {
    completions: {
      create: async (params: {
        model: string;
        messages: Array<{ role: string; content: string }>;
        temperature?: number;
        max_tokens?: number;
        stream?: boolean;
      }): Promise<{ data: any; error?: string }> => {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: params.model,
            messages: params.messages,
            temperature: params.temperature ?? 0.7,
            max_tokens: params.max_tokens,
            stream: params.stream ?? false,
          }),
        });

        if (!response.ok) {
          return { data: null, error: `Together API error: ${response.statusText}` };
        }

        return { data: await response.json(), error: undefined };
      },
    },
  };
}
