var $tt;
var $container;
var s3 = false;
var total;
var lowest_price, highest_price;
var base_font = 12;

$(document).ready(function(){
  var doc = location.search.split('=')[1];
  if (typeof doc === 'undefined') {
    doc = $('#menu').val();
  } else {
    $('#menu').val(doc);
  }

  $tt = $('#tooltip');
  $container = $('#baba');
  $('#menu').change(function(e){
    reset();
    load(this.value);
  });

  load($('#menu').val());
});

function map (n, start1, stop1, start2, stop2) {
  return ((n-start1)/(stop1-start1))*(stop2-start2)+start2;
};

function reset() {
  $container.html('');
}

function load(f) {
  $.get(f + '.csv', function(data){
    var data = $.csv.toArrays(data);
    data.sort(function(a, b) {
      return (b[3] - a[3]);
    });
    total = data.length;

    var prices = [];
    for (var i = 0; i < data.length; i++) {
      prices.push(data[i][3] * data[i][2]);
    }

    lowest_price = Math.min.apply(Math, prices);
    highest_price = Math.max.apply(Math, prices);

    for (var i = 0; i < data.length; i++) {
      add_item(data[i], i);
    }

  });
}

function add_item(item, ind) {
  var img = $('<img>').addClass('not-loaded');
  var $col = $('<a>').addClass('item');
  var quantity = item[3];
  var max_price = item[2]
  var cost = quantity * max_price;
  var src = s3 ? 'http://baabaa.s3.amazonaws.com/images/' : 'public/images/'
  src += item[9];

  $col.data('min-purchase', parseFloat(item[5]));
  $col.attr('target', '_blank');
  $col.attr('href', item[6]);
  img.css({width: map(Math.pow(quantity * max_price, 1/4), Math.pow(lowest_price, 1/4), Math.pow(highest_price, 1/4), 20, 300)})
  $col.css({
    fontSize: base_font,
    backgroundImage: "url('"+ src +"')",
    width: map(Math.pow(quantity * max_price, 1/4), Math.pow(lowest_price, 1/4), Math.pow(highest_price, 1/4), 30, 90) + '%',
  })

  img.attr('src', src);
  img.data('original', src);

  $col.append('<div>' + item[0] + '<span>: Minimum order of <b>' + item[3].toLocaleString() + ' ' + item[4] + '</b> for <b>$' + cost.toLocaleString() + '</b></span></div>');

  $col.hover(function() {
    $col.css({
      transform: 'scaleX(2) scaleY(2)',
      'z-index': 999,
      padding: 30,
    });
  }, function() {
    $col.css({
      transform: 'scaleX(1) scaleY(1)',
      'z-index':1,
      padding: '.1em',
    });
  });
  $('#baba').append($col);
}
