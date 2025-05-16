// window.lensID = 'b8e614e9-bd59-429b-94a8-05ae9385210a'; //Third Sky Lens;
// window.groupID = 'f7f4e367-f4b3-4de5-8e81-e9c842f2bf0b'; //LIVE_PROD Group;
// window.modePhoto = true;
// window.modeVideo = true;
// window.modeBothCamera = true;
// window.modeStartFaceCamera = false;


const params = new URLSearchParams(window.location.search);

function getURLorFallback(key, defaultValue) {
  if (params.has(key)) {
    // For booleans, interpret 'true'/'false' strings
    if (defaultValue === true || defaultValue === false) {
      return params.get(key) === 'true';
    }
    // For strings, just return the value
    return params.get(key);
  }
  return defaultValue;
}

window.lensID = getURLorFallback('lensID', 'b8e614e9-bd59-429b-94a8-05ae9385210a'); // Third Sky Lens
window.groupID = getURLorFallback('groupID', 'f7f4e367-f4b3-4de5-8e81-e9c842f2bf0b'); // LIVE_PROD Group
window.modePhoto = getURLorFallback('modePhoto', true);
window.modeVideo = getURLorFallback('modeVideo', true);
window.modeBothCamera = getURLorFallback('modeBothCamera', true);
window.modeStartFaceCamera = getURLorFallback('modeStartFaceCamera', false);
window.splashScreen = getURLorFallback('splashScreen', 'https://vjjv.github.io/reli3f_git/assets/intro.png');

console.log('lensID : ' + window.lensID);
console.log('groupID : ' + window.groupID);
console.log('modePhoto : ' + window.modePhoto);
console.log('modeVideo : ' + window.modeVideo);
console.log('modeBothCamera : ' + window.modeBothCamera);
console.log('modeStartFaceCamera : ' + window.modeStartFaceCamera);
console.log('splashScreen : ' + window.splashScreen);

document.getElementById('splash-img').src = window.splashScreen;