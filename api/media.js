import { mediaFeeds, hiddenMediaURLs } from '../server/media-config.js';
import { createMediaService } from '../server/media-feed.js';
const read = createMediaService(mediaFeeds, { hidden: hiddenMediaURLs });
export async function GET() {
  const payload = await read();
  return Response.json(payload, { status: payload.available ? 200 : 503, headers: {
    'Cache-Control': payload.partial ? 'no-store' : 'public, max-age=60, s-maxage=900, stale-while-revalidate=300',
    'X-Content-Type-Options': 'nosniff',
  } });
}
