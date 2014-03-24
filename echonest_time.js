module.exports = Music;

function Music(data) {
  this.data = data;
  this.max_loud = -9999;
  this.min_loud = 9999;
  for (var i in this.data.segments){
    var seg = this.data.segments[i];
    if (seg.loudness_max > this.max_loud){
      this.max_loud = seg.loudness_max;
    }
    if (seg.loudness_max < this.min_loud){
      this.min_loud = seg.loudness_max;
    } 
  }
  console.log("Max : " + this.max_loud + " / Min : " + this.min_loud);
}

Music.prototype.next = function() {
  if (!this.start) {
    this.start = new Date();
  }
  var now = new Date();
  var time = (now - this.start) / 1000;

  var res = {};

  ['bars', 'beats', 'tatums', 'sections', 'segments'].forEach(function(key) {
    res[key] = [];
    this.data[key] = this.data[key].filter(function(el, i) {
      if (el.start <= time) {
        res[key].push(el);
        return false;
      }
      return true;
    });
  }, this);

  return res;
};
Music.prototype.getMode = function(_loud) {
  var loud = (_loud - this.min_loud) / (this.max_loud - this.min_loud);
  var mode = -1;
  if (loud < 0.750){
      mode = 0;
  }
  else if(loud >= 0.750 && loud < 0.820){
      mode = 1;
  }
  else if(loud >= 0.820 && loud < 0.860){
      mode = 2;
  }
  else if(loud >= 0.860 && loud < 0.900){
      mode = 3;
  }
  else if(loud >= 0.900 && loud <= 1.00){
      mode = 4;
  }
  return {"mode":mode,"loud":loud};
};