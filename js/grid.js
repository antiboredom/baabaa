var $tt;
var $container;
var s3 = false;
var total;
var lowest_price, highest_price;

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

  //$container.isotype({
    //transitionDuration: 0,
    //itemSelector: '.item',
  //});
  //$container.isotope({
    //itemSelector: '.item',
    //masonry: {
      //columnWidth: 50
    //}
  //});

  load($('#menu').val());
});

function map (n, start1, stop1, start2, stop2) {
  return ((n-start1)/(stop1-start1))*(stop2-start2)+start2;
};

function reset() {
  //$container.isotope('destroy')
  $container.html('');
}

function load(f) {
  $.get(f + '.csv', function(data){
    var data = $.csv.toArrays(data);
    data.sort(function(a, b) {
      return (b[3]*b[2] - a[3] * a[2]);
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
  $col.data('min-purchase', parseFloat(item[5]));
  $col.attr('target', '_blank');
  $col.attr('href', item[6]);
  //$col.css({width: map(quantity * max_price, lowest_price, highest_price, 200, 300)})


  var src = s3 ? 'http://baabaa.s3.amazonaws.com/images/' : 'public/images/'
  src += item[9];

  img.load(function(){
    total --;
    if (total == 0) {
      $container.isotope({
        transitionDuration: 0,
        itemSelector: '.item',
        layoutMode: 'packery',
      });
     }
  });

  img.attr('src', src);
  img.data('original', src);

  $col.append(img);
  //$col.append('<div><h1>' + item[0] + '</h1><span>Minimum order of <b>' + item[3].toLocaleString() + ' ' + item[4] + '</b> for <b>$' + cost.toLocaleString() + '</b></span></div>');

  $col.hover(function() {
    $col.addClass('hover');
    $tt.html('<h1>' + item[0] + '</h1><span>Minimum order of <b>' + item[3].toLocaleString() + ' ' + item[4] + '</b> for <b>$' + cost.toLocaleString() + '</b></span>');
    $tt.show();
    $(window).mousemove(function(e){
      var scrollX = $(window).scrollLeft();
      var tt_height = $tt.height();
      var tt_width = 300;

      var posX = e.pageX - tt_width / 2;
      var posY = e.pageY + 50;

      if (posX < scrollX) posX = scrollX;
      if (posX + tt_width > scrollX + $(window).width()) posX = $(window).width() + scrollX - tt_width;
      //if (posY + tt_height > height) posY = e.pageY - 50 - tt_height;

      $tt.offset({left: posX, top: posY});
    });
  }, function() {
    $col.removeClass('hover');
    $tt.hide();
    $(window).unbind('mousemove');
  });

  $('#baba').append($col);
}
