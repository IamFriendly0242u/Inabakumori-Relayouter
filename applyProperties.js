/* ==========================================================================
   1. INITIAL CACHE RESTORATION
   ========================================================================== */

if (localStorage.getItem('we_backgroundbrightness') !== null && typeof background !== 'undefined' && background) {
    background.style.filter = `brightness(${parseInt(localStorage.getItem('we_backgroundbrightness')) / 100})`;
}

if (localStorage.getItem('we_musicvolume') !== null) {
    volume = parseInt(localStorage.getItem('we_musicvolume')) / 100;
}


/* ==========================================================================
   2. WALLPAPER ENGINE PROPERTIES LISTENER
   ========================================================================== */

window.wallpaperPropertyListener = {
    ['applyUserProperties']: function(properties) {
        if (properties.backgroundbrightness) {
            localStorage.setItem('we_backgroundbrightness', properties.backgroundbrightness.value);
            if (typeof background !== 'undefined' && background) {
                background.style.filter = `brightness(${properties.backgroundbrightness.value / 100})`;
            }
        }
        if (properties.audiovisualizerypos) {
            localStorage.setItem('we_audiovisualizerypos', properties.audiovisualizerypos.value);
            audiovisualizerypos = parseInt(properties.audiovisualizerypos.value);
        }
        if (properties.enabledragging) {
            draggingEnabled = properties.enabledragging.value;
        }
        if (properties.randomizesongs) {
            randomizeSongs = properties.randomizesongs.value;
        }
        if (properties.mirroredvisualizer) {
            localStorage.setItem('we_mirroredvisualizer', properties.mirroredvisualizer.value);
            isMirrored = properties.mirroredvisualizer.value;
        }
        if (properties.musicplayatstart) {
            playAtStart = properties.musicplayatstart.value;
            if (typeof pageLoad === 'function' && !pageLoad.isLoaded) pageLoad();
        }
        if (properties.soundsensitivity) {
            localStorage.setItem('we_soundsensitivity', properties.soundsensitivity.value);
            soundsensitivity = properties.soundsensitivity.value;
        }
        if (properties.musicvolume) {
            localStorage.setItem('we_musicvolume', properties.musicvolume.value);
            volume = parseInt(properties.musicvolume.value) / 100;
            if (typeof currentSong !== 'undefined' && currentSong && currentSong.audio) {
                currentSong.audio.volume = volume;
            }
        }
    },
};


/* ==========================================================================
   3. MEDIA PLAYBACK INTEGRATION LISTENER
   ========================================================================== */

if (window['wallpaperRegisterMediaPlaybackListener'] && typeof window['wallpaperMediaPlaybackListener'] === 'function') {
    window['wallpaperRegisterMediaPlaybackListener'](window['wallpaperMediaPlaybackListener']);
}