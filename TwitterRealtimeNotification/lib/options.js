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

$(function() {
var background = chrome.extension.getBackgroundPage();

(function() {

var options = background.load();

$('#events_mention_enabled').attr('checked', options.events.mention.enabled);
$('#events_mention_matchInReplyTo').attr('checked', options.events.mention.matchInReplyTo);
$('#events_directMessage_enabled').attr('checked', options.events.directMessage.enabled);
$('#events_retweet_enabled').attr('checked', options.events.retweet.enabled);
$('#events_favorite_enabled').attr('checked', options.events.favorite.enabled);
$('#events_unfavorite_enabled').attr('checked', options.events.unfavorite.enabled);
$('#events_follow_enabled').attr('checked', options.events.follow.enabled);

})();

var setMessage = function(name) {
  $('.' + name).text(chrome.i18n.getMessage(name));
};

setMessage('options_options');
setMessage('options_events');
setMessage('options_events_mention');
setMessage('options_events_mention_matchInReplyTo');
setMessage('options_events_mention_matchInReplyTo_help');
setMessage('options_events_directMessage');
setMessage('options_events_retweet');
setMessage('options_events_favorite');
setMessage('options_events_unfavorite');
setMessage('options_events_follow');
$('input[type="submit"]').val(chrome.i18n.getMessage('options_save'));

$('form').submit(function() {
  background.save({
    version: 1,
    events: {
      mention: {
        enabled: $('#events_mention_enabled').is(':checked'),
        matchInReplyTo: $('#events_mention_matchInReplyTo').is(':checked')
      },
      directMessage: {
        enabled: $('#events_directMessage_enabled').is(':checked')
      },
      retweet: {
        enabled: $('#events_retweet_enabled').is(':checked')
      },
      favorite: {
        enabled: $('#events_favorite_enabled').is(':checked')
      },
      unfavorite: {
        enabled: $('#events_unfavorite_enabled').is(':checked')
      },
      follow: {
        enabled: $('#events_follow_enabled').is(':checked')
      }
    }
  });
  return false;
});

});
