

//FLIP CAMERA EXAMPLE
import {
    bootstrapCameraKit,
    CameraKitSession,
    createMediaStreamSource,
    Transform2D,
} from '@snap/camera-kit';

const liveRenderTarget = document.getElementById('canvas');
const flipCamera = document.getElementById('flip');
const intro = document.getElementById('intro');
var firstTime = true;
document.body.addEventListener('click', () => {
    if (firstTime) {
        firstTime = false;
        // DeviceMotionEvent.requestPermission();
        intro.style.display = 'none';
        init();
    }
}, true);


let isBackFacing = true;
let mediaStream;

async function init() {
    const cameraKit = await bootstrapCameraKit({
        apiToken: 'eyJhbGciOiJIUzI1NiIsImtpZCI6IkNhbnZhc1MyU0hNQUNQcm9kIiwidHlwIjoiSldUIn0.eyJhdWQiOiJjYW52YXMtY2FudmFzYXBpIiwiaXNzIjoiY2FudmFzLXMyc3Rva2VuIiwibmJmIjoxNjk4MDU3NzAyLCJzdWIiOiI0MDUyY2RlNC02YzMzLTRkM2UtYTJjNC0yNzllYzc1M2VmOWR-U1RBR0lOR341MTY4YzVmNC1kYWVkLTQ1N2ItOGJmYy01Y2JhODkwOWU4OTgifQ.b0Z-TegYa2Sg-lZy_8XoPw7f_iz7eEC5BtzYooyL5K4',
    });

    const session = await cameraKit.createSession({ liveRenderTarget });
    const { lenses } = await cameraKit.lensRepository.loadLensGroups([
        'f7f4e367-f4b3-4de5-8e81-e9c842f2bf0b',
    ]);

    session.applyLens(lenses[0]);

    bindFlipCamera(session);
}

function bindFlipCamera(session) {
    flipCamera.style.cursor = 'pointer';

    flipCamera.addEventListener('click', () => {
        updateCamera(session);
    });

    updateCamera(session);
}

async function updateCamera(session) {

    // flipCamera.innerText = isBackFacing
    // ? 'Switch to Front Camera'
    // : 'Switch to Back Camera';

    if (mediaStream) {
        session.pause();
        mediaStream.getVideoTracks()[0].stop();
    }

    mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: isBackFacing ? 'environment' : 'user',
        },
    });

    const source = createMediaStreamSource(mediaStream, {
        // NOTE: This is important for world facing experiences
        cameraType: isBackFacing ? 'back' : 'front',
    });

    await session.setSource(source);

    if (!isBackFacing) {
        source.setTransform(Transform2D.MirrorX);
    }

    session.play();
    isBackFacing = !isBackFacing;
}

// init();