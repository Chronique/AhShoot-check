
// This route serves the Farcaster Frame / Mini App metadata.
// It corresponds to https://your-domain/.well-known/farcaster.json

export async function GET() {
  const config = {
    "accountAssociation": {
      "header": "eyJmaWQiOiA4ODcyNDYsICJ0eXBlIjogImN1c3RvZHkiLCAia2V5IjogIjB4N0Q0MDBGRDFGNTkyYkI0RkNkNmEzNjNCZkQyMDBBNDNEMDdlNjE5NiJ9",
      "payload": "eyJkb21haW4iOiAibWluaWtpH-ZGVtby52ZXJjZWwuYXBwIn0",
      "signature": "MHgxMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZjEyMzQ1Njc4OTBhYmNkZWYxMjM0NTY3ODkwYWJjZGVmMTIzNDU2Nzg5MGFiY2RlZjFj"
    },
    "frame": {
      "version": "1",
      "name": "AH SHOOT",
      "iconUrl": "https://raw.githubusercontent.com/base/demos/master/mini-apps/templates/minikit/mini-app-full-demo-minikit/public/icon.png",
      "homeUrl": "https://ah-shoot.vercel.app",
      "imageUrl": "https://raw.githubusercontent.com/base/demos/master/mini-apps/templates/minikit/mini-app-full-demo-minikit/public/icon.png",
      "buttonTitle": "Check Reputation",
      "splashImageUrl": "https://raw.githubusercontent.com/base/demos/master/mini-apps/templates/minikit/mini-app-full-demo-minikit/public/icon.png",
      "splashBackgroundColor": "#0f172a",
      "webhookUrl": "https://ah-shoot.vercel.app/api/webhook"
    }
  };

  return new Response(JSON.stringify(config), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
