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

var defaultOptions = {
  version: 1,
  events: {
    mention: {
      enabled: true,
      matchInReplyTo: false,
      automaticallyClose: true
    },
    directMessage: {
      enabled: true,
      automaticallyClose: false
    },
    retweet: {
      enabled: true,
      automaticallyClose: true
    },
    favorite: {
      enabled: true,
      automaticallyClose: true
    },
    unfavorite: {
      enabled: false,
      automaticallyClose: true
    },
    follow: {
      enabled: true,
      automaticallyClose: false
    }
  },
  notification: {
    automaticallyClose: {
      timeout: 30
    }
  }
};

var clone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

var merge = function(obj, other) {
  var result = clone(obj);
  for(var property in other) {
    if(result[property] === undefined) {
      result[property] = other[property];
    }
    else if(typeof result[property] == 'object') {
      result[property] = merge(result[property], other[property]);
    }
  }
  return result;
};

var load = function() {
  var options = localStorage.options;
  var result = options ? merge(JSON.parse(options), defaultOptions) : clone(defaultOptions);
  console.log('Options Loaded', result);
  return result;
};
var save = function(options_) {
  localStorage.options = JSON.stringify(merge(options_, defaultOptions));
  options = options_;
  console.log('Option Saved', options);
};

var oauth = ChromeExOAuth.initBackgroundPage({
  'request_url':     'https://twitter.com/oauth/request_token',
  'authorize_url':   'https://twitter.com/oauth/authorize',
  'access_url':      'https://twitter.com/oauth/access_token',
  'consumer_key':    'R78VhuLNcknz2HMBOGBag',
  'consumer_secret': 'vEB1TzUlssMKUSDqGC4UMTshOklw0t9O6Q7nbHBB08'
});

var verifyCredentialsUrl = 'https://api.twitter.com/1/account/verify_credentials.json';

var user = null;

var options = load();

var unescapeHTML = function(html) {
  return html.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g,'"').replace(/&amp;/g, '&');
};

var createQuery = function(obj) {
  return '?' + Object.keys(obj).map(function(key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
  }).join('&');
};

var notification = function(item) {
  console.log('Notification', item);
  var n = webkitNotifications.createHTMLNotification('notification.html' + createQuery(item));
  n.show();
  if(item.automaticallyClose) {
    setTimeout(function() {
      n.cancel();
    }, options.notification.automaticallyClose.timeout * 1000);
  }
};

var onMention = function(item) {
  notification({
    href:    'https://twitter.com/#!/' + item.user.screen_name + '/statuses/' + item.id_str,
    iconUrl: item.user.profile_image_url,
    title:   chrome.i18n.getMessage('notifications_mention_title', [ item.user.name, item.user.screen_name ]),
    content: unescapeHTML(item.text),
    automaticallyClose: options.events.mention.automaticallyClose
  });
};
var onDirectMessage = function(item) {
  notification({
    href:    'https://twitter.com/#!/messages',
    iconUrl: item.direct_message.sender.profile_image_url,
    title:   chrome.i18n.getMessage('notifications_directMessage_title', [ item.direct_message.sender.name, item.direct_message.sender.screen_name ]),
    content: unescapeHTML(item.direct_message.text),
    automaticallyClose: options.events.directMessage.automaticallyClose
  });
};
var onRetweet = function(item) {
  notification({
    href:    'https://twitter.com/#!/' + item.retweeted_status.user.screen_name + '/statuses/' + item.retweeted_status.id_str,
    iconUrl: item.user.profile_image_url,
    title:   chrome.i18n.getMessage('notifications_retweet_title', [ item.user.name, item.user.screen_name ]),
    content: unescapeHTML(item.retweeted_status.text),
    automaticallyClose: options.events.retweet.automaticallyClose
  });
};
var onFollow = function(item) {
  notification({
    href:    'https://twitter.com/#!/' + item.source.screen_name,
    iconUrl: item.source.profile_image_url,
    title:   chrome.i18n.getMessage('notifications_follow_title', [ item.source.name, item.source.screen_name ]),
    content: unescapeHTML(item.source.description),
    automaticallyClose: options.events.follow.automaticallyClose
  });
};
var onFavorite = function(item) {
  notification({
    href:    'https://twitter.com/#!/' + item.target_object.user.screen_name + '/statuses/' + item.target_object.id_str,
    iconUrl: item.source.profile_image_url,
    title:   chrome.i18n.getMessage('notifications_favorite_title', [ item.source.name, item.source.screen_name ]),
    content: unescapeHTML(item.target_object.text),
    automaticallyClose: options.events.favorite.automaticallyClose
  });
};
var onUnfavorite = function(item) {
  notification({
    href:    'https://twitter.com/#!/' + item.target_object.user.screen_name + '/statuses/' + item.target_object.id_str,
    iconUrl: item.source.profile_image_url,
    title:   chrome.i18n.getMessage('notifications_unfavorite_title', [ item.source.name, item.source.screen_name ]),
    content: unescapeHTML(item.target_object.text),
    automaticallyClose: options.events.unfavorite.automaticallyClose
  });
};

var onReceive = function(item) {
  switch(item.event) {
  case 'favorite':
    if(options.events.favorite.enabled) {
      if(item.source.id_str != user.id_str) {
        onFavorite(item);
      }
    }
    break;
  case 'unfavorite':
    if(options.events.unfavorite.enabled) {
      if(item.source.id_str != user.id_str) {
        onUnfavorite(item);
      }
    }
    break;
  case 'follow':
    if(options.events.follow.enabled) {
      if(item.source.id_str != user.id_str) {
        onFollow(item);
      }
    }
    break;
  default:
    if(item.retweeted_status) {
      if(options.events.retweet.enabled) {
        if(item.retweeted_status.user.id_str === user.id_str) {
          onRetweet(item);
        }
      }
    }
    else if(item.text && item.text.indexOf('@' + user.screen_name) != -1) {
      if(options.events.mention.enabled) {
        if(options.events.mention.matchInReplyTo) {
          if(item.in_reply_to_user_id_str === user.id_str) {
            onMention(item);
          }
        }
        else {
          onMention(item);
        }
      }
    }
    else if(item.direct_message) {
      if(options.events.directMessage.enabled) {
        if(item.direct_message.sender.id_str != user.id_str) {
          onDirectMessage(item);
        }
      }
    }
  }
};

oauth.authorize(function() {
  oauth.sendSignedRequest(verifyCredentialsUrl, function(data, xhr) {
    if(xhr.status != 200) {
      return;
    }
    user = JSON.parse(data);

    var userstream = new UserStream(oauth);
    userstream.start(onReceive);
  }, 'GET');
});

