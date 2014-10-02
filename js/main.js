var total_items = 0;
var counter;
var total_width = 0;
var height;
var scale = 100;
var $tt;
var $baba;
var show_details = true;
var zooming = false;

$(document).ready(function(){
  $tt = $('#tooltip');
  $baba = $('#baba');
  set_height();

  $(window).resize(function(){
    set_height();
  });

  $('#show_details').click(function(e){
    e.preventDefault();
    show_details = !show_details;
    if (show_details) {
      $(this).text("Hide item details");
    } else {
      $(this).text("Show item details");
    }
  });

  $.get('riot4.csv', function(data){
    var data = $.csv.toArrays(data);
    draw(data);
  });

  $('#left').click(function(){
    $('body').animate({scrollLeft: $(window).scrollLeft() - $(window).width()});
  });

  $('#right').click(function(){
    $('body').animate({scrollLeft: $(window).scrollLeft() + $(window).width()});
  });

  $baba.on('mousewheel', function(e) {
    old_scale = scale;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      scale += e.deltaY * 2;
      if (scale < 100) scale = 100;
      if (counter === 0) {
        set_scale(scale, old_scale, e);
      }
    }
  });
});

function draw(data) {
  total_items = counter = data.length;
  data.sort(function(a, b) {
    return (b[3]*b[2] - a[3] * a[2]);
  });
  for (var i = 0; i < total_items; i++) {
    add_item(data[i]);
  }
}

function add_item(item) {
  var img = new Image();
  var $col = $('<a>').addClass('item');
  var quantity = item[3];
  var max_price = item[2]
  var cost = quantity * max_price;

  $baba.append($col);

  $(img).load(function(){
    var h = height / quantity;
    var w = (h/this.height) * this.width;

    $col.css({
      'background-image': 'url(' + this.src + ')',
      'background-size': w + 'px ' + h + 'px',
      width: w
    });

    $col.data('w', w);
    $col.data('h', h);

    $col.hover(function() {
      if (show_details && !zooming) {
        $col.addClass('hover');
        $tt.html('<h1>' + item[0] + '</h1><span>Minimum order of <b>' + quantity.toLocaleString() + '</b> for <b>$' + cost.toLocaleString() + '</b></span>');
        $tt.append(img);
        $tt.show();
        $(window).mousemove(function(e){
          var scrollX = $(window).scrollLeft();
          var tt_height = $tt.height();
          var tt_width = 300;

          var posX = e.pageX - tt_width / 2;
          var posY = e.pageY + 50;

          if (posX < scrollX) posX = scrollX;
          if (posX + tt_width > scrollX + $(window).width()) posX = $(window).width() + scrollX - tt_width;
          if (posY + tt_height > height) posY = e.pageY - 50 - tt_height;

          $tt.offset({left: posX, top: posY});
        });
      }
    }, function() {
      if (show_details && !zooming) {
        $col.removeClass('hover');
        $tt.hide();
        $(window).unbind('mousemove');
      }
    });

    $col.attr('target', '_blank');
    $col.attr('href', item[6]);

    total_width += w;
    counter --;
    if (counter == 0) resize_window();
  });

  img.src = 'images/' + item[9];

}

function set_scale(s, os, e) {
  if (show_details) $tt.hide();
  var old_width = total_width;
  total_width = 0;
  $('.item').each(function(i){
    var w = $(this).data('w');
    var h = $(this).data('h');
    var new_w = (w * s/100);
    var new_h = (h * s/100);
    total_width += new_w;
    $(this).css({'background-size': + new_w + 'px ' + new_h + 'px', width: new_w});
  });
  resize_window();
  $(window).scrollLeft($(window).scrollLeft() * s/os);
}

function resize_window() {
  $baba.css({width: total_width});
}

function set_height() {
  height = $(window).height();
  $baba.css({height: height - $('#key').outerHeight(), marginTop: $('#key').outerHeight()});
}
