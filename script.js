// ============================================================
// BIBI'S WORLD — MAIN APPLICATION SCRIPT
// Boot sequence · window manager · galleries · UI effects ·
// Magical Lake · Memories.exe
//
// Keep section order unless dependencies are reviewed.
// ============================================================

// ====================================
// WINDOWS 2000 PORTFOLIO
// Window Manager v1
// ====================================

// ====================================
// AUTOMATIC WEBSITE BOOT SEQUENCE
// ====================================

document.body.classList.add("booting");

// Keep the animated wallpaper playing on desktop and mobile browsers.
// The video is revealed only after playback time genuinely advances.
function startWallpaperVideo() {
    const wallpaperVideo =
        document.getElementById("wallpaper-video");

    if (!wallpaperVideo) return;

    wallpaperVideo.muted = true;
    wallpaperVideo.defaultMuted = true;
    wallpaperVideo.loop = true;
    wallpaperVideo.playsInline = true;

    const showCssFallback = () => {
        wallpaperVideo.classList.remove("wallpaper-playing");
        wallpaperVideo.classList.add("wallpaper-failed");
    };

    const showVideo = () => {
        wallpaperVideo.classList.add("wallpaper-playing");
        wallpaperVideo.classList.remove("wallpaper-failed");
    };

    /*
     * Bind these once. "canplay" is intentionally not used:
     * mobile browsers may fire it while displaying a frozen frame.
     */
    if (wallpaperVideo.dataset.playbackEventsBound !== "true") {
        wallpaperVideo.dataset.playbackEventsBound = "true";

        wallpaperVideo.addEventListener("timeupdate", () => {
            if (
                !wallpaperVideo.paused &&
                wallpaperVideo.currentTime > 0.05
            ) {
                showVideo();
            }
        });

        wallpaperVideo.addEventListener("playing", () => {
            const startingTime = wallpaperVideo.currentTime;

            window.setTimeout(() => {
                if (
                    !wallpaperVideo.paused &&
                    wallpaperVideo.currentTime > startingTime + 0.03
                ) {
                    showVideo();
                } else {
                    showCssFallback();
                }
            }, 350);
        });

        [
            "pause",
            "stalled",
            "abort",
            "error",
            "emptied"
        ].forEach(eventName => {
            wallpaperVideo.addEventListener(
                eventName,
                showCssFallback
            );
        });
    }

    /* Keep the animated CSS layer visible during every attempt. */
    showCssFallback();

    const playAttempt = wallpaperVideo.play();

    if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(showCssFallback);
    }
}


// Retry video playback after the first real user interaction.
["pointerdown", "touchstart", "click"].forEach(eventName => {
    document.addEventListener(eventName, startWallpaperVideo, {
        once: true,
        passive: true
    });
});

window.addEventListener("DOMContentLoaded", () => {
    startWallpaperVideo();

    const bootScreen =
        document.getElementById("startup-boot-screen");

    const brandScreen =
        document.getElementById("startup-brand-screen");

    const settingsScreen =
        document.getElementById("startup-settings-screen");

    const powerVideoScreen =
        document.getElementById("startup-power-video-screen");

    const powerVideo =
        document.getElementById("startup-power-video");

    if (!bootScreen || !brandScreen || !settingsScreen) return;

    const biosSections = Array.from(
        bootScreen.querySelectorAll(".bios-section")
    );

    const biosLogo =
        bootScreen.querySelector(".bios-bibi-logo");

    const biosBottomText =
        bootScreen.querySelector(".bios-bottom-text");

    const biosText =
        bootScreen.querySelector(".bios-text");

    function scrollBiosToLatestLine(targetLine = null, force = false) {
        if (!biosText) return;

        const performScroll = () => {
            const visibleLines = Array.from(
                biosText.querySelectorAll("p.bios-line-visible")
            );

            const latestLine =
                targetLine || visibleLines[visibleLines.length - 1];

            if (!latestLine) return;

            const textRectangle = biosText.getBoundingClientRect();
            const lineRectangle = latestLine.getBoundingClientRect();
            const lowerSafeEdge = textRectangle.bottom - 10;
            const upperSafeEdge = textRectangle.top + 6;

            let nextScrollTop = biosText.scrollTop;

            if (force || lineRectangle.bottom > lowerSafeEdge) {
                nextScrollTop += lineRectangle.bottom - lowerSafeEdge;
            } else if (lineRectangle.top < upperSafeEdge) {
                nextScrollTop -= upperSafeEdge - lineRectangle.top;
            }

            const maximumScrollTop = Math.max(
                0,
                biosText.scrollHeight - biosText.clientHeight
            );

            biosText.scrollTop = Math.max(
                0,
                Math.min(maximumScrollTop, nextScrollTop)
            );
        };

        window.requestAnimationFrame(() => {
            performScroll();
            window.requestAnimationFrame(performScroll);
        });
    }

    let bootSequenceFinished = false;
    let automaticBootTimer = null;
    let welcomeTimer = null;

    const animationTimers = [];

    function scheduleAnimation(callback, delay) {
        const timer = window.setTimeout(callback, delay);
        animationTimers.push(timer);
        return timer;
    }

    function clearBiosAnimationTimers() {
        animationTimers.forEach(timer => {
            window.clearTimeout(timer);
        });

        animationTimers.length = 0;
    }

    function finishBiosBoot() {
        if (bootSequenceFinished) return;

        bootSequenceFinished = true;

        clearBiosAnimationTimers();
        window.clearTimeout(automaticBootTimer);
        document.removeEventListener("keydown", handleBiosKey);
        bootScreen.removeEventListener("click", finishBiosBoot);

        /*
         * Put the next screen underneath the BIOS before its fade starts.
         * This prevents the wallpaper/desktop from appearing for one frame.
         */
        brandScreen.classList.remove("hidden");
        brandScreen.setAttribute("aria-hidden", "false");

        window.requestAnimationFrame(() => {
            bootScreen.classList.add("bios-exiting");
        });

        window.setTimeout(() => {
            bootScreen.classList.add("hidden");
            bootScreen.setAttribute("aria-hidden", "true");

            window.setTimeout(() => {
                /* Show Welcome before removing the Beatriz screen. */
                settingsScreen.classList.remove("hidden");
                settingsScreen.setAttribute("aria-hidden", "false");

                window.requestAnimationFrame(() => {
                    brandScreen.classList.add("hidden");
                    brandScreen.setAttribute("aria-hidden", "true");
                });

                startWelcomeFireworks();

                welcomeTimer = window.setTimeout(() => {
                    /*
                     * Reveal the desktop underneath Welcome first, then remove
                     * Welcome on the next frame. This keeps the hand-off solid.
                     */
                    document.body.classList.remove("booting");
                    document.body.classList.add("desktop-loaded");

                    startWallpaperVideo();

                    window.requestAnimationFrame(() => {
                        settingsScreen.classList.add("hidden");
                        settingsScreen.setAttribute("aria-hidden", "true");
                    });
                }, 1700);
            }, 3500);
        }, 280);
    }

    function handleBiosKey(event) {
        if (
            event.key === "F1" ||
            event.key === "Enter" ||
            event.key === " "
        ) {
            event.preventDefault();
            finishBiosBoot();
        }
    }

    function startBiosTextAnimation() {
        bootScreen.classList.add("bios-animating");

        if (biosText) {
            biosText.scrollTop = 0;
        }

        let elapsed = 120;

        /* Power the logo on shortly after the first BIOS lines. */
        if (biosLogo) {
            scheduleAnimation(() => {
                biosLogo.classList.add("bios-logo-visible");
            }, 420);
        }

        biosSections.forEach((section, sectionIndex) => {
            const lines = Array.from(
                section.querySelectorAll("p")
            );

            lines.forEach((line, lineIndex) => {
                /* Status rows load slightly faster than headings. */
                const isFastStatusLine =
                    line.classList.contains("bios-status") ||
                    line.classList.contains("bios-detection");

                elapsed += isFastStatusLine ? 58 : 78;

                scheduleAnimation(() => {
                    line.classList.add("bios-line-visible");
                    scrollBiosToLatestLine(line);
                }, elapsed);
            });

            /* Small pause between BIOS blocks. */
            elapsed += sectionIndex < 5 ? 125 : 90;
        });

        const promptRevealTime = elapsed + 180;

        if (biosBottomText) {
            scheduleAnimation(() => {
                biosBottomText.classList.add(
                    "bios-prompt-visible"
                );
                scrollBiosToLatestLine(null, true);
            }, promptRevealTime);
        }

        /* Continue automatically after the loading animation finishes. */
        automaticBootTimer = window.setTimeout(
            finishBiosBoot,
            promptRevealTime + 2600
        );
    }

    let biosStarted = false;

    function beginBiosSequence() {
        if (biosStarted) return;
        biosStarted = true;

        document.body.classList.remove("powering-on");

        if (powerVideoScreen) {
            powerVideoScreen.classList.add("power-video-finished");
            powerVideoScreen.setAttribute("aria-hidden", "true");
        }

        /* BIOS skip controls become active only after the power-on video. */
        document.addEventListener("keydown", handleBiosKey);
        bootScreen.addEventListener("click", finishBiosBoot);

        startBiosTextAnimation();
        bootScreen.focus({ preventScroll: true });
    }

    function runPowerOnVideo() {
        /* Missing/unsupported asset must never trap the visitor on black. */
        if (!powerVideoScreen || !powerVideo) {
            beginBiosSequence();
            return;
        }

        let fallbackTimer = null;
        let hasFinished = false;
        let playAttemptInProgress = false;
        let interactionRetryBound = false;

        /* Recover the power-on layer even after bfcache/history restoration. */
        document.body.classList.add("powering-on");
        powerVideoScreen.classList.remove(
            "power-video-finished",
            "power-video-playing"
        );
        powerVideoScreen.classList.add("power-video-ready");
        powerVideoScreen.setAttribute("aria-hidden", "false");

        powerVideo.muted = true;
        powerVideo.defaultMuted = true;
        powerVideo.autoplay = true;
        powerVideo.playsInline = true;

        const removeInteractionRetry = () => {
            if (!interactionRetryBound) return;

            ["pointerdown", "touchstart", "keydown"].forEach(eventName => {
                document.removeEventListener(eventName, retryFromInteraction);
            });

            interactionRetryBound = false;
        };

        const finishPowerOnVideo = () => {
            if (hasFinished) return;
            hasFinished = true;

            removeInteractionRetry();

            if (fallbackTimer !== null) {
                window.clearTimeout(fallbackTimer);
                fallbackTimer = null;
            }

            beginBiosSequence();
        };

        const markPlaying = () => {
            powerVideoScreen.classList.add("power-video-playing");
        };

        const attemptPlayback = () => {
            if (hasFinished || playAttemptInProgress) return;

            playAttemptInProgress = true;

            const playAttempt = powerVideo.play();

            if (playAttempt && typeof playAttempt.then === "function") {
                playAttempt
                    .then(() => {
                        playAttemptInProgress = false;
                        markPlaying();
                        removeInteractionRetry();
                    })
                    .catch(() => {
                        /*
                         * Do NOT skip straight to BIOS when autoplay is refused.
                         * Keep the decoded first frame visible and retry on the
                         * visitor's first interaction instead.
                         */
                        playAttemptInProgress = false;

                        if (!interactionRetryBound) {
                            interactionRetryBound = true;

                            ["pointerdown", "touchstart", "keydown"].forEach(eventName => {
                                document.addEventListener(
                                    eventName,
                                    retryFromInteraction,
                                    { once: true, passive: eventName !== "keydown" }
                                );
                            });
                        }
                    });
            } else {
                playAttemptInProgress = false;
            }
        };

        function retryFromInteraction() {
            removeInteractionRetry();
            attemptPlayback();
        }

        const startVisiblePlayback = () => {
            if (hasFinished) return;

            powerVideoScreen.classList.add("power-video-ready");

            try {
                /* Only rewind if the clip has already advanced. */
                if (powerVideo.currentTime > 0.02) {
                    powerVideo.currentTime = 0;
                }
            } catch (error) {
                /* Seeking can fail until metadata is ready. */
            }

            window.requestAnimationFrame(() => {
                window.requestAnimationFrame(attemptPlayback);
            });
        };

        powerVideo.addEventListener("playing", markPlaying);
        powerVideo.addEventListener("ended", finishPowerOnVideo, { once: true });
        powerVideo.addEventListener("error", finishPowerOnVideo, { once: true });

        if (powerVideo.readyState >= 2) {
            startVisiblePlayback();
        } else {
            powerVideo.addEventListener("loadeddata", startVisiblePlayback, { once: true });
            powerVideo.addEventListener("canplay", startVisiblePlayback, { once: true });
            powerVideo.load();
        }

        /*
         * Also attempt immediately. Because the video is muted, modern browsers
         * normally allow this; loadeddata/canplay provide a second attempt.
         */
        attemptPlayback();

        /* Safety net: move on if the media file genuinely cannot play. */
        fallbackTimer = window.setTimeout(finishPowerOnVideo, 5000);
    }

    runPowerOnVideo();
});


const desktopIcons = document.querySelectorAll(".icon");
const windows = document.querySelectorAll(".window");
const taskbarWindows = document.getElementById("taskbar-windows");

const DISABLED_WINDOW_IDS = new Set([
    "haunted-mansion",
    "hermit-tower"
]);

let highestZ = 10000;
let galleryOffset = 0;


// ====================================
// WINDOW STATE HELPERS
// ====================================

function getWindowById(windowId) {
    if (!windowId) return null;

    return Array
        .from(windows)
        .find(windowElement => windowElement.dataset.windowId === windowId) || null;
}

function isWindowVisible(windowElement) {
    return Boolean(
        windowElement &&
        !windowElement.classList.contains("hidden")
    );
}

function getWindowZIndex(windowElement) {
    const parsedZIndex = Number.parseInt(
        window.getComputedStyle(windowElement).zIndex,
        10
    );

    return Number.isNaN(parsedZIndex)
        ? 0
        : parsedZIndex;
}

function clearActiveWindowState() {
    document
        .querySelectorAll(".window.active-window")
        .forEach(windowElement => {
            windowElement.classList.remove("active-window");
        });

    document
        .querySelectorAll(".task-button.active")
        .forEach(button => {
            button.classList.remove("active");
        });
}

function markWindowAsActive(windowElement) {
    if (!isWindowVisible(windowElement)) return;

    clearActiveWindowState();
    windowElement.classList.add("active-window");

    if (windowElement.taskButton) {
        windowElement.taskButton.classList.add("active");
    }
}

function activateTopVisibleWindow() {
    const visibleWindows = Array
        .from(windows)
        .filter(isWindowVisible)
        .sort((firstWindow, secondWindow) => (
            getWindowZIndex(secondWindow) -
            getWindowZIndex(firstWindow)
        ));

    if (!visibleWindows.length) {
        clearActiveWindowState();
        return;
    }

    markWindowAsActive(visibleWindows[0]);
}


// ====================================
// WINDOW MEDIA LIFECYCLE
// ====================================

function resetWindowMedia(windowElement) {
    if (!windowElement || windowElement.id !== "music-window") {
        return;
    }

    windowElement
        .querySelectorAll("iframe")
        .forEach(iframe => {
            const currentSource = iframe.src;

            if (!currentSource) return;

            iframe.src = "";

            requestAnimationFrame(() => {
                iframe.src = currentSource;
            });
        });
}


// ====================================
// WINDOW POSITIONING
// ====================================

function centerWindow(windowElement) {
    if (!windowElement) return;

    const taskbarHeight = 38;
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight - taskbarHeight;

    const left = Math.max(
        10,
        (availableWidth - windowElement.offsetWidth) / 2
    );

    const top = Math.max(
        10,
        (availableHeight - windowElement.offsetHeight) / 2
    );

    windowElement.style.left = `${Math.round(left)}px`;
    windowElement.style.top = `${Math.round(top)}px`;
}

function positionSocialsWindow(windowElement) {
    if (!windowElement || window.innerWidth <= 700) return;

    const taskbarHeight = 38;
    const availableHeight = window.innerHeight - taskbarHeight;

    const preferredLeft = window.innerWidth * 0.104;
    const preferredTop = availableHeight * 0.60;

    const maximumLeft = Math.max(
        14,
        window.innerWidth - windowElement.offsetWidth - 14
    );

    const maximumTop = Math.max(
        14,
        availableHeight - windowElement.offsetHeight - 14
    );

    windowElement.style.left = `${Math.round(
        Math.max(14, Math.min(preferredLeft, maximumLeft))
    )}px`;

    windowElement.style.top = `${Math.round(
        Math.max(14, Math.min(preferredTop, maximumTop))
    )}px`;
}

function positionAboutWindow(windowElement) {
    if (!windowElement) return;

    if (window.innerWidth <= 700) {
        centerWindow(windowElement);
        return;
    }

    const taskbarHeight = 38;
    const availableHeight = window.innerHeight - taskbarHeight;

    const preferredLeft = window.innerWidth * 0.10;
    const preferredTop = availableHeight * 0.075;

    const maximumLeft = Math.max(
        12,
        window.innerWidth - windowElement.offsetWidth - 12
    );

    const maximumTop = Math.max(
        12,
        availableHeight - windowElement.offsetHeight - 12
    );

    windowElement.style.left = `${Math.round(
        Math.max(12, Math.min(preferredLeft, maximumLeft))
    )}px`;

    windowElement.style.top = `${Math.round(
        Math.max(12, Math.min(preferredTop, maximumTop))
    )}px`;
}

function positionGalleryWindow(windowElement) {
    const startLeft = 180;
    const startTop = 80;

    windowElement.style.left = `${startLeft + galleryOffset}px`;
    windowElement.style.top = `${startTop + galleryOffset}px`;

    galleryOffset += 35;

    if (galleryOffset > 175) {
        galleryOffset = 0;
    }
}

function positionWindowForFirstOpen(windowElement) {
    if (!windowElement) return;

    if (windowElement.id === "about-window") {
        positionAboutWindow(windowElement);
        return;
    }

    if (windowElement.id === "socials-window") {
        positionSocialsWindow(windowElement);
        return;
    }

    if (windowElement.id === "contact-window") {
        windowElement.style.left = "650px";
        windowElement.style.top = "120px";
        return;
    }

    if (
        windowElement.id === "music-window" ||
        windowElement.id === "image-preview-window" ||
        windowElement.id === "trojan-window" ||
        windowElement.id === "memories-window" ||
        windowElement.id === "disney-window" ||
        windowElement.id === "miku-window" ||
        windowElement.id === "san-francisco-window" ||
        windowElement.id === "in-my-room-window" ||
        windowElement.id === "hanekawa-window" ||
        windowElement.id === "magical-lake-window" ||
        windowElement.classList.contains("graphic-project-window")
    ) {
        centerWindow(windowElement);
        return;
    }

    if (isGalleryWindow(windowElement)) {
        positionGalleryWindow(windowElement);
        return;
    }

    windowElement.style.left = "180px";
    windowElement.style.top = "120px";
}


// ====================================
// GALLERY STATE
// ====================================

function isGalleryWindow(windowElement) {
    if (!windowElement) return false;

    return windowElement.querySelector(
        ".project-gallery, .graphic-project-gallery"
    ) !== null;
}

function closeOtherGalleryWindows(windowToKeep) {
    document
        .querySelectorAll(".window:not(.hidden)")
        .forEach(openWindowElement => {
            if (
                openWindowElement !== windowToKeep &&
                isGalleryWindow(openWindowElement)
            ) {
                closeWindow(openWindowElement);
            }
        });
}


// ====================================
// CORE WINDOW ACTIONS
// ====================================

function bringToFront(windowElement) {
    if (!isWindowVisible(windowElement)) return;

    const visibleWindows = Array.from(
        document.querySelectorAll(".window:not(.hidden)")
    );

    const currentHighestZ = visibleWindows.reduce(
        (highestValue, currentWindow) => (
            Math.max(highestValue, getWindowZIndex(currentWindow))
        ),
        highestZ
    );

    highestZ = currentHighestZ + 1;
    windowElement.style.zIndex = String(highestZ);
}

function minimizeWindow(windowElement) {
    if (!isWindowVisible(windowElement)) return;

    windowElement.classList.add("hidden");
    windowElement.classList.remove("active-window");

    if (windowElement.taskButton) {
        windowElement.taskButton.classList.remove("active");
    }

    resetWindowMedia(windowElement);
    activateTopVisibleWindow();
}

function minimizeAllWindows() {
    Array
        .from(windows)
        .filter(isWindowVisible)
        .forEach(windowElement => {
            windowElement.classList.add("hidden");
            windowElement.classList.remove("active-window");

            if (windowElement.taskButton) {
                windowElement.taskButton.classList.remove("active");
            }

            resetWindowMedia(windowElement);
        });

    clearActiveWindowState();
}

function restoreWindow(windowElement) {
    if (!windowElement) return;

    const windowId = windowElement.dataset.windowId;

    if (DISABLED_WINDOW_IDS.has(windowId)) {
        return;
    }

    if (isGalleryWindow(windowElement)) {
        closeOtherGalleryWindows(windowElement);
    }

    windowElement.classList.remove("hidden");

    if (windowElement.id === "trojan-window") {
        startTrojanBinaryVideo();
    }

    bringToFront(windowElement);
    markWindowAsActive(windowElement);
}

function openWindow(windowElement) {
    if (!windowElement) return;

    const windowId = windowElement.dataset.windowId;

    if (DISABLED_WINDOW_IDS.has(windowId)) {
        return;
    }

    /* A hidden window with a task button is minimized, not closed. */
    if (
        windowElement.classList.contains("hidden") &&
        windowElement.taskButton
    ) {
        restoreWindow(windowElement);
        return;
    }

    if (isGalleryWindow(windowElement)) {
        closeOtherGalleryWindows(windowElement);
    }

    const wasHidden = windowElement.classList.contains("hidden");
    windowElement.classList.remove("hidden");

    if (wasHidden) {
        positionWindowForFirstOpen(windowElement);
    }

    if (windowElement.id === "shutdown-dialog") {
        windowElement.style.left = "50%";
        windowElement.style.top = "50%";
        windowElement.style.transform = "translate(-50%, -50%)";
    }

    if (windowElement.id === "trojan-window") {
        startTrojanBinaryVideo();
    }

    createTaskButton(windowElement);
    bringToFront(windowElement);
    markWindowAsActive(windowElement);
}

function closeWindow(windowElement) {
    if (!windowElement) return;

    const wasActive = windowElement.classList.contains("active-window");

    windowElement.classList.add("hidden");
    windowElement.classList.remove("active-window");

    resetWindowMedia(windowElement);

    if (windowElement.taskButton) {
        windowElement.taskButton.remove();
        windowElement.taskButton = null;
    }

    if (wasActive) {
        activateTopVisibleWindow();
    }
}


// ====================================
// DESKTOP ICONS
// Click visible app again -> minimize to taskbar
// ====================================

function activateWindowFromDesktopIcon(icon) {
    const windowId = icon?.dataset.window;

    if (!windowId) return;

    const menu = document.getElementById("start-menu");

    if (menu) {
        menu.classList.add("hidden");
    }

    if (windowId === "home") {
        minimizeAllWindows();
        return;
    }

    if (DISABLED_WINDOW_IDS.has(windowId)) {
        return;
    }

    const windowElement = getWindowById(windowId);

    if (!windowElement) return;

    /* Desktop icons work as a true toggle. */
    if (isWindowVisible(windowElement)) {
        minimizeWindow(windowElement);
        return;
    }

    if (windowElement.taskButton) {
        restoreWindow(windowElement);
        return;
    }

    openWindow(windowElement);
}

desktopIcons.forEach(icon => {
    icon.addEventListener("click", () => {
        activateWindowFromDesktopIcon(icon);
    });
});


// ====================================
// WINDOW CONTROLS
// ====================================

windows.forEach(windowElement => {
    windowElement.addEventListener("mousedown", () => {
        if (!isWindowVisible(windowElement)) return;

        bringToFront(windowElement);
        markWindowAsActive(windowElement);
    });

    const closeButton = windowElement.querySelector(".close");
    const minimizeButton = windowElement.querySelector(".minimize");
    const maximizeButton = windowElement.querySelector(".maximize");

    let maximized = false;

    if (closeButton) {
        closeButton.addEventListener("click", event => {
            event.stopPropagation();
            closeWindow(windowElement);
        });
    }

    if (minimizeButton) {
        minimizeButton.addEventListener("click", event => {
            event.stopPropagation();
            minimizeWindow(windowElement);
        });
    }

    if (maximizeButton) {
        maximizeButton.addEventListener("click", event => {
            event.stopPropagation();

            if (!maximized) {
                windowElement.dataset.left = windowElement.style.left;
                windowElement.dataset.top = windowElement.style.top;
                windowElement.dataset.width = (
                    windowElement.style.width ||
                    `${windowElement.offsetWidth}px`
                );
                windowElement.dataset.height = (
                    windowElement.style.height ||
                    `${windowElement.offsetHeight}px`
                );

                windowElement.style.left = "0";
                windowElement.style.top = "0";
                windowElement.style.width = "100vw";
                windowElement.style.height = "calc(100vh - 38px)";
                windowElement.classList.add("is-maximized");
                maximized = true;
                return;
            }

            windowElement.style.left = windowElement.dataset.left || "180px";
            windowElement.style.top = windowElement.dataset.top || "120px";
            windowElement.style.width = windowElement.dataset.width || "620px";
            windowElement.style.height = windowElement.dataset.height || "auto";
            windowElement.classList.remove("is-maximized");
            maximized = false;
        });
    }
});


// ====================================
// TASKBAR BUTTONS
// ====================================

function createTaskButton(windowElement) {
    if (!windowElement || windowElement.taskButton) return;

    const windowId = windowElement.dataset.windowId;

    /* Dialogs without an application ID do not belong in the taskbar. */
    if (!windowId) return;

    const iconPaths = {
        about: "assets/icons/about me.ico",
        memories: "assets/icons/memories.svg",
        photography: "assets/icons/photography.ico",
        "disney 2010": "assets/icons/photography.ico",
        "miku 2010": "assets/icons/photography.ico",
        "san francisco 2012": "assets/icons/photography.ico",
        "in my room 2017": "assets/icons/photography.ico",
        hanekawa: "assets/icons/photography.ico",
        "graphic-arts": "assets/icons/graphic arts.ico",
        "graphic-project-one": "assets/icons/graphic arts.ico",
        "graphic-project-two": "assets/icons/graphic arts.ico",
        music: "assets/icons/music.ico",
        "magical-lake": "assets/icons/magical-lake.svg",
        socials: "assets/icons/iexplore.ico",
        contact: "assets/icons/contato.ico",
        trash: "assets/icons/trash.ico",
        trojan: "assets/icons/trash.ico",
        "image-preview": "assets/icons/photography.ico"
    };

    const button = document.createElement("button");
    button.type = "button";
    button.className = "task-button";

    const icon = document.createElement("img");
    icon.className = "task-button-icon";
    icon.src = iconPaths[windowId] || "assets/icons/computer.ico";
    icon.alt = "";

    const text = document.createElement("span");
    text.className = "task-button-text";

    const title = windowElement.querySelector(".title-bar span");
    text.textContent = title ? title.textContent : windowId;

    const closeTab = document.createElement("span");
    closeTab.className = "task-button-close";
    closeTab.textContent = "×";
    closeTab.title = `Close ${text.textContent}`;
    closeTab.setAttribute("aria-hidden", "true");

    button.append(icon, text, closeTab);

    const closeFromTaskbar = event => {
        event.preventDefault();
        event.stopPropagation();
        closeWindow(windowElement);
    };

    closeTab.addEventListener("click", closeFromTaskbar);

    button.addEventListener("click", () => {
        if (!isWindowVisible(windowElement)) {
            restoreWindow(windowElement);
            return;
        }

        /* Windows-style behavior: active task button minimizes. */
        if (windowElement.classList.contains("active-window")) {
            minimizeWindow(windowElement);
            return;
        }

        bringToFront(windowElement);
        markWindowAsActive(windowElement);
    });

    taskbarWindows.appendChild(button);
    windowElement.taskButton = button;
}


// ====================================
// CLOCK + AERO MONTH CALENDAR
// ====================================

const clock =
    document.getElementById("clock");

const clockCalendar =
    document.getElementById("clock-calendar");

const calendarTitle =
    document.getElementById("calendar-title");

const calendarDays =
    document.getElementById("calendar-days");

const calendarPrevious =
    document.getElementById("calendar-previous");

const calendarNext =
    document.getElementById("calendar-next");

const calendarTodayButton =
    document.getElementById("calendar-today-button");


let visibleCalendarDate = new Date();

visibleCalendarDate.setDate(1);


