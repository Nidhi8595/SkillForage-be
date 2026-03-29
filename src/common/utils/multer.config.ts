import { BadRequestException } from '@nestjs/common';
import { memoryStorage } from 'multer';

export const multerConfig = {

  // Store file in memory as a Buffer (not on disk)
  // Why? We only need to parse it and throw it away
  // No disk I/O = faster processing
  storage: memoryStorage(),

  // Only allow PDF files
  fileFilter: (req: any, file: Express.Multer.File, callback: Function) => {
    if (file.mimetype !== 'application/pdf') {
      return callback(
        new BadRequestException('Only PDF files are allowed'),
        false
      );
    }
    callback(null, true); // null = no error, true = accept file
  },

  // Limit file size to 5MB
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB in bytes
  },
};