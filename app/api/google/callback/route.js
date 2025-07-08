// app/api/auth/google/callback/route.js
// This route handles the callback from Google after successful authentication.

import { setCookie } from "cookies-next";
import passport from "passport";
import connectDB from "../../../../Lib/config/db"; // Adjust path as needed
import "../../../../Lib/config/passport"; // Ensure this file initializes your passport strategies
import { NextResponse } from "next/server";

export async function GET(request) { // Google redirects to this URL with auth code
  await connectDB(); // Ensure DB connection is established

  // Create a mock Node.js request object for Passport.js compatibility
  const mockReq = {
    query: Object.fromEntries(request.nextUrl.searchParams.entries()),
    headers: Object.fromEntries(request.headers.entries()),
    method: request.method,
    url: request.url,
    connection: {
      encrypted: request.url.startsWith('https://'),
      remoteAddress: request.headers.get('x-forwarded-for') || request.ip,
    },
  };

  // Wrap the Passport authentication call in a Promise
  return new Promise((resolve, reject) => {
    let _internalHeaders = new Headers(); // Internal Headers object to collect Passport's headers
    let _internalStatusCode = 200; // Internal status code to capture Passport's status

    // Create a mock Node.js response object for Passport.js
    const mockRes = {
      // Mimic Node.js http.ServerResponse methods
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
      statusCode: _internalStatusCode,
      statusMessage: '',
      finished: false,
      writableEnded: false,

      // Core methods Passport uses for sending response (not primary for redirects)
      end: function(chunk, encoding, callback) {
        if (chunk) { /* _body += chunk.toString(encoding || 'utf8'); */ }
        if (!_internalHeaders.has('Location')) {
            resolve(new NextResponse(chunk, { status: _internalStatusCode, headers: _internalHeaders }));
        }
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
        return this;
      },
      // The critical redirect method that passport.authenticate will call
      redirect: function(url) {
        if (!_internalHeaders.has('Location')) {
            _internalHeaders.set('Location', url);
        }

        const finalRedirectStatus = (_internalStatusCode >= 300 && _internalStatusCode < 400)
                                    ? _internalStatusCode
                                    : 302;

        // CRITICAL CHANGE: Create the NextResponse object here and resolve it.
        // setCookie will then modify this 'response' object directly.
        const response = NextResponse.redirect(url, { status: finalRedirectStatus });

        for (const [name, value] of _internalHeaders.entries()) {
            if (name.toLowerCase() !== 'location') {
                response.headers.set(name, value);
            }
        }
        // DO NOT resolve here yet, as setCookie needs to modify 'response'
        // resolve(response); // Removed this resolve
      },
    };

    Object.defineProperty(mockRes, 'statusCode', {
        get() { return _internalStatusCode; },
        set(value) { _internalStatusCode = value; }
    });
    Object.defineProperty(mockRes, 'finished', {
        get() { return false; },
        set(value) { /* ignore */ }
    });
    Object.defineProperty(mockRes, 'writableEnded', {
        get() { return false; },
        set(value) { /* ignore */ }
    });


    // Passport.authenticate callback
    passport.authenticate("google", async (err, user, info) => {
      if (err) {
        console.error("Passport Google Callback Error:", err);
        const response = NextResponse.redirect('http://localhost:3000/?a=auth_error&msg=server_error', { status: 302 });
        return resolve(response);
      }
      if (!user) {
        console.warn("Passport Google Callback: No user found/created.");
        const response = NextResponse.redirect('http://localhost:3000/?a=auth_fail', { status: 302 });
        return resolve(response);
      }

      if (info && info.token) {
        const isProfileComplete = user.firstName && user.lastName && user.country && user.agreedToTerms;

        const redirectUrl = isProfileComplete
            ? new URL("http://localhost:3000/profile")
            : new URL("http://localhost:3000/profile/complete");

        const finalRedirectStatus = (_internalStatusCode >= 300 && _internalStatusCode < 400)
                                    ? _internalStatusCode
                                    : 302;

        // Create the final response object here
        const response = NextResponse.redirect(redirectUrl, { status: finalRedirectStatus });

        // Apply any headers set by Passport before setCookie (except 'Location')
        for (const [name, value] of _internalHeaders.entries()) {
            if (name.toLowerCase() !== 'location') {
                response.headers.set(name, value);
            }
        }

        // Set the cookie using the Next.js Response object
        // This MUST be called on the 'response' object that will actually be returned.
        setCookie("token", info.token, {
          req: request,
          res: response, // Pass the Next.js Response object correctly
          maxAge: 60 * 60 * 24 * 7, // 7 days
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
          sameSite: 'Lax',
          path: '/'
        });

        // Add a debug log to see if the Set-Cookie header is being added
        console.log('Set-Cookie header on response:', response.headers.get('Set-Cookie'));

        return resolve(response); // Resolve the promise with the response that now has the cookie
      } else {
        console.error("Passport Google Callback: No token found in info object.");
        const response = NextResponse.redirect('http://localhost:3000/?a=auth_error&msg=no_token', { status: 302 });
        return resolve(response);
      }
    })(mockReq, mockRes, (err) => {
      console.error("Passport Google Callback initial error (from next() callback):", err);
      const response = NextResponse.redirect('http://localhost:3000/?a=auth_error&msg=initial_server_error', { status: 302 });
      resolve(response);
    });
  });
}