function updateClock() {

    const now = new Date();

    clock.textContent =
        now.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });

    clock.title =
        now.toLocaleDateString([], {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
}


function datesAreEqual(firstDate, secondDate) {

    return (
        firstDate.getFullYear() === secondDate.getFullYear() &&
        firstDate.getMonth() === secondDate.getMonth() &&
        firstDate.getDate() === secondDate.getDate()
    );
}


function createCalendarDay(date, displayedMonth) {

    const today = new Date();

    const dayElement =
        document.createElement("button");

    dayElement.type = "button";
    dayElement.className = "calendar-day";
    dayElement.textContent = date.getDate();

    if (date.getMonth() !== displayedMonth) {
        dayElement.classList.add("outside-month");
    }

    if (datesAreEqual(date, today)) {
        dayElement.classList.add("today");
    }

    dayElement.title =
        date.toLocaleDateString([], {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

    dayElement.addEventListener("click", event => {

        event.stopPropagation();

        visibleCalendarDate =
            new Date(
                date.getFullYear(),
                date.getMonth(),
                1
            );

        buildCalendar();
    });

    return dayElement;
}


function buildCalendar() {

    const year =
        visibleCalendarDate.getFullYear();

    const month =
        visibleCalendarDate.getMonth();

    calendarTitle.textContent =
        visibleCalendarDate.toLocaleDateString([], {
            month: "long",
            year: "numeric"
        });

    calendarDays.innerHTML = "";

    const firstDayOfMonth =
        new Date(year, month, 1);

    const gridStartDate =
        new Date(firstDayOfMonth);

    gridStartDate.setDate(
        firstDayOfMonth.getDate() -
        firstDayOfMonth.getDay()
    );

    /*
     * Six rows of seven days.
     */
    for (let index = 0; index < 42; index++) {

        const date =
            new Date(gridStartDate);

        date.setDate(
            gridStartDate.getDate() + index
        );

        calendarDays.appendChild(
            createCalendarDay(date, month)
        );
    }
}


calendarPrevious.addEventListener("click", event => {

    event.stopPropagation();

    visibleCalendarDate =
        new Date(
            visibleCalendarDate.getFullYear(),
            visibleCalendarDate.getMonth() - 1,
            1
        );

    buildCalendar();
});


calendarNext.addEventListener("click", event => {

    event.stopPropagation();

    visibleCalendarDate =
        new Date(
            visibleCalendarDate.getFullYear(),
            visibleCalendarDate.getMonth() + 1,
            1
        );

    buildCalendar();
});


calendarTodayButton.addEventListener("click", event => {

    event.stopPropagation();

    const today = new Date();

    visibleCalendarDate =
        new Date(
            today.getFullYear(),
            today.getMonth(),
            1
        );

    buildCalendar();
});


/*
 * Keep the calendar open while using its buttons.
 */
clockCalendar.addEventListener("click", event => {
    event.stopPropagation();
});


updateClock();
buildCalendar();

setInterval(updateClock, 1000);

windows.forEach(window => {

    const titleBar = window.querySelector(".title-bar");

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    titleBar.addEventListener("mousedown", (e) => {

        window.style.zIndex = ++highestZ;

        isDragging = true;

        offsetX = e.clientX - window.offsetLeft;
        offsetY = e.clientY - window.offsetTop;

    });

    document.addEventListener("mousemove", (e) => {

        if (!isDragging) return;

        window.style.left = `${e.clientX - offsetX}px`;
        window.style.top = `${e.clientY - offsetY}px`;

    });

    document.addEventListener("mouseup", () => {

        isDragging = false;

    });

});

// ====================================
// WINDOW EDGE + CORNER RESIZING
// ====================================

const WINDOW_RESIZE_DIRECTIONS = [
    "north",
    "east",
    "south",
    "west",
    "north-east",
    "north-west",
    "south-east",
    "south-west"
];

function canResizeWindowsWithCursor() {
    return (
        !window.matchMedia("(max-width: 700px)").matches &&
        window.matchMedia("(hover: hover) and (pointer: fine)").matches
    );
}

function getResizeMinimum(windowElement, property, fallback) {
    const computedValue = Number.parseFloat(
        window.getComputedStyle(windowElement)[property]
    );

    if (Number.isFinite(computedValue) && computedValue > 0) {
        return Math.max(fallback, computedValue);
    }

    return fallback;
}

function addResizeHandles(windowElement) {
    if (!windowElement || windowElement.dataset.resizeHandles === "true") {
        return;
    }

    windowElement.dataset.resizeHandles = "true";

    WINDOW_RESIZE_DIRECTIONS.forEach(direction => {
        const handle = document.createElement("div");

        handle.className =
            `window-resize-handle window-resize-${direction}`;

        handle.dataset.resizeDirection = direction;
        handle.setAttribute("aria-hidden", "true");

        windowElement.appendChild(handle);

        handle.addEventListener("pointerdown", event => {
            if (
                !canResizeWindowsWithCursor() ||
                windowElement.classList.contains("is-maximized") ||
                windowElement.classList.contains("hidden")
            ) {
                return;
            }

            if (event.button !== 0) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            bringToFront(windowElement);

            const startingRectangle =
                windowElement.getBoundingClientRect();

            const startingX = event.clientX;
            const startingY = event.clientY;

            const startingLeft = startingRectangle.left;
            const startingTop = startingRectangle.top;
            const startingRight = startingRectangle.right;
            const startingBottom = startingRectangle.bottom;

            const minimumWidth = getResizeMinimum(
                windowElement,
                "minWidth",
                280
            );

            const minimumHeight = getResizeMinimum(
                windowElement,
                "minHeight",
                160
            );

            const screenMargin = 4;
            const taskbarHeight = 38;

            const maximumRight =
                window.innerWidth - screenMargin;

            const maximumBottom =
                window.innerHeight - taskbarHeight - screenMargin;

            const resizeNorth = direction.includes("north");
            const resizeSouth = direction.includes("south");
            const resizeEast = direction.includes("east");
            const resizeWest = direction.includes("west");

            windowElement.classList.add("is-resizing");
            document.body.classList.add("window-resize-active");

            handle.setPointerCapture(event.pointerId);

            const resizeWindow = moveEvent => {
                const movementX = moveEvent.clientX - startingX;
                const movementY = moveEvent.clientY - startingY;

                let left = startingLeft;
                let top = startingTop;
                let right = startingRight;
                let bottom = startingBottom;

                if (resizeEast) {
                    right = Math.min(
                        maximumRight,
                        Math.max(
                            startingLeft + minimumWidth,
                            startingRight + movementX
                        )
                    );
                }

                if (resizeWest) {
                    left = Math.max(
                        screenMargin,
                        Math.min(
                            startingRight - minimumWidth,
                            startingLeft + movementX
                        )
                    );
                }

                if (resizeSouth) {
                    bottom = Math.min(
                        maximumBottom,
                        Math.max(
                            startingTop + minimumHeight,
                            startingBottom + movementY
                        )
                    );
                }

                if (resizeNorth) {
                    top = Math.max(
                        screenMargin,
                        Math.min(
                            startingBottom - minimumHeight,
                            startingTop + movementY
                        )
                    );
                }

                const width = Math.max(minimumWidth, right - left);
                const height = Math.max(minimumHeight, bottom - top);

                windowElement.style.position = "absolute";
                windowElement.style.transform = "none";
                windowElement.style.left = `${Math.round(left)}px`;
                windowElement.style.top = `${Math.round(top)}px`;
                windowElement.style.width = `${Math.round(width)}px`;
                windowElement.style.height = `${Math.round(height)}px`;
                windowElement.style.maxWidth = "none";
                windowElement.style.maxHeight = "none";
            };

            const finishResize = finishEvent => {
                handle.removeEventListener(
                    "pointermove",
                    resizeWindow
                );

                handle.removeEventListener(
                    "pointerup",
                    finishResize
                );

                handle.removeEventListener(
                    "pointercancel",
                    finishResize
                );

                if (handle.hasPointerCapture(finishEvent.pointerId)) {
                    handle.releasePointerCapture(finishEvent.pointerId);
                }

                windowElement.classList.remove("is-resizing");
                document.body.classList.remove("window-resize-active");
            };

            handle.addEventListener("pointermove", resizeWindow);
            handle.addEventListener("pointerup", finishResize);
            handle.addEventListener("pointercancel", finishResize);
        });
    });
}

document
    .querySelectorAll(".window")
    .forEach(addResizeHandles);

// ====================================
// MUSIC TABS
// ====================================

const tabs = document.querySelectorAll(".music-tab");

tabs.forEach(tab => {

    tab.addEventListener("click", () => {

        const target = tab.dataset.tab;

        // Remove active from all buttons
        tabs.forEach(t => {
            t.classList.remove("active");
        });

        // Remove active from all content
        document.querySelectorAll(".music-content").forEach(content => {
            content.classList.remove("active");
        });


        // Activate clicked tab
        tab.classList.add("active");


        // Show correct content
        const selectedContent = document.getElementById(`${target}-tab`);

        if(selectedContent){
            selectedContent.classList.add("active");
        }

    });

});

// ------------------------------------
// MOBILE SOUNDCLOUD ARTWORK PLAYERS
// ------------------------------------
// The compact SoundCloud player is preserved on desktop. On phones, switch
// the same embeds to SoundCloud's visual player so each track artwork is shown.
const soundCloudMobileQuery =
    window.matchMedia("(max-width: 700px)");

function syncSoundCloudPlayerMode() {
    const useVisualPlayer = soundCloudMobileQuery.matches;

    document
        .querySelectorAll("#soundcloud-tab iframe")
        .forEach(iframe => {
            if (!iframe.dataset.desktopSrc) {
                iframe.dataset.desktopSrc =
                    iframe.getAttribute("src") || "";
            }

            const desktopSrc = iframe.dataset.desktopSrc;
            if (!desktopSrc) return;

            const visualSuffix =
                "&visual=true" +
                "&show_artwork=true" +
                "&show_comments=false" +
                "&hide_related=true";

            const desiredSrc = useVisualPlayer
                ? desktopSrc + visualSuffix
                : desktopSrc;

            if (iframe.getAttribute("src") !== desiredSrc) {
                iframe.setAttribute("src", desiredSrc);
            }
        });
}

syncSoundCloudPlayerMode();

if (typeof soundCloudMobileQuery.addEventListener === "function") {
    soundCloudMobileQuery.addEventListener(
        "change",
        syncSoundCloudPlayerMode
    );
} else if (typeof soundCloudMobileQuery.addListener === "function") {
    soundCloudMobileQuery.addListener(syncSoundCloudPlayerMode);
}


// ====================================
// PHOTO GALLERY FOLDERS
// ====================================

const photoFolders = document.querySelectorAll(".photo-folder");

photoFolders.forEach(folder => {

    folder.addEventListener("click", () => {

        const gallery = folder.dataset.gallery;


        const galleryWindow = document.querySelector(
            `[data-window-id="${gallery}"]`
        );


        if(galleryWindow){

            openWindow(galleryWindow);

        }

    });

});

// ====================================
// AUTOMATIC NUMBERED PHOTO GALLERIES
// ====================================

const numberedPhotoExtensions = [
    "jpg",
    "JPG",
    "jpeg",
    "JPEG",
    "png",
    "PNG",
    "webp",
    "WEBP"
];

function resolveNumberedPhotoExtension(
    folderPath,
    photoNumber,
    onResolved,
    onMissing
) {
    let extensionIndex = 0;
    const probeImage = new Image();

    function tryNextExtension() {
        if (extensionIndex >= numberedPhotoExtensions.length) {
            probeImage.onload = null;
            probeImage.onerror = null;

            if (typeof onMissing === "function") {
                onMissing();
            }

            return;
        }

        const extension =
            numberedPhotoExtensions[extensionIndex];

        extensionIndex += 1;

        probeImage.onload = () => {
            probeImage.onload = null;
            probeImage.onerror = null;
            onResolved(extension);
        };

        probeImage.onerror = tryNextExtension;
        probeImage.src =
            `${folderPath}/${photoNumber}.${extension}`;
    }

    tryNextExtension();
}

// Load the San Francisco folder thumbnail without requiring a fixed extension.
document
    .querySelectorAll("[data-numbered-thumbnail]")
    .forEach(thumbnail => {
        const folderPath = thumbnail.dataset.photoFolder;
        const photoNumber = Number.parseInt(
            thumbnail.dataset.photoNumber,
            10
        ) || 1;

        if (!folderPath) {
            return;
        }

        resolveNumberedPhotoExtension(
            folderPath,
            photoNumber,
            extension => {
                thumbnail.src =
                    `${folderPath}/${photoNumber}.${extension}`;
            },
            () => {
                thumbnail.src = "assets/icons/photography.ico";
                thumbnail.classList.add(
                    "photo-folder-fallback-icon"
                );
            }
        );
    });

// Build galleries from numbered files such as 1.jpg, 2.jpg, 3.jpg...
document
    .querySelectorAll("[data-numbered-gallery]")
    .forEach(gallery => {
        const folderPath = gallery.dataset.photoFolder;
        const photoCount = Number.parseInt(
            gallery.dataset.photoCount,
            10
        ) || 12;
        const galleryTitle =
            gallery.dataset.galleryTitle || "Gallery";

        if (!folderPath || photoCount < 1) {
            return;
        }

        resolveNumberedPhotoExtension(
            folderPath,
            1,
            extension => {
                const galleryFragment =
                    document.createDocumentFragment();

                for (
                    let photoNumber = 1;
                    photoNumber <= photoCount;
                    photoNumber += 1
                ) {
                    const galleryImage =
                        document.createElement("img");

                    galleryImage.src =
                        `${folderPath}/${photoNumber}.${extension}`;
                    galleryImage.alt =
                        `${galleryTitle} ${String(photoNumber).padStart(2, "0")}`;
                    galleryImage.loading = "lazy";
                    galleryImage.decoding = "async";

                    // Missing numbers do not leave broken-image boxes.
                    galleryImage.addEventListener(
                        "error",
                        () => galleryImage.remove(),
                        { once: true }
                    );

                    galleryFragment.appendChild(galleryImage);
                }

                gallery.appendChild(galleryFragment);
            },
            () => {
                const emptyMessage =
                    document.createElement("p");

                emptyMessage.className =
                    "numbered-gallery-empty";
                emptyMessage.textContent =
                    "No numbered photos were found in this folder.";

                gallery.appendChild(emptyMessage);
            }
        );
    });


// ====================================
// IMAGE + MEMORY PREVIEW WINDOW
// ====================================

const previewWindow =
    document.getElementById("image-preview-window");

const previewImage =
    document.getElementById("preview-image");

const previewVideo =
    document.getElementById("preview-video");

const previewTitle =
    document.getElementById("preview-title");

const previousPhotoButton =
    document.getElementById("previous-photo");

const nextPhotoButton =
    document.getElementById("next-photo");

const photoCounter =
    document.getElementById("photo-counter");

const photoNavigation =
    previewWindow?.querySelector(".photo-navigation");

let currentGalleryImages = [];
let currentPhotoIndex = 0;
let previewSourceMode = "gallery";

function stopPreviewVideo() {
    if (!previewVideo) return;

    previewVideo.pause();
    previewVideo.removeAttribute("src");
    previewVideo.load();
    previewVideo.classList.add("hidden");
}

function showPreviewImageElement() {
    if (!previewImage) return;

    previewImage.classList.remove("hidden");
}

function setSingleMemoryPreview(enabled) {
    if (!previewWindow) return;

    previewWindow.classList.toggle(
        "single-memory-preview",
        enabled
    );

    if (photoNavigation) {
        photoNavigation.setAttribute(
            "aria-hidden",
            enabled ? "true" : "false"
        );
    }
}

// Displays one photograph from a normal gallery.
function showPreviewPhoto(index) {
    if (
        !previewImage ||
        !previewTitle ||
        currentGalleryImages.length === 0
    ) {
        return;
    }

    if (index < 0) {
        index = currentGalleryImages.length - 1;
    }

    if (index >= currentGalleryImages.length) {
        index = 0;
    }

    currentPhotoIndex = index;

    const selectedImage =
        currentGalleryImages[currentPhotoIndex];

    stopPreviewVideo();
    showPreviewImageElement();

    previewImage.src = selectedImage.currentSrc || selectedImage.src;
    previewImage.alt = selectedImage.alt || "Gallery photo";
    previewTitle.textContent = selectedImage.alt || "Photo";

    if (photoCounter) {
        photoCounter.textContent =
            `${currentPhotoIndex + 1} / ${currentGalleryImages.length}`;
    }
}

function previewFileExtension(source = "") {
    const cleanSource = source.split("?")[0].split("#")[0];
    const extension = cleanSource.split(".").pop();
    return extension ? extension.toLowerCase() : "";
}

function previewItemIsVideo(item, mediaElement) {
    if (mediaElement?.tagName === "VIDEO" || item?.type === "video") {
        return true;
    }

    return new Set([
        "mp4",
        "webm",
        "mov",
        "m4v",
        "ogg",
        "ogv"
    ]).has(previewFileExtension(item?.src || ""));
}

/*
 * Memories use the same viewer shell as the galleries, but they open as a
 * single item. Only the Previous/Next/counter strip is hidden; the title bar,
 * menu bar, minimize, maximize, and close controls remain untouched.
 */
window.openMemoryInPhotoViewer = (item, mediaElement) => {
    if (!previewWindow || !previewImage || !previewTitle || !item?.src) {
        return;
    }

    previewSourceMode = "memory";
    currentGalleryImages = [];
    currentPhotoIndex = 0;
    setSingleMemoryPreview(true);

    const title =
        item.title ||
        mediaElement?.getAttribute("alt") ||
        "Memory";

    previewTitle.textContent = title;

    if (previewItemIsVideo(item, mediaElement) && previewVideo) {
        previewImage.classList.add("hidden");
        stopPreviewVideo();

        previewVideo.src = item.src;
        previewVideo.poster = item.poster || "";
        previewVideo.muted = true;
        previewVideo.defaultMuted = true;
        previewVideo.playsInline = true;
        previewVideo.classList.remove("hidden");

        const playAttempt = previewVideo.play();
        if (playAttempt && typeof playAttempt.catch === "function") {
            playAttempt.catch(() => {});
        }
    } else {
        stopPreviewVideo();
        showPreviewImageElement();

        previewImage.src =
            mediaElement?.currentSrc ||
            mediaElement?.src ||
            item.src;

        previewImage.alt = title;
    }

    openWindow(previewWindow);
    bringToFront(previewWindow);
};

// Opens static and dynamically generated gallery photos.
document.addEventListener("click", event => {
    const img = event.target.closest(
        ".project-gallery img, .graphic-project-gallery img"
    );

    if (!img) {
        return;
    }

    const gallery = img.closest(
        ".project-gallery, .graphic-project-gallery"
    );

    if (!gallery) {
        return;
    }

    previewSourceMode = "gallery";
    setSingleMemoryPreview(false);

    currentGalleryImages =
        Array.from(gallery.querySelectorAll("img"));

    currentPhotoIndex =
        currentGalleryImages.indexOf(img);

    showPreviewPhoto(currentPhotoIndex);
    openWindow(previewWindow);
});

previousPhotoButton?.addEventListener("click", () => {
    if (previewSourceMode === "gallery") {
        showPreviewPhoto(currentPhotoIndex - 1);
    }
});

nextPhotoButton?.addEventListener("click", () => {
    if (previewSourceMode === "gallery") {
        showPreviewPhoto(currentPhotoIndex + 1);
    }
});

// ====================================
// IMAGE PREVIEW KEYBOARD CONTROLS
// ====================================

document.addEventListener("keydown", event => {
    if (!previewWindow || previewWindow.classList.contains("hidden")) {
        return;
    }

    if (
        previewSourceMode === "gallery" &&
        currentGalleryImages.length > 0
    ) {
        if (event.key === "ArrowLeft") {
            showPreviewPhoto(currentPhotoIndex - 1);
        }

        if (event.key === "ArrowRight") {
            showPreviewPhoto(currentPhotoIndex + 1);
        }
    }

    if (event.key === "Escape") {
        closeWindow(previewWindow);
    }
});

if (previewWindow) {
    const previewVisibilityObserver = new MutationObserver(() => {
        if (previewWindow.classList.contains("hidden")) {
            previewVideo?.pause();
        }
    });

    previewVisibilityObserver.observe(previewWindow, {
        attributes: true,
        attributeFilter: ["class"]
    });
}


// ====================================
// GRAPHIC ARTS PROJECT FOLDERS
// ====================================

const graphicProjectFolders =
    document.querySelectorAll(".graphic-project-folder");

graphicProjectFolders.forEach(folder => {

    folder.addEventListener("click", () => {

        const galleryId = folder.dataset.gallery;

        const projectWindow =
            document.querySelector(
                `[data-window-id="${galleryId}"]`
            );

        if (!projectWindow) {
            return;
        }

        openWindow(projectWindow);

    });

});



window.addEventListener("resize", () => {

    const musicWindow =
        document.getElementById("music-window");

    const previewWindow =
        document.getElementById("image-preview-window");

    if (
        musicWindow &&
        !musicWindow.classList.contains("hidden")
    ) {
        centerWindow(musicWindow);
    }

    if (
        previewWindow &&
        !previewWindow.classList.contains("hidden")
    ) {
        centerWindow(previewWindow);
    }

});

// ====================================
// START MENU
// ====================================

const startButton = document.getElementById("startButton");
const startMenu = document.getElementById("start-menu");

startButton.addEventListener("click",(e)=>{

    e.stopPropagation();

    startMenu.classList.toggle("hidden");

});

document.addEventListener("click",()=>{

    startMenu.classList.add("hidden");

});

startMenu.addEventListener("click",(e)=>{

    e.stopPropagation();

});

document.querySelectorAll(".start-item[data-window]").forEach(item => {
    item.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();

        startMenu.classList.add("hidden");

        const windowElement = getWindowById(item.dataset.window);

        if (windowElement) {
            openWindow(windowElement);
        }
    });
});

// ====================================
// SHUTDOWN
// ====================================

const shutdownButton =
document.getElementById("shutdown-button");

const shutdownDialog =
document.getElementById("shutdown-dialog");

shutdownButton.addEventListener("click", () => {

    startMenu.classList.add("hidden");

    shutdownDialog.style.left = "50%";
    shutdownDialog.style.top = "50%";
    shutdownDialog.style.transform = "translate(-50%, -50%)";

    openWindow(shutdownDialog);

});

document.getElementById("shutdown-cancel")
.addEventListener("click",()=>{

    closeWindow(shutdownDialog);

});


document
    .getElementById("shutdown-confirm")
    .addEventListener("click", () => {

        document.body.innerHTML = `
            <div id="power-screen">

                <div class="power-message">
                    It is now safe to turn off your computer.
                </div>

                <button
                    id="power-on"
                    class="power-button"
                    type="button"
                >
                    ⏻ Power On
                </button>

            </div>
        `;

        document
    .getElementById("power-on")
    .addEventListener("click", () => {

        window.location.reload();

    });
 });  

// ====================================
// MAGIC SPARKLE CURSOR
// ====================================

(() => {

    const sparkleColour = "random";
    const sparkleCount = 50;

    const sparkles = [];

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    let previousMouseX = mouseX;
    let previousMouseY = mouseY;

    function createSparkleElement(size) {

        const element = document.createElement("div");

        element.style.position = "fixed";
        element.style.width = `${size}px`;
        element.style.height = `${size}px`;

        element.style.pointerEvents = "none";
        element.style.zIndex = "999999";

        element.style.visibility = "hidden";
        element.style.overflow = "hidden";

        document.body.appendChild(element);

        return element;
    }

    function createStarElement() {

        const star = createSparkleElement(5);

        star.style.background = "transparent";

        const verticalLine = document.createElement("div");
        const horizontalLine = document.createElement("div");

        verticalLine.style.position = "absolute";
        verticalLine.style.width = "1px";
        verticalLine.style.height = "5px";
        verticalLine.style.left = "2px";
        verticalLine.style.top = "0";

        horizontalLine.style.position = "absolute";
        horizontalLine.style.width = "5px";
        horizontalLine.style.height = "1px";
        horizontalLine.style.left = "0";
        horizontalLine.style.top = "2px";

        star.appendChild(verticalLine);
        star.appendChild(horizontalLine);

        return {
            element: star,
            verticalLine,
            horizontalLine
        };
    }

    function createRandomColour() {

        const colours = [
            255,
            Math.floor(Math.random() * 256),
            Math.floor(Math.random() * 256)
        ];

        colours.sort(() => Math.random() - 0.5);

        return `rgb(${colours[0]}, ${colours[1]}, ${colours[2]})`;
    }

    function getSparkleColour() {

        if (sparkleColour === "random") {
            return createRandomColour();
        }

        return sparkleColour;
    }

    function createSparkles() {

        for (let index = 0; index < sparkleCount; index++) {

            const star = createStarElement();
            const tiny = createSparkleElement(3);

            sparkles.push({
                star,
                tiny,

                x: 0,
                y: 0,

                velocityX: 0,
                velocityY: 0,

                starLife: 0,
                tinyLife: 0,

                colour: "#ffffff"
            });
        }
    }

    function activateSparkle() {

        const availableSparkle = sparkles.find(
            sparkle => sparkle.starLife === 0 && sparkle.tinyLife === 0
        );

        if (!availableSparkle) {
            return;
        }

        availableSparkle.x = mouseX;
        availableSparkle.y = mouseY;

        availableSparkle.velocityX =
            (Math.random() - 0.5) * 1.5;

        availableSparkle.velocityY =
            1 + Math.random() * 2;

        availableSparkle.starLife = 35;
        availableSparkle.colour = getSparkleColour();

        const {
            element,
            verticalLine,
            horizontalLine
        } = availableSparkle.star;

        verticalLine.style.backgroundColor =
            availableSparkle.colour;

        horizontalLine.style.backgroundColor =
            availableSparkle.colour;

        element.style.left =
            `${availableSparkle.x}px`;

        element.style.top =
            `${availableSparkle.y}px`;

        element.style.transform = "scale(1)";
        element.style.opacity = "1";
        element.style.visibility = "visible";
    }

    function updateStar(sparkle) {

        if (sparkle.starLife <= 0) {
            return;
        }

        sparkle.starLife--;

        sparkle.x += sparkle.velocityX;
        sparkle.y += sparkle.velocityY;

        sparkle.velocityY += 0.04;

        const progress =
            sparkle.starLife / 35;

        sparkle.star.element.style.left =
            `${sparkle.x}px`;

        sparkle.star.element.style.top =
            `${sparkle.y}px`;

        sparkle.star.element.style.opacity =
            `${progress}`;

        sparkle.star.element.style.transform =
            `scale(${0.5 + progress})`;

        if (
            sparkle.starLife <= 0 ||
            sparkle.y > window.innerHeight
        ) {

            sparkle.star.element.style.visibility =
                "hidden";

            activateTinySparkle(sparkle);
        }
    }

    function activateTinySparkle(sparkle) {

        sparkle.tinyLife = 25;

        sparkle.tiny.style.left =
            `${sparkle.x}px`;

        sparkle.tiny.style.top =
            `${sparkle.y}px`;

        sparkle.tiny.style.width = "2px";
        sparkle.tiny.style.height = "2px";

        sparkle.tiny.style.backgroundColor =
            sparkle.colour;

        sparkle.tiny.style.opacity = "1";
        sparkle.tiny.style.visibility = "visible";
    }

    function updateTinySparkle(sparkle) {

        if (sparkle.tinyLife <= 0) {
            return;
        }

        sparkle.tinyLife--;

        sparkle.x += sparkle.velocityX * 0.5;
        sparkle.y += sparkle.velocityY * 0.7;

        const progress =
            sparkle.tinyLife / 25;

        sparkle.tiny.style.left =
            `${sparkle.x}px`;

        sparkle.tiny.style.top =
            `${sparkle.y}px`;

        sparkle.tiny.style.opacity =
            `${progress}`;

        if (sparkle.tinyLife < 12) {
            sparkle.tiny.style.width = "1px";
            sparkle.tiny.style.height = "1px";
        }

        if (
            sparkle.tinyLife <= 0 ||
            sparkle.y > window.innerHeight
        ) {

            sparkle.tiny.style.visibility =
                "hidden";

            sparkle.tinyLife = 0;
        }
    }

    function animateSparkles() {

        sparkles.forEach(sparkle => {
            updateStar(sparkle);
            updateTinySparkle(sparkle);
        });

        requestAnimationFrame(animateSparkles);
    }

    function handlePointerMove(event) {

        mouseX = event.clientX;
        mouseY = event.clientY;

        const mouseMoved =
            Math.abs(mouseX - previousMouseX) > 1 ||
            Math.abs(mouseY - previousMouseY) > 1;

        if (mouseMoved) {
            activateSparkle();
        }

        previousMouseX = mouseX;
        previousMouseY = mouseY;
    }

    function initializeSparkleCursor() {

        createSparkles();

        document.addEventListener(
            "pointermove",
            handlePointerMove
        );

        animateSparkles();
    }

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initializeSparkleCursor
        );

    } else {

        initializeSparkleCursor();
    }

})();

// ====================================
// BIBI 3D CURSOR TILT
// ====================================

(() => {
    const bibiTitle = document.querySelector(".bibi-title");

    if (!bibiTitle) {
        return;
    }

    const maximumTilt = 14;

    let targetRotateX = 0;
    let targetRotateY = 0;

    let currentRotateX = 0;
    let currentRotateY = 0;

    let targetScale = 1;
    let currentScale = 1;

    function updateTargetTilt(event) {
        const normalizedX =
            (event.clientX / window.innerWidth) * 2 - 1;

        const normalizedY =
            (event.clientY / window.innerHeight) * 2 - 1;

        /*
         * Moving right tilts the right side toward the viewer.
         * Moving down tilts the bottom toward the viewer.
         */
        targetRotateY = normalizedX * maximumTilt;
        targetRotateX = normalizedY * -maximumTilt;

        targetScale = 1.025;
    }

    function resetTilt() {
        targetRotateX = 0;
        targetRotateY = 0;
        targetScale = 1;
    }

    function animateTilt() {
        const smoothing = 0.09;

        currentRotateX +=
            (targetRotateX - currentRotateX) * smoothing;

        currentRotateY +=
            (targetRotateY - currentRotateY) * smoothing;

        currentScale +=
            (targetScale - currentScale) * smoothing;

        bibiTitle.style.setProperty(
            "--bibi-rotate-x",
            `${currentRotateX.toFixed(2)}deg`
        );

        bibiTitle.style.setProperty(
            "--bibi-rotate-y",
            `${currentRotateY.toFixed(2)}deg`
        );

        bibiTitle.style.setProperty(
            "--bibi-scale",
            currentScale.toFixed(3)
        );

        requestAnimationFrame(animateTilt);
    }

    window.addEventListener("pointermove", updateTargetTilt);
    document.documentElement.addEventListener("mouseleave", resetTilt);
    window.addEventListener("blur", resetTilt);

    animateTilt();
})();

// ====================================
// CLICK SPARKLE EFFECT
// ====================================

document.addEventListener("click", event => {
    /* Do not draw desktop sparkles over any startup screen. */
    if (document.body.classList.contains("booting")) return;

    createClickSparkles(event.clientX, event.clientY);
});

function createClickSparkles(x, y) {
    const sparkleCount = 10;

    for (let i = 0; i < sparkleCount; i++) {
        const sparkle = document.createElement("span");

        sparkle.className = "click-sparkle";
        const vertical = document.createElement("div");
const horizontal = document.createElement("div");

vertical.className = "sparkle-vertical";
horizontal.className = "sparkle-horizontal";

sparkle.appendChild(vertical);
sparkle.appendChild(horizontal);

        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;

        const angle = (Math.PI * 2 * i) / sparkleCount;
        const distance = 25 + Math.random() * 35;

        sparkle.style.setProperty(
            "--sparkle-x",
            `${Math.cos(angle) * distance}px`
        );

        sparkle.style.setProperty(
            "--sparkle-y",
            `${Math.sin(angle) * distance}px`
        );

        sparkle.style.animationDelay = `${Math.random() * 0.08}s`;

        document.body.appendChild(sparkle);

        sparkle.addEventListener("animationend", () => {
            sparkle.remove();
        });
    }
}

// ====================================
// WELCOME SCREEN FIREWORKS
// ====================================

function startWelcomeFireworks() {

    const useMobileWelcomeEffect =
        window.matchMedia &&
        window.matchMedia("(max-width: 720px), (pointer: coarse)").matches;

    if (useMobileWelcomeEffect) {
        startMobileWelcomeTwinkles();
        return;
    }

    // Respect reduced-motion accessibility settings
    if (
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
        return;
    }

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    /*
     * Each firework is positioned around the Welcome message.
     * x and y are offsets from the center of the screen.
     */
    const fireworks = [
        {
            delay: 0,
            x: centerX - 190,
            y: centerY - 100
        },
        {
            delay: 180,
            x: centerX + 190,
            y: centerY - 90
        },
        {
            delay: 360,
            x: centerX - 130,
            y: centerY + 105
        },
        {
            delay: 520,
            x: centerX + 145,
            y: centerY + 100
        },
        {
            delay: 720,
            x: centerX,
            y: centerY - 135
        },
        {
            delay: 950,
            x: centerX,
            y: centerY + 130
        }
    ];

    fireworks.forEach(firework => {

        window.setTimeout(() => {

            createWelcomeFirework(
                firework.x,
                firework.y
            );

        }, firework.delay);

    });
}


