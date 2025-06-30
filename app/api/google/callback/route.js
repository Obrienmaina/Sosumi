// app/api/google/callback/route.js
import { setCookie } from "cookies-next";
import passport from "passport";
import connectDB from "../../../../Lib/config/db"; // Ensure this path is correct
import { NextResponse } from "next/server";

export async function GET(request) { // It's a GET request from Google's redirect
  await connectDB();

  // Mock Request object for Passport compatibility
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

  return new Promise((resolve, reject) => {
    let _internalHeaders = new Headers(); // Use a Headers object internally
    let _internalStatusCode = 200; // Will capture what Passport sets initially

    // Track state for mockRes
    let _finished = false;
    let _writableEnded = false;
    let _body = '';

    // Mock Response object for Passport compatibility
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
      statusCode: _internalStatusCode, // Initial value, will be overridden by getter/setter
      statusMessage: '',
      finished: _finished,
      writableEnded: _writableEnded,

      // Core methods Passport uses for sending response (not primary for redirects)
      end: function(chunk, encoding, callback) {
        if (chunk) { _body += chunk.toString(encoding || 'utf8'); }
        _finished = true;
        _writableEnded = true;
        // If this `end` is called for a non-redirect response, resolve here.
        // For redirects, the `redirect` method below will resolve.
        if (!_internalHeaders.has('Location')) { // Only resolve if not already a redirect
            resolve(new NextResponse(_body, { status: _internalStatusCode, headers: _internalHeaders }));
        }
      },
      send: function(body) {
        _body = body;
        _finished = true;
        _writableEnded = true;
        resolve(new NextResponse(body, { status: _internalStatusCode, headers: _internalHeaders }));
      },
      json: function(data) {
        _internalHeaders.set('Content-Type', 'application/json');
        _body = JSON.stringify(data);
        _finished = true;
        _writableEnded = true;
        resolve(NextResponse.json(data, { status: _internalStatusCode, headers: _internalHeaders }));
      },
      status: function(code) {
        _internalStatusCode = code; // Update internal status code
        return this; // Allow chaining
      },
      // The critical redirect method that passport.authenticate will call
      redirect: function(url) {
        // Passport sets 'Location' header and status code via setHeader/writeHead before calling redirect().
        // We ensure that header is indeed present here.
        if (!_internalHeaders.has('Location')) {
            _internalHeaders.set('Location', url);
        }

        // Use the status code that Passport has already set (e.g., 302, 307).
        // If for some reason Passport didn't set it (unlikely for a redirect), default to 302.
        const finalRedirectStatus = (_internalStatusCode >= 300 && _internalStatusCode < 400) 
                                    ? _internalStatusCode 
                                    : 302; // Default to 302 if not a valid redirect status

        const response = NextResponse.redirect(url, { status: finalRedirectStatus });

        // Apply any other collected headers from our internal Headers object to the NextResponse
        // Avoid setting 'Location' again as NextResponse.redirect handles it.
        for (const [name, value] of _internalHeaders.entries()) {
            if (name.toLowerCase() !== 'location') { // Don't override Location header
                response.headers.set(name, value);
            }
        }

        _finished = true;
        _writableEnded = true;
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
        get() { return _finished; },
        set(value) { _finished = value; }
    });
    Object.defineProperty(mockRes, 'writableEnded', {
        get() { return _writableEnded; },
        set(value) { _writableEnded = value; }
    });


    // Passport.authenticate callback made async to allow for profile completion checks
    // The `done` callback from your passport.js strategy will lead here.
    passport.authenticate("google", async (err, user, info) => {
      if (err) {
        console.error("Passport Google Callback Error:", err);
        // FIX: Always use a valid redirect status code (3xx) for redirects.
        // Do not use error codes like 500 here with NextResponse.redirect.
        const response = NextResponse.redirect('http://localhost:3000/?a=auth_error&msg=server_error', { status: 302 });
        return resolve(response);
      }
      if (!user) {
        console.warn("Passport Google Callback: No user found/created.");
        // This case indicates that Passport couldn't find/authenticate a user.
        const response = NextResponse.redirect('http://localhost:3000/?a=auth_fail', { status: 302 }); // Default to 302 for client redirect
        return resolve(response);
      }

      if (info && info.token) {
        // --- Profile Completion Check ---
        const isProfileComplete = user.firstName && user.lastName && user.country && user.agreedToTerms;

        const redirectUrl = isProfileComplete
            ? new URL("http://localhost:3000/profile") // Redirect to main profile if complete
            : new URL("http://localhost:3000/profile/complete"); // Redirect to completion page if incomplete

        // In this success path, Passport's `redirect` mock (mockRes.redirect) should have been called
        // internally by passport.authenticate and already handled the final redirect.
        // However, if we reach here, it implies custom handling.
        // Ensure finalRedirectStatus is a valid redirect code.
        const finalRedirectStatus = (_internalStatusCode >= 300 && _internalStatusCode < 400) 
                                    ? _internalStatusCode 
                                    : 302; // Default to 302 if Passport didn't set a redirect status

        const response = NextResponse.redirect(redirectUrl, { status: finalRedirectStatus });

        // Apply any headers set by Passport before setCookie (except 'Location' which is handled by NextResponse.redirect)
        for (const [name, value] of _internalHeaders.entries()) {
            if (name.toLowerCase() !== 'location') {
                response.headers.set(name, value);
            }
        }

        // Set the cookie using the Next.js Response object
        setCookie("token", info.token, {
          req: request,
          res: response, // Pass the Next.js Response object correctly
          maxAge: 60 * 60 * 24 * 7, // 7 days
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
          sameSite: 'Lax',
          path: '/'
        });

        return resolve(response);
      } else {
        console.error("Passport Google Callback: No token found in info object.");
        const response = NextResponse.redirect('http://localhost:3000/?a=auth_error&msg=no_token', { status: 302 });
        return resolve(response);
      }
    })(mockReq, mockRes, (err) => { // This is the final callback for passport.authenticate itself
      // Fallback error handler if passport.authenticate itself throws an unhandled error
      console.error("Passport Google Callback initial error (from next() callback):", err);
      // FIX: Always use a valid redirect status code (3xx) for redirects.
      // If it's truly an unrecoverable server error *before* the strategy runs,
      // consider returning a NextResponse.json with a 500 status instead of redirecting.
      // But if you must redirect, use 302.
      const response = NextResponse.redirect('http://localhost:3000/?a=auth_error&msg=initial_server_error', { status: 302 });
      resolve(response);
    });
  });
}
