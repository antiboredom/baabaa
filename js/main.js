var total_items = 0;
var counter;
var total_width = 0;
var height;
var scale = 100;
var $tt;
var $baba;
var show_details = true;
var zooming = false;
var use_canvas = false;
var max_per_row = 500;
var min_quantity, max_quantity;
var s3 = true;

$(document).ready(function(){
  if (navigator.userAgent.indexOf("Chrome") < 0) {// && navigator.userAgent.indexOf("Safari") < 0) {
    use_canvas = true;
    //$('#warning').show();
    //return false;
  }

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

  $('#left').click(function(){
    $('body').animate({scrollLeft: $(window).scrollLeft() - $(window).width()});
  });

  $('#right').click(function(){
    $('body').animate({scrollLeft: $(window).scrollLeft() + $(window).width()});
  });

  if (!use_canvas) {
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
  }

  $('#menu').change(function(e){
    reset();
    load(this.value);
  });

  load($('#menu').val());
});

function reset() {
  scale = 100;
  $('.item img').unbind();
  $('.item').unbind();
  $('body').scrollLeft(0);
  $baba.html('');
}

function load(f) {
  $.get(f + '.csv', function(data){
    var data = $.csv.toArrays(data);
    var quantities = [];
    data.forEach(function(d) {
      quantities.push(d[3]);
    });
    min_quantity = Math.min.apply(Math, quantities);
    max_quantity = Math.max.apply(Math, quantities);
    draw(data);
  });
}

function draw(data) {
  total_items = counter = data.length;
  total_width = 0;
  data.sort(function(a, b) {
    return (b[3]*b[2] - a[3] * a[2]);
  });
  for (var i = 0; i < total_items; i++) {
  //for (var i = 0; i < 10; i++) {
    add_item(data[i], i);
  }
  //sort();
}

function add_item(item, ind) {
  var img = new Image();
  var $col = $('<a>').addClass('item');
  var quantity = item[3];
  var max_price = item[2]
  var cost = quantity * max_price;
  $col.data('min-purchase', parseFloat(item[5]));

  if (use_canvas) {
    var $canv = $('<canvas>');
    var ctx = $canv[0].getContext('2d');
    $col.append($canv);
  }

  $baba.append($col);

  img.onload = function(){
    if (quantity > max_per_row) quantity = max_per_row;

    var h = height / quantity;
    var w = (h/img.height) * img.width;

    $col.data('w', w);
    $col.data('h', h);

    if (use_canvas) {
      $col.append(img);
      $col.data('quantity', quantity);

      $col.css({width: w, height: height});
      $canv[0].width = w;
      $canv[0].height = height;
      for (var i = 0; i < quantity; i ++) {
        ctx.drawImage(this, 0, i * h, w, h);
      }
    } else {
      $col.css({
        'background-image': 'url(' + img.src + ')',
        'background-size': w + 'px ' + h + 'px',
        width: w
      });
    }

    $col.hover(function() {
      if (show_details && !zooming) {
        $col.addClass('hover');
        $tt.html('<h1>' + item[0] + '</h1><span>Minimum order of <b>' + item[3].toLocaleString() + ' ' + item[4] + '</b> for <b>$' + cost.toLocaleString() + '</b></span>');
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
  };

  var src = s3 ? 'http://baabaa.s3.amazonaws.com/images/' : 'public/images/'
  img.src = src + item[9];

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
  height = window.innerHeight;
  $baba.css({height: height - $('#key').outerHeight(), marginTop: $('#key').outerHeight()});
}

var zoom = 1;

function zoom_in() {
  zoom = zoom * 2;
  set_zoom();
}

function zoom_out() {
  zoom = zoom / 2;
  if (zoom < 1) zoom = 1;
  set_zoom();
}

var zooming = false;

function set_zoom() {
  if (!zooming || 1==1) {
    total_width = 0;
    zooming = true;
    var total = $('.item').length;
    $('.item').each(function(item){
      var w = $(this).data('w');
      var h = $(this).data('h');
      var new_w = w * zoom;
      var new_h = h * zoom;
      total_width += new_w;
      var c = $(this).find('canvas')[0];
      var ctx = c.getContext('2d');
      var img = $(this).find('img')[0];
      $(this).css({width: new_w, height: height});
      c.width = new_w;
      c.height = height;
      if (img) {
        for (var i = 0; i < $(this).data('quantity'); i++) {
          ctx.drawImage(img, 0, i * new_h, new_w, new_h);
        }
      } else {
        console.log(this);
      }
      total --;
      if (total == 0) zooming = false;
    });
  }
}

function sort() {
  var items = $('.item');
  items.sort(function(a, b) {
    if ($(b).data('min-purchase') < $(a).data('min-purchase')) return -1;
    else if ($(b).data('min-purchase') > $(a).data('min-purchase')) return 1;
    else return 0;
  });

  items.detach().appendTo($baba);
  //for (var i = 0; i < items.length; i++) {
    //items[i].parentNode.appendChild(items[i]);
  //}
}
