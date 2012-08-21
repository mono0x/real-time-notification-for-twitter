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

var Settings = {};

Settings.namespace = 'sync';
Settings.storage   = chrome.storage[Settings.namespace];

Settings.nextSync  = 0;

Settings.defaultData = {
  version: 1,
  notifyMentions: true,
  notifyDirectMessages: true,
  notifyRetweets: true,
  notifyFavorites: true,
  notifyUnfavorites: false,
  notifyFollows: true,
  autoHideMentions: true,
  autoHideDirectMessages: true,
  autoHideRetweets: true,
  autoHideFavorites: true,
  autoHideUnfavorites: true,
  autoHideFollows: true,
  autoHideTimeout: 10,
  filterInReplyTo: false
};

Settings.migrate = function() {
  if(!('options' in localStorage)) {
    return false;
  }
  var options = JSON.parse(localStorage.options);
  delete localStorage.options;
  try {
    Settings.data = {
      version: 1,
      notifyMentions: options.events.mention.enabled,
      notifyDirectMessages: options.events.directMessage.enabled,
      notifyRetweets: options.events.retweet.enabled,
      notifyFavorites: options.events.favorite.enabled,
      notifyUnfavorites: options.events.unfavorite.enabled,
      notifyFollows: options.events.follow.enabled,
      autoHideMentions: options.events.mention.autoHide,
      autoHideDirectMessages: options.events.directMessage.autoHide,
      autoHideRetweets: options.events.retweet.autoHide,
      autoHideFavorites: options.events.favorite.autoHide,
      autoHideUnfavorites: options.events.unfavorite.autoHide,
      autoHideFollows: options.events.follow.autoHide,
      autoHideTimeout: options.notification.autoHide.timeout,
      filterInReplyTo: options.events.mention.matchInReplyTo
    };
    return true;
  }
  catch(e) {
    console.log(e);
    return false;
  }
};

Settings.initialize = function() {
  Settings.load(function() {
    chrome.storage.onChanged.addListener(function(changes, namespace) {
      for(key in changes) {
        Settings.data[key] = changes[key].newValue;
      }
    }, Settings.namespace);
  });
};

Settings.load = function(callback) {
  if(Settings.migrate()) {
    if(callback) { callback(Settings.data); }
    return;
  }
  Settings.storage.get(null, function(data) {
    if(data.version) {
      Settings.data = data;
    }
    else {
      Settings.data = {};
      for(key in Settings.defaultData) {
        Settings.data[key] = Settings.defaultData[key];
      }
    }
    if(callback) { callback(Settings.data); }
  });
};

Settings.save = function(callback) {
  Settings.storage.set(Settings.data, function() {

    if(callback) { callback(); }
  });
};

Settings.get = function(key) {
  return (key in Settings.data) ? Settings.data[key] : Settings.defaultData[key];
};

Settings.set = function(key, value) {
  Settings.data[key] = value;
  Settings.save();
};

Settings.initialize();

