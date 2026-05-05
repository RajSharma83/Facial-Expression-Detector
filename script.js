// Epression Detector //
const video = document.getElementById('video');
const expressionDisplay = document.getElementById('expression'); // Get the expression display element

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo);

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  );
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    
    // Get the highest expression score
    if (resizedDetections.length > 0) {
      const expressions = resizedDetections[0].expressions;
      const currentExpression = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
      const currentScore = (expressions[currentExpression] * 100).toFixed(2); // Get percentage
      
      expressionDisplay.textContent = `Current Expression : ${currentExpression.charAt(0).toUpperCase() + currentExpression.slice(1)} (${currentScore}%)`; // Capitalize the first letter and show percentage
    }
  }, 100);
});

// Facial Expression Ends //

