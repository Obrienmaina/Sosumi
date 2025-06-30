// app/api/google/route.js
import connectDB from "../../../Lib/config/db";
import passport from "passport";
import "../../../Lib/config/passport"; // This initializes your passport strategies
import { NextResponse } from "next/server";

export async function GET(request) {
  await connectDB();

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
    let _internalStatusCode = 200;

    const mockRes = {
      // Mimic Node.js http.ServerResponse methods
      setHeader: function(name, value) {
        // console.log(`mockRes.setHeader called: ${name} = ${value}`); // Log here
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
        // console.log(`mockRes.writeHead called: ${statusCode}`); // Log here
        if (typeof statusMessage === 'object' && statusMessage !== null) {
          headers = statusMessage;
          statusMessage = undefined;
        }
        _internalStatusCode = statusCode;
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

      // Core methods Passport uses for sending response (these are not primary for initial redirect)
      end: function(chunk, encoding, callback) {
        // console.log('mockRes.end called');
        // This is usually not called by Passport for a redirect.
        // If it's called, it means Passport didn't redirect.
        resolve(new NextResponse(chunk, { status: _internalStatusCode, headers: _internalHeaders }));
      },
      send: function(body) {
        // console.log('mockRes.send called');
        resolve(new NextResponse(body, { status: _internalStatusCode, headers: _internalHeaders }));
      },
      json: function(data) {
        // console.log('mockRes.json called');
        _internalHeaders.set('Content-Type', 'application/json');
        resolve(NextResponse.json(data, { status: _internalStatusCode, headers: _internalHeaders }));
      },
      status: function(code) {
        // console.log(`mockRes.status called: ${code}`);
        _internalStatusCode = code;
        return this; // Allow chaining
      },
      // The critical redirect method that passport.authenticate will call
      redirect: function(url) {
        // console.log(`mockRes.redirect called with URL: ${url}`); // Log here!

        // NextResponse.redirect implicitly sets Location and a 307 status.
        // If Passport explicitly set a Location header via setHeader/writeHead,
        // we'll ensure it's captured and used by NextResponse.
        let finalRedirectUrl = url;
        if (_internalHeaders.has('Location')) {
            finalRedirectUrl = _internalHeaders.get('Location');
            // console.log(`Using Location header from internal headers: ${finalRedirectUrl}`);
        }

        const response = NextResponse.redirect(finalRedirectUrl);

        // Apply all *other* collected headers to the Next.js Response object
        // The 'Location' header is already handled by NextResponse.redirect(url)
        // and should be correct if finalRedirectUrl is derived from _internalHeaders.
        for (const [name, value] of _internalHeaders.entries()) {
            // Avoid setting 'Location' header again if NextResponse.redirect already handled it
            if (name.toLowerCase() !== 'location') {
                response.headers.set(name, value);
            }
        }
        // Ensure the status code matches what Passport might have set (e.g., 302 or 307)
        response.status = _internalStatusCode;

        resolve(response); // IMMEDIATELY RESOLVE with the redirect response
      },
    };

    // Make properties reactive for Passport's direct assignments
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

    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
    })(mockReq, mockRes, (err) => {
      // This 'next' callback means passport.authenticate did NOT perform a redirect.
      // This is an unexpected path for initial Google OAuth, indicating a deeper Passport config issue.
      if (err) {
        console.error("Passport GET /api/google error (from next() callback):", err);
        const response = NextResponse.redirect('http://localhost:3000/?a=auth_error&msg=server_error');
        return resolve(response);
      }
      console.error("Passport GET /api/google: Authentication finished without redirect. This is unexpected. Check Passport strategy configuration.");
      const response = NextResponse.json({ message: "Authentication process failed unexpectedly. Check server logs." }, { status: 500 });
      resolve(response);
    });
  });
}
