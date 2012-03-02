var scraper = require('scraper');
var days2 = 'Måndag:Tisdag:Onsdag:Torsdag:Fredag:';
var Offer = require('./offer');

exports.scrape = function (req, res, resultHandler) {
  scraper(
  {
    'uri': 'http://www.brigaden.net/1/1.0.1.0/26/1/',
    'encoding': 'utf8'
  }
  , 
  function(err, jQuery) {
    if (err) {throw err;}
    parseJQuery(jQuery, resultHandler);
  });
}

exports.title = function() {
  return 'Brigaden';
}

function parseJQuery(jQuery, resultHandler) {
  console.log("Parsing");
  var header = '';
  var offers = new Array();
  var dishes = new Array();
  var dishesLeft = 0;
  var dishText = '';
  var curDay = '';
  header = 'Brigaden ' + jQuery('span').find('h2').text().trim();
  jQuery('span').find('p,div').
    each(function() {
      var curText = jQuery(this).find('strong').text().trim();
      if (curText.length > 0 && days2.indexOf(curText) != -1) {
        console.log('Found new day: ' + curText);
        curDay = curText.substring(0, curText.length - 1);
        dishes = new Array();
        if (curText === 'Måndag:') {
          dishText = jQuery(this).contents().last().text().trim();
          if (dishText.length > 0) {
            dishesLeft = 3;
            dishes.push(dishText);
          } else {
            dishesLeft = 4;
          }
        } else {
          dishText = '';
          dishesLeft = 4;                    
        }
      } else if (dishesLeft > 0) {
        curText = jQuery(this).text().trim();
        if (dishesLeft == 4) {
          dishText = curText;
        } else {
          dishText += '<BR>' + curText;
        }
        dishes.push(curText);
        if (dishesLeft == 1) {
          var o = new Offer();
          o.day = curDay;
          o.shortDay = curDay.substring(0, 2);
          o.dishes = dishes;
          offers.push(o);
        }
        console.log('dish=' + curText);
        dishesLeft--;
      }
            
    });
  resultHandler(offers, header);
}