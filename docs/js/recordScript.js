// ======================
// Module 0: Utilities
// ======================
const Utils = (() => {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const circle = document.querySelector(".progress-ring__circle");
  const radius = circle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;

  // Initialize circle stroke
  circle.style.strokeDasharray = `${circumference}`;
  circle.style.strokeDashoffset = `${circumference}`;

  return {
    isMobile,
    circle,
    radius,
    circumference,
    getSupportedMimeType: () => {
      const types = ["video/webm", "video/mp4", "video/x-matroska"];
      return types.find((type) => MediaRecorder.isTypeSupported(type));
    },
  };
})();

// ======================
// Module 1: DOM Elements
// ======================
const DomElements = (() => {
  const elements = {
    canvasPart: document.querySelector(".canvas-part"),
    previewPart: document.querySelector(".preview-part"),
    canvas: document.getElementById("canvas"),
    // ctx: document.getElementById("canvas").getContext("2d"),
    captureButton: document.getElementById("captureButton"),
    backButton: document.getElementById("backButton"),
    progressParentDiv: document.querySelector(".progress-parent"),
    videoProgressBar: document.getElementById("videoProgressBar"),
    controlPannel: document.querySelector(".controls"),
    videoCanvas: document.getElementById("videoCanvas"),
    videoElement: document.createElement("video"),
    actionButton: document.createElement("div"),
    previewImg: document.getElementById("preview-img"),
    spinLoading: document.querySelector(".spin-loading"),
  };

  // Configure video element
  elements.videoCanvas.className = "video-canvas";
  elements.videoCanvas.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    display: block;
  `;

  // Configure action button
  elements.actionButton.classList.add("action-btn");
  document.body.appendChild(elements.actionButton);
  elements.controlPannel.appendChild(elements.actionButton);

  return elements;
})();

// ======================
// Module 2: State Management
// ======================
const State = (() => {
  let state = {
    mediaRecorder: null,
    chunks: [],
    recording: false,
    videoIsDisplayed: false,
    holdTimeout: null,
    videoPlayInterval: null,
    zoomFactor: 1,
    zoomOriginX: 0,
    zoomOriginY: 0,
    isDragging: false,
    lastTouchY: 0,
    lastRenderTime: 0,
    customFPS: 30,
    frameDuration: 1000 / 30,
    ProgressInterval: null,
    hearts: [],
    heartColors: [
      "rgba(255, 0, 0, 0.2)",
      "rgba(255, 100, 100, 0.2)",
      "rgba(255, 0, 100, 0.2)",
    ],
    recordTime: 0,
    totalRecordTime: 5000,
    lastX: 0,
    lastY: 0,
    lastTouchDist: 0,
    activePointers: new Map(),
    linearGradient: null,
  };

  // Initialize linear gradient
  // state.linearGradient = DomElements.ctx.createLinearGradient(
  //   0,
  //   0,
  //   0,
  //   DomElements.canvas.height * 2
  // );
  // state.linearGradient.addColorStop(0, "rgb(52, 208, 235)");
  // state.linearGradient.addColorStop(0.4, "rgb(222, 208, 200)");
  // state.linearGradient.addColorStop(1, "rgb(48, 23, 221)");

  return {
    get: () => state,
    update: (newState) => {
      state = { ...state, ...newState };
    },
  };
})();

// ======================
// Module 3: Progress Management
// ======================
const ProgressManager = (() => {
  const updateProgress = () => {
    const state = State.get();
    Utils.circle.style.strokeDasharray = `${Utils.circumference + 20}`;

    state.recordTime += state.frameDuration;
    const percentage = Math.min(state.recordTime / state.totalRecordTime, 1);
    const offset = Utils.circumference - percentage * Utils.circumference;

    Utils.circle.style.strokeDashoffset = offset;

    if (state.recordTime >= state.totalRecordTime) {
      MediaRecorderManager.stopRecording();
      resetProgress();
    }
  };

  const resetProgress = () => {
    State.update({ recordTime: 0 });
    Utils.circle.style.strokeDashoffset = `${Utils.circumference}`;
    Utils.circle.style.stroke = "none";
    document.querySelector(".outer-circle").style.stroke =
      "rgba(255,255,255,1)";
  };

  return { updateProgress, resetProgress };
})();

// ======================
// Module 4: Media Recorder Management
// ======================
const MediaRecorderManager = (() => {
  let recorder;

  const startRecording = async () => {
    try {
      const state = State.get();
      const videoStream = DomElements.canvas.captureStream(state.customFPS);

      recorder = RecordRTC(videoStream, {
        type: "video",
        mimeType: "video/mp4",
      });

      recorder.startRecording();
      State.update({ recording: true });

      // Update UI for recording state
      UI.resizeSvg(1.1); // Update this line
      DomElements.captureButton.style.cssText = `
        width: 100%;
        height: 100%;
      `;
      document.querySelector(".progress-ring__circle").style.stroke = "#ff0000";
      document.querySelector(".outer-circle").style.stroke =
        "rgba(255,255,255,0.4)";
      document.querySelector(".inner-circle").style.fill = "#ff0000";
      document.querySelector(".inner-circle").style.scale = "0.8";
    } catch (err) {
      console.error("Error starting recording:", err);
      alert("Failed to start recording.");
    }
  };

  const stopRecording = () => {
    const state = State.get();
    if (!recorder || !state.recording) return;

    // Update UI elements
    DomElements.previewPart.style.display = "flex";
    setTimeout(() => {
      DomElements.previewPart.style.scale = "1";
    }, 20);
    DomElements.previewImg.style.display = "none";
    DomElements.videoCanvas.style.display = "block";
    DomElements.progressParentDiv.style.display = "flex";
    DomElements.canvasPart.style.display = "none";
    DomElements.controlPannel.style.display = "flex";
    DomElements.captureButton.style.display = "none";

    // Reset capture button styling
    DomElements.captureButton.style.cssText = `
      width: 90px;
      height: 90px;
    `;
    document.querySelector(".inner-circle").style.cssText = `
      fill: #ffff;
      scale: 1;
    `;

    recorder.stopRecording(() => {
      const blob = recorder.getBlob();
      const videoURL = URL.createObjectURL(blob);
      VideoManager.playVideoOnCanvas(videoURL);
    });

    State.update({
      recording: false,
      zoomFactor: 1,
      videoIsDisplayed: true,
    });
  };

  return { startRecording, stopRecording };
})();

// ======================
// Module 5: Video Management
// ======================
const VideoManager = (() => {
  const playVideoOnCanvas = (recordedVideoURL) => {
    const state = State.get();
    DomElements.spinLoading.style.display = "block";

    DomElements.videoElement.src = recordedVideoURL;
    DomElements.videoElement.loop = true;
    DomElements.videoElement.muted = true;
    DomElements.videoElement.autoplay = true;
    DomElements.videoElement.playsInline = true;

    DomElements.videoElement.addEventListener("loadedmetadata", () => {
      DomElements.spinLoading.style.display = "none";
      DomElements.videoCanvas.width = DomElements.videoElement.videoWidth;
      DomElements.videoCanvas.height = DomElements.videoElement.videoHeight;

      const videoCTX = DomElements.videoCanvas.getContext("2d");
      DomElements.videoElement.play();

      state.videoPlayInterval = setInterval(() => {
        if (DomElements.videoElement.paused || DomElements.videoElement.ended)
          return;

        videoCTX.clearRect(
          0,
          0,
          DomElements.videoCanvas.width,
          DomElements.videoCanvas.height
        );
        const aspectRatio =
          DomElements.videoElement.videoWidth /
          DomElements.videoElement.videoHeight;

        // Aspect ratio handling
        let drawWidth, drawHeight, offsetX, offsetY;
        if (
          DomElements.videoCanvas.width / DomElements.videoCanvas.height >
          aspectRatio
        ) {
          drawHeight = DomElements.videoCanvas.height;
          drawWidth = DomElements.videoCanvas.height * aspectRatio;
          offsetX = (DomElements.videoCanvas.width - drawWidth) / 2;
          offsetY = 0;
        } else {
          drawWidth = DomElements.videoCanvas.width;
          drawHeight = DomElements.videoCanvas.width / aspectRatio;
          offsetY = (DomElements.videoCanvas.height - drawHeight) / 2;
          offsetX = 0;
        }

        videoCTX.drawImage(
          DomElements.videoElement,
          offsetX,
          offsetY,
          drawWidth,
          drawHeight
        );

        VideoManager.updateTopProgressBar(); // Add this line
      }, 1000 / state.customFPS);
    });
  };

  const stopVideoPlayback = () => {
    DomElements.videoElement.pause();
    DomElements.videoCanvas
      .getContext("2d")
      .clearRect(
        0,
        0,
        DomElements.videoCanvas.width,
        DomElements.videoCanvas.height
      );
    DomElements.videoElement.src = "";
  };

  const updateTopProgressBar = () => {
    const progress =
      (DomElements.videoElement.currentTime /
        DomElements.videoElement.duration) *
      100;
    DomElements.videoProgressBar.style.width = `${progress}%`;
  };

  return { playVideoOnCanvas, stopVideoPlayback, updateTopProgressBar };
})();

// ======================
// Module 6: Canvas Drawing
// ======================
// const CanvasRenderer = (() => {
//   const draw = (timestamp) => {
//     const state = State.get();
//     const timeSinceLastRender = timestamp - state.lastRenderTime;

//     if (timeSinceLastRender >= state.frameDuration) {
//       DomElements.ctx.save();
//       DomElements.ctx.clearRect(
//         0,
//         0,
//         DomElements.canvas.width,
//         DomElements.canvas.height
//       );
//       DomElements.ctx.fillStyle = state.linearGradient;
//       DomElements.ctx.fillRect(
//         0,
//         0,
//         DomElements.canvas.width,
//         DomElements.canvas.height
//       );

//       // Apply zoom/pan transformations
//       DomElements.ctx.setTransform(
//         state.zoomFactor,
//         0,
//         0,
//         state.zoomFactor,
//         state.zoomOriginX,
//         state.zoomOriginY
//       );

//       // Draw text
//       DomElements.ctx.font = `${40 * state.zoomFactor}px sans`;
//       DomElements.ctx.textAlign = "center";
//       DomElements.ctx.textBaseline = "middle";
//       DomElements.ctx.fillStyle = "white";
//       DomElements.ctx.fillText("Hi, Bastein", 0, 0);
//       DomElements.ctx.restore();

//       // Update progress if recording
//       if (state.recording) ProgressManager.updateProgress();

//       State.update({ lastRenderTime: timestamp });
//     }

//     // animateHearts();
//     // addHeart();
//     requestAnimationFrame(draw);
//   };

//   // Heart animation functions
//   const addHeart = () => {
//     const state = State.get();
//     if (state.hearts.length >= 5) return;

//     state.hearts.push({
//       x: Math.random() * DomElements.canvas.width,
//       y: Math.random() * DomElements.canvas.height,
//       size: Math.random() * 25 + 15,
//       opacity: Math.random() * 0.5 + 0.5,
//       speed: Math.random() * 2 + 0.5,
//       gradient: createPurpleGradient(),
//       glow: true,
//       glowIntensity: 20,
//       glowDirection: 1,
//       glowSpeed: 0.8,
//     });
//   };

//   const createPurpleGradient = () => {
//     const gradient = DomElements.ctx.createRadialGradient(0, 0, 5, 0, 0, 20);
//     gradient.addColorStop(0, "rgba(128, 0, 128, 0.9)");
//     gradient.addColorStop(1, "rgba(230, 230, 250, 0.8)");
//     return gradient;
//   };

//   const animateHearts = () => {
//     const state = State.get();
//     state.hearts.forEach((heart, index) => {
//       DomElements.ctx.save();
//       DomElements.ctx.globalAlpha = heart.opacity;

//       // Glow effect logic
//       heart.glowIntensity += heart.glowDirection * heart.glowSpeed;
//       if (heart.glowIntensity >= 30) heart.glowDirection = -1.5;
//       else if (heart.glowIntensity <= 5) heart.glowDirection = 1;

//       DomElements.ctx.shadowBlur = heart.glowIntensity;
//       DomElements.ctx.shadowColor = "rgba(255, 0, 255, 0.8)";

//       // Position adjustment for zoom
//       const adjustedX =
//         (heart.x - state.zoomOriginX) * state.zoomFactor + state.zoomOriginX;
//       const adjustedY =
//         (heart.y - state.zoomOriginY) * state.zoomFactor + state.zoomOriginY;

//       DomElements.ctx.translate(adjustedX, adjustedY);
//       DomElements.ctx.fillStyle =
//         heart.glowIntensity > 10 ? heart.gradient : "rgba(255, 255, 255, 0.2)";

//       drawHeart(DomElements.ctx, 0, 0, heart.size);
//       DomElements.ctx.restore();

//       // Update position
//       heart.y -= heart.speed;
//       if (heart.y + heart.size < 0) state.hearts.splice(index, 1);
//     });
//   };

//   const drawHeart = (ctx, x, y, size) => {
//     ctx.beginPath();
//     ctx.moveTo(x, y + size / 4);
//     ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
//     ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size / 2, x, y + size);
//     ctx.bezierCurveTo(
//       x,
//       y + size / 2,
//       x + size / 2,
//       y + size / 2,
//       x + size / 2,
//       y + size / 4
//     );
//     ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
//     ctx.closePath();
//     ctx.fill();
//   };

//   return { draw };
// })();

// ======================
// Module 7: Event Handlers
// ======================
const EventHandlers = (() => {
  const initialize = () => {
    // Canvas interaction events
    DomElements.canvas.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    DomElements.canvas.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    DomElements.canvas.addEventListener("touchend", handleTouchEnd, {
      passive: false,
    });
    DomElements.canvas.addEventListener("touchcancel", handleTouchCancel, {
      passive: false,
    });
    DomElements.canvas.addEventListener("wheel", handleMouseWheel, {
      passive: false,
    });
    DomElements.canvas.addEventListener("mousemove", handleMouseMove);
    DomElements.canvas.addEventListener("mousedown", handleMouseDown);
    DomElements.canvas.addEventListener("mouseup", handleMouseUp);
    DomElements.canvas.addEventListener("mouseleave", handleMouseLeave);

    // Capture button events
    DomElements.captureButton.addEventListener(
      "pointerdown",
      handleCaptureStart
    );
    DomElements.captureButton.addEventListener("pointerup", handleCaptureEnd);
    DomElements.captureButton.addEventListener(
      "pointercancel",
      handleCaptureCancel
    );

    // Control buttons
    DomElements.backButton.addEventListener("click", handleBackClick);
    DomElements.actionButton.addEventListener("click", handleActionClick);

    // Window resize
    window.addEventListener("resize", handleResize);

    // Add initial resize
    handleResize(); // Add this line
  };

  // Touch Handling
  const handleTouchMove = (e) => {
    e.preventDefault();
    const state = State.get();

    if (state.isDragging && e.touches.length === 1) {
      const dx = e.touches[0].clientX - state.lastX;
      const dy = e.touches[0].clientY - state.lastY;
      State.update({
        zoomOriginX: state.zoomOriginX + dx,
        zoomOriginY: state.zoomOriginY + dy,
        lastX: e.touches[0].clientX,
        lastY: e.touches[0].clientY,
      });
    }

    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const touchDist = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      if (state.lastTouchDist) {
        const zoomChange = touchDist > state.lastTouchDist ? 1.1 : 0.9;
        State.update({
          zoomFactor: Math.max(1, Math.min(state.zoomFactor * zoomChange, 4)),
          lastTouchDist: touchDist,
        });
      }
    }
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      State.update({
        isDragging: true,
        lastX: e.touches[0].clientX,
        lastY: e.touches[0].clientY,
      });
    }
  };

  const handleTouchEnd = (e) => {
    e.preventDefault();
    State.update({
      lastTouchDist: 0,
      isDragging: false,
    });
  };

  const handleTouchCancel = (e) => {
    e.preventDefault();
    State.update({ isDragging: false });
  };

  // Mouse Handling
  const handleMouseWheel = (e) => {
    e.preventDefault();
    const state = State.get();
    const zoomChange = e.deltaY > 0 ? 0.9 : 1.1;
    State.update({
      zoomFactor: Math.max(1, Math.min(state.zoomFactor * zoomChange, 5)),
    });
  };

  const handleMouseMove = (e) => {
    const state = State.get();
    if (state.isDragging) {
      const dx = e.clientX - state.lastX;
      const dy = e.clientY - state.lastY;
      State.update({
        zoomOriginX: state.zoomOriginX + dx,
        zoomOriginY: state.zoomOriginY + dy,
        lastX: e.clientX,
        lastY: e.clientY,
      });
    }
  };

  const handleMouseDown = (e) => {
    State.update({
      isDragging: true,
      lastX: e.clientX,
      lastY: e.clientY,
    });
  };

  const handleMouseUp = () => {
    State.update({ isDragging: false });
  };

  const handleMouseLeave = () => {
    State.update({ isDragging: false });
  };

  // Capture Button Handling
  const handleCaptureStart = (e) => {
    e.preventDefault();
    State.update({
      holdTimeout: setTimeout(() => MediaRecorderManager.startRecording(), 500),
    });
  };

  const handleCaptureEnd = (e) => {
    e.preventDefault();
    const state = State.get();
    clearTimeout(state.holdTimeout);

    if (state.recording) {
      MediaRecorderManager.stopRecording();
      UI.updateActionButtonLabel("video");
    } else if (!state.videoIsDisplayed) {
      DomElements.videoCanvas.style.display = "none";
      DomElements.previewPart.style.display = "flex";
      DomElements.canvasPart.style.display = "none";

      DomElements.progressParentDiv.style.display = "none";
      DomElements.controlPannel.style.display = "flex";
      UI.updateActionButtonLabel("image");
      capturePhoto();
      setTimeout(() => {
        DomElements.previewPart.style.scale = "1";
      }, 10);
    }
  };

  const handleCaptureCancel = (e) => {
    e.preventDefault();
    const state = State.get();
    clearTimeout(state.holdTimeout);
    if (state.recording) MediaRecorderManager.stopRecording();
  };

  // Photo Capture
  const capturePhoto = () => {
    DomElements.previewImg.src = DomElements.canvas.toDataURL("image/png");
    DomElements.previewPart.style.display = "flex";
    DomElements.videoCanvas.style.display = "none";
    DomElements.progressParentDiv.style.display = "none";
    DomElements.controlPannel.style.display = "flex";
    UI.updateActionButtonLabel("image");
  };

  // Back Button
  const handleBackClick = () => {
    State.update({
      videoIsDisplayed: false,
      zoomFactor: 1.1,
    });

    DomElements.previewPart.style.display = "none";
    DomElements.canvasPart.style.display = "block";
    DomElements.captureButton.style.display = "flex";
    DomElements.previewPart.style.scale = "1.3";
    VideoManager.stopVideoPlayback();
    ProgressManager.resetProgress();
  };

  // Action Button
  const handleActionClick = async () => {
    const state = State.get();
    if (DomElements.videoCanvas.style.display === "block") {
      await handleVideoAction();
    } else {
      await handlePhotoAction();
    }
  };

  const handleVideoAction = async () => {
    const videoURL = DomElements.videoElement.src;
    if (Utils.isMobile) {
      await shareMedia(videoURL, "video/webm", "video.webm");
    } else {
      const a = document.createElement("a");
      a.href = videoURL;
      a.download = "video.webm";
      a.click();
    }
  };

  const handlePhotoAction = async () => {
    const imgSrc = DomElements.previewImg.src;
    if (Utils.isMobile) {
      await shareMedia(imgSrc, "image/png", "photo.png");
    } else {
      const a = document.createElement("a");
      a.href = imgSrc;
      a.download = "photo.png";
      a.click();
    }
  };

  const shareMedia = async (src, type, filename) => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const file = new File([blob], filename, { type });
      await navigator.share({ files: [file] });
    } catch (err) {
      console.error("Sharing failed:", err);
    }
  };

  // Resize Handler
  const handleResize = () => {
    DomElements.canvas.width = window.innerWidth;
    DomElements.canvas.height = window.innerHeight;
    State.update({
      zoomOriginX: DomElements.canvas.width / 2,
      zoomOriginY: DomElements.canvas.height / 2,
    });
  };

  return { initialize };
})();

// ======================
// Module 8: UI Management
// ======================
const UI = (() => {
  const updateActionButtonLabel = (mediaType) => {
    DomElements.actionButton.textContent = Utils.isMobile
      ? mediaType === "image"
        ? "Share Photo"
        : "Share Video"
      : mediaType === "image"
      ? "Save Photo"
      : "Save Video";
  };

  const resizeSvg = (scale = 1) => {
    const innerCircle = document.querySelector(".inner-circle");
    const outerCircle = document.querySelector(".outer-circle");
    if (innerCircle) {
      innerCircle.style.transform = `scale(${scale})`;
    }
    if (outerCircle) {
      outerCircle.style.transition = "all 0.3s ease";
    }
  };

  return { updateActionButtonLabel, resizeSvg };
})();

// ======================
// Initialize Application
// ======================
const App = (() => {
  const init = () => {
    EventHandlers.initialize();
    // handleResize();
    // Initial visibility states
    DomElements.canvasPart.style.opacity = 1;
    DomElements.controlPannel.style.display = "none";
    DomElements.progressParentDiv.style.display = "none";
    // requestAnimationFrame(CanvasRenderer.draw);
  };

  return { init };
})();

// Start the app
App.init();
