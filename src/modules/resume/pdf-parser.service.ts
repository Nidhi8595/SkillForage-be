import { Injectable, BadRequestException } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse-fork');

@Injectable()
export class PdfParserService {

  async extractText(buffer: Buffer): Promise<string> {
    try {
      const data = await pdfParse(buffer);

      const text: string = data.text;

      if (!text || text.trim().length === 0) {
        throw new BadRequestException(
          'Could not extract text from PDF. Make sure it is not a scanned image.',
        );
      }

      return this.normalizeText(text);

    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.error('PDF parse error:', error);
      throw new BadRequestException('Failed to parse PDF file.');
    }
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s.#+]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}