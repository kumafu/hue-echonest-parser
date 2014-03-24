var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs"),
    osc = require("node-osc"),
    ws = require("ws"),
    Music = require('./echonest_time.js'),
    port = process.argv[2] || 8888,
    music_file = process.argv[3] || "music_anthem.json",
    data = require('./'+music_file);

var timer = 0;
var stat = 0;
var music;
music = new Music(data);
var starttime = 0;
var musicData = {};

var osc_client = new osc.Client('192.168.2.23', 7400);

var oscServer = new osc.Server(7400, '127.0.0.1');
oscServer.on("message", function (msg, rinfo) {
      //console.log("message receive:");
      //console.log(msg);
      if (msg[2][0] == '/music/start'){
        console.log('start by osc');
        start();
      }
});

var WebSocketServer = ws.Server;
var wss = new WebSocketServer({port: 1234});
wss.on('connection', function(ws) {
    ws.on('message', function(msg) {
        console.log('received: %s', msg);
        if (msg ==  'start'){
            console.log('Start by ws');
            start();

        } else if (msg == 'stop'){
            console.log('Stop by ws');
            stop();
        }
    });
});
function start(){
    starttime = new Date().getTime();
    timer = setInterval(function(){
        var newTime = new Date().getTime();
        var timePos = (newTime - starttime) / 1000 + "s";
        var res = music.next();
        if (res.bars.length){
            musicData.bars = res.bars;
            var loud = Number(musicData.segments[0].loudness_max);
            var modeSet = music.getMode(loud);
            console.log(timePos+' : Bars Tick ['+modeSet.mode+'] / '+loud +"(" +modeSet.loud+")");
            //console.log(musicData.segments[0].loudness_max);
            osc_client.send('/music/bars/tick',modeSet.mode);

        }
        // if (res.beats.length){
        //     console.log(res.beats);
            
        // }
        // if (res.tatums.length){
        //     console.log(res.tatums);
            
        // }
        if (res.sections.length){
            musicData.sections = res.sections;
            if (musicData.segments){
                var loud = Number(musicData.segments[0].loudness_max);
                var modeSet = music.getMode(loud);
                console.log(timePos+' : Sections Tick ['+modeSet.mode+']');
                osc_client.send('/music/sections/tick',modeSet.mode);
            }
            
        }
        if (res.segments.length){
            musicData.segments = res.segments;
            //console.log(timePos+' : Segments Tick');
            //osc_client.send('/music/segments/tick')
            //console.log(res.segments);
            
        }
    });
}

function stop(){
    clearInterval(timer);

}


http.createServer(function(request, response) {

  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);

    path.exists(filename, function(exists){
        if (!exists) { Response_404(); return ; }
        if (fs.statSync(filename).isDirectory()) { filename += '/index.html'; }

        fs.readFile(filename, "binary", function(err, file){
            if (err) { Response_500(err); return ; }
            Response_200(file, filename);   
        }); 

    });



    function Response_200(file, falename){
        var extname = path.extname(filename);
        var headerStr = {
            '.json':{
                'Content-Type':'application/json; charset=utf-8',
                'Access-Control-Allow-Origin':'*',
                'Pragma': 'no-cache',
                'Cache-Control' : 'no-cache'
                },
        }
        headerStr['.topojson'] = headerStr['.geojson'] = headerStr['.csv'] =  headerStr['.json'];
        var header = (headerStr[extname]) ? headerStr[extname] : null;

        response.writeHead(200, header);
        response.write(file, "binary");
        response.end();
    }  


    function Response_404(){
          response.writeHead(404, {"Content-Type": "text/plain"});
          response.write("404 Not Found\n");
          response.end();
    }  

    function Response_500(err){
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(err + "\n");
            response.end();
    }  


}).listen(parseInt(port, 10));

console.log("Server running at http://localhost:" + port );