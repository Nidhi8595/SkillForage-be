import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

@Injectable()
export class GroqService {

  private readonly logger = new Logger(GroqService.name);
  private readonly client: Groq;

  constructor(private readonly configService: ConfigService) {
    this.client = new Groq({
      apiKey: this.configService.get<string>('GROQ_API_KEY'),
    });
  }

  async generateSkillBenchmark(roleName: string): Promise<{
    required: string[];
    good_to_have: string[];
  }> {
    this.logger.log(`Calling Groq for role: "${roleName}"`);

    const completion = await this.client.chat.completions.create({
      model: 'llama-3.1-8b-instant',   // free, fast, great for structured output
      temperature: 0.1,                  // low = consistent JSON every time
      max_tokens: 500,
      response_format: { type: 'json_object' }, // forces valid JSON output
      messages: [
        {
          role: 'system',
          content: `You are a skills taxonomy expert. Always respond with valid JSON only. No explanation. No markdown.`,
        },
        {
          role: 'user',
          content: `For the job role "${roleName}", return this exact JSON structure:
{
  "required": ["skill1", "skill2"],
  "good_to_have": ["skill3", "skill4"]
}

Rules:
- required: 6 to 9 essential skills a person MUST have
- good_to_have: 4 to 7 skills that make a candidate stand out
- Skills must be lowercase and specific
- Examples: "python", "ecg interpretation", "figma", "contract drafting"
- Cover ANY field: medicine, law, design, finance, arts, engineering, trades
- Return ONLY the JSON object`,
        },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? '';
    this.logger.log(`Groq response: ${text}`);

    return this.parseResponse(text, roleName);
  }

  private parseResponse(
    raw: string,
    roleName: string,
  ): { required: string[]; good_to_have: string[] } {
    try {
      const parsed = JSON.parse(raw);

      const required: string[] = (parsed.required || [])
        .map((s: string) => s.toLowerCase().trim())
        .filter((s: string) => s.length > 1);

      const good_to_have: string[] = (parsed.good_to_have || [])
        .map((s: string) => s.toLowerCase().trim())
        .filter((s: string) => s.length > 1);

      if (required.length === 0) throw new Error('Empty skills');

      return { required, good_to_have };

    } catch (err) {
      this.logger.error(`Parse failed for "${roleName}": ${err}`);
      return {
        required: ['communication', 'problem solving', 'teamwork', 'analytical thinking'],
        good_to_have: ['leadership', 'project management'],
      };
    }
  }
}