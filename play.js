var stat = 0;
var connection;
$(function() {
	connection = new WebSocket('ws://localhost:1234/');
	connection.onopen = function () {
		init();
	};
});


function init(){
	$("#play-button").click(function(){
		if (stat == 0){
			$(this).text('Stop');
			stat = 1;
			connection.send('start');
		}
		else if(stat == 1){
			$(this).text('Start');
			stat = 0;
			connection.send('stop');
		}

	});
}