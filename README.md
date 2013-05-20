Webmaker-LoginAPI
============

## Setup

Setup is easy!  Add to your package.json and run `npm install`.

## Integration

Pass the module:

1. An http address including a user/pass according to the `http` uri scheme: `http://user:pass@webmakerServer.foo`

2. Your app's express instance

i.e. 

`require( "webmaker-loginapi" )( "http://admin:roflcoptor@login.wm.org", expressApp )`

## API Exposure

By passing the express object to this module, you are automatically adding a proxy to this module's `getUser` method through the following route:

```javascript
app.get( "/user/:userid", function( req, res ) {
  loginAPI.getUser(req.param( 'userid' ), function( err, user ) {
    if ( err || !user ) {
      return res.json( 404, {
      status: "failed",
      reason: ( err || "user not defined" )
      });
    }
    req.session.webmakerid = user.subdomain;
    res.json( 200, {
      status: "okay",
      user: user
    });
  });
});
```

## Usage

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
