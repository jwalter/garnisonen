var scraper = require('scraper');

exports.scrape = function (req, res) {
  scraper(
  {
    'uri': 'http://du-o-ja.se/',
    'encoding': 'binary'
  }
  , 
  function(err, jQuery) {
    if (err) {throw err;}
    res.render('lunch', parseJQuery(jQuery));
  });
}

function parseJQuery(jQuery) {
  console.log("Parsing");
  var dayNames = ['Må', 'Ti', 'On', 'To', 'Fr'];
  var header = '';
  var dishes = new Array();
  var days = 'MåndagTisdagOnsdagTorsdagFredag';
  var menuFound = false;
  var lastRowWasDay = false;
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
        lastRowWasDay = false;
        console.log('Adding dish: ' + curText);
      } else if (menuFound) {
        console.log('curText=' + curText);
        lastRowWasDay = days.indexOf(curText) != -1;
      }
    }
  });
  return {title: 'Du-o-ja', header: header, dishes: dishes, dayNames: dayNames};
}