import { g8 } from '@graph8/sdk';

g8.init({
  apiKey: process.env.GRAPH8_API_KEY!,
  // the SDK automatically handles base URLs and default rate limits
});

export { g8 };
