/* 
  Copyright 2013 Mozilla Foundation
 
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

var express = require( "express" );

var fogin = express(),
    user = "user",
    pass = "pass",
    basicAuth = express.basicAuth( function ( username, password ) {
      return (username === user && password === pass);
    });
 
// Configuration

fogin.configure( function(){
  fogin.set( "views", __dirname + "/views" );
  fogin.set( "view engine", "ejs" );
  fogin.use( fogin.router );
  fogin.use( express.bodyParser );
  fogin.use( express.errorHandler( { dumpExceptions: true, showStack: true } ) );
});

//Fogin GET USER
fogin.get( '/user/:id', basicAuth, function ( req, res ) {
  var id = req.params.id;

  if ( id === "foo@foo.com" ) {
    return res.json(200, { 
      error: null,
      user: {
        _id: "foo@foo.com",
        email: "foo@foo.com",
        subdomain: "bar",
        isAdmin: true
      }
    });
  }

  return res.json( 404, { error: "User not found for ID: " + id, user: null } );
});

//Fogin isAdmin
fogin.get( '/isAdmin', basicAuth, function ( req, res ) {
  var id = req.query.id;

  if ( id === "foo@foo.com" ) {
    return res.json( { error: null, isAdmin: true } );
  }
      
  return res.json( 404, { error: "User not found for ID: " + id, isAdmin: false } );

});

fogin.listen( 8887, function () {
  if ( process.send ) {
    process.send( 'Started' );
  }
});

