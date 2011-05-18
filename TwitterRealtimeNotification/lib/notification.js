/*
 * Copyright (c) 2011 mono
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

var parseQuery = function() {
  var queryString = location.search.substring(1);
  var query = {};
  queryString.split('&').forEach(function(pair) {
    var kv = pair.split('=');
    if(kv.length == 2) {
      query[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
    }
  });
  return query;
}

document.addEventListener('DOMContentLoaded', function() {
  var query = parseQuery();
  var title = document.getElementById('title');
  var icon = document.getElementById('icon');
  var content = document.getElementById('content');
  title.textContent = query.title;
  title.href = query.href;
  icon.src = query.iconUrl;
  content.textContent = query.content;
  title.addEventListener('click', function() {
    chrome.tabs.create({
      url: title.href
    });
    window.close();
    return false;
  }, false);
}, false);