function startMobileWelcomeTwinkles() {

    if (
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
        return;
    }

    const existingEffect =
        document.querySelector(".mobile-welcome-effect");

    if (existingEffect) {
        existingEffect.remove();
    }

    const effect = document.createElement("div");
    effect.className = "mobile-welcome-effect";
    effect.setAttribute("aria-hidden", "true");

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const colours = [
        "#ffffff",
        "#ff78dc",
        "#c995ff",
        "#76dfff",
        "#fff27a"
    ];

    [0, 180].forEach(delay => {
        const ring = document.createElement("span");
        ring.className = "mobile-welcome-ring";
        ring.style.left = `${centerX}px`;
        ring.style.top = `${centerY}px`;
        ring.style.animationDelay = `${delay}ms`;
        effect.appendChild(ring);
    });

    const particleCount = 30;

    for (let index = 0; index < particleCount; index++) {
        const particle = document.createElement("span");
        particle.className = "mobile-welcome-twinkle";
        particle.textContent = index % 4 === 0 ? "✧" : "✦";

        const angle = (Math.PI * 2 * index) / particleCount;
        const radius = 58 + (index % 5) * 15;
        const horizontalRadius = Math.min(radius, window.innerWidth * 0.38);
        const verticalRadius = Math.min(radius * 0.72, window.innerHeight * 0.20);

        const x = centerX + Math.cos(angle) * horizontalRadius;
        const y = centerY + Math.sin(angle) * verticalRadius;

        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.color = colours[index % colours.length];
        particle.style.animationDelay = `${(index % 10) * 45}ms`;
        particle.style.setProperty(
            "--mobile-twinkle-rotation",
            `${index * 23}deg`
        );

        effect.appendChild(particle);
    }

    document.body.appendChild(effect);

    window.setTimeout(() => {
        effect.remove();
    }, 1550);
}


function createWelcomeFirework(x, y) {

    const sparkleCount = 22;

    const fireworkColours = [
        "#ffffff",
        "#ff78dc",
        "#b978ff",
        "#76dfff",
        "#fff27a",
        "#ff8c75",
        "#8dffca"
    ];

    const fireworkColour =
        fireworkColours[
            Math.floor(
                Math.random() * fireworkColours.length
            )
        ];

    for (
        let index = 0;
        index < sparkleCount;
        index++
    ) {

        const sparkle =
            document.createElement("span");

        sparkle.className = "click-sparkle";

        /*
         * Keep the fireworks above the loading screen.
         */
        sparkle.style.zIndex = "1000001";

        /*
         * Slightly slower than the normal click sparkles.
         */
        sparkle.style.animationDuration =
            `${0.75 + Math.random() * 0.25}s`;

        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;

        const vertical =
            document.createElement("div");

        const horizontal =
            document.createElement("div");

        vertical.className = "sparkle-vertical";
        horizontal.className = "sparkle-horizontal";

        /*
         * Give this firework one main color.
         */
        const sparkleGlow = `
            0 0 2px #ffffff,
            0 0 5px ${fireworkColour},
            0 0 10px ${fireworkColour},
            0 0 16px ${fireworkColour}
        `;

        vertical.style.backgroundColor =
            fireworkColour;

        horizontal.style.backgroundColor =
            fireworkColour;

        vertical.style.boxShadow = sparkleGlow;
        horizontal.style.boxShadow = sparkleGlow;

        sparkle.appendChild(vertical);
        sparkle.appendChild(horizontal);

        /*
         * Distribute the sparkles evenly in a circle.
         */
        const angle =
            (Math.PI * 2 * index) /
            sparkleCount;

        /*
         * Give each particle a slightly different distance.
         */
        const distance =
            55 + Math.random() * 60;

        sparkle.style.setProperty(
            "--sparkle-x",
            `${Math.cos(angle) * distance}px`
        );

        sparkle.style.setProperty(
            "--sparkle-y",
            `${Math.sin(angle) * distance}px`
        );

        sparkle.style.animationDelay =
            `${Math.random() * 0.08}s`;

        document.body.appendChild(sparkle);

        sparkle.addEventListener(
            "animationend",
            () => {
                sparkle.remove();
            }
        );
    }

    /*
     * Small white flash in the middle of the firework.
     */
    createFireworkFlash(x, y, fireworkColour);
}


function createFireworkFlash(x, y, colour) {

    const flash = document.createElement("div");

    flash.className = "welcome-firework-flash";

    flash.style.left = `${x}px`;
    flash.style.top = `${y}px`;

    flash.style.backgroundColor = "#ffffff";

    flash.style.boxShadow = `
        0 0 7px #ffffff,
        0 0 15px ${colour},
        0 0 28px ${colour}
    `;

    document.body.appendChild(flash);

    flash.addEventListener(
        "animationend",
        () => {
            flash.remove();
        }
    );
}


// Retry video playback after the first real user interaction.
["pointerdown", "touchstart", "click"].forEach(eventName => {
    document.addEventListener(
        eventName,
        startWallpaperVideo,
        { once: true, passive: true }
    );
});

document.addEventListener("visibilitychange", () => {
    if (!document.hidden) startWallpaperVideo();
});

// ====================================
// TROJAN.EXE FAKE CMD SEQUENCE
// ====================================

const trojanProgram =
    document.getElementById("trojan-program");

const trojanWindow =
    document.getElementById("trojan-window");

const trojanBinaryVideo =
    trojanWindow?.querySelector(".trojan-binary-video") || null;

const trojanTerminal =
    document.getElementById("trojan-terminal");

const trojanReveal =
    document.getElementById("trojan-reveal");

const trojanLoader =
    document.getElementById("trojan-loader");

const trojanLoaderFill =
    document.getElementById("trojan-loader-fill");

const trojanLoaderHeading =
    document.getElementById("trojan-loader-heading");

const trojanLoaderStatus =
    document.getElementById("trojan-loader-status");

const trojanLoaderPercentage =
    document.getElementById(
        "trojan-loader-percentage"
    );

let trojanSequenceId = 0;

// One timing profile for every screen size.
// Mobile no longer receives a slower animation.
const TROJAN_TIMING = Object.freeze({
    emptyLine: 20,
    characterMin: 1,
    characterRange: 4,
    linePauseMin: 10,
    linePauseRange: 25,
    loaderMin: 320,
    loaderRange: 380,
    loaderComplete: 500,
    loaderClose: 260,
    preGlitch: 120,
    glitch: 450
});

const trojanLines = [
    "Bibi's World [Version 6.0.6002]",
    "(C) Copyright Beatriz Guimarães. All rights reserved.",
    "",
    "C:\\Users\\Bibi> trojan.exe",
    "",
    "[BOOT] Initializing executable...",
    "[SCAN] Searching local memory...",
    "[SCAN] Detecting emotional vulnerabilities...",
    "[FOUND] nostalgia.dll",
    "[FOUND] internet_addiction.sys",
    "[FOUND] pink_glitter_driver.exe",
    "",
    "[CONNECT] Establishing encrypted connection...",
    "[CONNECT] Contacting unknown host: STEAM_MAINFRAME",
    "[OK] Connection accepted.",
    "",
    "[INJECT] Loading profile payload...",
    "[INJECT] Installing questionable life choices...",
    "[INJECT] Synchronizing game library...",
    "[INJECT] Recovering abandoned save files...",
    "",
    "WARNING: USER HAS TOO MANY UNPLAYED GAMES.",
    "WARNING: WALLET INTEGRITY COMPROMISED.",
    "",
     "[PROCESS] Opening payload installer..."
];

function startTrojanBinaryVideo() {
    if (!trojanBinaryVideo) return;

    trojanBinaryVideo.muted = true;
    trojanBinaryVideo.defaultMuted = true;
    trojanBinaryVideo.loop = true;
    trojanBinaryVideo.playsInline = true;

    const actuallyPlay = () => {
        try {
            trojanBinaryVideo.currentTime = 0;
        } catch (error) {
            /* Metadata may still be loading. */
        }

        trojanBinaryVideo.classList.add("trojan-video-active");

        window.requestAnimationFrame(() => {
            const playAttempt = trojanBinaryVideo.play();

            if (
                playAttempt &&
                typeof playAttempt.catch === "function"
            ) {
                playAttempt.catch(() => {
                    trojanBinaryVideo.classList.remove("trojan-video-active");
                });
            }
        });
    };

    if (trojanBinaryVideo.readyState >= 2) {
        actuallyPlay();
    } else {
        trojanBinaryVideo.addEventListener("loadeddata", actuallyPlay, { once: true });
        trojanBinaryVideo.addEventListener("canplay", actuallyPlay, { once: true });
        trojanBinaryVideo.load();
    }
}

function wait(milliseconds) {
    return new Promise(resolve => {
        window.setTimeout(resolve, milliseconds);
    });
}

async function typeTrojanLine(line, sequenceId) {

    if (sequenceId !== trojanSequenceId) {
        return false;
    }

    const lineElement =
        document.createElement("div");

    lineElement.className = "trojan-line";

    trojanTerminal.appendChild(lineElement);

    if (line === "") {
        lineElement.innerHTML = "&nbsp;";
        trojanTerminal.scrollTop =
            trojanTerminal.scrollHeight;

        await wait(TROJAN_TIMING.emptyLine);
        return true;
    }

    for (
        let characterIndex = 0;
        characterIndex < line.length;
        characterIndex++
    ) {
        if (sequenceId !== trojanSequenceId) {
            return false;
        }

        lineElement.textContent +=
            line[characterIndex];

        trojanTerminal.scrollTop =
            trojanTerminal.scrollHeight;

        await wait(
            TROJAN_TIMING.characterMin +
            Math.random() * TROJAN_TIMING.characterRange
        );
    }

    await wait(
        TROJAN_TIMING.linePauseMin +
        Math.random() * TROJAN_TIMING.linePauseRange
    );

    return true;
}

async function runTrojanLoader(sequenceId) {

    const stages = [
        {
            progress: 8,
            heading: "Building profile information...",
            status: "Preparing local files"
        },
        {
            progress: 24,
            heading: "Building profile information...",
            status: "Finding abandoned save files"
        },
        {
            progress: 43,
            heading: "Installing suspicious components...",
            status: "Injecting nostalgia.dll"
        },
        {
            progress: 61,
            heading: "Synchronizing Steam data...",
            status: "Reading game library"
        },
        {
            progress: 78,
            heading: "Synchronizing Steam data...",
            status: "Counting unplayed games"
        },
        {
            progress: 92,
            heading: "Unlocking visual payload...",
            status: "Rendering profile image"
        },
        {
            progress: 100,
            heading: "Installation complete!",
            status: "Access granted"
        }
    ];

    trojanLoaderFill.style.width = "0%";
    trojanLoaderPercentage.textContent = "0%";

    trojanLoaderHeading.textContent =
        "Building profile information...";

    trojanLoaderStatus.textContent =
        "Preparing files";

    trojanLoader.classList.add(
        "trojan-loader-visible"
    );

    trojanLoader.setAttribute(
        "aria-hidden",
        "false"
    );

    for (const stage of stages) {

        if (sequenceId !== trojanSequenceId) {
            return false;
        }

        trojanLoaderHeading.textContent =
            stage.heading;

        trojanLoaderStatus.textContent =
            stage.status;

        trojanLoaderFill.style.width =
            `${stage.progress}%`;

        trojanLoaderPercentage.textContent =
            `${stage.progress}%`;

        await wait(
            TROJAN_TIMING.loaderMin +
            Math.random() * TROJAN_TIMING.loaderRange
        );
    }

    await wait(TROJAN_TIMING.loaderComplete);

    if (sequenceId !== trojanSequenceId) {
        return false;
    }

    trojanLoader.classList.remove(
        "trojan-loader-visible"
    );

    trojanLoader.setAttribute(
        "aria-hidden",
        "true"
    );

    await wait(TROJAN_TIMING.loaderClose);

    return true;
}

async function runTrojanSequence() {
    trojanSequenceId++;

    const currentSequenceId = trojanSequenceId;

    trojanTerminal.innerHTML = "";

    trojanTerminal.classList.remove(
        "trojan-terminal-hidden"
    );

    trojanReveal.classList.remove(
        "trojan-reveal-visible"
    );

    trojanLoader.classList.remove(
        "trojan-loader-visible"
    );

    trojanLoader.setAttribute(
        "aria-hidden",
        "true"
    );

    trojanLoaderFill.style.width = "0%";
    trojanLoaderPercentage.textContent = "0%";

    trojanWindow.classList.remove(
        "trojan-glitch"
    );

    openWindow(trojanWindow);
    startTrojanBinaryVideo();

    for (const line of trojanLines) {
        const shouldContinue =
            await typeTrojanLine(
                line,
                currentSequenceId
            );

        if (!shouldContinue) {
            return;
        }
    }

    const loaderCompleted =
        await runTrojanLoader(
            currentSequenceId
        );

    if (!loaderCompleted) {
        return;
    }

    await wait(TROJAN_TIMING.preGlitch);

    if (currentSequenceId !== trojanSequenceId) {
        return;
    }

    trojanWindow.classList.add(
        "trojan-glitch"
    );

    await wait(TROJAN_TIMING.glitch);

    if (currentSequenceId !== trojanSequenceId) {
        return;
    }

    trojanTerminal.classList.add(
        "trojan-terminal-hidden"
    );

    trojanReveal.classList.add(
        "trojan-reveal-visible"
    );

    trojanWindow.classList.remove(
        "trojan-glitch"
    );
}

if (
    trojanProgram &&
    trojanWindow &&
    trojanTerminal &&
    trojanReveal &&
    trojanLoader &&
    trojanLoaderFill &&
    trojanLoaderHeading &&
    trojanLoaderStatus &&
    trojanLoaderPercentage
) {
    trojanProgram.addEventListener(
        "click",
        () => {
            runTrojanSequence();
        }
    );
}
// ====================================
// TRUE PHONE VIEWPORT + WINDOW CENTERING
// ====================================

function isMobileViewport() {
    return window.matchMedia("(max-width: 700px)").matches;
}

function updatePhoneViewportVariables() {
    const viewport = window.visualViewport;
    const width = viewport ? viewport.width : window.innerWidth;
    const height = viewport ? viewport.height : window.innerHeight;

    document.documentElement.style.setProperty(
        "--phone-width",
        `${Math.round(width)}px`
    );

    document.documentElement.style.setProperty(
        "--phone-height",
        `${Math.round(height)}px`
    );
}

function fitWindowToMobileViewport(windowElement) {
    if (!windowElement || !isMobileViewport()) {
        return;
    }

    updatePhoneViewportVariables();

    const viewport = window.visualViewport;
    const width = viewport ? viewport.width : window.innerWidth;
    const height = viewport ? viewport.height : window.innerHeight;
    const taskbarHeight = 42;
    const margin = 10;
    const usableHeight = Math.max(240, height - taskbarHeight);

    windowElement.style.position = "fixed";
    windowElement.style.left = `${width / 2}px`;
    windowElement.style.top = `${usableHeight / 2}px`;
    windowElement.style.transform = "translate(-50%, -50%)";
    windowElement.style.width = `${Math.max(280, width - margin * 2)}px`;
    windowElement.style.maxWidth = `${Math.max(280, width - margin * 2)}px`;
    windowElement.style.height = `${Math.max(220, usableHeight - margin * 2)}px`;
    windowElement.style.maxHeight = `${Math.max(220, usableHeight - margin * 2)}px`;
}

function fitMagicalLakeToMobileViewport(windowElement) {
    if (
        !windowElement ||
        windowElement.id !== "magical-lake-window" ||
        !isMobileViewport()
    ) {
        return;
    }

    updatePhoneViewportVariables();

    const viewport = window.visualViewport;

    const width = viewport
        ? viewport.width
        : window.innerWidth;

    const height = viewport
        ? viewport.height
        : window.innerHeight;

    const offsetLeft = viewport
        ? viewport.offsetLeft
        : 0;

    const offsetTop = viewport
        ? viewport.offsetTop
        : 0;

    const taskbarHeight = 42;
    const margin = 6;

    const usableHeight = Math.max(
        240,
        height - taskbarHeight
    );

    const windowWidth = Math.max(
        280,
        width - margin * 2
    );

    const windowHeight = Math.max(
        220,
        usableHeight - margin * 2
    );

    windowElement.style.position = "fixed";

    windowElement.style.left =
        `${offsetLeft + width / 2}px`;

    windowElement.style.top =
        `${offsetTop + usableHeight / 2}px`;

    windowElement.style.right = "auto";
    windowElement.style.bottom = "auto";

    windowElement.style.transform =
        "translate(-50%, -50%)";

    windowElement.style.width =
        `${windowWidth}px`;

    windowElement.style.maxWidth =
        `${windowWidth}px`;

    windowElement.style.height =
        `${windowHeight}px`;

    windowElement.style.maxHeight =
        `${windowHeight}px`;

    windowElement.style.margin = "0";
}

function positionMobileWindow(windowElement) {
    if (["magical-lake-window", "hermit-tower-window"].includes(windowElement.id)) {
        fitMagicalLakeToMobileViewport(
            windowElement
        );
    } else {
        fitWindowToMobileViewport(
            windowElement
        );
    }
}

const originalOpenWindowForMobile = openWindow;

openWindow = function(windowElement) {
    if (!windowElement || windowElement.id === "haunted-mansion-window") {
        return;
    }

    originalOpenWindowForMobile(windowElement);

    if (isMobileViewport()) {
        requestAnimationFrame(() => {
            positionMobileWindow(windowElement);
            bringToFront(windowElement);

            window.setTimeout(() => {
                if (
                    !windowElement.classList.contains("hidden")
                ) {
                    positionMobileWindow(windowElement);
                    bringToFront(windowElement);
                }
            }, 80);
        });
    }
};

function refitOpenWindowsForViewport() {
    updatePhoneViewportVariables();

    if (!isMobileViewport()) {
        return;
    }

    document
        .querySelectorAll(".window:not(.hidden)")
        .forEach(positionMobileWindow);
}

window.addEventListener("resize", refitOpenWindowsForViewport);
window.addEventListener("orientationchange", () => {
    window.setTimeout(refitOpenWindowsForViewport, 120);
});

    if (window.visualViewport) {
    window.visualViewport.addEventListener(
        "resize",
        refitOpenWindowsForViewport
    );

    window.visualViewport.addEventListener(
        "scroll",
        refitOpenWindowsForViewport
    );
}

window.addEventListener("DOMContentLoaded", () => {
    updatePhoneViewportVariables();
    refitOpenWindowsForViewport();
});


// ====================================
// MAGICAL LAKE — CUTE DETAILED PIXEL ART
// ====================================

