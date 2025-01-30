 //resize the SVG element based on the canvas size
 function resizeSvg(scale = 1) {
    const svgContainer = document.getElementById("captureButton");
    const svg = document.getElementById("progressRing");
    const containerWidth = svgContainer.offsetWidth;
    const containerHeight = svgContainer.offsetHeight;

    // Define the radius based on the smaller of the two dimensions
    const radius = Math.min(containerWidth, containerHeight) / 2 - 10;

    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    svg.setAttribute("width", containerWidth);
    svg.setAttribute("height", containerHeight);
    svg.setAttribute("viewBox", `0 0 ${containerWidth} ${containerHeight}`);

    const outerCircle = document.querySelector(".outer-circle");
    const progressCircle = document.querySelector(".progress-ring__circle");
    const innerCircle = document.querySelector(".inner-circle");

    outerCircle.setAttribute("r", radius * scale);
    outerCircle.setAttribute("cx", centerX);
    outerCircle.setAttribute("cy", centerY);

    progressCircle.setAttribute("r", radius * scale);
    progressCircle.setAttribute("cx", centerX);
    progressCircle.setAttribute("cy", centerY);

    innerCircle.setAttribute("r", radius * 0.9); // Slightly smaller inner circle
    innerCircle.setAttribute("cx", centerX);
    innerCircle.setAttribute("cy", centerY);
  }

  resizeSvg();