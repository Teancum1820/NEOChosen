// Public review-only assets. No production routes or data bindings.
const headers = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  'Referrer-Policy': 'same-origin'
};

export default {
  async fetch(request, env) {
    if (!['GET', 'HEAD'].includes(request.method)) {
      return new Response('Method not allowed.', {
        status: 405, headers: { ...headers, Allow: 'GET, HEAD' }
      });
    }
    const asset = await env.ASSETS.fetch(request);
    const response = new Response(asset.body, asset);
    for (const [name, value] of Object.entries(headers)) response.headers.set(name, value);
    return response;
  }
};