(() => {
    const canvas = document.getElementById("magical-lake-canvas");
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    context.imageSmoothingEnabled = false;

    const BASE_WIDTH = 480;
    const BASE_HEIGHT = 300;

    let WIDTH = canvas.width;
    let HEIGHT = canvas.height;
    let WATER_LINE = 171;

    const status = document.getElementById("magical-lake-status");

    const lakeWindow = document.getElementById("magical-lake-window");
    const lakeScreen = lakeWindow
        ? lakeWindow.querySelector(".magical-lake-screen")
        : null;

    const waterfallCanvas = document.createElement("canvas");
    waterfallCanvas.id = "magical-waterfall-canvas";
    waterfallCanvas.setAttribute("aria-hidden", "true");
    document.body.appendChild(waterfallCanvas);

    const waterfallContext = waterfallCanvas.getContext("2d", {
        alpha: true
    });

    if (waterfallContext) {
        waterfallContext.imageSmoothingEnabled = false;
    }

    let pointerX = WIDTH * 0.5;
    let pointerY = HEIGHT * 0.52;
    let wishCount = 0;

    const sparkles = [];
    const ripples = [];
    const bubbles = [];
    const waterfallDrops = [];

    let waterfallBoost = 0;
    let waterfallSpawnCarry = 0;
    let previousWaterfallTime = 0;
    let waterfallPixelRatio = 1;

    const waterShadow = {
        active: false,
        startedAt: 0,
        duration: 3400,
        direction: 1,
        splashX: WIDTH / 2,
        wobble: 0
    };

    const permanentFairies = [
        {
            x: 91,
            y: 112,
            phase: 0.3,
            speed: 0.85,
            wing: "#baffff",
            dress: "#64e9e2",
            hair: "#ffe876"
        },
        {
            x: 145,
            y: 82,
            phase: 1.8,
            speed: 1.05,
            wing: "#fff8a8",
            dress: "#ffcf55",
            hair: "#f6a65d"
        },
        {
            x: 331,
            y: 94,
            phase: 3.0,
            speed: 0.76,
            wing: "#f3c3ff",
            dress: "#d58cff",
            hair: "#f4b078"
        },
        {
            x: 394,
            y: 124,
            phase: 4.2,
            speed: 1.12,
            wing: "#a9ffe4",
            dress: "#6ce8ad",
            hair: "#50344f"
        },
        {
            x: 258,
            y: 58,
            phase: 2.2,
            speed: 0.66,
            wing: "#ffffff",
            dress: "#ff9fd6",
            hair: "#ffe38a"
        },
        {
            x: 207,
            y: 127,
            phase: 5.4,
            speed: 0.92,
            wing: "#b7ccff",
            dress: "#859cff",
            hair: "#8b4a60"
        },
        {
            x: 438,
            y: 70,
            phase: 6.1,
            speed: 0.72,
            wing: "#ffd5ef",
            dress: "#ff78b7",
            hair: "#d47345"
        }
    ];

    const backgroundStars = Array.from({ length: 96 }, (_, index) => ({
        x: (index * 79 + 17) % WIDTH,
        y: 12 + ((index * 47 + 9) % 140),
        phase: index * 0.57,
        size: index % 13 === 0 ? 2 : 1,
        colorIndex: index % 5
    }));

    const fireflies = Array.from({ length: 28 }, (_, index) => ({
        x: 12 + ((index * 83) % (WIDTH - 24)),
        y: 105 + ((index * 37) % 172),
        phase: index * 0.81,
        rangeX: 3 + (index % 5),
        rangeY: 2 + (index % 4)
    }));

    const dancingNymphs = [
    {
        dress: "#f5d3ff",
        hair: "#f6cd8c",
        flower: "#ffe9ff",
        phase: 0.2
    },
    {
        dress: "#bff7ff",
        hair: "#cf8d62",
        flower: "#fff6ad",
        phase: 1.45
    },
    {
        dress: "#ffd2eb",
        hair: "#7f5265",
        flower: "#fff0ff",
        phase: 2.7
    },
    {
        dress: "#d6c7ff",
        hair: "#f0af7c",
        flower: "#ffe7a7",
        phase: 3.95
    },
    {
        dress: "#c8ffd9",
        hair: "#5f4a45",
        flower: "#fff6d8",
        phase: 5.2
    }
];

    const circleFairies = Array.from(
    { length: 20 },
    (_, index) => ({
        orbit: 33 + (index % 4) * 8,
        lift: 15 + (index % 3) * 5,
        phase: index * 0.84,
        speed: 0.7 + (index % 5) * 0.08,
        glow: [
            "#ffe6fb",
            "#fff6b0",
            "#bdfcff",
            "#f0cbff"
        ][index % 4]
    })
);

    function resizeLakeCanvasToScreen() {
    const fullLayout = useFullLakeLayout();

    let targetWidth = BASE_WIDTH;
    let targetHeight = BASE_HEIGHT;

    if (fullLayout) {
        const rectangle = lakeScreen
            ? lakeScreen.getBoundingClientRect()
            : null;

        let visibleWidth =
            rectangle && rectangle.width > 80
                ? rectangle.width
                : 0;

        let visibleHeight =
            rectangle && rectangle.height > 120
                ? rectangle.height
                : 0;

        if (!visibleWidth || !visibleHeight) {
            const viewport = window.visualViewport;

            const viewportWidth = viewport
                ? viewport.width
                : window.innerWidth;

            const viewportHeight = viewport
                ? viewport.height
                : window.innerHeight;

            visibleWidth = Math.max(
                280,
                viewportWidth - 24
            );

            visibleHeight = Math.max(
                420,
                viewportHeight - 132
            );
        }

        targetHeight = Math.round(
            BASE_WIDTH *
            visibleHeight /
            visibleWidth
        );

        targetHeight = Math.max(
            560,
            Math.min(980, targetHeight)
        );
    }

    if (
        canvas.width !== targetWidth ||
        canvas.height !== targetHeight
    ) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        context.imageSmoothingEnabled = false;
    }

    WIDTH = canvas.width;
    HEIGHT = canvas.height;

    WATER_LINE = fullLayout
        ? Math.round(
            Math.max(
                198,
                Math.min(
                    252,
                    HEIGHT * 0.34
                )
            )
        )
        : 171;

    pointerX = WIDTH * 0.5;

    pointerY =
        WATER_LINE +
        (HEIGHT - WATER_LINE) * 0.42;

    waterShadow.splashX =
        WIDTH * 0.5;
}

    let statusAnimationTimer = null;

    function setStatus(message) {
        if (!status) return;

        status.textContent = message;
        status.classList.remove("magical-lake-message-visible");

        // Restart the little top-center message animation each time.
        void status.offsetWidth;
        status.classList.add("magical-lake-message-visible");

        window.clearTimeout(statusAnimationTimer);
        statusAnimationTimer = window.setTimeout(() => {
            status.classList.remove("magical-lake-message-visible");
        }, 3600);
    }

    function canvasPoint(event) {
        const rectangle = canvas.getBoundingClientRect();

        return {
            x: Math.max(0, Math.min(
                WIDTH,
                (event.clientX - rectangle.left) * WIDTH / rectangle.width
            )),
            y: Math.max(0, Math.min(
                HEIGHT,
                (event.clientY - rectangle.top) * HEIGHT / rectangle.height
            ))
        };
    }

    function resizeWaterfallCanvas() {
        if (!waterfallContext) return;

        waterfallPixelRatio = Math.min(
            2,
            Math.max(1, window.devicePixelRatio || 1)
        );

        const viewportWidth = Math.max(1, Math.round(window.innerWidth));
        const viewportHeight = Math.max(1, Math.round(window.innerHeight));

        waterfallCanvas.width = Math.round(
            viewportWidth * waterfallPixelRatio
        );
        waterfallCanvas.height = Math.round(
            viewportHeight * waterfallPixelRatio
        );

        waterfallCanvas.style.width = `${viewportWidth}px`;
        waterfallCanvas.style.height = `${viewportHeight}px`;

        waterfallContext.setTransform(
            waterfallPixelRatio,
            0,
            0,
            waterfallPixelRatio,
            0,
            0
        );
        waterfallContext.imageSmoothingEnabled = false;
    }

    function lakeWindowIsVisible() {
        if (!lakeWindow || !lakeScreen) return false;
        if (lakeWindow.classList.contains("hidden")) return false;

        const style = window.getComputedStyle(lakeWindow);
        return style.display !== "none" && style.visibility !== "hidden";
    }

    function getWaterfallSource() {
        if (!lakeWindowIsVisible()) return null;

        const rectangle = lakeScreen.getBoundingClientRect();

        if (
            rectangle.width < 20 ||
            rectangle.height < 20 ||
            rectangle.bottom < 0 ||
            rectangle.top > window.innerHeight
        ) {
            return null;
        }

        const windowZ = Number.parseInt(
            window.getComputedStyle(lakeWindow).zIndex,
            10
        );

        waterfallCanvas.style.zIndex = String(
            Number.isFinite(windowZ)
                ? Math.max(3, windowZ - 1)
                : 9999
        );

        return {
            left: rectangle.left + rectangle.width * 0.17,
            right: rectangle.right - rectangle.width * 0.17,
            y: rectangle.bottom - 2,
            width: rectangle.width * 0.66
        };
    }

    function spawnWaterfallDrop(source, strength = 1) {
        const streamCount = 15;
        const stream = Math.floor(Math.random() * streamCount);
        const streamPosition = stream / Math.max(1, streamCount - 1);
        const streamX = source.left + source.width * streamPosition;
        const spread = 2 + Math.random() * 8;
        const randomValue = Math.random();
        const isGlitter = randomValue < 0.25 + waterfallBoost * 0.11;
        const isHeart = !isGlitter && randomValue > 0.94;

        waterfallDrops.push({
            x: streamX + (Math.random() - 0.5) * spread,
            y: source.y + Math.random() * 3,
            velocityX: (Math.random() - 0.5) * 0.38,
            velocityY: (1.3 + Math.random() * 2.25) * strength,
            gravity: 0.018 + Math.random() * 0.025,
            width: Math.random() < 0.76 ? 2 : 3,
            height: isGlitter || isHeart
                ? 2
                : 4 + Math.floor(Math.random() * 12),
            life: 280 + Math.random() * 190,
            phase: Math.random() * Math.PI * 2,
            glitter: isGlitter,
            heart: isHeart,
            colorIndex: Math.floor(Math.random() * 7)
        });

        if (waterfallDrops.length > 620) {
            waterfallDrops.splice(0, waterfallDrops.length - 620);
        }
    }

    function drawWaterfallStar(x, y, color, alpha) {
        const px = Math.round(x);
        const py = Math.round(y);

        waterfallContext.globalAlpha = alpha;
        waterfallContext.fillStyle = color;
        waterfallContext.fillRect(px, py, 2, 2);
        waterfallContext.fillRect(px - 3, py, 2, 2);
        waterfallContext.fillRect(px + 3, py, 2, 2);
        waterfallContext.fillRect(px, py - 3, 2, 2);
        waterfallContext.fillRect(px, py + 3, 2, 2);
    }

    function drawWaterfallHeart(x, y, color, alpha) {
        const px = Math.round(x);
        const py = Math.round(y);

        waterfallContext.globalAlpha = alpha;
        waterfallContext.fillStyle = color;
        waterfallContext.fillRect(px - 3, py - 2, 3, 3);
        waterfallContext.fillRect(px + 1, py - 2, 3, 3);
        waterfallContext.fillRect(px - 4, py, 8, 3);
        waterfallContext.fillRect(px - 2, py + 3, 4, 2);
        waterfallContext.fillRect(px - 1, py + 5, 2, 2);
    }

    function drawGlitteringWaterfall(time) {
        if (!waterfallContext) return;

        waterfallContext.clearRect(
            0,
            0,
            window.innerWidth,
            window.innerHeight
        );

        const source = getWaterfallSource();
        const delta = previousWaterfallTime
            ? Math.min(34, time - previousWaterfallTime)
            : 16;
        previousWaterfallTime = time;

        if (!source) {
            waterfallDrops.length = 0;
            waterfallCanvas.classList.remove("waterfall-visible");
            return;
        }

        waterfallCanvas.classList.add("waterfall-visible");

        const mobileMultiplier = window.innerWidth <= 700 ? 0.66 : 1;
        const spawnRate = (0.11 + waterfallBoost * 0.13) * mobileMultiplier;

        waterfallSpawnCarry += delta * spawnRate;

        while (waterfallSpawnCarry >= 1) {
            spawnWaterfallDrop(
                source,
                1 + Math.min(0.72, waterfallBoost * 0.3)
            );
            waterfallSpawnCarry -= 1;
        }

        const lipPulse = 0.76 + Math.sin(time * 0.009) * 0.16;
        waterfallContext.globalAlpha = lipPulse;

        for (let stream = 0; stream < 15; stream++) {
            const x = source.left + source.width * (stream / 14);
            const width = stream % 4 === 0 ? 4 : 2;
            const colors = ["#e9ffff", "#a8fbff", "#fff5bc", "#efc8ff"];
            waterfallContext.fillStyle = colors[stream % colors.length];
            waterfallContext.fillRect(
                Math.round(x - width * 0.5),
                Math.round(source.y),
                width,
                3 + (stream % 5)
            );
        }

        const colors = [
            "#efffff",
            "#9effff",
            "#69e8ef",
            "#fff3a8",
            "#efc0ff",
            "#ffadd8",
            "#a7c8ff"
        ];

        for (let index = waterfallDrops.length - 1; index >= 0; index--) {
            const drop = waterfallDrops[index];

            drop.phase += 0.045;
            drop.x += drop.velocityX + Math.sin(drop.phase) * 0.09;
            drop.y += drop.velocityY;
            drop.velocityY += drop.gravity;
            drop.life -= delta;

            if (
                drop.life <= 0 ||
                drop.y > window.innerHeight + 28 ||
                drop.x < -30 ||
                drop.x > window.innerWidth + 30
            ) {
                waterfallDrops.splice(index, 1);
                continue;
            }

            const fade = Math.min(1, drop.life / 86);
            const color = colors[drop.colorIndex % colors.length];

            if (drop.heart) {
                drawWaterfallHeart(
                    drop.x,
                    drop.y,
                    color,
                    fade * 0.78
                );
            } else if (drop.glitter) {
                drawWaterfallStar(
                    drop.x,
                    drop.y,
                    color,
                    fade * (0.6 + Math.sin(
                        time * 0.02 + drop.phase
                    ) * 0.3)
                );
            } else {
                waterfallContext.globalAlpha = fade * 0.62;
                waterfallContext.fillStyle = color;
                waterfallContext.fillRect(
                    Math.round(drop.x),
                    Math.round(drop.y),
                    drop.width,
                    drop.height
                );

                waterfallContext.globalAlpha = fade * 0.28;
                waterfallContext.fillStyle = "#ffffff";
                waterfallContext.fillRect(
                    Math.round(drop.x),
                    Math.round(drop.y),
                    1,
                    Math.max(2, Math.floor(drop.height * 0.66))
                );
            }
        }

        waterfallContext.globalAlpha = 1;
        waterfallBoost *= 0.982;
    }

    function addSparkle(x, y, strong = false) {
        const amount = strong ? 42 : 20;

        for (let index = 0; index < amount; index++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = strong
                ? 0.42 + Math.random() * 1.72
                : 0.28 + Math.random() * 1.05;

            sparkles.push({
                x,
                y,
                velocityX: Math.cos(angle) * speed,
                velocityY: Math.sin(angle) * speed - (strong ? 0.78 : 0.34),
                life: strong
                    ? 78 + Math.random() * 52
                    : 50 + Math.random() * 38,
                maximumLife: strong ? 130 : 88,
                size: Math.random() > 0.73 ? 2 : 1,
                hue: Math.random(),
                heart: Math.random() < (strong ? 0.2 : 0.08)
            });
        }
    }

    function addBubbles(x, y, amount = 5) {
        for (let index = 0; index < amount; index++) {
            bubbles.push({
                x: x + (Math.random() - 0.5) * 22,
                y: y + Math.random() * 8,
                velocityX: (Math.random() - 0.5) * 0.18,
                velocityY: -0.22 - Math.random() * 0.36,
                life: 46 + Math.random() * 44,
                maximumLife: 90,
                size: Math.random() > 0.68 ? 2 : 1
            });
        }
    }

    function triggerWaterShadow() {
        waterShadow.active = true;
        waterShadow.startedAt = performance.now();
        waterShadow.duration = 3300 + Math.random() * 600;
        waterShadow.direction = Math.random() > 0.5 ? 1 : -1;
        waterShadow.splashX = WIDTH * (0.38 + Math.random() * 0.24);
        waterShadow.wobble = Math.random() * Math.PI * 2;

        /* A quiet first ripple hints that a shadow is approaching. */
        ripples.push({
            x: waterShadow.direction > 0 ? 38 : WIDTH - 38,
            y: WATER_LINE + 34,
            radius: 3,
            life: 78,
            maximumLife: 78
        });
    }

    function drawWaterShadow(time) {
        if (!waterShadow.active) return;

        const progress = Math.max(
            0,
            Math.min(1, (time - waterShadow.startedAt) / waterShadow.duration)
        );

        if (progress >= 1) {
            waterShadow.active = false;
            return;
        }

        const direction = waterShadow.direction;
        const splashX = waterShadow.splashX;
        const startX = direction > 0 ? -64 : WIDTH + 64;
        const exitX = direction > 0 ? WIDTH + 70 : -70;
        const fade = Math.sin(progress * Math.PI);

        let x;
        let y;
        let angle;
        let scale = 1;
        let tailSwing;
        let breachAmount = 0;
        let splashAmount = 0;

        if (progress < 0.38) {
            /* The silhouette rises from deep water toward the surface. */
            const local = progress / 0.38;
            const eased = local * local * (3 - 2 * local);

            x = startX + (splashX - direction * 28 - startX) * eased;
            y = WATER_LINE + 54 - eased * 42
                + Math.sin(local * Math.PI * 3 + waterShadow.wobble) * 3;
            angle = -direction * (0.05 + eased * 0.26);
            scale = 0.88 + eased * 0.12;
            tailSwing = Math.sin(time * 0.024) * 6;
        } else if (progress < 0.67) {
            /* A dark fish briefly breaks the surface in a small arc. */
            const local = (progress - 0.38) / 0.29;
            const arc = Math.sin(local * Math.PI);

            x = splashX + direction * (-28 + local * 56);
            y = WATER_LINE + 8 - arc * 31;
            angle = direction * (-0.44 + local * 0.88);
            scale = 1 + arc * 0.08;
            tailSwing = Math.sin(time * 0.035) * 8;
            breachAmount = arc;

            const firstSplash = Math.max(0, 1 - Math.abs(local - 0.08) / 0.22);
            const secondSplash = Math.max(0, 1 - Math.abs(local - 0.92) / 0.24);
            splashAmount = Math.min(1, firstSplash + secondSplash);
        } else {
            /* It disappears below the surface, leaving only ripples. */
            const local = (progress - 0.67) / 0.33;
            const eased = local * local * (3 - 2 * local);

            x = splashX + direction * (30 + (Math.abs(exitX - splashX) - 30) * eased);
            y = WATER_LINE + 13 + eased * 58
                + Math.sin(local * Math.PI * 3 + waterShadow.wobble) * 3;
            angle = direction * (0.31 - eased * 0.21);
            scale = 1 - eased * 0.13;
            tailSwing = Math.sin(time * 0.025) * 6;
        }

        /* Shadowy expanding surface rings around the splash point. */
        const ringLife = Math.max(0, (progress - 0.34) / 0.66);
        if (ringLife > 0) {
            context.save();
            context.lineWidth = 1;

            for (let ring = 0; ring < 3; ring += 1) {
                const delayed = Math.max(0, ringLife - ring * 0.16);
                if (delayed <= 0) continue;

                const radiusX = 10 + delayed * (38 + ring * 8);
                const radiusY = 2 + delayed * (7 + ring * 2);

                context.globalAlpha = (1 - delayed) * (0.22 - ring * 0.04);
                context.strokeStyle = ring === 0 ? "#a6d7df" : "#315b70";
                context.beginPath();
                context.ellipse(
                    Math.round(splashX),
                    WATER_LINE + 3,
                    radiusX,
                    radiusY,
                    0,
                    0,
                    Math.PI * 2
                );
                context.stroke();
            }

            context.restore();
        }

        /* Pixel droplets and a dark splash crown remain part of the shadow. */
        if (splashAmount > 0) {
            context.save();
            context.globalAlpha = 0.10 + splashAmount * 0.26;
            context.fillStyle = "#0a2638";

            const crownWidth = 19 + splashAmount * 10;
            context.fillRect(
                Math.round(splashX - crownWidth / 2),
                WATER_LINE - 1,
                Math.round(crownWidth),
                4
            );
            context.fillRect(
                Math.round(splashX - 15),
                Math.round(WATER_LINE - 5 - splashAmount * 7),
                4,
                Math.round(5 + splashAmount * 8)
            );
            context.fillRect(
                Math.round(splashX + 11),
                Math.round(WATER_LINE - 6 - splashAmount * 9),
                4,
                Math.round(6 + splashAmount * 10)
            );
            context.fillRect(
                Math.round(splashX - 3),
                Math.round(WATER_LINE - 9 - splashAmount * 11),
                5,
                Math.round(8 + splashAmount * 12)
            );

            context.globalAlpha = splashAmount * 0.34;
            context.fillStyle = "#77aeb9";
            const droplets = [
                [-23, -13, 3],
                [-15, -23, 2],
                [-6, -30, 3],
                [7, -28, 2],
                [16, -20, 3],
                [24, -11, 2]
            ];

            droplets.forEach(([offsetX, offsetY, size], index) => {
                const fall = Math.abs(Math.sin(
                    progress * Math.PI * 5 + index * 0.8
                )) * 5;
                context.fillRect(
                    Math.round(splashX + offsetX * splashAmount),
                    Math.round(WATER_LINE + offsetY * splashAmount + fall),
                    size,
                    size
                );
            });

            context.restore();
        }

        /* Blocky fish silhouette: visible, but never brightly revealed. */
        context.save();
        context.translate(Math.round(x), Math.round(y));
        context.rotate(angle);
        context.scale(direction * scale, scale);
        context.globalAlpha = 0.14 + fade * 0.28 + breachAmount * 0.07;
        context.fillStyle = "#061a2a";

        context.beginPath();
        context.moveTo(-28, -5);
        context.lineTo(-18, -10);
        context.lineTo(9, -9);
        context.lineTo(25, -4);
        context.lineTo(32, 0);
        context.lineTo(25, 4);
        context.lineTo(9, 9);
        context.lineTo(-18, 10);
        context.lineTo(-28, 5);
        context.closePath();
        context.fill();

        context.beginPath();
        context.moveTo(-25, 0);
        context.lineTo(-42, -13 - tailSwing * 0.35);
        context.lineTo(-37, 0);
        context.lineTo(-42, 13 + tailSwing * 0.35);
        context.closePath();
        context.fill();

        context.beginPath();
        context.moveTo(-2, -8);
        context.lineTo(8, -17);
        context.lineTo(13, -8);
        context.closePath();
        context.fill();

        context.beginPath();
        context.moveTo(2, 7);
        context.lineTo(11, 14);
        context.lineTo(15, 7);
        context.closePath();
        context.fill();

        /* A subtle water sheen keeps the fish reading as a submerged shadow. */
        context.globalAlpha = fade * 0.13;
        context.fillStyle = "#6ca5b2";
        context.fillRect(-14, -7, 25, 2);
        context.fillRect(4, 6, 14, 1);
        context.restore();

        if (progress < 0.38 && Math.random() < 0.045) {
            addBubbles(x, y - 4, 1);
        }
    }

    function makeWish(x = WIDTH * 0.5, y = WATER_LINE + 40, strong = true) {
        wishCount += 1;

        const waterY = Math.max(WATER_LINE + 5, Math.min(HEIGHT - 18, y));

        ripples.push({
            x,
            y: waterY,
            radius: 2,
            life: strong ? 96 : 66,
            maximumLife: strong ? 96 : 66
        });

        if (strong) {
            ripples.push({
                x,
                y: waterY,
                radius: 8,
                life: 82,
                maximumLife: 82
            });
        }

        addSparkle(x, Math.min(waterY, WATER_LINE + 28), strong);
        addBubbles(x, waterY, strong ? 9 : 4);

        waterfallBoost = Math.min(
            2.5,
            waterfallBoost + (strong ? 1.08 : 0.46)
        );

        const messages = [
            "The lake tucked your wish beneath a lily pad.",
            "A tiny fairy carried your wish into the light.",
            "The flowers are sparkling for you.",
            "Something magical moved beneath the water.",
            "Your wish is safe in Bibi's World."
        ];

        const selectedMessage = messages[(wishCount - 1) % messages.length];
        setStatus(selectedMessage);

        if (selectedMessage === "Something magical moved beneath the water.") {
            triggerWaterShadow();
        }
    }

    function drawPixelStar(x, y, color, size = 1, alpha = 1) {
        const px = Math.round(x);
        const py = Math.round(y);

        context.globalAlpha = alpha;
        context.fillStyle = color;
        context.fillRect(px, py, size, size);
        context.fillRect(px - size, py, size, size);
        context.fillRect(px + size, py, size, size);
        context.fillRect(px, py - size, size, size);
        context.fillRect(px, py + size, size, size);
        context.globalAlpha = 1;
    }

    function drawPixelHeart(x, y, color, size = 1, alpha = 1) {
        const px = Math.round(x);
        const py = Math.round(y);
        const unit = Math.max(1, Math.round(size));

        context.globalAlpha = alpha;
        context.fillStyle = color;
        context.fillRect(px - 3 * unit, py - 2 * unit, 3 * unit, 3 * unit);
        context.fillRect(px + unit, py - 2 * unit, 3 * unit, 3 * unit);
        context.fillRect(px - 4 * unit, py, 8 * unit, 3 * unit);
        context.fillRect(px - 2 * unit, py + 3 * unit, 4 * unit, 2 * unit);
        context.fillRect(px - unit, py + 5 * unit, 2 * unit, 2 * unit);
        context.globalAlpha = 1;
    }

    function drawSky(time) {
    const skyBands = [
        "#171733",
        "#1d2042",
        "#232a51",
        "#28375e",
        "#2b4568",
        "#31546f",
        "#37637a",
        "#3f7184"
    ];

    const bandHeight =
        Math.ceil(
            WATER_LINE /
            skyBands.length
        );

    skyBands.forEach((color, index) => {
        context.fillStyle = color;

        context.fillRect(
            0,
            index * bandHeight,
            WIDTH,
            bandHeight + 1
        );
    });

    const starColors = [
        "#d5ffff",
        "#fff4a6",
        "#f0c1ff",
        "#ffb8dc",
        "#bad0ff"
    ];

    backgroundStars.forEach(star => {
        const twinkle =
            0.28 +
            0.72 *
            Math.abs(
                Math.sin(
                    time * 0.0018 +
                    star.phase
                )
            );

        drawPixelStar(
            star.x,
            star.y,
            starColors[star.colorIndex],
            star.size,
            twinkle
        );
    });

    context.globalAlpha = 0.18;
    context.fillStyle = "#d6e9ff";

    context.fillRect(70, 40, 42, 6);
    context.fillRect(80, 34, 24, 6);
    context.fillRect(365, 48, 48, 6);
    context.fillRect(377, 41, 25, 7);
    context.fillRect(27, 83, 31, 5);

    context.globalAlpha = 1;

    /*
     * Extra stars continue through the
     * taller mobile sky.
     */
    if (useFullLakeLayout()) {
        for (
            let index = 0;
            index < 44;
            index += 1
        ) {
            const x =
                8 +
                (
                    (index * 97) %
                    (WIDTH - 16)
                );

            const y =
                18 +
                (
                    (index * 53) %
                    Math.max(
                        30,
                        WATER_LINE - 36
                    )
                );

            const alpha =
                0.18 +
                Math.abs(
                    Math.sin(
                        time * 0.003 +
                        index * 0.61
                    )
                ) * 0.62;

            drawPixelStar(
                x,
                y,
                index % 4 === 0
                    ? "#ffd8ef"
                    : "#d8ffff",
                index % 17 === 0
                    ? 2
                    : 1,
                alpha
            );
        }
    }
}

    function drawDivineLight(time) {
        const pulse = 0.86 + Math.sin(time * 0.0015) * 0.09;

        context.save();
        context.globalAlpha = 0.14 * pulse;
        context.fillStyle = "#fffbe5";
        context.beginPath();
        context.moveTo(184, 0);
        context.lineTo(296, 0);
        context.lineTo(338, WATER_LINE + 23);
        context.lineTo(143, WATER_LINE + 23);
        context.closePath();
        context.fill();

        context.globalAlpha = 0.11 * pulse;
        context.beginPath();
        context.moveTo(214, 0);
        context.lineTo(268, 0);
        context.lineTo(292, WATER_LINE + 36);
        context.lineTo(188, WATER_LINE + 36);
        context.closePath();
        context.fill();

        context.globalAlpha = 0.96;
        context.fillStyle = "#fffde2";
        context.fillRect(232, 0, 17, 8);
        context.fillRect(226, 8, 29, 6);
        context.fillRect(220, 14, 41, 5);
        context.fillRect(214, 19, 53, 3);

        context.globalAlpha = 0.34 * pulse;
        context.fillStyle = "#fff0a8";
        context.fillRect(204, 23, 73, 3);
        context.fillRect(194, 29, 92, 2);

        /* Falling golden pixels inside the light beam. */
        for (let index = 0; index < 22; index++) {
            const x = 177 + ((index * 31) % 127);
            const y = 20 + ((index * 41 + Math.floor(time * 0.018)) % 146);
            const alpha = 0.25 + Math.abs(
                Math.sin(time * 0.004 + index)
            ) * 0.6;

            drawPixelStar(
                x,
                y,
                index % 3 === 0 ? "#ffffff" : "#ffe789",
                index % 8 === 0 ? 2 : 1,
                alpha
            );
        }

        context.restore();
    }

    function drawDistantForest() {
        context.fillStyle = "#102c3b";

        for (let x = 0; x < WIDTH; x += 14) {
            const height = 29 + ((x * 7) % 43);
            context.fillRect(x, WATER_LINE - height, 7, height);
            context.fillRect(x - 4, WATER_LINE - height + 9, 15, 5);
            context.fillRect(x - 7, WATER_LINE - height + 18, 21, 5);
            context.fillRect(x - 10, WATER_LINE - height + 28, 27, 5);
        }

        context.fillStyle = "#17464a";
        context.fillRect(0, WATER_LINE - 9, WIDTH, 9);

        context.fillStyle = "#287264";
        for (let x = 5; x < WIDTH; x += 31) {
            context.fillRect(x, WATER_LINE - 6 - (x % 8), 19, 3);
        }

        context.fillStyle = "#4e9c78";
        for (let x = 11; x < WIDTH; x += 53) {
            context.fillRect(x, WATER_LINE - 9, 3, 3);
        }
    }

    function drawTree(x, mirror = false, time = 0) {
        context.save();
        context.translate(x, 0);
        if (mirror) context.scale(-1, 1);

        context.fillStyle = "#0a1722";

const mainTrunkHeight = useFullLakeLayout()
    ? Math.max(
        139,
        WATER_LINE - 35
    )
    : 139;

context.fillRect(
    0,
    43,
    27,
    mainTrunkHeight
);
        context.fillRect(14, 27, 12, 38);
        context.fillRect(22, 14, 9, 34);
        context.fillRect(28, 12, 57, 8);
        context.fillRect(60, 20, 9, 26);
        context.fillRect(65, 39, 41, 8);
        context.fillRect(9, 72, 34, 10);
        context.fillRect(4, 108, 39, 12);

        context.fillStyle = "#173142";
        context.fillRect(5, 48, 7, 121);
        context.fillRect(16, 33, 5, 111);
        context.fillRect(31, 15, 49, 4);
        context.fillRect(67, 24, 5, 17);

        context.fillStyle = "#27624e";
        context.fillRect(8, 62, 4, 47);
        context.fillRect(18, 43, 4, 39);
        context.fillRect(34, 13, 38, 3);
        context.fillRect(62, 27, 4, 19);

        /* Layered, chunky pixel leaves. */
        const leafColors = ["#102b36", "#174235", "#205b43", "#2c7652"];
        const leafBlocks = [
            [-11, 21, 48, 17],
            [-20, 38, 66, 20],
            [18, 4, 68, 20],
            [58, 23, 58, 19],
            [78, 43, 43, 18],
            [-6, 62, 36, 16]
        ];

        leafBlocks.forEach((block, index) => {
            context.fillStyle = leafColors[index % leafColors.length];
            context.fillRect(...block);
        });

        /* Cute pink blossoms that gently twinkle. */
        const blossoms = [
            [10, 31], [27, 19], [49, 11], [72, 16], [91, 30],
            [15, 52], [101, 47], [34, 42], [64, 31]
        ];

        blossoms.forEach(([bx, by], index) => {
            const alpha = 0.62 + Math.sin(time * 0.004 + index) * 0.22;
            context.globalAlpha = alpha;
            context.fillStyle = index % 2 ? "#ff9fd4" : "#ffd0ea";
            context.fillRect(bx, by, 3, 3);
            context.fillRect(bx - 2, by + 1, 2, 2);
            context.fillRect(bx + 3, by + 1, 2, 2);
        });

        context.globalAlpha = 1;
        context.restore();
    }

    function drawLake(time) {
        const waterBands = [
            "#16536d",
            "#17637a",
            "#157483",
            "#16858d",
            "#13747d",
            "#105e6d",
            "#0d4b5d"
        ];

        const height = HEIGHT - WATER_LINE;
        const bandHeight = Math.ceil(height / waterBands.length);

        waterBands.forEach((color, index) => {
            context.fillStyle = color;
            context.fillRect(
                0,
                WATER_LINE + index * bandHeight,
                WIDTH,
                bandHeight + 1
            );
        });

        const center = WIDTH * 0.5;
        const shimmer = Math.round(Math.sin(time * 0.002) * 3);

        for (let row = 0; row < 19; row++) {
            const y = WATER_LINE + 5 + row * 6;
            const width = 22 + row * 10;
            const offset = ((row * 17 + Math.floor(time * 0.018)) % 15) - 7;

            context.globalAlpha = 0.15 + row * 0.011;
            context.fillStyle = row % 4 === 0 ? "#fff2b6" : "#b8ffff";
            context.fillRect(
                Math.round(center - width * 0.5 + offset + shimmer),
                y,
                width,
                row % 5 === 0 ? 2 : 1
            );
        }

        context.globalAlpha = 1;

        for (let index = 0; index < 42; index++) {
            const y = WATER_LINE + 5 + ((index * 17) % (height - 11));
            const x = ((index * 61 + Math.floor(time * 0.024)) % (WIDTH + 55)) - 30;
            const length = 5 + (index % 7) * 3;

            context.globalAlpha = 0.11 + (index % 5) * 0.04;
            context.fillStyle = index % 3 === 0
                ? "#fff1aa"
                : index % 2
                    ? "#76f0ef"
                    : "#d3ffff";
            context.fillRect(x, y, length, index % 11 === 0 ? 2 : 1);
        }

        context.globalAlpha = 1;

drawExtendedLakeDetails(time);
drawLilyPads(time);
    }

    function drawLilyPad(x, y, scale, flowerColor, time, phase) {
        const width = Math.round(18 * scale);
        const height = Math.max(3, Math.round(6 * scale));
        const bob = Math.round(Math.sin(time * 0.0025 + phase));
        const px = Math.round(x);
        const py = Math.round(y + bob);

        context.fillStyle = "#154f48";
        context.fillRect(px - Math.floor(width / 2), py, width, height);
        context.fillRect(px - Math.floor(width * 0.38), py - 2, Math.round(width * 0.76), 2);

        context.fillStyle = "#3d9c65";
        context.fillRect(px - Math.floor(width * 0.33), py, Math.round(width * 0.42), 2);
        context.fillStyle = "#8ad66f";
        context.fillRect(px - Math.floor(width * 0.25), py - 1, Math.round(width * 0.2), 1);

        if (flowerColor) {
            context.fillStyle = flowerColor;
            context.fillRect(px - 3, py - 6, 3, 3);
            context.fillRect(px + 1, py - 6, 3, 3);
            context.fillRect(px - 1, py - 8, 3, 3);
            context.fillRect(px - 1, py - 4, 3, 3);
            context.fillStyle = "#fff6a8";
            context.fillRect(px, py - 5, 2, 2);
        }
    }

    function drawLilyPads(time) {
    drawLilyPad(
        78,
        WATER_LINE + 44,
        1.1,
        "#ffb3dd",
        time,
        0.2
    );

    drawLilyPad(
        137,
        WATER_LINE + 76,
        0.72,
        null,
        time,
        1.7
    );

    drawLilyPad(
        305,
        WATER_LINE + 54,
        0.9,
        "#e8bcff",
        time,
        2.8
    );

    drawLilyPad(
        402,
        WATER_LINE + 88,
        0.75,
        "#fff0a8",
        time,
        4.1
    );

    drawLilyPad(
        250,
        WATER_LINE + 105,
        0.62,
        null,
        time,
        5.3
    );

    if (useFullLakeLayout()) {
        const lakeDepth =
            HEIGHT - WATER_LINE;

        const lowerPads = [
            [92, 0.34, 0.82, "#ffd0ea", 0.8],
            [378, 0.39, 0.72, "#d7c4ff", 1.5],
            [152, 0.50, 0.66, null, 2.1],
            [329, 0.57, 0.94, "#fff1a8", 2.9],
            [73, 0.66, 0.72, "#bff9ff", 3.8],
            [408, 0.72, 0.68, "#ffd5f0", 4.4],
            [205, 0.76, 0.58, null, 5.1],
            [278, 0.84, 0.70, "#e9c8ff", 5.8]
        ];

        lowerPads.forEach(
            ([
                x,
                progress,
                scale,
                flower,
                phase
            ]) => {
                drawLilyPad(
                    x,
                    WATER_LINE +
                    lakeDepth * progress,
                    scale,
                    flower,
                    time,
                    phase
                );
            }
        );
    }

    /* Tiny frog on first lily pad. */
    const frogY =
        WATER_LINE +
        36 +
        Math.round(
            Math.sin(
                time * 0.0025 +
                0.2
            )
        );

    context.fillStyle = "#8dd85f";

    context.fillRect(
        72,
        frogY,
        12,
        7
    );

    context.fillRect(
        74,
        frogY - 4,
        3,
        4
    );

    context.fillRect(
        80,
        frogY - 4,
        3,
        4
    );

    context.fillStyle = "#f8ffd6";

    context.fillRect(
        75,
        frogY - 3,
        1,
        1
    );

    context.fillRect(
        81,
        frogY - 3,
        1,
        1
    );

    context.fillStyle = "#18332a";

    context.fillRect(
        76,
        frogY + 2,
        4,
        1
    );
}

    function drawMushroom(x, groundY, scale, capColor, glowColor = "#fff2a8") {
        const stemWidth = Math.max(3, Math.round(4 * scale));
        const stemHeight = Math.round(14 * scale);
        const capWidth = Math.round(21 * scale);
        const capHeight = Math.max(6, Math.round(8 * scale));
        const stemX = Math.round(x - stemWidth * 0.5);
        const stemY = Math.round(groundY - stemHeight);

        context.globalAlpha = 0.13;
        context.fillStyle = glowColor;
        context.fillRect(
            Math.round(x - capWidth * 0.7),
            stemY - capHeight - 4,
            Math.round(capWidth * 1.4),
            capHeight + 12
        );
        context.globalAlpha = 1;

        context.fillStyle = "#ffe8ce";
        context.fillRect(stemX, stemY, stemWidth, stemHeight);
        context.fillStyle = "#dfa7c6";
        context.fillRect(
            stemX,
            stemY + Math.round(stemHeight * 0.6),
            Math.max(1, Math.floor(stemWidth * 0.4)),
            Math.round(stemHeight * 0.4)
        );

        context.fillStyle = capColor;
        context.fillRect(
            Math.round(x - capWidth * 0.5),
            stemY - capHeight + 2,
            capWidth,
            capHeight - 1
        );
        context.fillRect(
            Math.round(x - capWidth * 0.39),
            stemY - capHeight - 2,
            Math.round(capWidth * 0.78),
            4
        );
        context.fillRect(
            Math.round(x - capWidth * 0.24),
            stemY - capHeight - 4,
            Math.round(capWidth * 0.48),
            2
        );

        context.fillStyle = "#fff6c5";
        const spots = [-0.28, 0.05, 0.28];
        spots.forEach((offset, index) => {
            context.fillRect(
                Math.round(x + capWidth * offset),
                stemY - capHeight + (index % 2 ? 3 : 1),
                Math.max(2, Math.round(scale * 2)),
                Math.max(2, Math.round(scale * 2))
            );
        });
    }

    function drawPixelFlower(x, y, petalColor, centerColor = "#fff6a6", scale = 1) {
        const unit = Math.max(1, Math.round(scale));

        context.fillStyle = "#2f9a57";
        context.fillRect(x, y + 2 * unit, unit, 7 * unit);
        context.fillRect(x + unit, y + 5 * unit, 2 * unit, unit);

        context.fillStyle = petalColor;
        context.fillRect(x - 3 * unit, y, 3 * unit, 3 * unit);
        context.fillRect(x + unit, y, 3 * unit, 3 * unit);
        context.fillRect(x - unit, y - 3 * unit, 3 * unit, 3 * unit);
        context.fillRect(x - unit, y + 3 * unit, 3 * unit, 3 * unit);

        context.fillStyle = centerColor;
        context.fillRect(x - unit, y, 3 * unit, 3 * unit);
    }

    function drawGrassClump(x, baseY, color, accent, seed) {
        const heights = [8, 13, 10, 16, 7, 12];

        heights.forEach((height, index) => {
            const h = height + ((seed + index * 3) % 5);
            const bladeX = x + index * 3;
            context.fillStyle = index % 2 ? accent : color;
            context.fillRect(bladeX, baseY - h, 2, h);

            if (index % 2 === 0) {
                context.fillRect(bladeX - 2, baseY - h + 4, 2, 2);
            } else {
                context.fillRect(bladeX + 2, baseY - h + 6, 2, 2);
            }
        });
    }

    function useFullLakeLayout() {
    // The detailed tall composition is now shared by desktop and mobile.
    return true;
}

    function drawMoonlitPath(time) {
    if (!useFullLakeLayout()) return;

    const centerX =
        WIDTH * 0.5;

    const nymphY =
        HEIGHT - 146;

    /*
     * Winding ribbon of moonlight
     * traveling down to the dancers.
     */
    for (
        let step = 0;
        step < 28;
        step += 1
    ) {
        const progress =
            step / 27;

        const y =
            18 +
            progress *
            (nymphY - 24);

        const sway =
            Math.sin(
                time * 0.0011 +
                progress * 7.2
            ) *
            (
                4 +
                progress * 18
            );

        const width =
            12 +
            progress * 70;

        const x =
            centerX + sway;

        context.globalAlpha =
            0.035 +
            progress * 0.055;

        context.fillStyle =
            progress < 0.38
                ? "#fff9e4"
                : "#d9f5e9";

        context.fillRect(
            Math.round(
                x -
                width * 0.5
            ),
            Math.round(y),
            Math.round(width),
            5 +
            Math.round(
                progress * 5
            )
        );

        context.globalAlpha = 0.07;
        context.fillStyle = "#ffffff";

        context.fillRect(
            Math.round(
                x -
                width * 0.18
            ),
            Math.round(y + 1),
            Math.max(
                3,
                Math.round(
                    width * 0.36
                )
            ),
            1
        );
    }

    const pathSparkles = 22;

    for (
        let index = 0;
        index < pathSparkles;
        index += 1
    ) {
        const progress =
            index /
            (pathSparkles - 1);

        const y =
            28 +
            progress *
            (nymphY - 38);

        const x =
            centerX +
            Math.sin(
                time * 0.0011 +
                progress * 7.2
            ) *
            (
                5 +
                progress * 18
            );

        const twinkle =
            0.28 +
            Math.abs(
                Math.sin(
                    time * 0.004 +
                    index * 0.8
                )
            ) * 0.58;

        drawPixelStar(
            x +
            (
                index % 2
                    ? 11
                    : -12
            ),
            y,
            index % 3 === 0
                ? "#ffe3f5"
                : "#fff4ad",
            1,
            twinkle
        );
    }

    context.globalAlpha = 1;
}

    function drawTinyCircleFairy(
    x,
    y,
    color,
    alpha,
    wingFrame
) {
    const px = Math.round(x);
    const py = Math.round(y);

    context.save();

    context.globalAlpha =
        alpha * 0.16;

    context.fillStyle = color;

    context.fillRect(
        px - 4,
        py - 4,
        9,
        9
    );

    context.globalAlpha =
        alpha * 0.82;

    context.fillStyle = color;

    if (wingFrame === 0) {
        context.fillRect(
            px - 5,
            py - 2,
            2,
            3
        );

        context.fillRect(
            px + 3,
            py - 2,
            2,
            3
        );
    } else {
        context.fillRect(
            px - 5,
            py - 1,
            2,
            2
        );

        context.fillRect(
            px + 3,
            py - 1,
            2,
            2
        );
    }

    context.fillStyle = "#fff4de";

    context.fillRect(
        px - 1,
        py - 2,
        3,
        3
    );

    context.fillStyle = "#f7a8cf";

    context.fillRect(
        px - 1,
        py + 1,
        3,
        3
    );

    drawPixelStar(
        px,
        py - 5,
        color,
        1,
        alpha * 0.75
    );

    context.restore();
}

    function drawNymphSprite(
    x,
    y,
    nymph,
    time,
    index,
    facingRight
) {
    const px =
        Math.round(x);

    const py =
        Math.round(
            y +
            Math.sin(
                time * 0.0032 +
                nymph.phase
            ) * 1.4
        );

    const direction =
        facingRight
            ? 1
            : -1;

    context.save();

    context.globalAlpha = 0.14;
    context.fillStyle = nymph.dress;

    context.fillRect(
        px - 10,
        py - 12,
        21,
        24
    );

    context.globalAlpha = 1;

    context.fillStyle =
        nymph.hair;

    context.fillRect(
        px - 4,
        py - 10,
        8,
        5
    );

    context.fillRect(
        px - 5,
        py - 7,
        2,
        5
    );

    context.fillRect(
        px + 3,
        py - 7,
        2,
        5
    );

    context.fillStyle =
        "#f6c6a0";

    context.fillRect(
        px - 3,
        py - 6,
        7,
        6
    );

    context.fillStyle =
        nymph.flower;

    context.fillRect(
        px - 1,
        py - 11,
        2,
        2
    );

    context.fillRect(
        px - 4,
        py - 10,
        2,
        2
    );

    context.fillRect(
        px + 2,
        py - 10,
        2,
        2
    );

    context.fillStyle =
        nymph.dress;

    context.fillRect(
        px - 3,
        py,
        7,
        8
    );

    context.fillRect(
        px - 6,
        py + 5,
        13,
        4
    );

    context.fillRect(
        px - 8,
        py + 9,
        17,
        3
    );

    context.fillRect(
        px - 5,
        py + 12,
        11,
        2
    );

    context.fillStyle =
        "#fff1fa";

    context.fillRect(
        px - 2,
        py + 1,
        5,
        2
    );

    context.fillRect(
        px - 1,
        py + 5,
        3,
        2
    );

    context.fillStyle =
        "#f6c6a0";

    context.fillRect(
        px - 7 * direction,
        py + 1,
        3 * direction,
        2
    );

    context.fillRect(
        px + 4 * direction,
        py + 1,
        4 * direction,
        2
    );

    context.fillRect(
        px - 2,
        py + 14,
        2,
        4
    );

    context.fillRect(
        px + 1,
        py + 14,
        2,
        4
    );

    drawPixelStar(
        px +
        direction * 10,
        py - 2,
        nymph.flower,
        1,
        0.75
    );

    drawPixelStar(
        px -
        direction * 9,
        py + 4,
        "#ffffff",
        1,
        0.6
    );

    context.restore();
}

    function drawNymphCircle(time) {
    if (!useFullLakeLayout()) return;

    const centerX =
        WIDTH * 0.5;

    const centerY =
        HEIGHT - 146;

    const ringRadiusX = 57;
    const ringRadiusY = 23;

    context.save();

    context.globalAlpha =
        0.10 +
        Math.sin(
            time * 0.0026
        ) * 0.025;

    context.fillStyle =
        "#fff0b8";

    context.beginPath();

    context.ellipse(
        centerX,
        centerY + 17,
        79,
        28,
        0,
        0,
        Math.PI * 2
    );

    context.fill();

    context.globalAlpha =
        0.28 +
        Math.sin(
            time * 0.0026
        ) * 0.05;

    context.strokeStyle =
        "#fff4cf";

    context.lineWidth = 1;

    context.beginPath();

    context.ellipse(
        centerX,
        centerY + 17,
        67,
        18,
        0,
        0,
        Math.PI * 2
    );

    context.stroke();

    context.globalAlpha = 0.18;

    context.strokeStyle =
        "#e9c8ff";

    context.beginPath();

    context.ellipse(
        centerX,
        centerY + 17,
        86,
        31,
        0,
        0,
        Math.PI * 2
    );

    context.stroke();

    context.restore();

    dancingNymphs.forEach(
        (nymph, index) => {
            const angle =
                time * 0.00072 +
                index *
                (
                    Math.PI * 2 /
                    dancingNymphs.length
                );

            const x =
                centerX +
                Math.cos(angle) *
                ringRadiusX;

            const y =
                centerY +
                Math.sin(angle) *
                ringRadiusY;

            drawNymphSprite(
                x,
                y,
                nymph,
                time,
                index,
                Math.cos(angle) >= 0
            );
        }
    );

    const petalColors = [
        "#ffe5f4",
        "#fff2ba",
        "#cdf7ff",
        "#f1d7ff"
    ];

    for (
        let index = 0;
        index < 20;
        index += 1
    ) {
        const angle =
            index *
            (
                Math.PI * 2 /
                20
            ) +
            time * 0.00055;

        const x =
            centerX +
            Math.cos(angle) *
            (
                25 +
                index % 3 * 7
            );

        const y =
            centerY +
            18 +
            Math.sin(angle) *
            (
                7 +
                index % 2 * 4
            );

        drawPixelStar(
            x,
            y,
            petalColors[
                index %
                petalColors.length
            ],
            1,
            0.72
        );
    }
}

    function drawCircleFairies(time) {
    if (!useFullLakeLayout()) return;

    const centerX =
        WIDTH * 0.5;

    const centerY =
        HEIGHT - 151;

    circleFairies.forEach(
        (fairy, index) => {
            const angle =
                time *
                0.00165 *
                fairy.speed +
                fairy.phase;

            const orbitX =
                76 +
                (index % 5) * 9;

            const orbitY =
                33 +
                (index % 4) * 6;

            const x =
                centerX +
                Math.cos(angle) *
                orbitX;

            const y =
                centerY +
                Math.sin(
                    angle * 1.08
                ) *
                orbitY;

            const alpha =
                0.48 +
                Math.abs(
                    Math.sin(
                        time * 0.005 +
                        fairy.phase
                    )
                ) * 0.5;

            const wingFrame =
                Math.floor(
                    time * 0.018 +
                    index
                ) % 2;

            drawTinyCircleFairy(
                x,
                y,
                fairy.glow,
                alpha,
                wingFrame
            );
        }
    );
}

    function drawForeground(time) {
        const groundOffset =
    Math.max(
        0,
        HEIGHT - BASE_HEIGHT
    );
        context.fillStyle = "#071b20";
        context.fillRect(0, HEIGHT - 29, WIDTH, 29);

        /* Chunky grass banks with several pixel layers. */
        context.fillStyle = "#10372e";
        context.fillRect(0, HEIGHT - 43, 145, 17);
        context.fillRect(WIDTH - 150, HEIGHT - 45, 150, 19);
        context.fillRect(168, HEIGHT - 27, 145, 14);

        context.fillStyle = "#1d6041";
        context.fillRect(0, HEIGHT - 40, 136, 5);
        context.fillRect(WIDTH - 141, HEIGHT - 42, 141, 5);
        context.fillRect(176, HEIGHT - 26, 128, 5);

        for (let x = 0; x < WIDTH; x += 18) {
            const onBank = x < 145 || x > WIDTH - 153 || (x > 165 && x < 315);
            if (!onBank) continue;

            const baseY = x > 165 && x < 315
                ? HEIGHT - 20
                : HEIGHT - 29;

            drawGrassClump(
                x,
                baseY,
                "#26784b",
                "#48aa5a",
                x
            );
        }

        /* Soft glowing moss island. */
        context.globalAlpha = 0.58 + Math.sin(time * 0.003) * 0.09;
        context.fillStyle = "#73d54f";
        context.fillRect(185, HEIGHT - 31, 111, 7);
        context.fillRect(199, HEIGHT - 34, 83, 4);
        context.fillStyle = "#c5ff78";
        context.fillRect(210, HEIGHT - 36, 57, 3);
        context.globalAlpha = 1;

        drawMushroom(
    54,
    287 + groundOffset,
    1.35,
    "#ff6f49"
);

drawMushroom(
    101,
    294 + groundOffset,
    0.8,
    "#ff4e72",
    "#ffb7d2"
);

drawMushroom(
    394,
    290 + groundOffset,
    1.16,
    "#ff8561"
);

drawMushroom(
    442,
    296 + groundOffset,
    0.73,
    "#e95c8c",
    "#efc6ff"
);

drawMushroom(
    244,
    296 + groundOffset,
    0.9,
    "#ff5d72",
    "#fff2ad"
);

drawMushroom(
    342,
    296 + groundOffset,
    0.62,
    "#f6a04b"
);

        const flowers = [
            [22, 275, "#ff5fc3", 1],
            [127, 279, "#66e8ff", 1],
            [157, 288, "#ffac57", 1],
            [318, 284, "#fff05e", 1],
            [361, 278, "#ff79aa", 1],
            [466, 272, "#b878ff", 1],
            [194, 288, "#ff9fdc", 1],
            [287, 288, "#8ee0ff", 1]
        ];

        flowers.forEach(
    ([x, y, color, scale]) => {
        drawPixelFlower(
            x,
            y + groundOffset,
            color,
            "#fff5a0",
            scale
        );
    }
);

        /* Tiny stones and berries make the ground feel busier and cuter. */
        const stones = [
            [13, 292, "#667d91"], [70, 296, "#a689b6"],
            [145, 295, "#5d8292"], [325, 296, "#7c8fa4"],
            [419, 295, "#8f78a2"], [468, 295, "#608495"]
        ];

        stones.forEach(([x, y, color]) => {
    const stoneY =
        y + groundOffset;

    context.fillStyle = color;

    context.fillRect(
        x,
        stoneY,
        6,
        3
    );

    context.fillRect(
        x + 1,
        stoneY - 2,
        4,
        2
    );
});

        for (let index = 0; index < 20; index++) {
            const x = 185 + ((index * 23) % 113);
            const y = HEIGHT - 38 + ((index * 11) % 19);
            const alpha = 0.45 + Math.abs(
                Math.sin(time * 0.005 + index)
            ) * 0.5;

            if (index % 5 === 0) {
                drawPixelHeart(
                    x,
                    y,
                    "#ffb4df",
                    1,
                    alpha * 0.72
                );
            } else {
                drawPixelStar(
                    x,
                    y,
                    index % 2 ? "#fff16e" : "#c7ffff",
                    1,
                    alpha
                );
            }
        }

        context.globalAlpha = 1;
    }
    function drawExtendedLakeDetails(time) {
    if (!useFullLakeLayout()) return;

    const lakeHeight =
        HEIGHT - WATER_LINE;

    const centerX =
        WIDTH * 0.5;

    /*
     * Long moon reflection connecting
     * the original lake to the lower scene.
     */
    for (
        let row = 0;
        row < 34;
        row += 1
    ) {
        const progress =
            row / 33;

        const y =
            WATER_LINE +
            18 +
            progress *
            (lakeHeight - 86);

        const width =
            18 +
            progress * 84;

        const drift =
            Math.sin(
                time * 0.0017 +
                row * 0.72
            ) *
            (3 + progress * 9);

        context.globalAlpha =
            0.08 +
            (1 - progress) * 0.08;

        context.fillStyle =
            row % 5 === 0
                ? "#fff4bd"
                : "#c8ffff";

        context.fillRect(
            Math.round(
                centerX -
                width * 0.5 +
                drift
            ),
            Math.round(y),
            Math.max(
                4,
                Math.round(width)
            ),
            row % 6 === 0
                ? 2
                : 1
        );
    }

    /*
     * Extra small water lines throughout
     * the extended lake.
     */
    for (
        let index = 0;
        index < 58;
        index += 1
    ) {
        const y =
            WATER_LINE +
            30 +
            (
                (index * 61) %
                Math.max(
                    80,
                    lakeHeight - 92
                )
            );

        const x =
            12 +
            (
                (
                    index * 89 +
                    Math.floor(
                        time * 0.012
                    )
                ) %
                (WIDTH - 24)
            );

        const length =
            4 +
            (index % 9) * 2;

        context.globalAlpha =
            0.08 +
            (index % 6) * 0.025;

        context.fillStyle =
            index % 4 === 0
                ? "#fff1a5"
                : index % 3 === 0
                    ? "#f1caff"
                    : "#9ff8f2";

        context.fillRect(
            x,
            y,
            length,
            index % 13 === 0
                ? 2
                : 1
        );
    }

    const floatingLights = [
        [95, 0.26, "#fff4a0"],
        [382, 0.31, "#ffd1ef"],
        [65, 0.48, "#c7ffff"],
        [419, 0.52, "#efc8ff"],
        [128, 0.70, "#ffd8eb"],
        [355, 0.77, "#fff3a8"],
        [230, 0.89, "#c6ffff"]
    ];

    floatingLights.forEach(
        ([x, progress, color], index) => {
            const y =
                WATER_LINE +
                lakeHeight * progress;

            const pulse =
                0.42 +
                Math.abs(
                    Math.sin(
                        time * 0.004 +
                        index * 0.9
                    )
                ) * 0.55;

            drawPixelStar(
                x,
                y,
                color,
                index % 3 === 0
                    ? 2
                    : 1,
                pulse
            );

            context.globalAlpha =
                pulse * 0.18;

            context.fillStyle = color;

            context.fillRect(
                x - 5,
                y + 4,
                11,
                1
            );
        }
    );

    const fish = [
        [105, 0.41, 1],
        [365, 0.61, -1],
        [170, 0.82, 1]
    ];

    fish.forEach(
        ([baseX, progress, direction], index) => {
            const swim =
                Math.sin(
                    time * 0.0012 +
                    index * 2.1
                ) * 18;

            const x =
                baseX + swim;

            const y =
                WATER_LINE +
                lakeHeight * progress;

            context.globalAlpha = 0.22;
            context.fillStyle = "#082f43";

            context.fillRect(
                x - 6,
                y,
                12,
                3
            );

            context.fillRect(
                x + 5 * direction,
                y - 2,
                4 * direction,
                7
            );

            context.globalAlpha = 0.12;
            context.fillStyle = "#b8ffff";

            context.fillRect(
                x - 4,
                y,
                6,
                1
            );
        }
    );

    context.globalAlpha = 1;
}
    function drawFairySprite(x, y, fairy, facingRight, alpha, wingFrame) {
        const direction = facingRight ? 1 : -1;
        const px = Math.round(x);
        const py = Math.round(y);

        context.save();

        /* Square glow halo, kept pixel-crisp. */
        context.globalAlpha = alpha * 0.12;
        context.fillStyle = fairy.wing;
        context.fillRect(px - 12, py - 13, 25, 26);
        context.globalAlpha = alpha * 0.07;
        context.fillRect(px - 16, py - 9, 33, 18);

        /* More detailed animated wings. */
        context.globalAlpha = alpha * 0.78;
        context.fillStyle = fairy.wing;

        if (wingFrame === 0) {
            context.fillRect(px - 10 * direction, py - 10, 7 * direction, 5);
            context.fillRect(px - 13 * direction, py - 6, 10 * direction, 4);
            context.fillRect(px + 3 * direction, py - 10, 7 * direction, 5);
            context.fillRect(px + 3 * direction, py - 5, 10 * direction, 4);
        } else {
            context.fillRect(px - 11 * direction, py - 7, 8 * direction, 5);
            context.fillRect(px - 12 * direction, py - 1, 9 * direction, 4);
            context.fillRect(px + 3 * direction, py - 7, 8 * direction, 5);
            context.fillRect(px + 3 * direction, py - 1, 9 * direction, 4);
        }

        context.globalAlpha = alpha * 0.34;
        context.fillStyle = "#ffffff";
        context.fillRect(px - 8 * direction, py - 8, 3 * direction, 2);
        context.fillRect(px + 5 * direction, py - 8, 3 * direction, 2);

        /* Hair and face. */
        context.globalAlpha = alpha;
        context.fillStyle = fairy.hair;
        context.fillRect(px - 3, py - 10, 7, 5);
        context.fillRect(px - 4, py - 8, 2, 5);

        context.fillStyle = "#f6bd8d";
        context.fillRect(px - 2, py - 6, 5, 5);
        context.fillStyle = "#4e3150";
        context.fillRect(px + direction, py - 5, 1, 1);

        /* Dress with skirt pixels. */
        context.fillStyle = fairy.dress;
        context.fillRect(px - 2, py - 1, 5, 7);
        context.fillRect(px - 4, py + 5, 9, 3);
        context.fillRect(px - 3, py + 8, 7, 2);

        context.fillStyle = "#f8d0a8";
        context.fillRect(px - 5 * direction, py, 3 * direction, 2);
        context.fillRect(px + 3 * direction, py + 1, 3 * direction, 2);
        context.fillRect(px - 2, py + 10, 1, 4);
        context.fillRect(px + 2, py + 10, 1, 4);

        drawPixelStar(
            px + direction * 14,
            py - 10,
            fairy.wing,
            1,
            alpha
        );
        drawPixelStar(
            px - direction * 15,
            py + 2,
            fairy.wing,
            1,
            alpha * 0.75
        );

        context.restore();
    }

    function drawPermanentFairies(time) {
        permanentFairies.forEach((fairy, index) => {
            const x = fairy.x + Math.sin(
                time * 0.00135 * fairy.speed + fairy.phase
            ) * (7 + index * 0.6);
            const y = fairy.y + Math.cos(
                time * 0.0018 * fairy.speed + fairy.phase
            ) * (5 + index % 3);
            const alpha = 0.68 + Math.sin(
                time * 0.006 + fairy.phase
            ) * 0.2;
            const wingFrame = Math.floor(
                time * 0.012 + index
            ) % 2;

            drawFairySprite(
                x,
                y,
                fairy,
                index % 2 === 0,
                alpha,
                wingFrame
            );
        });

        context.globalAlpha = 1;
    }

    function drawFireflies(time) {
        fireflies.forEach((firefly, index) => {
            const x = firefly.x + Math.sin(
                time * 0.0014 + firefly.phase
            ) * firefly.rangeX;
            const y = firefly.y + Math.cos(
                time * 0.0018 + firefly.phase
            ) * firefly.rangeY;
            const alpha = 0.12 + Math.abs(
                Math.sin(time * 0.0047 + firefly.phase)
            ) * 0.75;

            context.globalAlpha = alpha * 0.16;
            context.fillStyle = index % 4 === 0 ? "#ffb8e1" : "#fff27a";
            context.fillRect(Math.round(x - 3), Math.round(y - 3), 7, 7);
            drawPixelStar(
                x,
                y,
                index % 4 === 0 ? "#ffd0eb" : "#fff59a",
                1,
                alpha
            );
        });

        context.globalAlpha = 1;
    }

    function updateAndDrawSparkles() {
        for (let index = sparkles.length - 1; index >= 0; index--) {
            const sparkle = sparkles[index];

            sparkle.x += sparkle.velocityX;
            sparkle.y += sparkle.velocityY;
            sparkle.velocityX *= 0.992;
            sparkle.velocityY += 0.012;
            sparkle.life -= 1;

            if (sparkle.life <= 0) {
                sparkles.splice(index, 1);
                continue;
            }

            const alpha = Math.max(0, sparkle.life / sparkle.maximumLife);
            const colors = [
                "#ffffff",
                "#fff6a6",
                "#9ffff4",
                "#e7b5ff",
                "#ffb3d8",
                "#b7cbff"
            ];
            const color = colors[
                Math.floor(sparkle.hue * colors.length) % colors.length
            ];

            if (sparkle.heart) {
                drawPixelHeart(
                    sparkle.x,
                    sparkle.y,
                    color,
                    sparkle.size,
                    alpha * 0.82
                );
            } else {
                drawPixelStar(
                    sparkle.x,
                    sparkle.y,
                    color,
                    sparkle.size,
                    alpha
                );
            }
        }
    }

    function updateAndDrawBubbles() {
        for (let index = bubbles.length - 1; index >= 0; index--) {
            const bubble = bubbles[index];
            bubble.x += bubble.velocityX;
            bubble.y += bubble.velocityY;
            bubble.life -= 1;

            if (bubble.life <= 0 || bubble.y < WATER_LINE - 4) {
                bubbles.splice(index, 1);
                continue;
            }

            const alpha = Math.min(1, bubble.life / bubble.maximumLife);
            const px = Math.round(bubble.x);
            const py = Math.round(bubble.y);
            const size = bubble.size;

            context.globalAlpha = alpha * 0.62;
            context.fillStyle = "#d8ffff";
            context.fillRect(px, py, size, size);
            context.fillRect(px - size, py + size, size, size);
            context.globalAlpha = 1;
        }
    }

    function updateAndDrawRipples() {
        for (let index = ripples.length - 1; index >= 0; index--) {
            const ripple = ripples[index];
            ripple.radius += 0.62;
            ripple.life -= 1;

            if (ripple.life <= 0) {
                ripples.splice(index, 1);
                continue;
            }

            const alpha = ripple.life / ripple.maximumLife;
            context.globalAlpha = alpha * 0.72;
            context.strokeStyle = "#e1ffff";
            context.lineWidth = 1;

            context.beginPath();
            context.ellipse(
                Math.round(ripple.x),
                Math.round(ripple.y),
                Math.round(ripple.radius * 1.9),
                Math.max(1, Math.round(ripple.radius * 0.42)),
                0,
                0,
                Math.PI * 2
            );
            context.stroke();

            if (ripple.radius > 7) {
                context.globalAlpha = alpha * 0.3;
                context.fillStyle = "#fff0b0";
                context.fillRect(
                    Math.round(ripple.x - ripple.radius),
                    Math.round(ripple.y),
                    Math.max(2, Math.round(ripple.radius * 0.5)),
                    1
                );
            }
        }

        context.globalAlpha = 1;
    }

    function drawFrame(time) {
        context.clearRect(0, 0, WIDTH, HEIGHT);

        drawSky(time);
        drawDivineLight(time);
        drawDistantForest();

        drawLake(time);
        drawWaterShadow(time);

        drawTree(-3, false, time);
        drawTree(WIDTH + 3, true, time);

        drawMoonlitPath(time);
        drawFireflies(time);
        drawForeground(time);

        updateAndDrawRipples();
        updateAndDrawBubbles();

        drawNymphCircle(time);
        drawCircleFairies(time);
        drawPermanentFairies(time);

        updateAndDrawSparkles();
        drawGlitteringWaterfall(time);

        window.requestAnimationFrame(drawFrame);
    }

    canvas.addEventListener("pointermove", event => {
        const point = canvasPoint(event);
        pointerX = point.x;
        pointerY = point.y;
    });

    canvas.addEventListener("pointerdown", event => {
        event.preventDefault();
        const point = canvasPoint(event);
        pointerX = point.x;
        pointerY = point.y;
        makeWish(point.x, point.y, false);
        canvas.focus({ preventScroll: true });
    });

    canvas.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            makeWish(pointerX, pointerY, true);
        }
    });

    function resizeAllLakeCanvases() {
        resizeLakeCanvasToScreen();
        resizeWaterfallCanvas();
    }

    window.addEventListener("resize", resizeAllLakeCanvases);

    window.addEventListener("orientationchange", () => {
        window.setTimeout(resizeAllLakeCanvases, 140);
    });

    if (window.visualViewport) {
        window.visualViewport.addEventListener(
            "resize",
            resizeAllLakeCanvases
        );
    }

    if (lakeScreen && "ResizeObserver" in window) {
        const lakeResizeObserver = new ResizeObserver(() => {
            resizeLakeCanvasToScreen();
        });

        lakeResizeObserver.observe(lakeScreen);
    }

    resizeAllLakeCanvases();

    window.requestAnimationFrame(() => {
        resizeLakeCanvasToScreen();
        window.requestAnimationFrame(resizeLakeCanvasToScreen);
    });

    setStatus("The lake is listening...");
    window.requestAnimationFrame(drawFrame);
})();


