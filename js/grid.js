var $container;
var s3 = true;
var total;

$(document).ready(function(){

  $container = $('#baba');
  $('#menu').change(function(e){
    reset();
    load(this.value);
  });

  $container.masonry({
    transitionDuration: 0,
    itemSelector: '.item',
  });

  load($('#menu').val());
});

function reset() {
  $container.html('');
}

function load(f) {
  $.get(f + '.csv', function(data){
    var data = $.csv.toArrays(data);
    data.sort(function(a, b) {
      return (b[3]*b[2] - a[3] * a[2]);
    });
    total = data.length;
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

  var src = s3 ? 'http://baabaa.s3.amazonaws.com/images/' : 'public/images/'
  src += item[9];

  img.load(function(){
    total --;
    if (total % 50 == 0 || total == 0)
      $container.masonry('reload');
  });

  img.attr('src', src);
  img.data('original', src);

  $col.append(img);

  $('#baba').append($col);
}
