var scraper = require('scraper');
var Offer = require('./offer');

exports.scrape = function (req, res, resultHandler) {
  scraper(
  {
    'uri': 'http://du-o-ja.se/',
    'encoding': 'binary'
  }
  , 
  function(err, jQuery) {
    if (err) {throw err;}
    parseJQuery(jQuery, resultHandler);
  });
}

exports.title = function() {
  return 'Du-o-ja';
}

function parseJQuery(jQuery, resultHandler) {
  console.log("Parsing");
  var header = '';
  var dishes = new Array();
  var offers = new Array();
  var days = 'MåndagTisdagOnsdagTorsdagFredag';
  var menuFound = false;
  var lastRowWasDay = false;
  var curDay = '';
  jQuery('p').first().contents().filter('h5').remove().end().
  each(function parseRow() {
    var curText = jQuery(this).text().trim();
    if (!menuFound) {
      menuFound = curText.indexOf('Lunchmeny v.') != -1;
      if (menuFound) {
        header = 'Du-o-ja ' + curText;
      }
    }
    if (curText.length > 0) {
      if (lastRowWasDay) {
        dishes.push(curText);
        o = new Offer();
        o.day = curDay;
        o.shortDay = curDay.substring(0, 2);
        o.dishes = dishes;
        offers.push(o);
        lastRowWasDay = false;
        console.log('Adding dish: ' + curText);
      } else if (menuFound) {
        console.log('curText=' + curText);
        if (days.indexOf(curText) != -1) {
          lastRowWasDay = true;
          curDay = curText;
          dishes = new Array();
        }
        lastRowWasDay = days.indexOf(curText) != -1;
      }
    }
  });
  resultHandler(offers, header);
}