// ====================================
// MEMORIES.EXE — INFINITE 3D ARCHIVE
// ====================================

(() => {
    const memoriesWindow =
        document.getElementById("memories-window");

    const stage =
        document.getElementById("memories-stage");

    const world =
        document.getElementById("memories-world");

    if (!memoriesWindow || !stage || !world) {
        return;
    }

    /*
     * Add future files to assets/photos/memories/ and list them here.
     * Images and videos are detected automatically from their extensions.
     * Video previews autoplay silently and repeat only their first 3 seconds.
     */
    const memoriesMedia = [
        { src: "assets/photos/memories/1.webp", title: "Memory 01" },
        { src: "assets/photos/memories/2.webp", title: "Memory 02" },
        { src: "assets/photos/memories/3.webp", title: "Memory 03" },
        { src: "assets/photos/memories/4.webp", title: "Memory 04" },
        { src: "assets/photos/memories/5.webp", title: "Memory 05" },
        { src: "assets/photos/memories/6.webp", title: "Memory 06" },
        { src: "assets/photos/memories/7.webp", title: "Memory 07" },
        { src: "assets/photos/memories/8.webp", title: "Memory 08" }
    ];

    /*
     * A denser staggered arrangement: compact enough to read as one archive,
     * while retaining separate rows, columns, and depth layers.
     */
    const spatialPositions = [
        { x: -620, y: -360, z: 620, width: 300, rotation: -5, opacity: 0.50 },
        { x: -210, y: -500, z: -720, width: 230, rotation: 4, opacity: 0.32 },
        { x: 260, y: -340, z: 180, width: 320, rotation: -3, opacity: 0.46 },
        { x: 640, y: -50, z: -980, width: 225, rotation: 5, opacity: 0.27 },
        { x: -650, y: 80, z: -240, width: 265, rotation: 3, opacity: 0.39 },
        { x: -300, y: 400, z: 760, width: 310, rotation: -4, opacity: 0.54 },
        { x: 160, y: 320, z: -790, width: 215, rotation: 2, opacity: 0.29 },
        { x: 590, y: 440, z: 340, width: 285, rotation: -5, opacity: 0.47 }
    ];

    const videoExtensions = new Set([
        "mp4",
        "webm",
        "mov",
        "m4v",
        "ogg",
        "ogv"
    ]);

    /* Reset and every new opening use the preferred far distance. */
    const FAR_OPENING_DEPTH = -1360;

    /*
     * Each card wraps from the front of the camera to the far background.
     * This produces a seamless, endlessly repeating archive in both travel
     * directions without changing any card's X/Y arrangement.
     */
    const LOOP_MIN_RELATIVE_Z = -2600;
    const LOOP_MAX_RELATIVE_Z = 790;
    const LOOP_DEPTH =
        LOOP_MAX_RELATIVE_Z - LOOP_MIN_RELATIVE_Z;

    const PAN_SENSITIVITY = 2;
    const POINTER_PAN_X = 150;
    const POINTER_PAN_Y = 115;
    const POINTER_TRAVEL_SENSITIVITY = 2.8;
    const MOBILE_WHEEL_TRAVEL_SENSITIVITY = 2.35;
    const DESKTOP_WHEEL_TRAVEL_SENSITIVITY = 2.35;
    const TRACKPAD_PAN_SENSITIVITY = 1.15;
    const RIGHT_DRAG_TRAVEL_SENSITIVITY = 4.2;

    const DRAG_FOLLOW = 20;
    const RELEASE_FOLLOW = 9;
    const DEPTH_FOLLOW = 8.5;
    const LOOK_FOLLOW = 7.5;
    const POINTER_FOLLOW = 10;
    const RELEASE_GLIDE = 105;

    const MAX_LOOK_PITCH = 10;
    const MAX_LOOK_YAW = 14;

    const view = {
        x: 0,
        y: 0,
        z: FAR_OPENING_DEPTH,
        pitch: 0,
        yaw: 0,
        pointerX: 0,
        pointerY: 0
    };

    const targetView = { ...view };

    const drag = {
        active: false,
        mode: "pan",
        pointerId: null,
        startPointerX: 0,
        startPointerY: 0,
        startViewX: 0,
        startViewY: 0,
        startViewZ: 0,
        lastPointerX: 0,
        lastPointerY: 0,
        lastMoveTime: 0,
        velocityX: 0,
        velocityY: 0
    };

    const memoryVideos = [];
    const memoryNodes = [];

    let viewAnimationFrame = null;
    let previousFrameTime = performance.now();
    let lastFreePointerY = null;

    function clamp(value, minimum, maximum) {
        return Math.min(maximum, Math.max(minimum, value));
    }

    function positiveModulo(value, divisor) {
        return ((value % divisor) + divisor) % divisor;
    }

    function damp(current, target, followSpeed, elapsedSeconds) {
        const amount = 1 - Math.exp(-followSpeed * elapsedSeconds);
        return current + (target - current) * amount;
    }

    function smoothstep(minimum, maximum, value) {
        const normalized = clamp(
            (value - minimum) / (maximum - minimum),
            0,
            1
        );

        return normalized * normalized * (3 - 2 * normalized);
    }

    function wrappedRelativeDepth(baseZ, cameraZ) {
        return positiveModulo(
            baseZ + cameraZ - LOOP_MIN_RELATIVE_Z,
            LOOP_DEPTH
        ) + LOOP_MIN_RELATIVE_Z;
    }

    function normalizeLongTravel() {
        const limit = LOOP_DEPTH * 1000;

        if (Math.abs(targetView.z) < limit) {
            return;
        }

        const cycles = Math.trunc(targetView.z / LOOP_DEPTH);
        const shift = cycles * LOOP_DEPTH;

        targetView.z -= shift;
        view.z -= shift;
    }

    function updateWrappedCards() {
        memoryNodes.forEach(node => {
            const relativeZ = wrappedRelativeDepth(
                node.memoryBaseZ,
                view.z
            );

            const actualZ = relativeZ - view.z;
            const closeness = clamp(
                1 - Math.abs(relativeZ) / 2500,
                0,
                1
            );

            const backBoundaryFade = smoothstep(
                LOOP_MIN_RELATIVE_Z,
                LOOP_MIN_RELATIVE_Z + 520,
                relativeZ
            );

            const frontBoundaryFade = 1 - smoothstep(
                LOOP_MAX_RELATIVE_Z - 250,
                LOOP_MAX_RELATIVE_Z,
                relativeZ
            );

            const boundaryFade = Math.min(
                backBoundaryFade,
                frontBoundaryFade
            );

            const opacity = clamp(
                node.memoryOpacity *
                (0.50 + closeness * 1.18) *
                boundaryFade,
                0,
                0.92
            );

            const blur = clamp(
                (Math.abs(relativeZ) - 920) / 720,
                0,
                2.25
            );

            node.style.setProperty(
                "--memory-z",
                `${actualZ.toFixed(2)}px`
            );

            node.style.setProperty(
                "--memory-base-opacity",
                opacity.toFixed(3)
            );

            node.style.setProperty(
                "--memory-depth-blur",
                `${blur.toFixed(2)}px`
            );

            node.style.zIndex = String(
                Math.round(clamp(relativeZ + 3000, 1, 5000))
            );

            node.style.pointerEvents =
                boundaryFade > 0.08 ? "auto" : "none";
        });
    }

    function renderView() {
        updateWrappedCards();

        const renderedX = view.x + view.pointerX;
        const renderedY = view.y + view.pointerY;

        world.style.transform =
            `translate3d(${renderedX}px, ${renderedY}px, ${view.z}px) ` +
            `rotateX(${view.pitch}deg) rotateY(${view.yaw}deg)`;

        stage.style.setProperty(
            "--memories-pointer-x",
            `${renderedX * 0.018 + view.yaw * 1.35}px`
        );

        stage.style.setProperty(
            "--memories-pointer-y",
            `${renderedY * 0.018 - view.pitch * 1.35}px`
        );

        stage.style.setProperty(
            "--memories-depth-shift",
            `${positiveModulo(view.z, LOOP_DEPTH) * 0.025}px`
        );
    }

    function animateView(currentTime) {
        viewAnimationFrame = null;

        const elapsedSeconds = clamp(
            (currentTime - previousFrameTime) / 1000,
            0.001,
            0.05
        );

        previousFrameTime = currentTime;

        const panFollow = drag.active
            ? DRAG_FOLLOW
            : RELEASE_FOLLOW;

        view.x = damp(view.x, targetView.x, panFollow, elapsedSeconds);
        view.y = damp(view.y, targetView.y, panFollow, elapsedSeconds);
        view.z = damp(view.z, targetView.z, DEPTH_FOLLOW, elapsedSeconds);
        view.pitch = damp(
            view.pitch,
            targetView.pitch,
            LOOK_FOLLOW,
            elapsedSeconds
        );
        view.yaw = damp(
            view.yaw,
            targetView.yaw,
            LOOK_FOLLOW,
            elapsedSeconds
        );
        view.pointerX = damp(
            view.pointerX,
            targetView.pointerX,
            POINTER_FOLLOW,
            elapsedSeconds
        );
        view.pointerY = damp(
            view.pointerY,
            targetView.pointerY,
            POINTER_FOLLOW,
            elapsedSeconds
        );

        const settled =
            Math.abs(targetView.x - view.x) < 0.05 &&
            Math.abs(targetView.y - view.y) < 0.05 &&
            Math.abs(targetView.z - view.z) < 0.05 &&
            Math.abs(targetView.pitch - view.pitch) < 0.01 &&
            Math.abs(targetView.yaw - view.yaw) < 0.01 &&
            Math.abs(targetView.pointerX - view.pointerX) < 0.05 &&
            Math.abs(targetView.pointerY - view.pointerY) < 0.05;

        if (settled) {
            Object.assign(view, targetView);
            normalizeLongTravel();
        }

        renderView();

        if (!settled) {
            viewAnimationFrame =
                window.requestAnimationFrame(animateView);
        }
    }

    function requestViewAnimation() {
        if (viewAnimationFrame !== null) return;

        previousFrameTime = performance.now();
        viewAnimationFrame =
            window.requestAnimationFrame(animateView);
    }

    function setViewImmediately(nextView) {
        Object.assign(targetView, nextView);
        Object.assign(view, targetView);

        if (viewAnimationFrame !== null) {
            window.cancelAnimationFrame(viewAnimationFrame);
            viewAnimationFrame = null;
        }

        renderView();
    }

    function resetView(immediate = false) {
        const resetState = {
            x: 0,
            y: 0,
            z: FAR_OPENING_DEPTH,
            pitch: 0,
            yaw: 0,
            pointerX: 0,
            pointerY: 0
        };

        if (immediate) {
            setViewImmediately(resetState);
            return;
        }

        Object.assign(targetView, resetState);
        requestViewAnimation();
    }

    function travelBy(distance) {
        targetView.z += distance;
        normalizeLongTravel();
        requestViewAnimation();
    }

    function fileExtension(source = "") {
        const cleanSource = source.split("?")[0].split("#")[0];
        const finalPart = cleanSource.split(".").pop();
        return finalPart ? finalPart.toLowerCase() : "";
    }

    function isVideoMemory(item) {
        return item.type === "video" ||
            videoExtensions.has(fileExtension(item.src));
    }

    function positionForIndex(index) {
        if (spatialPositions[index]) {
            return spatialPositions[index];
        }

        const extraIndex = index - spatialPositions.length;
        const angle = extraIndex * 2.399963229728653;
        const radius = 1250 + Math.sqrt(extraIndex + 1) * 260;
        const zLayer = (extraIndex % 7) - 3;

        return {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius * 0.74,
            z: zLayer * 310,
            width: 220 + (index % 4) * 28,
            rotation: ((index * 7) % 15) - 7,
            opacity: 0.30 + (index % 4) * 0.055
        };
    }

    function setFrameAspect(frame, width, height) {
        if (width > 0 && height > 0) {
            frame.style.aspectRatio = `${width} / ${height}`;
        }
    }

    function markMediaMissing(frame) {
        frame.classList.add("is-missing");
        frame.replaceChildren();
    }

    function restartThreeSecondLoop(video) {
        const loopEnd = Number.isFinite(video.duration)
            ? Math.min(3, video.duration)
            : 3;

        if (
            loopEnd > 0 &&
            video.currentTime >= loopEnd - 0.035
        ) {
            video.currentTime = 0;

            const playAttempt = video.play();
            if (playAttempt && typeof playAttempt.catch === "function") {
                playAttempt.catch(() => {});
            }
        }
    }

    function safelyPlayMemoryVideo(video) {
        if (
            memoriesWindow.classList.contains("hidden") ||
            document.hidden
        ) {
            return;
        }

        video.muted = true;
        video.defaultMuted = true;

        const playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === "function") {
            playAttempt.catch(() => {});
        }
    }

    function createVideo(frame, item) {
        const video = document.createElement("video");

        video.className = "memory-media memory-video";
        video.src = item.src;
        video.muted = true;
        video.defaultMuted = true;
        video.autoplay = true;
        video.playsInline = true;
        video.preload = "metadata";
        video.setAttribute("muted", "");
        video.setAttribute("autoplay", "");
        video.setAttribute("playsinline", "");
        video.setAttribute("aria-label", item.title || "Memory video preview");

        if (item.poster) {
            video.poster = item.poster;
        }

        video.addEventListener("loadedmetadata", () => {
            setFrameAspect(frame, video.videoWidth, video.videoHeight);
        });

        video.addEventListener("loadeddata", () => {
            video.currentTime = 0;
            safelyPlayMemoryVideo(video);
        });

        video.addEventListener("timeupdate", () => {
            restartThreeSecondLoop(video);
        });

        video.addEventListener("ended", () => {
            video.currentTime = 0;
            safelyPlayMemoryVideo(video);
        });

        video.addEventListener("error", () => {
            markMediaMissing(frame);
        });

        frame.appendChild(video);
        memoryVideos.push(video);
        return video;
    }

    function createImage(frame, item) {
        const image = document.createElement("img");

        image.className = "memory-media memory-image";
        image.src = item.src;
        image.alt = item.alt || item.title || "Memory image";
        image.loading = "lazy";
        image.decoding = "async";
        image.draggable = false;

        image.addEventListener("load", () => {
            setFrameAspect(frame, image.naturalWidth, image.naturalHeight);
        });

        image.addEventListener("error", () => {
            markMediaMissing(frame);
        });

        frame.appendChild(image);
        return image;
    }

    function createMemoryCard(item, index) {
        const position = positionForIndex(index);
        const node = document.createElement("article");
        const fixedShell = document.createElement("div");
        const card = document.createElement("button");
        const frame = document.createElement("span");

        const memoryX = item.x ?? position.x;
        const memoryY = item.y ?? position.y;
        const memoryZ = item.z ?? position.z;
        const memoryOpacity = item.opacity ?? position.opacity;

        node.className = "memory-node";
        node.style.width = `${item.width || position.width}px`;
        node.style.setProperty("--memory-x", `${memoryX}px`);
        node.style.setProperty("--memory-y", `${memoryY}px`);
        node.style.setProperty("--memory-z", `${memoryZ}px`);
        node.style.setProperty(
            "--memory-rotation",
            `${item.rotation ?? position.rotation}deg`
        );

        node.memoryBaseZ = memoryZ;
        node.memoryOpacity = memoryOpacity;

        fixedShell.className = "memory-float-shell";

        card.className = "memory-tooltip";
        card.type = "button";
        card.setAttribute(
            "aria-label",
            `Open ${item.title || `Memory ${index + 1}`}`
        );

        frame.className = "memory-preview";

        let mediaElement = null;

        if (!item.src) {
            frame.classList.add("is-placeholder");
        } else if (isVideoMemory(item)) {
            node.classList.add("contains-video");
            mediaElement = createVideo(frame, item);
        } else {
            mediaElement = createImage(frame, item);
        }

        card.appendChild(frame);
        fixedShell.appendChild(card);
        node.appendChild(fixedShell);

        card.addEventListener("click", event => {
            event.stopPropagation();

            if (!item.src || frame.classList.contains("is-missing")) {
                return;
            }

            window.openMemoryInPhotoViewer?.(item, mediaElement);
        });

        world.appendChild(node);
        memoryNodes.push(node);
    }

    memoriesMedia.forEach(createMemoryCard);

    function normalizedWheelDelta(event, value) {
        if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
            return value * 16;
        }

        if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
            return value * stage.clientHeight;
        }

        return value;
    }

    stage.addEventListener(
        "wheel",
        event => {
            event.preventDefault();

            const verticalDelta = clamp(
                normalizedWheelDelta(event, event.deltaY),
                -190,
                190
            );

            const horizontalDelta = clamp(
                normalizedWheelDelta(event, event.deltaX),
                -150,
                150
            );

            /*
             * Wheel forward/up has a negative delta and moves forward/nearer.
             * Wheel backward/down moves backward/farther. Horizontal trackpad
             * movement pans through the field at the same time.
             */
            const wheelTravelSensitivity =
                window.matchMedia("(max-width: 700px)").matches
                    ? MOBILE_WHEEL_TRAVEL_SENSITIVITY
                    : DESKTOP_WHEEL_TRAVEL_SENSITIVITY;

            travelBy(
                -verticalDelta * wheelTravelSensitivity
            );

            targetView.x -=
                horizontalDelta * TRACKPAD_PAN_SENSITIVITY;

            requestViewAnimation();
        },
        { passive: false }
    );

    function updatePointerLook(event) {
        const rectangle = stage.getBoundingClientRect();

        if (!rectangle.width || !rectangle.height) {
            return;
        }

        const normalizedX = clamp(
            (event.clientX - rectangle.left) / rectangle.width - 0.5,
            -0.5,
            0.5
        );

        const normalizedY = clamp(
            (event.clientY - rectangle.top) / rectangle.height - 0.5,
            -0.5,
            0.5
        );

        /* Cursor movement pans and looks in the same direction. */
        targetView.pointerX = normalizedX * POINTER_PAN_X * 2;
        targetView.pointerY = normalizedY * POINTER_PAN_Y * 2;
        targetView.yaw = normalizedX * MAX_LOOK_YAW * 2;
        targetView.pitch = -normalizedY * MAX_LOOK_PITCH * 2;

        requestViewAnimation();
    }

    stage.addEventListener("pointerdown", event => {
        if (
            (event.button !== 0 && event.button !== 2) ||
            event.target.closest(".memory-tooltip") ||
            event.target.closest(".memories-control")
        ) {
            return;
        }

        event.preventDefault();

        drag.active = true;
        drag.mode = event.button === 2 ? "travel" : "pan";
        drag.pointerId = event.pointerId;
        drag.startPointerX = event.clientX;
        drag.startPointerY = event.clientY;
        drag.startViewX = targetView.x;
        drag.startViewY = targetView.y;
        drag.startViewZ = targetView.z;
        drag.lastPointerX = event.clientX;
        drag.lastPointerY = event.clientY;
        drag.lastMoveTime = performance.now();
        drag.velocityX = 0;
        drag.velocityY = 0;

        stage.classList.add("is-panning");
        stage.classList.toggle("is-travelling", drag.mode === "travel");
        stage.setPointerCapture(event.pointerId);
    });

    stage.addEventListener("pointermove", event => {
        updatePointerLook(event);

        /*
         * Free cursor movement now controls depth as well as pan/look.
         * Moving the cursor upward travels forward/nearer through the
         * archive; moving it downward travels backward/farther. This is
         * deliberately disabled while dragging so the existing left/right
         * drag controls keep their original behavior.
         */
        if (!drag.active) {
            if (lastFreePointerY !== null) {
                const freeMoveY = clamp(
                    event.clientY - lastFreePointerY,
                    -42,
                    42
                );

                if (Math.abs(freeMoveY) > 0.1) {
                    travelBy(
                        -freeMoveY * POINTER_TRAVEL_SENSITIVITY
                    );
                }
            }

            lastFreePointerY = event.clientY;
            return;
        }

        lastFreePointerY = event.clientY;

        if (event.pointerId !== drag.pointerId) {
            return;
        }

        const now = performance.now();
        const elapsed = Math.max(8, now - drag.lastMoveTime);
        const moveX = event.clientX - drag.lastPointerX;
        const moveY = event.clientY - drag.lastPointerY;

        drag.velocityX =
            drag.velocityX * 0.78 + (moveX / elapsed) * 0.22;
        drag.velocityY =
            drag.velocityY * 0.78 + (moveY / elapsed) * 0.22;

        drag.lastPointerX = event.clientX;
        drag.lastPointerY = event.clientY;
        drag.lastMoveTime = now;

        const totalX = event.clientX - drag.startPointerX;
        const totalY = event.clientY - drag.startPointerY;

        if (drag.mode === "travel") {
            /* Right-drag sideways pans; right-drag vertically zooms/travels. */
            targetView.x =
                drag.startViewX + totalX * PAN_SENSITIVITY;

            targetView.z =
                drag.startViewZ -
                totalY * RIGHT_DRAG_TRAVEL_SENSITIVITY;
        } else {
            /* Left-drag gives unrestricted pan in every screen direction. */
            targetView.x =
                drag.startViewX + totalX * PAN_SENSITIVITY;

            targetView.y =
                drag.startViewY + totalY * PAN_SENSITIVITY;
        }

        requestViewAnimation();
    });

    function finishPan(event) {
        if (
            !drag.active ||
            event.pointerId !== drag.pointerId
        ) {
            return;
        }

        const finishedMode = drag.mode;

        drag.active = false;
        drag.pointerId = null;
        stage.classList.remove("is-panning", "is-travelling");

        if (finishedMode === "pan") {
            targetView.x +=
                drag.velocityX * RELEASE_GLIDE * PAN_SENSITIVITY;

            targetView.y +=
                drag.velocityY * RELEASE_GLIDE * PAN_SENSITIVITY;
        } else {
            targetView.x +=
                drag.velocityX * RELEASE_GLIDE * PAN_SENSITIVITY;

            targetView.z -=
                drag.velocityY * RELEASE_GLIDE *
                RIGHT_DRAG_TRAVEL_SENSITIVITY;
        }

        normalizeLongTravel();
        requestViewAnimation();

        if (stage.hasPointerCapture(event.pointerId)) {
            stage.releasePointerCapture(event.pointerId);
        }
    }

    stage.addEventListener("pointerup", finishPan);
    stage.addEventListener("pointercancel", finishPan);

    stage.addEventListener("contextmenu", event => {
        event.preventDefault();
    });

    stage.addEventListener("pointerleave", () => {
        if (drag.active) return;

        lastFreePointerY = null;
        targetView.pointerX = 0;
        targetView.pointerY = 0;
        targetView.pitch = 0;
        targetView.yaw = 0;
        requestViewAnimation();
    });

    stage.addEventListener("keydown", event => {
        const movement = event.shiftKey ? 180 : 80;
        const travel = event.shiftKey ? 310 : 150;

        if (event.key === "+" || event.key === "=") {
            event.preventDefault();
            travelBy(travel);
        } else if (event.key === "-" || event.key === "_") {
            event.preventDefault();
            travelBy(-travel);
        } else if (event.key === "0") {
            event.preventDefault();
            resetView();
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            targetView.x -= movement * PAN_SENSITIVITY;
            requestViewAnimation();
        } else if (event.key === "ArrowRight") {
            event.preventDefault();
            targetView.x += movement * PAN_SENSITIVITY;
            requestViewAnimation();
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            targetView.y -= movement * PAN_SENSITIVITY;
            requestViewAnimation();
        } else if (event.key === "ArrowDown") {
            event.preventDefault();
            targetView.y += movement * PAN_SENSITIVITY;
            requestViewAnimation();
        }
    });

    document
        .getElementById("memories-reset")
        ?.addEventListener("click", () => {
            resetView();
        });

    function refreshMemoryPlayback() {
        memoryVideos.forEach(video => {
            if (
                memoriesWindow.classList.contains("hidden") ||
                document.hidden
            ) {
                video.pause();
            } else {
                safelyPlayMemoryVideo(video);
            }
        });
    }

    let wasWindowHidden =
        memoriesWindow.classList.contains("hidden");

    const windowVisibilityObserver = new MutationObserver(() => {
        const isWindowHidden =
            memoriesWindow.classList.contains("hidden");

        if (wasWindowHidden && !isWindowHidden) {
            resetView(true);
        }

        wasWindowHidden = isWindowHidden;
        refreshMemoryPlayback();
    });

    windowVisibilityObserver.observe(memoriesWindow, {
        attributes: true,
        attributeFilter: ["class"]
    });

    document.addEventListener("visibilitychange", refreshMemoryPlayback);

    ["pointerdown", "touchstart", "click"].forEach(eventName => {
        document.addEventListener(eventName, refreshMemoryPlayback, {
            once: true,
            passive: true
        });
    });

    window.addEventListener("resize", () => {
        renderView();
    });

    resetView(true);
})();



