// app/api/auth/google/route.js
// This route initiates the Google OAuth authentication flow.

import connectDB from "@/Lib/config/db"; // Use alias if configured, e.g., '@/lib/config/db'
import passport from "passport";
import "@/Lib/config/passport"; // This file should initialize your passport strategies
import { NextResponse } from "next/server";

export async function GET(request) {
  await connectDB(); // Ensure DB connection is established

  // Create a mock Node.js request object to be compatible with Passport.js
  // Passport.js expects a Node.js `req` object, which is different from Next.js `NextRequest`.
  const mockReq = {
    query: Object.fromEntries(request.nextUrl.searchParams.entries()),
    headers: Object.fromEntries(request.headers.entries()),
    method: request.method,
    url: request.url,
    connection: {
      encrypted: request.url.startsWith('https://'),
      remoteAddress: request.headers.get('x-forwarded-for') || request.ip,
    },
    // Add other properties if your Passport strategy or middleware expects them
    // e.g., cookies, body (though for GET, body is irrelevant)
  };

  // Wrap the Passport authentication call in a Promise
  // This allows us to use async/await syntax and resolve the Next.js Response.
  return new Promise((resolve, reject) => {
    let _internalHeaders = new Headers(); // Internal Headers object to collect Passport's headers
    let _internalStatusCode = 200; // Internal status code to capture Passport's status

    // Create a mock Node.js response object for Passport.js
    const mockRes = {
      // Mimic Node.js http.ServerResponse methods for Passport to interact with
      setHeader: function(name, value) {
        _internalHeaders.set(name, value);
      },
      getHeader: function(name) {
        return _internalHeaders.get(name);
      },
      getHeaders: function() {
        return Object.fromEntries(_internalHeaders.entries());
      },
      removeHeader: function(name) {
        _internalHeaders.delete(name);
      },
      hasHeader: function(name) {
        return _internalHeaders.has(name);
      },
      writeHead: function(statusCode, statusMessage, headers) {
        if (typeof statusMessage === 'object' && statusMessage !== null) {
          headers = statusMessage;
          statusMessage = undefined;
        }
        _internalStatusCode = statusCode; // Capture status from writeHead
        if (headers) {
          for (const name in headers) {
            _internalHeaders.set(name, headers[name]);
          }
        }
      },
      // Properties that Passport might set or check directly
      // These are made reactive using Object.defineProperty below
      statusCode: _internalStatusCode,
      statusMessage: '',
      finished: false,
      writableEnded: false,

      // Core methods Passport uses for sending response (not typically called for initial OAuth redirect)
      end: function(chunk, encoding, callback) {
        // If Passport calls `end` instead of `redirect`, it means the flow didn't redirect as expected.
        resolve(new NextResponse(chunk, { status: _internalStatusCode, headers: _internalHeaders }));
      },
      send: function(body) {
        resolve(new NextResponse(body, { status: _internalStatusCode, headers: _internalHeaders }));
      },
      json: function(data) {
        _internalHeaders.set('Content-Type', 'application/json');
        resolve(NextResponse.json(data, { status: _internalStatusCode, headers: _internalHeaders }));
      },
      status: function(code) {
        _internalStatusCode = code;
        return this; // Allow chaining
      },
      // The critical `redirect` method that `passport.authenticate` will call
      redirect: function(url) {
        // Passport sets 'Location' header via setHeader/writeHead before calling redirect().
        // We ensure that header is indeed present here or use the provided URL.
        let finalRedirectUrl = url;
        if (_internalHeaders.has('Location')) {
            finalRedirectUrl = _internalHeaders.get('Location');
        }

        // Use the status code that Passport has already set (e.g., 302, 307).
        // If not a valid redirect status, default to 307 (Temporary Redirect) for POST-like redirects.
        const finalRedirectStatus = (_internalStatusCode >= 300 && _internalStatusCode < 400)
                                    ? _internalStatusCode
                                    : 307; // Default to 307 for initial OAuth redirect

        const response = NextResponse.redirect(finalRedirectUrl, { status: finalRedirectStatus });

        // Apply any other collected headers from our internal Headers object to the NextResponse
        // Avoid setting 'Location' again as NextResponse.redirect handles it.
        for (const [name, value] of _internalHeaders.entries()) {
            if (name.toLowerCase() !== 'location') { // Don't override Location header
                response.headers.set(name, value);
            }
        }
        resolve(response); // IMMEDIATELY RESOLVE with the redirect response
      },
    };

    // Make properties reactive for Passport's direct assignments
    // This ensures Passport can directly set `mockRes.statusCode` etc.
    Object.defineProperty(mockRes, 'statusCode', {
        get() { return _internalStatusCode; },
        set(value) { _internalStatusCode = value; }
    });
    Object.defineProperty(mockRes, 'finished', {
        get() { return false; }, // Passport typically doesn't set this to true before redirecting
        set(value) { /* ignore, or handle if needed for specific Passport versions */ }
    });
    Object.defineProperty(mockRes, 'writableEnded', {
        get() { return false; }, // Passport typically doesn't set this to true before redirecting
        set(value) { /* ignore, or handle if needed for specific Passport versions */ }
    });


    // Call passport.authenticate for the 'google' strategy
    // Passport will internally handle the redirect to Google's OAuth consent screen.
    passport.authenticate("google", {
      scope: ["profile", "email"], // Request user's profile and email
      session: false, // Do not create a session (we're using JWTs)
    })(mockReq, mockRes, (err) => {
      // This 'next' callback means passport.authenticate did NOT perform a redirect.
      // This is an unexpected path for initial Google OAuth, indicating a deeper Passport config issue.
      if (err) {
        console.error("Passport GET /api/auth/google error (from next() callback):", err);
        // Redirect to an error page or display an error message
        const response = NextResponse.redirect('http://localhost:3000/?a=auth_error&msg=server_error', { status: 302 });
        return resolve(response);
      }
      console.error("Passport GET /api/auth/google: Authentication finished without redirect. This is unexpected. Check Passport strategy configuration.");
      // If no redirect, return an internal server error response
      const response = NextResponse.json({ message: "Authentication process failed unexpectedly. Check server logs." }, { status: 500 });
      resolve(response);
    });
  });
}
