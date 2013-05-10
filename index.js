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

// Global requires
var request = require( "request" ),
    url = require( "url" );

// Module.exports
module.exports = function ( rawUrl ) {
  var parsedUrl = url.parse( rawUrl ),
      webmakerUrl = parsedUrl.href + parsedUrl.host,
      auth = parsedUrl.auth.split(":");
      
      auth = {
        user: auth[0],
        pass: auth[1]
      };

  return {
    getUser: function ( id, callback ) {
      request.auth( auth.user, auth.pass )
        .get( webmakerUrl + "/user/" + id, function ( error, response, body ) {
          if ( error || body.error ) {
            return callback( error || body.error );
          }

          callback( null, body.user );
        });
    },
    isAdmin: function ( id, callback ) {
      request.auth( auth.user, auth.pass, false )
        .get( webmakerUrl + "/isAdmin?id=" + id, function ( error, response, body ) {
          if ( error || body.error ) {
            return callback( error || body.error );
          }

          callback( null, body.isAdmin );
        });
    }
  };
};