// ====================================
// HAUNTED MANSION — 32-BIT CODE-DRAWN PIXEL SCENE
// ====================================

(() => {
    const canvas = document.getElementById("haunted-mansion-canvas");
    const mansionWindow = document.getElementById("haunted-mansion-window");

    if (!canvas || !mansionWindow) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const artCanvas = document.createElement("canvas");
    const art = artCanvas.getContext("2d", { alpha: false });

    if (!art) return;

    context.imageSmoothingEnabled = false;
    art.imageSmoothingEnabled = false;

    const palette = {
        black: "#030209",
        ink: "#07050f",
        ink2: "#0b0716",

        sky0: "#05030d",
        sky1: "#090617",
        sky2: "#100922",
        sky3: "#17102f",
        sky4: "#211640",
        sky5: "#2e1f55",
        sky6: "#3b2a68",
        skyFlash: "#756aa8",

        cloud0: "#0e0c19",
        cloud1: "#171326",
        cloud2: "#221b3a",
        cloud3: "#322750",
        cloud4: "#493966",
        cloud5: "#665184",
        cloudLit: "#8d82ad",

        moonGlow: "#706a9d",
        moonRim: "#cbd1f3",
        moon: "#f0f1ff",
        moonShade1: "#d0d3ed",
        moonShade2: "#aaa8d2",

        mist0: "#211a36",
        mist1: "#30264c",
        hillFar: "#0c0917",
        hillMid: "#100c20",
        hillNear: "#151027",
        pineFar: "#100d21",
        pineMid: "#16112c",
        pineNear: "#1d1638",

        tree0: "#08060f",
        tree1: "#100a1d",
        tree2: "#211237",
        tree3: "#382056",
        moss0: "#1a102d",
        moss1: "#2d1848",

        stone0: "#090711",
        stone1: "#100c1d",
        stone2: "#191229",
        stone3: "#24193a",
        stone4: "#34234e",
        stone5: "#4a3266",
        stoneLit: "#6b4a83",

        roof0: "#06050c",
        roof1: "#0c0915",
        roof2: "#151023",
        roof3: "#221633",
        roof4: "#38234d",

        metal0: "#0b0814",
        metal1: "#24163a",
        metal2: "#4b3568",

        orange0: "#6d231e",
        orange1: "#a83b28",
        orange2: "#e15e36",
        orange3: "#ff8b49",
        orange4: "#ffb65f",
        orange5: "#ffe29a",

        water0: "#050611",
        water1: "#090b1b",
        water2: "#101329",
        water3: "#191b3b",
        water4: "#272651",
        water5: "#403b72",
        water6: "#6d649a",

        lightningGlow: "#8996e0",
        lightningBlue: "#c8d3ff",
        lightning: "#fbfbff"
    };

    const ART_WIDTH = 384;
    const OUTPUT_SCALE = 2;

    let logicalWidth = ART_WIDTH;
    let logicalHeight = 288;
    let lastSizeKey = "";

    let stars = [];
    let farTrees = [];
    let waterMarks = [];
    let stoneNoise = [];
    let foliageDots = [];
    let rainSpecks = [];

    let nextStrikeAt = 0;
    let strikeStartedAt = -Infinity;
    let strikeDuration = 620;
    let lightningMain = [];
    let lightningBranches = [];
    let lightningSideGlow = 1;

    function clamp(value, minimum, maximum) {
        return Math.max(minimum, Math.min(maximum, value));
    }

    function mix(minimum, maximum, amount) {
        return minimum + (maximum - minimum) * amount;
    }

    function px(value) {
        return Math.round(value);
    }

    function hashSeed(text) {
        let seed = 2166136261;

        for (let index = 0; index < text.length; index += 1) {
            seed ^= text.charCodeAt(index);
            seed = Math.imul(seed, 16777619);
        }

        return seed >>> 0;
    }

    function makeRandom(seed) {
        let value = seed >>> 0;

        return () => {
            value += 0x6D2B79F5;
            let result = value;
            result = Math.imul(result ^ (result >>> 15), result | 1);
            result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
            return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
        };
    }

    function randomBetween(minimum, maximum) {
        return minimum + Math.random() * (maximum - minimum);
    }

    function setCanvasSize() {
        const screen = canvas.parentElement;
        if (!screen) return;

        const rectangle = screen.getBoundingClientRect();
        const cssWidth = Math.max(320, rectangle.width || 860);
        const cssHeight = Math.max(240, rectangle.height || 620);
        const nextLogicalHeight = clamp(
            Math.round(ART_WIDTH * (cssHeight / cssWidth)),
            236,
            430
        );

        const sizeKey = `${ART_WIDTH}x${nextLogicalHeight}`;
        if (sizeKey === lastSizeKey) return;

        lastSizeKey = sizeKey;
        logicalWidth = ART_WIDTH;
        logicalHeight = nextLogicalHeight;

        artCanvas.width = logicalWidth;
        artCanvas.height = logicalHeight;

        canvas.width = logicalWidth * OUTPUT_SCALE;
        canvas.height = logicalHeight * OUTPUT_SCALE;

        context.imageSmoothingEnabled = false;
        art.imageSmoothingEnabled = false;

        rebuildStaticSceneData(sizeKey);
    }

    function rebuildStaticSceneData(sizeKey) {
        const random = makeRandom(hashSeed(`haunted32:${sizeKey}`));

        stars = Array.from({ length: 115 }, () => ({
            x: Math.floor(random() * logicalWidth),
            y: Math.floor(random() * logicalHeight * 0.42),
            size: random() > 0.92 ? 2 : 1,
            bright: random() > 0.70
        }));

        farTrees = [];
        for (let x = -6; x < logicalWidth + 10; x += 6 + Math.floor(random() * 4)) {
            farTrees.push({
                x,
                height: Math.floor(mix(18, 42, random())),
                width: Math.floor(mix(10, 20, random())),
                tone: random() > 0.5 ? 1 : 0
            });
        }

        waterMarks = Array.from({ length: 135 }, () => ({
            x: Math.floor(random() * logicalWidth),
            y: random(),
            width: Math.floor(mix(3, 24, random())),
            tone: Math.floor(random() * 5),
            phase: random() * Math.PI * 2,
            speed: mix(0.35, 1.2, random())
        }));

        stoneNoise = Array.from({ length: 160 }, () => ({
            x: random(),
            y: random(),
            w: random() > 0.78 ? 5 : random() > 0.5 ? 3 : 2,
            tone: random()
        }));

        foliageDots = Array.from({ length: 170 }, () => ({
            x: random(),
            y: random(),
            size: random() > 0.86 ? 2 : 1,
            tone: random()
        }));

        rainSpecks = Array.from({ length: 70 }, () => ({
            x: random() * logicalWidth,
            y: random() * logicalHeight,
            length: random() > 0.72 ? 3 : 2,
            phase: random() * 1000
        }));
    }

    function fillRect(x, y, width, height, color) {
        art.fillStyle = color;
        art.fillRect(px(x), px(y), Math.max(1, px(width)), Math.max(1, px(height)));
    }

    function rectOutline(x, y, width, height, color, thickness = 1) {
        fillRect(x, y, width, thickness, color);
        fillRect(x, y + height - thickness, width, thickness, color);
        fillRect(x, y, thickness, height, color);
        fillRect(x + width - thickness, y, thickness, height, color);
    }

    function polygon(points, color) {
        if (!points.length) return;

        art.fillStyle = color;
        art.beginPath();
        art.moveTo(px(points[0][0]), px(points[0][1]));

        for (let index = 1; index < points.length; index += 1) {
            art.lineTo(px(points[index][0]), px(points[index][1]));
        }

        art.closePath();
        art.fill();
    }

    function strokePath(points, color, width = 1, alpha = 1) {
        if (!points.length) return;

        art.save();
        art.globalAlpha = alpha;
        art.strokeStyle = color;
        art.lineWidth = width;
        art.lineJoin = "miter";
        art.lineCap = "square";
        art.beginPath();
        art.moveTo(px(points[0][0]), px(points[0][1]));

        for (let index = 1; index < points.length; index += 1) {
            art.lineTo(px(points[index][0]), px(points[index][1]));
        }

        art.stroke();
        art.restore();
    }

    function ellipse(x, y, radiusX, radiusY, color) {
        art.fillStyle = color;
        art.beginPath();
        art.ellipse(px(x), px(y), Math.max(1, px(radiusX)), Math.max(1, px(radiusY)), 0, 0, Math.PI * 2);
        art.fill();
    }

    function ditherRect(x, y, width, height, color, density = 0.5, phase = 0) {
        art.fillStyle = color;
        const startX = px(x);
        const startY = px(y);
        const endX = px(x + width);
        const endY = px(y + height);
        const threshold = Math.max(1, Math.round(1 / Math.max(0.08, density)));

        for (let yy = startY; yy < endY; yy += 2) {
            for (let xx = startX; xx < endX; xx += 2) {
                if (((xx + yy + phase) / 2) % threshold < 1) {
                    art.fillRect(xx, yy, 1, 1);
                }
            }
        }
    }

    function drawSky(flash) {
        const colors = [
            palette.sky0,
            palette.sky1,
            palette.sky2,
            palette.sky3,
            palette.sky4,
            palette.sky5,
            palette.sky6
        ];

        const skyBottom = logicalHeight * 0.62;
        const bandHeight = Math.ceil(skyBottom / colors.length);

        colors.forEach((color, index) => {
            fillRect(0, index * bandHeight, logicalWidth, bandHeight + 2, color);

            if (index > 0) {
                ditherRect(
                    0,
                    index * bandHeight - 4,
                    logicalWidth,
                    8,
                    colors[index - 1],
                    0.34,
                    index
                );
            }
        });

        if (flash > 0.03) {
            art.save();
            art.globalAlpha = flash * 0.32;
            fillRect(0, 0, logicalWidth, skyBottom, palette.skyFlash);
            art.restore();
        }

        stars.forEach(star => {
            if (flash > 0.48 && !star.bright) return;
            const tone = star.bright ? palette.moonRim : palette.cloud5;
            fillRect(star.x, star.y, star.size, star.size, tone);
        });
    }

    function drawMoon(flash) {
        const x = logicalWidth * 0.185;
        const y = logicalHeight * 0.19;
        const radius = clamp(logicalWidth * 0.080, 24, 34);

        ellipse(x, y, radius + 7, radius + 7, palette.moonGlow);
        ditherRect(x - radius - 8, y - radius - 8, (radius + 8) * 2, (radius + 8) * 2, palette.sky5, 0.42, 1);
        ellipse(x, y, radius + 2, radius + 2, palette.moonRim);
        ellipse(x, y, radius, radius, flash > 0.62 ? "#ffffff" : palette.moon);

        ellipse(x - radius * 0.34, y - radius * 0.23, radius * 0.18, radius * 0.12, palette.moonShade1);
        ellipse(x + radius * 0.25, y - radius * 0.12, radius * 0.12, radius * 0.08, palette.moonShade2);
        ellipse(x + radius * 0.06, y + radius * 0.27, radius * 0.24, radius * 0.12, palette.moonShade1);
        ellipse(x - radius * 0.25, y + radius * 0.24, radius * 0.09, radius * 0.07, palette.moonShade2);

        drawBat(x - 8, y - 2, 1.15);
        drawBat(x + 22, y + 6, 0.72);
        drawBat(x - 29, y + 14, 0.58);
    }

    function drawBat(x, y, scale, wing = 0) {
        const flap = clamp(wing, -1, 1);
        const wingTipY = y - (4 + flap * 3.1) * scale;
        const lowerWingY = y + (2.5 - flap * 0.9) * scale;

        polygon([
            [x - 7 * scale, y],
            [x - 4 * scale, wingTipY],
            [x - 1.5 * scale, y - 1.5 * scale],
            [x, y - 3 * scale],
            [x + 1.5 * scale, y - 1.5 * scale],
            [x + 4 * scale, wingTipY],
            [x + 7 * scale, y],
            [x + 3.5 * scale, y - 0.5 * scale],
            [x + 1.4 * scale, lowerWingY],
            [x, y + 1.2 * scale],
            [x - 1.4 * scale, lowerWingY],
            [x - 3.5 * scale, y - 0.5 * scale]
        ], palette.black);
    }

    function drawPerspectiveBats(now) {
        if (reducedMotion.matches) return;

        const flights = [
            { phase: 0.02, side: -1, lane: -0.08, scale: 5.4 },
            { phase: 0.21, side:  1, lane:  0.07, scale: 4.4 },
            { phase: 0.43, side: -1, lane:  0.03, scale: 3.9 },
            { phase: 0.68, side:  1, lane: -0.04, scale: 4.8 }
        ];

        const cycleMs = 9800;
        const activePortion = 0.61;

        flights.forEach((flight, index) => {
            const cycle = ((now / cycleMs) + flight.phase) % 1;
            if (cycle > activePortion) return;

            const progress = cycle / activePortion;
            const eased = 1 - Math.pow(1 - progress, 2.15);
            const side = flight.side;

            // Start oversized and just behind/below the observer, then arc
            // toward one side of the distant sky while shrinking rapidly.
            const startX = logicalWidth * (0.5 + flight.lane);
            const endX = logicalWidth * (side < 0 ? 0.075 : 0.925);
            const curve = Math.sin(progress * Math.PI) * logicalWidth * 0.085 * side;
            const x = mix(startX, endX, eased) + curve;
            const y = mix(logicalHeight * 1.06, logicalHeight * 0.245, eased)
                - Math.sin(progress * Math.PI) * logicalHeight * 0.075;

            const perspective = Math.pow(1 - progress, 1.85);
            const scale = 0.34 + flight.scale * perspective;
            const wing = Math.sin(now * 0.020 + index * 1.7 + progress * 14);

            art.save();
            art.globalAlpha = clamp(0.34 + perspective * 0.66, 0, 1);
            drawBat(x, y, scale, wing);
            art.restore();
        });
    }

    function drawCloudCluster(x, y, width, height, tone, litTone, flash, drift = 0) {
        const xx = x + drift;

        ellipse(xx + width * 0.14, y + height * 0.58, width * 0.18, height * 0.29, tone);
        ellipse(xx + width * 0.30, y + height * 0.39, width * 0.23, height * 0.38, tone);
        ellipse(xx + width * 0.50, y + height * 0.49, width * 0.28, height * 0.36, tone);
        ellipse(xx + width * 0.70, y + height * 0.36, width * 0.19, height * 0.30, tone);
        ellipse(xx + width * 0.85, y + height * 0.57, width * 0.17, height * 0.25, tone);
        fillRect(xx + width * 0.10, y + height * 0.53, width * 0.78, height * 0.31, tone);

        const highlight = flash > 0.25 ? litTone : palette.cloud4;
        art.save();
        art.globalAlpha = flash > 0.25 ? 0.38 + flash * 0.25 : 0.36;
        ellipse(xx + width * 0.36, y + height * 0.32, width * 0.17, height * 0.12, highlight);
        ellipse(xx + width * 0.68, y + height * 0.33, width * 0.11, height * 0.09, highlight);
        art.restore();

        ditherRect(xx + width * 0.08, y + height * 0.66, width * 0.76, height * 0.18, palette.cloud0, 0.32, px(x + y));
    }

    function drawClouds(now, flash) {
        const drift = reducedMotion.matches ? 0 : Math.floor((now / 2100) % 12);

        drawCloudCluster(-46 + drift, logicalHeight * 0.09, 155, 32, palette.cloud1, palette.cloudLit, flash, 0);
        drawCloudCluster(45 - drift * 0.35, logicalHeight * 0.27, 145, 27, palette.cloud2, palette.cloudLit, flash, 0);
        drawCloudCluster(167 + drift * 0.4, logicalHeight * 0.07, 166, 35, palette.cloud3, palette.cloudLit, flash, 0);
        drawCloudCluster(287 - drift * 0.55, logicalHeight * 0.22, 130, 30, palette.cloud1, palette.cloudLit, flash, 0);
        drawCloudCluster(116 + drift * 0.25, logicalHeight * 0.36, 190, 25, palette.cloud1, palette.cloudLit, flash, 0);
    }

    function drawHillsAndForest(flash) {
        const horizon = logicalHeight * 0.665;

        polygon([
            [0, horizon],
            [0, horizon - 29],
            [31, horizon - 47],
            [64, horizon - 35],
            [95, horizon - 54],
            [128, horizon - 37],
            [169, horizon - 58],
            [211, horizon - 39],
            [247, horizon - 52],
            [291, horizon - 35],
            [333, horizon - 49],
            [logicalWidth, horizon - 30],
            [logicalWidth, horizon]
        ], flash > 0.48 ? palette.mist0 : palette.hillFar);

        polygon([
            [0, horizon],
            [0, horizon - 17],
            [36, horizon - 30],
            [76, horizon - 20],
            [112, horizon - 36],
            [151, horizon - 23],
            [195, horizon - 39],
            [235, horizon - 20],
            [278, horizon - 35],
            [325, horizon - 22],
            [logicalWidth, horizon - 31],
            [logicalWidth, horizon]
        ], palette.hillMid);

        farTrees.forEach(tree => {
            const baseY = horizon + 2;
            const tone = tree.tone ? palette.pineMid : palette.pineFar;
            drawPine(tree.x, baseY, tree.width, tree.height, tone, palette.hillFar);
        });

        art.save();
        art.globalAlpha = 0.55 + flash * 0.12;
        fillRect(0, horizon - 8, logicalWidth, 8, palette.mist0);
        ditherRect(0, horizon - 13, logicalWidth, 10, palette.mist1, 0.27, 2);
        art.restore();
    }

    function drawPine(x, baseY, width, height, tone, shadowTone = null) {
        const shadow = shadowTone || tone;
        fillRect(x - 1, baseY - height * 0.68, 3, height * 0.68, shadow);

        const tiers = 5;
        for (let tier = 0; tier < tiers; tier += 1) {
            const topY = baseY - height + tier * (height * 0.13);
            const tierWidth = width * (0.42 + tier * 0.16);
            polygon([
                [x, topY],
                [x - tierWidth * 0.55, topY + height * 0.20],
                [x - tierWidth * 0.22, topY + height * 0.17],
                [x - tierWidth * 0.72, topY + height * 0.29],
                [x + tierWidth * 0.72, topY + height * 0.29],
                [x + tierWidth * 0.22, topY + height * 0.17],
                [x + tierWidth * 0.55, topY + height * 0.20]
            ], tier % 2 ? shadow : tone);
        }
    }

    function drawDistantTrees() {
        const baseY = logicalHeight * 0.72;

        drawPine(102, baseY, 31, 77, palette.pineNear, palette.pineMid);
        drawPine(125, baseY + 2, 24, 58, palette.pineMid, palette.pineFar);
        drawPine(311, baseY + 1, 30, 74, palette.pineNear, palette.pineMid);
        drawPine(335, baseY + 2, 22, 54, palette.pineMid, palette.pineFar);
        drawPine(77, baseY + 3, 18, 46, palette.pineMid, palette.pineFar);
    }

    function drawMansion(flash, now) {
        const W = logicalWidth;
        const H = logicalHeight;
        const ground = H * 0.742;
        const centerX = W * 0.605;
        const baseLeft = centerX - 77;
        const baseRight = centerX + 80;
        const bodyTop = ground - 76;

        // Foundation hill and approach.
        polygon([
            [W * 0.29, ground + 8],
            [W * 0.34, ground - 7],
            [W * 0.43, ground - 13],
            [W * 0.61, ground - 17],
            [W * 0.75, ground - 12],
            [W * 0.83, ground - 4],
            [W * 0.88, ground + 8],
            [W * 0.88, ground + 20],
            [W * 0.29, ground + 20]
        ], palette.hillNear);

        // Long rear wing.
        fillRect(baseLeft, bodyTop + 18, baseRight - baseLeft, 62, palette.stone1);
        fillRect(baseLeft + 4, bodyTop + 20, baseRight - baseLeft - 8, 2, palette.stone3);
        fillRect(baseLeft + 1, bodyTop + 22, 3, 56, palette.stone4);
        fillRect(baseRight - 5, bodyTop + 22, 4, 57, palette.stone0);

        // Left and right projecting wings.
        drawTower(baseLeft - 23, bodyTop + 6, 36, 74, 31, flash, "left");
        drawTower(baseRight - 8, bodyTop + 11, 33, 69, 28, flash, "right");

        // Central body and grand gable.
        fillRect(centerX - 49, bodyTop - 8, 98, 89, palette.stone2);
        fillRect(centerX - 46, bodyTop - 5, 3, 84, palette.stone4);
        fillRect(centerX + 44, bodyTop - 2, 4, 82, palette.stone0);

        polygon([
            [centerX - 57, bodyTop - 6],
            [centerX, bodyTop - 43],
            [centerX + 57, bodyTop - 6]
        ], palette.roof0);
        polygon([
            [centerX - 50, bodyTop - 7],
            [centerX, bodyTop - 38],
            [centerX + 22, bodyTop - 7]
        ], palette.roof3);
        strokePath([
            [centerX - 55, bodyTop - 6],
            [centerX, bodyTop - 43],
            [centerX + 56, bodyTop - 6]
        ], flash > 0.34 ? palette.stoneLit : palette.roof4, 1, 0.82);

        // Main tower.
        const towerX = centerX - 18;
        const towerY = bodyTop - 70;
        fillRect(towerX, towerY, 36, 95, palette.stone1);
        fillRect(towerX + 2, towerY + 2, 3, 89, palette.stone4);
        fillRect(towerX + 31, towerY + 4, 4, 88, palette.stone0);

        // Tower crown and roof.
        fillRect(towerX - 4, towerY + 14, 44, 6, palette.stone3);
        fillRect(towerX - 5, towerY + 16, 46, 2, palette.stone5);
        polygon([
            [towerX - 4, towerY + 1],
            [centerX, towerY - 45],
            [towerX + 40, towerY + 1]
        ], palette.roof0);
        polygon([
            [towerX + 2, towerY],
            [centerX, towerY - 41],
            [centerX + 8, towerY]
        ], palette.roof3);
        strokePath([
            [towerX - 3, towerY + 1],
            [centerX, towerY - 45],
            [towerX + 39, towerY + 1]
        ], flash > 0.28 ? palette.stoneLit : palette.roof4, 1, 0.8);

        // Tall finial and weather vane.
        fillRect(centerX, towerY - 56, 1, 12, flash > 0.55 ? palette.lightningBlue : palette.metal2);
        fillRect(centerX - 6, towerY - 53, 12, 1, palette.metal2);
        fillRect(centerX + 4, towerY - 55, 3, 2, palette.metal2);
        polygon([
            [centerX + 7, towerY - 55],
            [centerX + 12, towerY - 53],
            [centerX + 7, towerY - 51]
        ], palette.metal1);

        // Side turrets and pointed roofs.
        drawTurret(centerX - 64, bodyTop - 17, 22, 66, 26, flash);
        drawTurret(centerX + 50, bodyTop - 15, 21, 64, 24, flash);
        drawTurret(baseLeft - 8, bodyTop + 1, 17, 55, 22, flash);
        drawTurret(baseRight - 2, bodyTop + 1, 17, 54, 21, flash);

        // Balcony under the tower.
        fillRect(centerX - 29, towerY + 33, 58, 16, palette.stone2);
        fillRect(centerX - 31, towerY + 47, 62, 3, palette.stone4);
        fillRect(centerX - 31, towerY + 32, 62, 2, palette.stone5);
        for (let x = centerX - 25; x <= centerX + 25; x += 7) {
            fillRect(x, towerY + 29, 1, 5, palette.metal2);
        }
        fillRect(centerX - 29, towerY + 28, 58, 1, palette.metal2);

        // Stone texture: tiny stable masonry marks.
        stoneNoise.forEach(mark => {
            const x = baseLeft + mark.x * (baseRight - baseLeft);
            const y = bodyTop - 4 + mark.y * 82;

            if (x > centerX - 17 && x < centerX + 18 && y < bodyTop + 4) return;

            const color = mark.tone > 0.72
                ? palette.stone4
                : mark.tone > 0.36
                    ? palette.stone3
                    : palette.stone1;

            art.save();
            art.globalAlpha = 0.62;
            fillRect(x, y, mark.w, 1, color);
            art.restore();
        });

        // Roof shingles.
        drawRoofShingles(centerX - 48, bodyTop - 33, 96, 27);
        drawRoofShingles(centerX - 15, towerY - 35, 30, 33);

        // Windows across the facade.
        const flicker = reducedMotion.matches ? 1 : 0.92 + Math.sin(now / 570) * 0.08;
        const windowGroups = [
            [baseLeft - 13, bodyTop + 31, 0.72],
            [baseLeft - 13, bodyTop + 53, 1],
            [baseLeft + 18, bodyTop + 30, 0.92],
            [baseLeft + 39, bodyTop + 31, 0.78],
            [centerX - 34, bodyTop + 22, 0.9],
            [centerX - 12, bodyTop + 18, 1],
            [centerX + 13, bodyTop + 18, 0.82],
            [centerX + 34, bodyTop + 22, 0.96],
            [baseRight - 31, bodyTop + 34, 0.78],
            [baseRight - 10, bodyTop + 31, 1],
            [baseRight + 7, bodyTop + 51, 0.88],
            [centerX - 8, towerY + 9, 1],
            [centerX + 3, towerY + 9, 0.84],
            [centerX - 7, towerY + 58, 0.82],
            [centerX + 4, towerY + 58, 1]
        ];

        windowGroups.forEach(([x, y, intensity], index) => {
            drawGothicWindow(x, y, index % 3 === 0 ? 7 : 6, index % 2 === 0 ? 13 : 12, intensity * flicker, flash);
        });

        // A human shadow is visible only when lightning illuminates the castle.
        // It stands in the lower row of the main tower windows.
        drawLightningWindowShadow(centerX + 4, towerY + 58, 6, 13, flash);

        // Tall arched entrance.
        drawDoor(centerX - 8, ground - 28, 16, 28, flash);

        // Stairway.
        for (let step = 0; step < 7; step += 1) {
            const width = 24 + step * 7;
            fillRect(centerX - width / 2, ground + step * 2, width, 2, step % 2 ? palette.stone2 : palette.stone4);
        }

        // Side stairs and retaining stones.
        strokePath([
            [centerX - 55, ground - 4],
            [centerX - 48, ground + 4],
            [centerX - 39, ground + 9]
        ], palette.stone4, 2);
        strokePath([
            [centerX + 55, ground - 4],
            [centerX + 47, ground + 4],
            [centerX + 38, ground + 9]
        ], palette.stone0, 2);

        // Wrought iron fence and gate.
        drawFence(baseLeft - 58, ground + 12, 58);
        drawFence(baseRight, ground + 12, 54);
        drawGate(centerX - 28, ground + 12, 56, 22);

        // Gate pillars and lanterns.
        drawGatePillar(centerX - 38, ground + 12, flash);
        drawGatePillar(centerX + 34, ground + 12, flash);

        // Ivy climbing one side.
        drawIvy(baseRight - 21, bodyTop + 16, 44);
    }

    function drawTower(x, y, width, height, roofHeight, flash, side) {
        fillRect(x, y, width, height, palette.stone1);
        fillRect(x + 2, y + 2, 3, height - 4, palette.stone3);
        fillRect(x + width - 4, y + 3, 3, height - 3, palette.stone0);

        polygon([
            [x - 4, y + 2],
            [x + width * 0.5, y - roofHeight],
            [x + width + 4, y + 2]
        ], palette.roof0);
        polygon([
            [x + 2, y + 1],
            [x + width * 0.5, y - roofHeight + 4],
            [x + width * 0.62, y + 1]
        ], palette.roof3);

        const rim = flash > 0.34 ? palette.stoneLit : palette.roof4;
        strokePath([
            [x - 3, y + 1],
            [x + width * 0.5, y - roofHeight],
            [x + width + 3, y + 1]
        ], rim, 1, 0.72);

        if (side === "left") {
            fillRect(x + 6, y + height * 0.54, 1, 13, palette.stone4);
        }
    }

    function drawTurret(x, y, width, height, roofHeight, flash) {
        fillRect(x, y, width, height, palette.stone1);
        fillRect(x + 2, y + 2, 2, height - 4, palette.stone4);
        fillRect(x + width - 3, y + 4, 2, height - 4, palette.stone0);

        polygon([
            [x - 3, y + 1],
            [x + width * 0.5, y - roofHeight],
            [x + width + 3, y + 1]
        ], palette.roof0);
        polygon([
            [x + 1, y],
            [x + width * 0.5, y - roofHeight + 3],
            [x + width * 0.60, y]
        ], palette.roof3);

        if (flash > 0.35) {
            strokePath([
                [x - 2, y],
                [x + width * 0.5, y - roofHeight],
                [x + width + 2, y]
            ], palette.stoneLit, 1, flash * 0.65);
        }
    }

    function drawRoofShingles(x, y, width, height) {
        art.save();
        art.globalAlpha = 0.58;

        for (let yy = y; yy < y + height; yy += 4) {
            const row = Math.floor((yy - y) / 4);
            const inset = row * 2.4;
            const start = x + inset;
            const end = x + width - inset;

            for (let xx = start + (row % 2) * 3; xx < end; xx += 7) {
                fillRect(xx, yy, 4, 1, row % 2 ? palette.roof2 : palette.roof4);
            }
        }

        art.restore();
    }

    function drawGothicWindow(x, y, width, height, intensity, flash) {
        const warm = intensity > 0.92
            ? palette.orange4
            : intensity > 0.78
                ? palette.orange3
                : palette.orange2;

        fillRect(x - 1, y + 2, width + 2, height - 2, palette.stone0);
        polygon([
            [x - 1, y + 3],
            [x + width * 0.5, y - 2],
            [x + width + 1, y + 3]
        ], palette.stone0);

        const glow = flash > 0.68 ? palette.orange5 : warm;
        fillRect(x, y + 3, width, height - 4, glow);
        polygon([
            [x, y + 3],
            [x + width * 0.5, y],
            [x + width, y + 3]
        ], glow);

        art.save();
        art.globalAlpha = 0.55 + intensity * 0.35;
        fillRect(x + Math.floor(width / 2), y + 2, 1, height - 2, palette.orange0);
        fillRect(x, y + Math.floor(height * 0.53), width, 1, palette.orange0);
        art.restore();

        // Tiny sill / hot edge.
        fillRect(x, y + height - 1, width, 1, palette.orange1);
        if (intensity > 0.9) {
            fillRect(x + 1, y + 4, 1, Math.max(2, height - 7), palette.orange5);
        }
    }

    function drawLightningWindowShadow(x, y, width, height, flash) {
        if (flash <= 0.055) return;

        const visibility = clamp((flash - 0.055) / 0.42, 0, 1);
        const center = Math.round(x + width * 0.5);
        const headY = Math.round(y + 4);

        art.save();
        art.globalAlpha = 0.34 + visibility * 0.64;

        // Head, neck, shoulders and narrow torso, clipped by the tiny gothic window.
        fillRect(center - 1, headY, 3, 3, palette.black);
        fillRect(center, headY + 3, 1, 1, palette.black);
        fillRect(center - 2, headY + 4, 5, 2, palette.black);
        fillRect(center - 1, headY + 6, 3, Math.max(2, height - 10), palette.black);

        // Lightning rim makes the silhouette read as a person without glowing
        // after the flash has gone.
        art.globalAlpha = visibility * 0.22;
        fillRect(center - 2, headY + 3, 1, 4, palette.lightningBlue);

        art.restore();
    }

    function drawDoor(x, y, width, height, flash) {
        fillRect(x - 2, y + 6, width + 4, height - 6, palette.stone0);
        polygon([
            [x - 2, y + 7],
            [x + width * 0.5, y - 2],
            [x + width + 2, y + 7]
        ], palette.stone0);

        fillRect(x, y + 8, width, height - 8, palette.orange0);
        polygon([
            [x, y + 8],
            [x + width * 0.5, y + 1],
            [x + width, y + 8]
        ], palette.orange2);

        fillRect(x + 2, y + 9, width - 4, height - 10, flash > 0.55 ? palette.orange4 : palette.orange2);
        fillRect(x + width * 0.5, y + 7, 1, height - 7, palette.orange0);
        fillRect(x + 2, y + 16, width - 4, 1, palette.orange0);
        fillRect(x + width - 4, y + 20, 1, 1, palette.orange5);
    }

    function drawFence(x, baseY, width) {
        fillRect(x, baseY - 10, width, 1, palette.metal1);
        fillRect(x, baseY - 4, width, 1, palette.metal2);

        for (let xx = x; xx <= x + width; xx += 6) {
            fillRect(xx, baseY - 18, 1, 18, palette.metal2);
            polygon([
                [xx - 2, baseY - 18],
                [xx, baseY - 23],
                [xx + 2, baseY - 18]
            ], palette.metal2);
        }
    }

    function drawGate(x, baseY, width, height) {
        fillRect(x, baseY - height, 2, height, palette.metal2);
        fillRect(x + width - 2, baseY - height, 2, height, palette.metal2);
        fillRect(x, baseY - height, width, 1, palette.metal2);

        const half = width / 2;
        for (let xx = x + 6; xx < x + width - 5; xx += 7) {
            fillRect(xx, baseY - height + 4, 1, height - 4, palette.metal2);
            polygon([
                [xx - 2, baseY - height + 4],
                [xx, baseY - height],
                [xx + 2, baseY - height + 4]
            ], palette.metal2);
        }

        strokePath([
            [x + 2, baseY - height + 7],
            [x + half, baseY - 2],
            [x + width - 2, baseY - height + 7]
        ], palette.metal1, 1);
    }

    function drawGatePillar(x, baseY, flash) {
        fillRect(x, baseY - 27, 9, 27, palette.stone2);
        fillRect(x + 1, baseY - 26, 2, 25, palette.stone4);
        fillRect(x - 2, baseY - 29, 13, 3, palette.stone3);
        fillRect(x - 1, baseY - 32, 11, 3, palette.stone1);

        fillRect(x + 2, baseY - 38, 5, 6, palette.metal0);
        fillRect(x + 3, baseY - 37, 3, 4, flash > 0.55 ? palette.orange5 : palette.orange4);
        fillRect(x + 2, baseY - 39, 5, 1, palette.metal2);
    }

    function drawIvy(x, y, height) {
        strokePath([
            [x, y],
            [x - 5, y + 10],
            [x + 2, y + 18],
            [x - 4, y + 27],
            [x + 1, y + height]
        ], palette.tree3, 1, 0.8);

        for (let index = 0; index < 9; index += 1) {
            const yy = y + 4 + index * 4;
            const xx = x + (index % 2 ? 2 : -3);
            fillRect(xx, yy, 3, 2, index % 3 ? palette.tree2 : palette.tree3);
        }
    }

    function drawGroundAndFoliage(flash) {
        const ground = logicalHeight * 0.742;
        const waterTop = logicalHeight * 0.835;

        fillRect(0, ground + 10, logicalWidth, waterTop - ground - 10, palette.hillNear);

        // Cobblestone path from gate toward the pond.
        polygon([
            [logicalWidth * 0.545, ground + 16],
            [logicalWidth * 0.665, ground + 16],
            [logicalWidth * 0.74, waterTop],
            [logicalWidth * 0.42, waterTop]
        ], palette.stone1);

        for (let row = 0; row < 9; row += 1) {
            const y = ground + 20 + row * 5;
            const widening = row * 5.3;
            const left = logicalWidth * 0.605 - 25 - widening;
            const width = 50 + widening * 2;
            const offset = row % 2 ? 5 : 0;

            for (let x = left + offset; x < left + width; x += 13) {
                fillRect(x, y, 8, 1, row % 3 === 0 ? palette.stone4 : palette.stone3);
            }
        }

        // Dense purple shrubs and rocks.
        foliageDots.forEach(dot => {
            const leftSide = dot.x < 0.5;
            const xx = leftSide
                ? mix(15, logicalWidth * 0.43, dot.x * 2)
                : mix(logicalWidth * 0.78, logicalWidth - 15, (dot.x - 0.5) * 2);
            const yy = mix(ground + 2, waterTop + 5, dot.y);
            const color = dot.tone > 0.76
                ? (flash > 0.45 ? palette.stoneLit : palette.tree3)
                : dot.tone > 0.42
                    ? palette.tree2
                    : palette.pineNear;

            fillRect(xx, yy, dot.size + 1, dot.size, color);
        });

        // Foreground rocks.
        polygon([[8, waterTop], [23, waterTop - 17], [38, waterTop - 9], [49, waterTop], [49, waterTop + 9], [8, waterTop + 9]], palette.tree0);
        polygon([[logicalWidth - 62, waterTop], [logicalWidth - 45, waterTop - 20], [logicalWidth - 28, waterTop - 12], [logicalWidth - 10, waterTop], [logicalWidth - 10, waterTop + 9], [logicalWidth - 62, waterTop + 9]], palette.tree0);
        strokePath([[16, waterTop - 2], [24, waterTop - 14], [36, waterTop - 7]], palette.tree3, 2, 0.65);
        strokePath([[logicalWidth - 56, waterTop - 1], [logicalWidth - 44, waterTop - 16], [logicalWidth - 31, waterTop - 8]], palette.tree3, 2, 0.65);
    }

    function drawWater(now, flash) {
        const waterTop = logicalHeight * 0.835;
        const height = logicalHeight - waterTop;

        fillRect(0, waterTop, logicalWidth, height, palette.water0);
        fillRect(0, waterTop, logicalWidth, 2, palette.water3);

        // Moon reflection on the left.
        const moonCenter = logicalWidth * 0.185;
        for (let row = 0; row < 13; row += 1) {
            const y = waterTop + 3 + row * 3;
            const spread = 9 + row * 2.4;
            const shift = Math.sin(now / 360 + row) * 3;
            const tone = row % 3 === 0 ? palette.water6 : row % 2 ? palette.water5 : palette.cloud5;
            fillRect(moonCenter - spread / 2 + shift, y, spread, 1, tone);
        }

        // Mansion window reflections.
        const mansionCenter = logicalWidth * 0.605;
        for (let row = 0; row < 12; row += 1) {
            const y = waterTop + 3 + row * 3;
            const spread = 13 + row * 1.7;
            const shift = Math.sin(now / 420 + row * 0.8) * 2;
            const tone = row % 4 === 0 ? palette.orange3 : row % 2 ? palette.orange1 : palette.water5;
            art.save();
            art.globalAlpha = row < 5 ? 0.92 : 0.64;
            fillRect(mansionCenter - spread / 2 + shift, y, spread, 1, tone);
            art.restore();
        }

        // Fine ripple field.
        waterMarks.forEach(mark => {
            const yy = waterTop + 2 + mark.y * Math.max(1, height - 3);
            const shimmer = reducedMotion.matches
                ? 0
                : Math.sin(now / 520 * mark.speed + mark.phase) * 2;
            const xx = mark.x + shimmer;
            const tones = [palette.water1, palette.water2, palette.water3, palette.water4, palette.water5];
            const color = tones[mark.tone] || palette.water2;
            fillRect(xx, yy, mark.width, 1, color);
        });

        // Lightning reflection.
        if (flash > 0.05) {
            const boltX = lightningMain.length
                ? lightningMain[lightningMain.length - 1][0]
                : logicalWidth * 0.40;
            const strength = flash;

            art.save();
            art.globalAlpha = 0.35 + strength * 0.55;
            for (let row = 0; row < 11; row += 1) {
                const y = waterTop + 2 + row * 3;
                const width = 5 + row * 1.8;
                const shift = Math.sin(row * 2.3 + now / 95) * 3;
                fillRect(boltX - width / 2 + shift, y, width, 1, strength > 0.52 ? palette.lightning : palette.lightningGlow);
            }
            art.restore();
        }
    }

    function drawGnarledTree(side, flash) {
        const left = side === "left";
        const dir = left ? 1 : -1;
        const baseX = left ? 18 : logicalWidth - 18;
        const baseY = logicalHeight + 6;
        const trunkTopY = logicalHeight * 0.18;

        // Thick trunk silhouette.
        polygon([
            [baseX - 17 * dir, baseY],
            [baseX - 12 * dir, logicalHeight * 0.77],
            [baseX - 9 * dir, logicalHeight * 0.59],
            [baseX - 3 * dir, logicalHeight * 0.43],
            [baseX + 2 * dir, logicalHeight * 0.31],
            [baseX + 7 * dir, trunkTopY],
            [baseX + 17 * dir, trunkTopY - 8],
            [baseX + 13 * dir, logicalHeight * 0.36],
            [baseX + 18 * dir, logicalHeight * 0.57],
            [baseX + 23 * dir, logicalHeight * 0.77],
            [baseX + 28 * dir, baseY]
        ], palette.tree0);

        // Main limbs crossing the top corners.
        drawBranch([
            [baseX + 5 * dir, logicalHeight * 0.39],
            [baseX + 15 * dir, logicalHeight * 0.25],
            [baseX + 31 * dir, logicalHeight * 0.14],
            [baseX + 58 * dir, logicalHeight * 0.09],
            [baseX + 86 * dir, logicalHeight * 0.11]
        ], 8, flash, dir);

        drawBranch([
            [baseX + 7 * dir, logicalHeight * 0.48],
            [baseX + 28 * dir, logicalHeight * 0.37],
            [baseX + 52 * dir, logicalHeight * 0.33],
            [baseX + 74 * dir, logicalHeight * 0.25]
        ], 6, flash, dir);

        drawBranch([
            [baseX + 4 * dir, logicalHeight * 0.61],
            [baseX + 26 * dir, logicalHeight * 0.66],
            [baseX + 45 * dir, logicalHeight * 0.76]
        ], 7, flash, dir);

        drawBranch([
            [baseX + 12 * dir, logicalHeight * 0.27],
            [baseX + 7 * dir, logicalHeight * 0.15],
            [baseX + 11 * dir, logicalHeight * 0.06]
        ], 5, flash, dir);

        // Smaller crooked twigs.
        const twigSets = left
            ? [
                [[46, 56], [65, 42], [79, 41]],
                [[70, 39], [83, 28], [99, 27]],
                [[79, 93], [97, 83], [109, 84]],
                [[42, 111], [57, 103], [67, 95]]
            ]
            : [
                [[logicalWidth - 47, 62], [logicalWidth - 67, 46], [logicalWidth - 86, 47]],
                [[logicalWidth - 70, 47], [logicalWidth - 89, 34], [logicalWidth - 107, 35]],
                [[logicalWidth - 77, 96], [logicalWidth - 99, 83], [logicalWidth - 116, 86]],
                [[logicalWidth - 43, 118], [logicalWidth - 61, 105], [logicalWidth - 75, 101]]
            ];

        twigSets.forEach(points => {
            strokePath(points, palette.tree0, 3);
            if (flash > 0.22) {
                strokePath(points, palette.tree3, 1, flash * 0.48);
            }
        });

        // Bark highlights.
        strokePath([
            [baseX - 2 * dir, logicalHeight * 0.72],
            [baseX + 3 * dir, logicalHeight * 0.51],
            [baseX + 10 * dir, logicalHeight * 0.30],
            [baseX + 13 * dir, trunkTopY]
        ], flash > 0.42 ? palette.stoneLit : palette.tree3, 2, 0.72);

        strokePath([
            [baseX + 9 * dir, logicalHeight * 0.83],
            [baseX + 4 * dir, logicalHeight * 0.69],
            [baseX + 8 * dir, logicalHeight * 0.54]
        ], palette.tree2, 2, 0.8);

        // Hanging moss / dead vines.
        const mossX = left ? baseX + 38 : baseX - 44;
        for (let index = 0; index < 9; index += 1) {
            const x = mossX + dir * index * 7;
            const y = logicalHeight * (0.115 + (index % 3) * 0.035);
            const length = 11 + (index % 4) * 6;
            strokePath([
                [x, y],
                [x + dir * 2, y + length * 0.45],
                [x, y + length]
            ], index % 2 ? palette.moss0 : palette.moss1, 1, 0.85);
        }

        // Roots.
        drawBranch([
            [baseX + 2 * dir, logicalHeight * 0.89],
            [baseX + 28 * dir, logicalHeight * 0.91],
            [baseX + 52 * dir, logicalHeight * 0.96]
        ], 7, flash, dir);
    }

    function drawBranch(points, width, flash, dir) {
        strokePath(points, palette.tree0, width);
        strokePath(points, palette.tree1, Math.max(2, width - 3), 0.78);

        const highlight = flash > 0.35 ? palette.stoneLit : palette.tree3;
        const shifted = points.map(([x, y]) => [x - dir, y - 1]);
        strokePath(shifted, highlight, 1, flash > 0.35 ? 0.45 + flash * 0.35 : 0.45);
    }

    function drawMist(now, flash) {
        const y = logicalHeight * 0.69;
        const drift = reducedMotion.matches ? 0 : Math.floor((now / 110) % 22);

        art.save();
        art.globalAlpha = 0.14 + flash * 0.08;
        for (let row = 0; row < 4; row += 1) {
            const offset = row % 2 ? -drift : drift;
            fillRect(-28 + offset, y + row * 7, logicalWidth + 56, 2, row % 2 ? palette.mist0 : palette.mist1);
            ditherRect(-20 + offset, y - 2 + row * 7, logicalWidth + 40, 7, palette.cloud5, 0.18, row);
        }
        art.restore();
    }

    function buildLightningPath() {
        const startX = randomBetween(logicalWidth * 0.34, logicalWidth * 0.53);
        const targetX = randomBetween(logicalWidth * 0.30, logicalWidth * 0.47);
        const stopY = randomBetween(logicalHeight * 0.48, logicalHeight * 0.61);

        const points = [[startX, -3]];
        let x = startX;
        let y = -3;

        while (y < stopY) {
            const nextY = Math.min(stopY, y + randomBetween(8, 16));
            const progress = nextY / stopY;
            const pull = (targetX - x) * (0.12 + progress * 0.08);
            x += randomBetween(-11, 11) + pull;
            x = clamp(x, logicalWidth * 0.18, logicalWidth * 0.62);
            y = nextY;
            points.push([x, y]);
        }

        return points;
    }

    function beginLightning(now) {
        strikeStartedAt = now;
        strikeDuration = randomBetween(560, 790);
        lightningMain = buildLightningPath();
        lightningBranches = [];
        lightningSideGlow = Math.random() > 0.5 ? 1 : -1;

        const branchCount = Math.random() > 0.56 ? 3 : 2;

        for (let branch = 0; branch < branchCount; branch += 1) {
            const startIndex = clamp(
                Math.floor(lightningMain.length * randomBetween(0.28, 0.72)),
                1,
                lightningMain.length - 2
            );
            const [startX, startY] = lightningMain[startIndex];
            const branchPoints = [[startX, startY]];
            let x = startX;
            let y = startY;
            const direction = branch % 2 === 0 ? -1 : 1;
            const length = randomBetween(28, 55);
            const endY = Math.min(logicalHeight * 0.66, startY + length);

            while (y < endY) {
                y += randomBetween(6, 11);
                x += direction * randomBetween(3, 9) + randomBetween(-4, 4);
                branchPoints.push([x, y]);
            }

            lightningBranches.push(branchPoints);
        }

        nextStrikeAt = now + randomBetween(3500, 7000);
    }

    function getFlashStrength(now) {
        const elapsed = now - strikeStartedAt;
        if (elapsed < 0 || elapsed > strikeDuration) return 0;

        const pulseA = Math.max(0, 1 - Math.abs(elapsed - 42) / 48);
        const pulseB = Math.max(0, 1 - Math.abs(elapsed - 160) / 70) * 0.80;
        const pulseC = Math.max(0, 1 - Math.abs(elapsed - 325) / 100) * 0.45;
        const pulseD = Math.max(0, 1 - Math.abs(elapsed - 505) / 130) * 0.18;

        return clamp(Math.max(pulseA, pulseB, pulseC, pulseD), 0, 1);
    }

    function drawLightning(flash) {
        if (flash <= 0.03 || lightningMain.length < 2) return;

        art.save();
        art.globalAlpha = clamp(0.35 + flash * 0.72, 0, 1);
        strokePath(lightningMain, palette.lightningGlow, 7, 0.24 + flash * 0.26);
        strokePath(lightningMain, palette.lightningBlue, 3, 0.70 + flash * 0.25);
        strokePath(lightningMain, palette.lightning, 1, 1);

        lightningBranches.forEach((branch, index) => {
            const strength = index === 0 ? 0.72 : 0.52;
            strokePath(branch, palette.lightningGlow, 4, flash * 0.20 * strength);
            strokePath(branch, palette.lightningBlue, 2, flash * strength);
            strokePath(branch, palette.lightning, 1, flash * strength);
        });
        art.restore();
    }

    function drawRain(now, flash) {
        if (reducedMotion.matches) return;

        art.save();
        art.globalAlpha = 0.10 + flash * 0.12;

        rainSpecks.forEach(drop => {
            const travel = ((now * 0.035 + drop.phase) % (logicalHeight + 30)) - 15;
            const x = (drop.x + travel * 0.18) % (logicalWidth + 8) - 4;
            strokePath([
                [x, travel],
                [x - 1, travel + drop.length]
            ], flash > 0.45 ? palette.lightningBlue : palette.cloud5, 1, 1);
        });

        art.restore();
    }

    function drawForegroundVignette() {
        // Pixel-darkened corners rather than a smooth photographic vignette.
        const layers = 9;

        for (let layer = 0; layer < layers; layer += 1) {
            const alpha = 0.025 + layer * 0.008;
            art.save();
            art.globalAlpha = alpha;
            rectOutline(layer, layer, logicalWidth - layer * 2, logicalHeight - layer * 2, palette.black, 1);
            art.restore();
        }
    }

    function compositeToCanvas() {
        context.fillStyle = palette.black;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.imageSmoothingEnabled = false;
        context.drawImage(artCanvas, 0, 0, canvas.width, canvas.height);
    }

    function drawScene(now) {
        setCanvasSize();

        if (
            nextStrikeAt === 0 ||
            (!reducedMotion.matches && now >= nextStrikeAt)
        ) {
            beginLightning(now);
        }

        const flash = reducedMotion.matches ? 0 : getFlashStrength(now);

        drawSky(flash);
        drawMoon(flash);
        drawClouds(now, flash);
        drawLightning(flash);
        drawRain(now, flash);
        drawHillsAndForest(flash);
        drawDistantTrees();
        drawMist(now, flash);
        drawMansion(flash, now);
        drawGroundAndFoliage(flash);
        drawWater(now, flash);
        drawGnarledTree("left", flash);
        drawGnarledTree("right", flash);
        drawPerspectiveBats(now);
        drawForegroundVignette();

        compositeToCanvas();

        const flashOverlay = mansionWindow.querySelector(
            ".haunted-mansion-flash"
        );

        if (flashOverlay) {
            flashOverlay.style.opacity = String(
                clamp(flash * 0.30, 0, 0.30)
            );
        }
    }

    function animate(now) {
        if (!mansionWindow.classList.contains("hidden")) {
            drawScene(now);
        }

        window.requestAnimationFrame(animate);
    }

    const resizeObserver = new ResizeObserver(() => {
        lastSizeKey = "";

        if (!mansionWindow.classList.contains("hidden")) {
            drawScene(performance.now());
        }
    });

    if (canvas.parentElement) {
        resizeObserver.observe(canvas.parentElement);
    }

    setCanvasSize();
    nextStrikeAt = performance.now() + 950;
    drawScene(performance.now());
    window.requestAnimationFrame(animate);
})();




