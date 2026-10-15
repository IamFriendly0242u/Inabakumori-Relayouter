/* ==========================================================================
   1. CANVAS SETUP & CONFIGURATION
   ========================================================================== */

const canvas = document.getElementById('audiovisualizer');
const context = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let audiovisualizerdirection = 1;
let audiovisualizerypos = localStorage.getItem('we_audiovisualizerypos') !== null ? parseInt(localStorage.getItem('we_audiovisualizerypos')) : 100;
let soundsensitivity = localStorage.getItem('we_soundsensitivity') !== null ? parseInt(localStorage.getItem('we_soundsensitivity')) : 100;
let color = "#000000";

let isMirrored = localStorage.getItem('we_mirroredvisualizer') !== null ? (localStorage.getItem('we_mirroredvisualizer') === 'true') : true;

window.isVisualizerEnabled = true;

let barsHeight = [];
let barsHeight2 = [];


/* ==========================================================================
   2. WALLPAPER ENGINE AUDIO LISTENER
   ========================================================================== */

function lerp(current, target, smoothness) {
    return current + (target - current) * smoothness;
}

if (window.wallpaperRegisterAudioListener) {
    window.wallpaperRegisterAudioListener((audioArray) => {
        if (window.isVisualizerEnabled === false) {
            context.clearRect(0, 0, window.innerWidth, window.innerHeight);
            return;
        }

        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        context.fillStyle = color;
        const sensitivity = soundsensitivity / 100;
        let halfCount = audioArray.length / 2;
        let barWidth = Math.round(window.innerWidth / 128);
        let barHeightMax = 700;

        if (!isMirrored) {
            barWidth = Math.round(window.innerWidth / 64);
        }

        for (let i = 0; i < halfCount; i++) {
            let height = barHeightMax * Math.min(audioArray[i], 1) * sensitivity;
            if (height >= barHeightMax) height = 500;
            let offset = 0;
            if (audiovisualizerdirection == 1) {
                offset = 0;
            } else if (audiovisualizerdirection == 2) {
                offset = height;
            } else if (audiovisualizerdirection == 3) {
                offset = height / 2;
            }

            if (!barsHeight[i]) barsHeight[i] = 0;
            barsHeight[i] = lerp(barsHeight[i], height, 0.5);

            context.fillRect(
                barWidth * i + Math.round(barWidth * 0.3),
                (audiovisualizerypos / 100) * window.innerHeight - barsHeight[i] + offset,
                barWidth - Math.round(barWidth * 0.6),
                barsHeight[i]
            );
        }

        if (isMirrored) {
            let j = audioArray.length;
            for (let i = halfCount; i < audioArray.length; i++) {
                let height = barHeightMax * Math.min(audioArray[i], 1) * sensitivity;
                if (height >= barHeightMax) height = 500;
                let offset = 0;
                if (audiovisualizerdirection == 1) {
                    offset = 0;
                } else if (audiovisualizerdirection == 2) {
                    offset = height;
                } else if (audiovisualizerdirection == 3) {
                    offset = height / 2;
                }

                if (!barsHeight2[i]) barsHeight2[i] = 0;
                barsHeight2[i] = lerp(barsHeight2[i], height, 0.5);

                context.fillRect(
                    (barWidth * j) - barWidth + Math.round(barWidth * 0.3),
                    (audiovisualizerypos / 100) * window.innerHeight - barsHeight2[i] + offset,
                    barWidth - Math.round(barWidth * 0.6),
                    barsHeight2[i]
                );
                j--;
            }
        }
    });
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});