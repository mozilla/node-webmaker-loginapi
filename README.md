Webmaker-LoginAPI
============

## Setup

Setup is easy!  Add to your package.json and run `npm install`.

## Integration

Pass the module:

1. An http address including a user/pass according to the `http` uri scheme: `http://user:pass@webmakerServer.foo`

2. Your app's express instance

    NOTE: Do not call the constructor-function returned by the `require()` until all of your server's general middleware has been declared.

i.e. 

```javascript
var loginHandle = require( "webmaker-loginapi" )( expressApp, "http://admin:roflcoptor@login.wm.org" );
```

## API Exposure

Instantiating this module creates the `GET /user/:id` route in the parent app for use during SSO integration. It exposes the Webmaker username associated with valid persona credentials as `req.session.username`.

The route will return `{ status: "okay", user: user }` when successful, and `{ status: "failure", reason: "error message" }` when not.

## Methods

The module returns an object with two methods:

`loginHandle.getUser ( id, callback )`

 ...which retrieves the user model for the passed `id`, passing the callback the parameters `( errorString, userObject )` and

`loginHandle.isAdmin ( id, callback )`

 ...which retrieves the user permissions for the passed `id`, passing the callback the parameters `( errorString, [isAdmin] )` 

See: https://github.com/mozilla/login.webmaker.org/wiki/LoginAPI-&-User-Model

## Testing

Ensure the `grunt` and `mocha` npm modules are installed globally, then run

1.  `grunt`
2.  `mocha`