// ====================================
// HERMIT TOWER — EXACT ART + ANIMATED LAYERS
// ====================================
// The exact supplied artwork is used as the high-resolution base scene.
// JavaScript Canvas adds the motion: moonlight, sky shimmer, twinkles,
// drifting cloud highlights, moving hermit, and magic particles.
// ====================================

(() => {
    const canvas = document.getElementById("hermit-tower-canvas");
    const towerWindow = document.getElementById("hermit-tower-window");

    if (!canvas || !towerWindow) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    );

    const SCENE_WIDTH = 1174;
    const SCENE_HEIGHT = 930;

    const sceneImage = new Image();
    sceneImage.decoding = "async";
    sceneImage.src = "assets/images/hermit-tower-scene.png";

    const mageImage = new Image();
    mageImage.decoding = "async";
    mageImage.src = "assets/images/hermit-tower-mage.png";

    const frameCanvas = document.createElement("canvas");
    frameCanvas.width = SCENE_WIDTH;
    frameCanvas.height = SCENE_HEIGHT;

    const frame = frameCanvas.getContext("2d", { alpha: false });
    if (!frame) return;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    frame.imageSmoothingEnabled = true;
    frame.imageSmoothingQuality = "high";

    let sceneReady = false;
    let mageReady = false;
    let cloudLayers = [];
    let windCanopyLayers = [];

    const moonGlints = [
        [574, 498, 0.2],
        [604, 561, 1.4],
        [545, 678, 2.1],
        [511, 728, 3.4],
        [428, 762, 4.0],
        [825, 586, 5.3],
        [916, 574, 6.2],
        [1007, 698, 7.1],
        [347, 601, 8.2],
        [281, 688, 9.0]
    ];

    const windLeaves = Array.from({ length: 34 }, (_, index) => ({
        x: (index * 83 + 31) % SCENE_WIDTH,
        y: 455 + ((index * 61) % 400),
        speed: 0.018 + (index % 7) * 0.0035,
        phase: index * 1.37,
        size: index % 9 === 0 ? 3 : index % 3 === 0 ? 2 : 1,
        tone: index % 5
    }));

    const starPoints = [
        [47, 51], [126, 50], [175, 101], [235, 38], [302, 77],
        [355, 96], [413, 52], [479, 66], [550, 111], [831, 72],
        [975, 96], [1076, 46], [1112, 170], [1021, 338], [892, 283],
        [223, 285], [145, 219], [344, 254], [483, 207], [1040, 254]
    ];

    const magicParticles = Array.from({ length: 36 }, (_, index) => ({
        angle: index * 0.91,
        radius: 10 + (index % 9) * 7,
        speed: 0.0009 + (index % 7) * 0.00013,
        size: index % 6 === 0 ? 3 : index % 3 === 0 ? 2 : 1,
        phase: index * 1.73
    }));

    function buildCloudLayer(sx, sy, sw, sh, feather = 0.84) {
        const layerCanvas = document.createElement("canvas");
        layerCanvas.width = sw;
        layerCanvas.height = sh;

        const layer = layerCanvas.getContext("2d");
        if (!layer) return null;

        layer.imageSmoothingEnabled = true;
        layer.imageSmoothingQuality = "high";

        layer.drawImage(
            sceneImage,
            sx, sy, sw, sh,
            0, 0, sw, sh
        );

        layer.globalCompositeOperation = "destination-in";

        const gradient = layer.createRadialGradient(
            sw * 0.5,
            sh * 0.5,
            Math.min(sw, sh) * 0.12,
            sw * 0.5,
            sh * 0.5,
            Math.max(sw, sh) * 0.58
        );

        gradient.addColorStop(0, "rgba(255,255,255,1)");
        gradient.addColorStop(feather, "rgba(255,255,255,0.78)");
        gradient.addColorStop(1, "rgba(255,255,255,0)");

        layer.fillStyle = gradient;
        layer.fillRect(0, 0, sw, sh);
        layer.globalCompositeOperation = "source-over";

        return {
            canvas: layerCanvas,
            x: sx,
            y: sy,
            width: sw,
            height: sh
        };
    }

    function prepareCloudLayers() {
        cloudLayers = [
            buildCloudLayer(14, 112, 438, 287),
            buildCloudLayer(800, 55, 354, 333),
            buildCloudLayer(282, 266, 336, 265),
            buildCloudLayer(760, 344, 348, 224)
        ].filter(Boolean);
    }


    function buildWindCanopyLayer(sx, sy, sw, sh, feather = 0.72) {
        const layerCanvas = document.createElement("canvas");
        layerCanvas.width = sw;
        layerCanvas.height = sh;

        const layer = layerCanvas.getContext("2d");
        if (!layer) return null;

        layer.imageSmoothingEnabled = true;
        layer.imageSmoothingQuality = "high";

        layer.drawImage(
            sceneImage,
            sx, sy, sw, sh,
            0, 0, sw, sh
        );

        layer.globalCompositeOperation = "destination-in";

        const gradient = layer.createRadialGradient(
            sw * 0.5,
            sh * 0.48,
            Math.min(sw, sh) * 0.18,
            sw * 0.5,
            sh * 0.48,
            Math.max(sw, sh) * 0.60
        );

        gradient.addColorStop(0, "rgba(255,255,255,1)");
        gradient.addColorStop(feather, "rgba(255,255,255,0.82)");
        gradient.addColorStop(1, "rgba(255,255,255,0)");

        layer.fillStyle = gradient;
        layer.fillRect(0, 0, sw, sh);
        layer.globalCompositeOperation = "source-over";

        return {
            canvas: layerCanvas,
            x: sx,
            y: sy,
            width: sw,
            height: sh
        };
    }

    function prepareWindCanopyLayers() {
        windCanopyLayers = [
            buildWindCanopyLayer(0, 430, 355, 365),
            buildWindCanopyLayer(826, 390, 348, 408),
            buildWindCanopyLayer(300, 500, 318, 260),
            buildWindCanopyLayer(680, 680, 470, 235)
        ].filter(Boolean);
    }

    function drawBaseScene() {
        frame.globalCompositeOperation = "source-over";
        frame.globalAlpha = 1;
        frame.drawImage(
            sceneImage,
            0,
            0,
            SCENE_WIDTH,
            SCENE_HEIGHT
        );
    }

    function getWindStrength(now) {
        if (reducedMotion.matches) return 0.28;

        const slow = 0.5 + 0.5 * Math.sin(now / 4200);
        const gust = 0.5 + 0.5 * Math.sin(now / 1180 + 0.8);

        return 0.28 + slow * 0.38 + gust * 0.24;
    }

    function drawSkyShimmer(now) {
        if (reducedMotion.matches) return;

        const wind = getWindStrength(now);

        frame.save();

        /*
         * The cloud patches are copied from the exact artwork itself.
         * Small horizontal movement makes the sky visibly breathe/blow
         * without replacing the original illustration.
         */
        cloudLayers.forEach((layer, index) => {
            const direction = index % 2 === 0 ? 1 : 0.72;
            const xShift =
                Math.sin(now / (5100 + index * 620) + index * 0.7) *
                (5 + index * 1.7) *
                wind *
                direction;

            const yShift =
                Math.cos(now / (7600 + index * 510) + index * 0.42) *
                (0.8 + index * 0.22);

            frame.globalCompositeOperation = "source-over";
            frame.globalAlpha = 0.055 + wind * 0.035;

            frame.drawImage(
                layer.canvas,
                layer.x + xShift,
                layer.y + yShift,
                layer.width,
                layer.height
            );

            frame.globalCompositeOperation = "screen";
            frame.globalAlpha = 0.035 + wind * 0.045;

            frame.drawImage(
                layer.canvas,
                layer.x + xShift * 1.18,
                layer.y + yShift - 1,
                layer.width,
                layer.height
            );
        });

        /*
         * Fine wind streaks across the upper sky. They are intentionally
         * low-opacity so they read as moving air rather than rain.
         */
        frame.globalCompositeOperation = "screen";
        frame.strokeStyle = "#b9d7ff";
        frame.lineWidth = 1;

        for (let index = 0; index < 15; index += 1) {
            const travel =
                ((now * (0.018 + index * 0.0007) + index * 97) %
                    (SCENE_WIDTH + 260)) -
                130;

            const y =
                105 +
                ((index * 47) % 360) +
                Math.sin(now / 1500 + index) * 4;

            const length = 12 + (index % 5) * 7;

            frame.globalAlpha =
                0.018 +
                wind * 0.028 +
                (index % 4 === 0 ? 0.014 : 0);

            frame.beginPath();
            frame.moveTo(travel, y);
            frame.lineTo(travel + length, y - 2);
            frame.stroke();
        }

        const skyPulse = 0.5 + 0.5 * Math.sin(now / 5200);
        const skyGradient = frame.createLinearGradient(
            0,
            0,
            0,
            SCENE_HEIGHT * 0.58
        );

        skyGradient.addColorStop(
            0,
            `rgba(105,150,255,${0.014 + skyPulse * 0.014})`
        );
        skyGradient.addColorStop(
            0.65,
            `rgba(73,108,211,${0.008 + skyPulse * 0.008})`
        );
        skyGradient.addColorStop(1, "rgba(0,0,0,0)");

        frame.fillStyle = skyGradient;
        frame.fillRect(
            0,
            0,
            SCENE_WIDTH,
            SCENE_HEIGHT * 0.62
        );

        frame.restore();
    }

    function drawMoonlight(now) {
        const pulse = reducedMotion.matches
            ? 0.62
            : 0.62 +
              Math.sin(now / 2350) * 0.10 +
              Math.sin(now / 7600) * 0.045;

        const sway = reducedMotion.matches
            ? 0
            : Math.sin(now / 7600) * 14;

        const moonX = 244;
        const moonY = 80;

        frame.save();
        frame.globalCompositeOperation = "screen";

        /*
         * Breathing halo around the crescent. The radius expands a little
         * while brightness rises and falls, which makes the moon feel alive.
         */
        const haloRadius =
            150 +
            pulse * 28 +
            (reducedMotion.matches ? 0 : Math.sin(now / 1800) * 7);

        const halo = frame.createRadialGradient(
            moonX,
            moonY,
            8,
            moonX,
            moonY,
            haloRadius
        );

        halo.addColorStop(
            0,
            `rgba(255,248,204,${0.28 * pulse})`
        );
        halo.addColorStop(
            0.16,
            `rgba(236,242,255,${0.17 * pulse})`
        );
        halo.addColorStop(
            0.48,
            `rgba(146,181,239,${0.082 * pulse})`
        );
        halo.addColorStop(
            0.78,
            `rgba(91,128,211,${0.035 * pulse})`
        );
        halo.addColorStop(
            1,
            "rgba(57,76,145,0)"
        );

        frame.fillStyle = halo;
        frame.fillRect(
            moonX - haloRadius,
            moonY - haloRadius,
            haloRadius * 2,
            haloRadius * 2
        );

        /*
         * A large moving moonbeam sweeps subtly across the tower and cliff.
         * It stays soft so the original painting remains intact.
         */
        const beam = frame.createLinearGradient(
            120 + sway,
            70,
            770 + sway,
            770
        );

        beam.addColorStop(
            0,
            `rgba(238,246,255,${0.062 * pulse})`
        );
        beam.addColorStop(
            0.40,
            `rgba(196,220,255,${0.038 * pulse})`
        );
        beam.addColorStop(
            0.76,
            `rgba(139,179,238,${0.020 * pulse})`
        );
        beam.addColorStop(
            1,
            "rgba(90,135,220,0)"
        );

        frame.fillStyle = beam;
        frame.beginPath();
        frame.moveTo(115 + sway, 91);
        frame.lineTo(338 + sway, 65);
        frame.lineTo(845 + sway * 0.35, 815);
        frame.lineTo(500 + sway * 0.22, 846);
        frame.closePath();
        frame.fill();

        /*
         * A second, narrower ray gives the beam a visible moving center.
         */
        const ray = frame.createLinearGradient(
            210 + sway * 0.7,
            90,
            675 + sway * 0.32,
            720
        );

        ray.addColorStop(
            0,
            `rgba(255,252,229,${0.045 * pulse})`
        );
        ray.addColorStop(
            0.58,
            `rgba(205,226,255,${0.026 * pulse})`
        );
        ray.addColorStop(
            1,
            "rgba(150,190,255,0)"
        );

        frame.fillStyle = ray;
        frame.beginPath();
        frame.moveTo(205 + sway * 0.7, 89);
        frame.lineTo(270 + sway * 0.7, 82);
        frame.lineTo(690 + sway * 0.32, 740);
        frame.lineTo(566 + sway * 0.32, 755);
        frame.closePath();
        frame.fill();

        /*
         * Moonlight glints appear on stone and foliage in rhythm with the
         * halo, making the light feel as though it is touching the scene.
         */
        moonGlints.forEach((glint, index) => {
            const sparkle =
                0.5 +
                0.5 *
                    Math.sin(
                        now / 620 +
                        glint[2] +
                        index * 0.47
                    );

            if (sparkle < 0.55) return;

            frame.globalAlpha =
                (0.08 + sparkle * 0.12) * pulse;

            frame.fillStyle =
                index % 3 === 0
                    ? "#fff8d4"
                    : "#d7e7ff";

            frame.fillRect(
                Math.round(glint[0] - 2),
                Math.round(glint[1]),
                5,
                1
            );

            frame.fillRect(
                Math.round(glint[0]),
                Math.round(glint[1] - 2),
                1,
                5
            );
        });

        frame.restore();
    }

    function drawStarTwinkles(now) {
        if (reducedMotion.matches) return;

        frame.save();
        frame.globalCompositeOperation = "screen";

        starPoints.forEach((point, index) => {
            const pulse = 0.5 + 0.5 * Math.sin(now / 430 + index * 1.81);
            if (pulse < 0.60) return;

            const [x, y] = point;
            const size = pulse > 0.88 ? 3 : 2;
            const alpha = 0.35 + pulse * 0.55;

            frame.globalAlpha = alpha;
            frame.fillStyle = index % 4 === 0 ? "#fff0a6" : "#eef7ff";
            frame.fillRect(Math.round(x - size), Math.round(y), size * 2 + 1, 1);
            frame.fillRect(Math.round(x), Math.round(y - size), 1, size * 2 + 1);

            if (pulse > 0.92) {
                frame.globalAlpha = 0.20;
                frame.fillRect(x - 4, y - 4, 9, 9);
            }
        });

        frame.restore();
    }

    function drawWind(now) {
        const wind = getWindStrength(now);

        frame.save();

        /*
         * Exact foliage patches from the supplied art are gently shifted
         * and rotated. Low opacity keeps the base painting crisp while the
         * leaf edges visibly sway during gusts.
         */
        windCanopyLayers.forEach((layer, index) => {
            const direction = index % 2 === 0 ? 1 : -1;

            const sway =
                Math.sin(
                    now / (1250 + index * 230) +
                    index * 1.4
                ) *
                (1.6 + index * 0.45) *
                wind;

            const lift =
                Math.cos(
                    now / (1850 + index * 190) +
                    index
                ) *
                0.8 *
                wind;

            const angle =
                direction *
                Math.sin(
                    now / (1700 + index * 260) +
                    index * 0.8
                ) *
                0.0045 *
                wind;

            const centerX =
                layer.x + layer.width * 0.5;

            const centerY =
                layer.y + layer.height * 0.72;

            frame.save();
            frame.globalCompositeOperation = "source-over";
            frame.globalAlpha = 0.075 + wind * 0.045;

            frame.translate(
                centerX + sway,
                centerY + lift
            );

            frame.rotate(angle);

            frame.drawImage(
                layer.canvas,
                -layer.width * 0.5,
                -layer.height * 0.72,
                layer.width,
                layer.height
            );

            frame.restore();

            /*
             * A light-catching pass makes the moving leaf edges shimmer.
             */
            frame.save();
            frame.globalCompositeOperation = "screen";
            frame.globalAlpha = 0.018 + wind * 0.024;

            frame.drawImage(
                layer.canvas,
                layer.x + sway * 1.35,
                layer.y + lift - 1,
                layer.width,
                layer.height
            );

            frame.restore();
        });

        /*
         * Loose leaves cross the screen during the wind. They remain tiny
         * pixel-art marks so they belong to the original visual language.
         */
        const leafColors = [
            "#72a84e",
            "#a8cf68",
            "#567a3c",
            "#d0c36a",
            "#71985b"
        ];

        windLeaves.forEach((leaf, index) => {
            const travel =
                ((leaf.x +
                    now * leaf.speed * (26 + wind * 36)) %
                    (SCENE_WIDTH + 80)) -
                40;

            const verticalWave =
                Math.sin(
                    now / (460 + index * 19) +
                    leaf.phase
                ) *
                (4 + (index % 4));

            const y =
                leaf.y +
                verticalWave +
                Math.sin(now / 1900 + leaf.phase) *
                    12 *
                    wind;

            frame.globalCompositeOperation = "source-over";
            frame.globalAlpha =
                0.22 +
                wind * 0.46;

            frame.fillStyle =
                leafColors[leaf.tone];

            frame.fillRect(
                Math.round(travel),
                Math.round(y),
                leaf.size + 1,
                leaf.size
            );

            if (
                leaf.size > 1 &&
                index % 3 === 0
            ) {
                frame.fillRect(
                    Math.round(travel + 2),
                    Math.round(y - 1),
                    1,
                    1
                );
            }
        });

        frame.restore();
    }

    function drawAnimatedMage(now) {
        if (!mageReady) return;

        // Exact sprite was cropped from the supplied artwork.
        const baseX = 636;
        const baseY = 611;

        const wind = getWindStrength(now);

        const bob = reducedMotion.matches
            ? 0
            : Math.round(
                Math.sin(now / 520) * 1.5 +
                Math.sin(now / 1480) * wind
            );

        const lean = reducedMotion.matches
            ? 0
            : Math.round(
                Math.sin(now / 780) * 1.2 +
                Math.sin(now / 2100) * wind * 1.4
            );

        frame.save();
        frame.globalCompositeOperation = "source-over";
        frame.globalAlpha = 1;
        frame.imageSmoothingEnabled = false;

        // Draw the exact hermit sprite over its original position.
        // The 1–2 pixel motion is enough to feel alive while preserving the art.
        frame.drawImage(
            mageImage,
            baseX + lean,
            baseY + bob
        );

        frame.restore();
    }

    function drawMagic(now) {
        const handX = 704;
        const handY = 651;
        const burstX = 747;
        const burstY = 634;

        frame.save();
        frame.globalCompositeOperation = "screen";

        const pulse = reducedMotion.matches
            ? 0.7
            : 0.66 + Math.sin(now / 260) * 0.22;

        // Animated spell beam layered over the original painted beam.
        frame.globalAlpha = 0.26 + pulse * 0.25;
        frame.strokeStyle = "#ffe16e";
        frame.lineWidth = 1;
        frame.beginPath();
        frame.moveTo(handX, handY);
        frame.quadraticCurveTo(722, 646, burstX, burstY);
        frame.stroke();

        const glow = frame.createRadialGradient(
            burstX,
            burstY,
            1,
            burstX,
            burstY,
            50 + pulse * 10
        );

        glow.addColorStop(0, `rgba(255,248,177,${0.38 + pulse * 0.28})`);
        glow.addColorStop(0.16, `rgba(255,194,48,${0.22 + pulse * 0.16})`);
        glow.addColorStop(0.55, "rgba(255,155,25,0.07)");
        glow.addColorStop(1, "rgba(255,155,25,0)");

        frame.fillStyle = glow;
        frame.fillRect(burstX - 65, burstY - 65, 130, 130);

        magicParticles.forEach((particle, index) => {
            const time = now * particle.speed + particle.phase;
            const radius = particle.radius + Math.sin(time * 2.3) * 4;
            const x = burstX + Math.cos(particle.angle + time) * radius;
            const y = burstY + Math.sin(particle.angle * 0.73 + time * 1.27) * radius * 0.60;

            const sparkle = 0.5 + 0.5 * Math.sin(now / 150 + index * 1.3);
            if (sparkle < 0.26) return;

            frame.globalAlpha = 0.22 + sparkle * 0.78;
            frame.fillStyle = index % 5 === 0
                ? "#fffbd0"
                : index % 3 === 0
                    ? "#ffef87"
                    : "#ffc839";

            const size = particle.size;
            frame.fillRect(Math.round(x), Math.round(y), size, size);

            if (sparkle > 0.78 && index % 4 === 0) {
                frame.fillRect(Math.round(x - 3), Math.round(y), 7, 1);
                frame.fillRect(Math.round(x), Math.round(y - 3), 1, 7);
            }
        });

        frame.restore();
    }

    function resizeCanvasToScreen() {
        const screen = canvas.parentElement;
        if (!screen) return;

        const box = screen.getBoundingClientRect();
        const width = Math.max(300, Math.round(box.width));
        const height = Math.max(220, Math.round(box.height));

        const ratio = Math.min(
            2,
            Math.max(1, window.devicePixelRatio || 1)
        );

        const targetWidth = Math.round(width * ratio);
        const targetHeight = Math.round(height * ratio);

        if (
            canvas.width !== targetWidth ||
            canvas.height !== targetHeight
        ) {
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = "high";
        }
    }

    function compositeFrame() {
        resizeCanvasToScreen();

        context.fillStyle = "#020611";
        context.fillRect(0, 0, canvas.width, canvas.height);

        const scale = Math.min(
            canvas.width / SCENE_WIDTH,
            canvas.height / SCENE_HEIGHT
        );

        const width = SCENE_WIDTH * scale;
        const height = SCENE_HEIGHT * scale;
        const left = (canvas.width - width) / 2;
        const top = (canvas.height - height) / 2;

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";

        context.drawImage(
            frameCanvas,
            0,
            0,
            SCENE_WIDTH,
            SCENE_HEIGHT,
            Math.round(left),
            Math.round(top),
            Math.round(width),
            Math.round(height)
        );
    }

    function render(now) {
        if (!sceneReady) return;

        drawBaseScene();
        drawSkyShimmer(now);
        drawMoonlight(now);
        drawStarTwinkles(now);
        drawWind(now);
        drawAnimatedMage(now);
        drawMagic(now);
        compositeFrame();
    }

    function animate(now) {
        if (!towerWindow.classList.contains("hidden")) {
            render(now);
        }

        window.requestAnimationFrame(animate);
    }

    sceneImage.addEventListener("load", () => {
        sceneReady = true;
        prepareCloudLayers();
        prepareWindCanopyLayers();
        render(performance.now());
    });

    mageImage.addEventListener("load", () => {
        mageReady = true;
        if (sceneReady) render(performance.now());
    });

    const resizeObserver = new ResizeObserver(() => {
        if (sceneReady && !towerWindow.classList.contains("hidden")) {
            render(performance.now());
        }
    });

    if (canvas.parentElement) {
        resizeObserver.observe(canvas.parentElement);
    }

    window.requestAnimationFrame(animate);
})();

