/*
 * Copyright (c) 2011-2012 mono
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

function UserStream(oauth) {
  this.oauth = oauth;
}

UserStream.USER_STREAM_URI = 'https://userstream.twitter.com/1.1/user.json';

UserStream.prototype.start = function(callback) {
  this.oauth.authorize(function() {
    var wait = 0;
    var connectionError = false;
    var connect = function() {
      var method = 'GET';
      var xhr = new XMLHttpRequest();
      var signedUrl = this.oauth.signURL(UserStream.USER_STREAM_URI, method, { oauth_version: '1.0' });
      xhr.open(method, signedUrl, true);

      var items = 0;
      var offset = 0;
      var elapsed = 0;
      var interval = setInterval(function() {
        if(++elapsed > 90) {
          connectionError = true;
          xhr.abort();
          return;
        }
        if(items > 500) {
          connectionError = false;
          xhr.abort();
          return;
        }
        var responseText = xhr.responseText;
        for(; ; ) {
          var index = responseText.indexOf("\r", offset);
          if(index == -1) {
            break;
          }
          var line = responseText.substr(offset, index - offset);
          if(line.length >= 2) {
            callback(JSON.parse(line));
            ++items;
          }
          offset = index + 2;
          elapsed = 0;
        }
      }, 1000);

      xhr.onreadystatechange = function(data) {
        if(xhr.readyState == 4) {
          clearInterval(interval);
          if(connectionError || xhr.status != 200) {
            if(wait === 0) {
              wait = 20000;
            }
            else if(wait < 240000) {
              wait *= 2;
            }
            connectionError = false;
          }
          else {
            wait = 0;
          }
          setTimeout(connect, wait);
        }
      };
      xhr.send(null);
    };
    connect();
  });
};



