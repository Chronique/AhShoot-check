
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
      "homeUrl": "https://ah-shoot-check.vercel.app",
      "imageUrl": "https://raw.githubusercontent.com/base/demos/master/mini-apps/templates/minikit/mini-app-full-demo-minikit/public/icon.png",
      "buttonTitle": "Check Reputation",
      "splashImageUrl": "https://raw.githubusercontent.com/base/demos/master/mini-apps/templates/minikit/mini-app-full-demo-minikit/public/icon.png",
      "splashBackgroundColor": "#0f172a",
      "webhookUrl": "https://ah-shoot-check.vercel.app/api/webhook",
      "ogDescription": "Verify EAS attestations instantly.",
      "ogImageUrl": "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234f46e5' d='M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z'/%3E%3Cpath fill='%23ffffff' d='M10 17l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z'/%3E%3C/svg%3E",
      "primaryCategory": "developer-tools",
      "requiredCapabilities": [
        "actions.ready",
        "actions.addMiniApp",
        "actions.signIn",
        "actions.openUrl",
        "actions.sendToken",
        "actions.viewToken",
        "actions.composeCast",
        "actions.viewProfile",
        "actions.setPrimaryButton",
        "actions.swapToken",
        "actions.close",
        "actions.viewCast",
        "wallet.getEthereumProvider"
      ],
      "canonicalDomain": "ah-shoot-check.vercel.app",
      "noindex": false,
      "tags": [
        "base",
        "baseapp",
        "miniapp",
        "tools"
      ]
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
