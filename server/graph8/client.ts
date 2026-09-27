import * as path from 'path';
import * as dotenv from 'dotenv';

// Ensure environment is loaded if not already present
if (!process.env.GRAPH8_API_KEY) {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
  dotenv.config();
}

import { g8 } from '@graph8/sdk';

if (process.env.GRAPH8_API_KEY) {
  g8.init({
    apiKey: process.env.GRAPH8_API_KEY,
  });
}

export { g8 };