/* =========================================================
   PHOTOGRAPHY — GROUP ALBUMS INTO PAGES OF 6
========================================================= */

/* =========================================================
   PHOTOGRAPHY
   SORT NEWEST → OLDEST
   THEN GROUP INTO PAGES OF 6

   1 2 3   |   7 8 9
   4 5 6   |  10 11 12
========================================================= */

function buildPhotographyAlbumPages() {

    const gallery = document.querySelector(
        "#photography-window .photo-gallery"
    );

    if (!gallery) return;


    /* -----------------------------------------
       GET ALL ALBUMS

       This works even if the function is
       called again after pages were built.
    ----------------------------------------- */

    let albums = [
        ...gallery.querySelectorAll(
            ":scope > .photo-folder"
        )
    ];


    /* If albums are already inside pages,
       pull them back out first */
    const existingPages = [
        ...gallery.querySelectorAll(
            ":scope > .photo-album-page"
        )
    ];

    if (existingPages.length) {

        albums = existingPages.flatMap(page => [
            ...page.querySelectorAll(
                ":scope > .photo-folder"
            )
        ]);

        existingPages.forEach(page => {
            page.remove();
        });
    }


    /* -----------------------------------------
       SORT BY YEAR
       NEWEST FIRST
    ----------------------------------------- */

    albums.sort((albumA, albumB) => {

        const yearA =
            Number(albumA.dataset.year) || 0;

        const yearB =
            Number(albumB.dataset.year) || 0;

        return yearB - yearA;

    });


    /* -----------------------------------------
       BUILD 6-ALBUM PAGES
    ----------------------------------------- */

    const albumsPerPage = 6;

    for (
        let i = 0;
        i < albums.length;
        i += albumsPerPage
    ) {

        const page =
            document.createElement("div");

        page.className =
            "photo-album-page";


        const group =
            albums.slice(
                i,
                i + albumsPerPage
            );


        group.forEach(album => {
            page.appendChild(album);
        });


        gallery.appendChild(page);
    }

}


/* Run after the page has loaded */
if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        buildPhotographyAlbumPages
    );

} else {

    buildPhotographyAlbumPages();

}
