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

$(function() {
  var background = chrome.extension.getBackgroundPage();

  var Settings   = background.Settings;

  $('.group.notification').each(function() {
    var group   = $(this).attr('id');
    var name    = 'notify' + group;
    var element = $(this).find('#' + name);
    var details = $(this).find('.details input');

    element.prop('checked', Settings.get(name));
    element.click(function() {
      var checked = $(this).is(':checked');
      Settings.set(name, checked);
      details.prop('disabled', !checked);
    });
    details.each(function() {
      var e = $(this);
      var id = e.attr('id');
      e.prop('checked', Settings.get(id));
      e.click(function() {
        console.log('click', e);
        Settings.set(id, e.is(':checked'));
      });
    });
    details.prop('disabled', !Settings.get(name));
  });

  $('#autoHideTimeout').prop('valueAsNumber', Settings.get('autoHideTimeout'));
  $('#autoHideTimeout').change(function() {
    Settings.set('autoHideTimeout', $(this).prop('valueAsNumber'));
  });

  $('.text').each(function() {
    $(this).text(chrome.i18n.getMessage($(this).attr('id')));
  });

});
