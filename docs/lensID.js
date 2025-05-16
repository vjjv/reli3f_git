// window.lensID = 'b8e614e9-bd59-429b-94a8-05ae9385210a'; //Third Sky Lens;
// window.groupID = 'f7f4e367-f4b3-4de5-8e81-e9c842f2bf0b'; //LIVE_PROD Group;
// window.modePhoto = true;
// window.modeVideo = true;
// window.modeBothCamera = true;
// window.modeStartFaceCamera = false;



const params = new URLSearchParams(window.location.search);

function getURLorFallback(key, defaultValue) {
  return params.has(key) ? params.get(key) : defaultValue;
}

window.lensID = getURLorFallback('lensID', 'b8e614e9-bd59-429b-94a8-05ae9385210a'); // Third Sky Lens
window.groupID = getURLorFallback('groupID', 'f7f4e367-f4b3-4de5-8e81-e9c842f2bf0b'); // LIVE_PROD Group
window.modePhoto = getURLorFallback('modePhoto', true) === 'true';
window.modeVideo = getURLorFallback('modeVideo', true) === 'true';
window.modeBothCamera = getURLorFallback('modeBothCamera', true) === 'true';
window.modeStartFaceCamera = getURLorFallback('modeStartFaceCamera', false) === 'true';


console.log('lensID : '+ window.lensID);
console.log('groupID : '+ window.lensID);
console.log('modePhoto : '+ window.modePhoto);
console.log('modeVideo : '+ window.modeVideo);
console.log('modeBothCamera : '+ window.modeBothCamera);
console.log('modeStartFaceCamera : '+ window.startFaceCamera);