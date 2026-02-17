
import { Errors, createClient } from "@farcaster/quick-auth";

const client = createClient();

// Helper to get domain in Vercel Serverless environment
function getUrlHost(request: Request): string {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const url = new URL(origin);
      return url.host;
    } catch (e) {
      console.warn("Invalid origin:", origin);
    }
  }

  const host = request.headers.get("host");
  if (host) return host;

  if (process.env.NEXT_PUBLIC_URL) {
      try {
        return new URL(process.env.NEXT_PUBLIC_URL).host;
      } catch (e) {}
  }
  
  return "ah-shoot-check.vercel.app";
}

export async function GET(request: Request) {
  const authorization = request.headers.get("Authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ message: "Missing token" }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const token = authorization.split(" ")[1];
    const payload = await client.verifyJwt({
      token: token,
      domain: getUrlHost(request),
    });

    return new Response(JSON.stringify({
      success: true,
      user: {
        fid: payload.sub,
        issuedAt: payload.iat,
        expiresAt: payload.exp,
      },
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });

  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      return new Response(JSON.stringify({ message: "Invalid token" }), { status: 401 });
    }
    return new Response(JSON.stringify({ message: (e as Error).message }), { status: 500 });
  }
}
