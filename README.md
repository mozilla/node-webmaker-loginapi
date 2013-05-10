Webmaker-SSO
============

## Setup

Setup is easy!  Add to your package.json and run `npm install`.

## Integration

Pass the module an http address including a username password according to the `http` uri scheme:

`http://user:pass@webmakerServer.foo`

i.e. 

`require( "webmaker-sso" )("http://admin:roflcoptor@login.wm.org")`

## Usage

The module returns an object with two methods:

`loginHandle.getUser ( _id, callback )`

 ...which retrieves the user model for the passed `id`, passing the callback the parameters `( errorString, userObject )` and

`loginHandle.isAdmin ( _id, callback )`

 ...which retrieves the user permissions for the passed `id`, passing the callback the parameters `( errorString, [isAdmin] )` 

See: https://github.com/mozilla/login.webmaker.org/wiki/LoginAPI-&-User-Model
