export default {
  async fetch(request) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || "*",
      "Access-Control-Max-Age": "86400",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");

    if (!targetUrl) {
      return new Response("Fout: 'url' parameter ontbreekt.", { status: 400 });
    }

    try {
      const newHeaders = new Headers(request.headers);
      newHeaders.delete("host");
      newHeaders.delete("referer");

      const response = await fetch(targetUrl, {
        method: request.method,
        headers: newHeaders,
        body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null
      });

      const modifiedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers)
      });

      Object.keys(corsHeaders).forEach(key => {
        modifiedResponse.headers.set(key, corsHeaders[key]);
      });

      return modifiedResponse;

    } catch (error) {
      return new Response("Proxy Fout: " + error.message, { status: 500, headers: corsHeaders });
    }
  }
};
