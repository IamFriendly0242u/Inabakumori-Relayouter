/* ==========================================================================
   1. WALLPAPER ENGINE PROPERTIES LISTENER
   ========================================================================== */

window.wallpaperPropertyListener = {
    applyUserProperties: function(properties) {
        if (properties.backgroundbrightness) {
            background.style.filter = `brightness(${properties.backgroundbrightness.value / 100})`;
        }
        if (properties.audiovisualizerypos) {
            audiovisualizerypos = parseInt(properties.audiovisualizerypos.value);
        }
        if (properties.enabledragging) {
            draggingEnabled = properties.enabledragging.value;
        }
        if (properties.randomizesongs) {
            randomizeSongs = properties.randomizesongs.value;
        }
        if (properties.mirroredvisualizer) {
            isMirrored = properties.mirroredvisualizer.value;
        }
        if (properties.musicplayatstart) {
            playAtStart = properties.musicplayatstart.value;
            if (!pageLoad.isLoaded) pageLoad();
        }
        if (properties.soundsensitivity) {
            soundsensitivity = properties.soundsensitivity.value;
        }
        if (properties.musicvolume) {
            volume = parseInt(properties.musicvolume.value) / 100;
            if (currentSong && currentSong.audio) {
                currentSong.audio.volume = volume;
            }
        }
    },
};


/* ==========================================================================
   2. MEDIA PLAYBACK INTEGRATION LISTENER
   ========================================================================== */

window.wallpaperRegisterMediaPlaybackListener(wallpaperMediaPlaybackListener);