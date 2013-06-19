Webmaker-LoginAPI
============

## Setup

Setup is easy!  Add to your package.json and run `npm install`.

## Integration

Pass the module:

1. Your app's express instance

    NOTE: Do not call the constructor-function returned by the `require()` until all of your server's general middleware has been declared.

2. An options object that will pass options used for [Express Persona](https://github.com/jbuck/express-persona) and our SSO integration.

### Required Options

* `audience` - The URL of your express app when viewed in a browser. Must include the protocol, hostname, and port.
  * Example: `http://example.org:80`, `https://example.org:443`
* `loginURL` - An http address including a user/pass according to the `http` uri scheme.
  * Exmaple: - `http://user:pass@webmakerServer.foo`

### Optional Options
* `verifyResponse` - A callback used for custom actions needed for individual apps. It is returned:
  * `res` - The server response object.
  * `data` - Contains information useful to determine app specific actions such as:
    ** `email` - The email of the Persona Users
    ** `user` - An object containing information about this Webmaker user.
    ** `status` - Just general information if things didn't fail.

i.e.

```javascript
var loginHandle = require( "webmaker-loginapi" )( expressApp, {
  loginURL: "http://admin:roflcoptor@login.wm.org",
  audience: "http://example.org:443"
});
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
