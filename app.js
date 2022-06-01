// var cw = $('#grid').width();
// $('#grid').css({'height':cw+'px'});
let px = Math.min($('#body').width(), $('#body').height());
$('#grid').css({'width': px+'px', 'height': px+'px'});