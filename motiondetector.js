// Cross browser support to fetch the correct getUserMedia object.
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
  || navigator.mozGetUserMedia || navigator.msGetUserMedia;

// Cross browser support for window.URL.
window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;


var MotionCapture = (function() {
  var version = 0;
  var stepCount = 0;

  var canvas = document.getElementById('canvas');
  var video = document.getElementById('camStream');
  var ctx = canvas.getContext('2d');
  var animationCanvas = document.getElementById('animation');
  var aniCtx = animationCanvas.getContext('2d');
  var threshold = 830000;
  var localStream = null;
  var imgData = null;
  var imgDataPrev = [null,null];
  var frames = [];
  var frame = -1;
  var playing = true;

  animationCanvas.onclick = function(){playing=!playing;}
 
  function success(stream) {
    localStream = stream;
    // Create a new object URL to use as the video's source.
    video.srcObject = stream
    video.play();
  }

  
  function handleError(error) {
    console.error(error);
  }


  function snapshot() {
    if (localStream) {
      canvas.width = video.offsetWidth;
      canvas.height = video.offsetHeight;
      animationCanvas.width = video.offsetWidth;
      animationCanvas.height = video.offsetHeight;
  
      threshold = document.getElementById('threshold').value;
      ctx.drawImage(video, 0, 0);

      // Must capture image data in new instance as it is a live reference.
      // Use alternative live referneces to prevent messed up data.
      imgDataPrev[version] = ctx.getImageData(0, 0, canvas.width, canvas.height);
      version = (version == 0) ? 1 : 0;
      imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      var length = imgData.data.length;
      document.getElementById('threshold').max=length;

      var difference = compareTwoImages(imgDataPrev[0],imgDataPrev[1]);
      if(difference > threshold)
      {
        captureImage(canvas);
      }
      if(difference>0){
        document.getElementById('motion').innerHTML = (compareTwoImages(imgDataPrev[0],imgDataPrev[1])) + ' <strong>/</strong> ' + length;
      }
    }
  }

function captureImage(ctx){
  frames.push(imgData);

var image = document.createElement('img');
var dataUrl = ctx.toDataURL();
image.style.width='20px';
image.src = dataUrl;
image.onclick = function(){
  var img = new Image();
  img.src=this.src;
  playing = false;
  [].slice.call(document.getElementById('captures').getElementsByTagName('img'))
  .forEach(function(x,i){
    x.style.opacity=1;
  })
  aniCtx.drawImage(img,0,0);
  this.style.opacity=0.5;
}
document.getElementById('captures').append(image);

}

function compareTwoImages(img1,img2){
  var diffPixels = 0;
  if(img1!==null && img2!==null){
for(var i =0; i < img1.data.length; i++){
  if(img1.data[i] !=img2.data[i]){
    diffPixels++;
  }
}
  }
return diffPixels;
}

function step(){
  stepCount++;
  if(stepCount%30 && playing){
    snapshot();
  if(frame<frames.length){
    frame++;
  } else{frame=0;}
  if(frames[frame]!==undefined){
aniCtx.putImageData(frames[frame],0,0);
  }
}
window.requestAnimationFrame(step);
}

  
  function init_() {
    if (navigator.getUserMedia) { 
      navigator.getUserMedia({video:true}, success, handleError);
    } else { 
      console.error('Your browser does not support getUserMedia');
    }
    // window.setInterval(snapshot, 32);
    window.requestAnimationFrame(step);
  }

  return {
    init: init_
  };
})();

MotionCapture.init();
