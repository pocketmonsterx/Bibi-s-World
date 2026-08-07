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

    document.addEventListener("keydown", handleBiosKey);
    bootScreen.addEventListener("click", finishBiosBoot);

    startBiosTextAnimation();
    bootScreen.focus({ preventScroll: true });
});


const desktopIcons = document.querySelectorAll(".icon");
const windows = document.querySelectorAll(".window");

let highestZ = 10000;
let galleryOffset = 0;

const taskbarWindows = document.getElementById("taskbar-windows");


// ====================================
// DESKTOP ICONS
// Open, restore, and always bring the requested window to front
// ====================================

function markWindowAsActive(windowElement) {
    document
        .querySelectorAll(".task-button")
        .forEach(button => button.classList.remove("active"));

    document
        .querySelectorAll(".window.active-window")
        .forEach(openWindowElement => {
            openWindowElement.classList.remove("active-window");
        });

    windowElement.classList.add("active-window");

    if (windowElement.taskButton) {
        windowElement.taskButton.classList.add("active");
    }
}

function activateWindowFromDesktopIcon(icon) {
    const id = icon.dataset.window;

    if (!id || id === "home") {
        return;
    }

    /*
     * Compare data values directly instead of building a CSS selector.
     * This also works safely for IDs containing spaces.
     */
    const windowElement = Array
        .from(windows)
        .find(candidate => candidate.dataset.windowId === id);

    if (!windowElement) {
        return;
    }

    const menu = document.getElementById("start-menu");

    if (menu) {
        menu.classList.add("hidden");
    }

    openWindow(windowElement);
    bringToFront(windowElement);
    markWindowAsActive(windowElement);

    /*
     * Re-apply after layout and after the current click finishes. This
     * prevents another window handler from reclaiming the top layer.
     */
    requestAnimationFrame(() => {
        bringToFront(windowElement);
        markWindowAsActive(windowElement);

        window.setTimeout(() => {
            if (!windowElement.classList.contains("hidden")) {
                bringToFront(windowElement);
                markWindowAsActive(windowElement);
            }
        }, 0);
    });
}

desktopIcons.forEach(icon => {
    icon.addEventListener("click", () => {
        activateWindowFromDesktopIcon(icon);
    });
});

// --------------------
// Center a window
// --------------------

function centerWindow(windowElement) {

    const taskbarHeight = 38;

    const availableWidth = window.innerWidth;
    const availableHeight =
        window.innerHeight - taskbarHeight;

    const windowWidth =
        windowElement.offsetWidth;

    const windowHeight =
        windowElement.offsetHeight;

    const left = Math.max(
        10,
        (availableWidth - windowWidth) / 2
    );

    const top = Math.max(
        10,
        (availableHeight - windowHeight) / 2
    );

    windowElement.style.left = `${left}px`;
    windowElement.style.top = `${top}px`;
}


// --------------------
// Check whether a window is a gallery
// --------------------

function isGalleryWindow(windowElement) {

    return windowElement.querySelector(
        ".project-gallery"
    ) !== null;

}


// --------------------
// Position gallery windows
// --------------------

function positionGalleryWindow(windowElement) {

    const startLeft = 180;
    const startTop = 80;

    windowElement.style.left =
        `${startLeft + galleryOffset}px`;

    windowElement.style.top =
        `${startTop + galleryOffset}px`;

    galleryOffset += 35;

    if (galleryOffset > 175) {
        galleryOffset = 0;
    }

}


function openWindow(windowElement) {

    const wasHidden =
        windowElement.classList.contains("hidden");

    windowElement.classList.remove("hidden");

    if (wasHidden) {

        // The wider About Me window opens centered so it stays on-screen.
        if (windowElement.id === "about-window") {

            centerWindow(windowElement);

        }

        // Contact always opens in the same place
        else if (windowElement.id === "contact-window") {

            windowElement.style.left = "650px";
            windowElement.style.top = "120px";

        }

        // Music always opens centered
        else if (windowElement.id === "music-window") {

            centerWindow(windowElement);

        }

        // Photo preview always opens centered
        else if (windowElement.id === "image-preview-window") {

            centerWindow(windowElement);

        }

        // Large portfolio projects always open centered
else if (
    windowElement.id === "memories-window" ||
    windowElement.id === "disney-window" ||
    windowElement.id === "miku-window" ||
    windowElement.id === "san-francisco-window" ||
    windowElement.id === "in-my-room-window" ||
    windowElement.id === "magical-lake-window" ||
    windowElement.classList.contains("graphic-project-window")
) {
    centerWindow(windowElement);
}

// Other galleries cascade
else if (isGalleryWindow(windowElement)) {

    positionGalleryWindow(windowElement);

}

        // Other windows use a normal default position
        else {

            windowElement.style.left = "180px";
            windowElement.style.top = "120px";

        }
    }

    if (windowElement.id === "shutdown-dialog") {

    windowElement.style.left = "50%";
    windowElement.style.top = "50%";
    windowElement.style.transform = "translate(-50%, -50%)";

}

   bringToFront(windowElement);


requestAnimationFrame(() => {
    bringToFront(windowElement);
});

createTaskButton(windowElement);

    if (windowElement.taskButton) {
        windowElement.taskButton.classList.add("active");
    }
}

// --------------------

function closeWindow(windowElement){

    windowElement.classList.add("hidden");

    // Stop SoundCloud and Bandcamp playback
    // when the Music window is closed
    if (windowElement.id === "music-window") {

        const musicIframes =
            windowElement.querySelectorAll("iframe");

        musicIframes.forEach(iframe => {

            const currentSource = iframe.src;

            iframe.src = "";

            requestAnimationFrame(() => {
                iframe.src = currentSource;
            });

        });

    }

    if(windowElement.taskButton){

        windowElement.taskButton.remove();

        windowElement.taskButton = null;

    }

}

// --------------------

function bringToFront(windowElement) {
    if (!windowElement) {
        return;
    }

    /*
     * Only visible application windows participate in stacking. Hidden
     * dialogs can otherwise retain an old high z-index and interfere with
     * the window the visitor has just selected from the desktop.
     */
    const visibleWindows = Array.from(
        document.querySelectorAll(".window:not(.hidden)")
    );

    const currentHighestZ = visibleWindows.reduce(
        (highestValue, currentWindow) => {
            const currentZIndex = Number.parseInt(
                window.getComputedStyle(currentWindow).zIndex,
                10
            );

            return Number.isNaN(currentZIndex)
                ? highestValue
                : Math.max(highestValue, currentZIndex);
        },
        highestZ
    );

    highestZ = currentHighestZ + 1;
    windowElement.style.zIndex = String(highestZ);

    visibleWindows.forEach(currentWindow => {
        currentWindow.classList.toggle(
            "active-window",
            currentWindow === windowElement
        );
    });
}

// --------------------
// Configura cada janela
// --------------------

windows.forEach(windowElement=>{
    
        windowElement.addEventListener("mousedown", () => {
        bringToFront(windowElement);
    });

    const close =
        windowElement.querySelector(".close");
        
    const minimize =
        windowElement.querySelector(".minimize");

    const maximize =
        windowElement.querySelector(".maximize");

    let maximized=false;

    if(close){

        close.addEventListener("click",()=>{

            closeWindow(windowElement);

        });

    }

    if(minimize){

    minimize.addEventListener("click",()=>{

        windowElement.classList.add("hidden");

        if (windowElement.id === "music-window") {

            const musicIframes =
                windowElement.querySelectorAll("iframe");

            musicIframes.forEach(iframe => {

                const currentSource = iframe.src;

                iframe.src = "";

                requestAnimationFrame(() => {
                    iframe.src = currentSource;
                });

            });

        }

    });

}

    if(maximize){

        maximize.addEventListener("click",()=>{

            if(!maximized){

                windowElement.dataset.left=
                windowElement.style.left;

                windowElement.dataset.top=
                windowElement.style.top;

                windowElement.dataset.width =
                    windowElement.style.width ||
                    `${windowElement.offsetWidth}px`;

                windowElement.dataset.height =
                    windowElement.style.height ||
                    `${windowElement.offsetHeight}px`;

                windowElement.style.left="0";

                windowElement.style.top="0";

                windowElement.style.width="100vw";

                windowElement.style.height="calc(100vh - 38px)";

                windowElement.classList.add("is-maximized");
                maximized=true;

            }

            else{

                windowElement.style.left=
                windowElement.dataset.left || "180px";

                windowElement.style.top=
                windowElement.dataset.top || "120px";

                windowElement.style.width=
                windowElement.dataset.width || "620px";

                windowElement.style.height=
                windowElement.dataset.height || "auto";

                windowElement.classList.remove("is-maximized");
                maximized=false;

            }

        });

    }

});

function createTaskButton(windowElement) {

    if (windowElement.taskButton) return;

    const button = document.createElement("button");
    button.className = "task-button";

    const windowId = windowElement.dataset.windowId;

    const iconPaths = {
        about: "assets/icons/about me.ico",
        memories: "assets/icons/memories.svg",
        photography: "assets/icons/photography.ico",
        "disney 2010": "assets/icons/photography.ico",
        "miku 2010": "assets/icons/photography.ico",
        "san francisco 2012": "assets/icons/photography.ico",
        "in my room 2017": "assets/icons/photography.ico",
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

    const icon = document.createElement("img");
    icon.className = "task-button-icon";

    icon.src =
        iconPaths[windowId] ||
        "assets/icons/computer.ico";

    icon.alt = "";

    const text = document.createElement("span");
    text.className = "task-button-text";

    const title =
        windowElement.querySelector(".title-bar span");

    text.textContent = title
        ? title.textContent
        : windowId;

    const closeTab = document.createElement("span");
    closeTab.className = "task-button-close";
    closeTab.textContent = "×";
    closeTab.title = `Close ${text.textContent}`;
    closeTab.setAttribute("aria-hidden", "true");

    button.appendChild(icon);
    button.appendChild(text);
    button.appendChild(closeTab);

    closeTab.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        closeWindow(windowElement);
    });

    button.addEventListener("click", () => {

        if (windowElement.classList.contains("hidden")) {

            windowElement.classList.remove("hidden");

            bringToFront(windowElement);

            button.classList.add("active");

        } else {

            windowElement.classList.add("hidden");

            button.classList.remove("active");
        }
    });

    taskbarWindows.appendChild(button);

    windowElement.taskButton = button;
}

// ====================================
// CLOCK + AERO MONTH CALENDAR
// ====================================

const clock =
    document.getElementById("clock");

const clockArea =
    document.getElementById("clock-area");

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

const homeIcon = document.querySelector('.icon[data-window="home"]');

homeIcon.addEventListener("click", () => {

    document.querySelectorAll(".window").forEach(window => {
        window.classList.add("hidden");
    });

});


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

document.querySelectorAll(".start-item[data-window]").forEach(item=>{

    item.addEventListener("click", event => {

        event.preventDefault();
        event.stopPropagation();

        startMenu.classList.add("hidden");

        const windowElement =
        document.querySelector(
            `[data-window-id="${item.dataset.window}"]`
        );

        if (windowElement) {

            openWindow(windowElement);

            requestAnimationFrame(() => {
                bringToFront(windowElement);
            });

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

    const currentSequenceId =
        trojanSequenceId;

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

    /*
     * Very short pause before the glitch.
     */
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
    if (windowElement.id === "magical-lake-window") {
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
    const mobile = isMobileLakeLayout();

    let targetWidth = BASE_WIDTH;
    let targetHeight = BASE_HEIGHT;

    if (mobile) {
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

    WATER_LINE = mobile
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
    if (isMobileLakeLayout()) {
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

const mainTrunkHeight = isMobileLakeLayout()
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

    if (isMobileLakeLayout()) {
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

    function isMobileLakeLayout() {
    return (
        window.innerWidth <= 700 ||
        (
            lakeScreen &&
            lakeScreen.clientWidth > 0 &&
            lakeScreen.clientWidth < 560
        )
    );
}

    function drawMoonlitPath(time) {
    if (!isMobileLakeLayout()) return;

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
    if (!isMobileLakeLayout()) return;

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
    if (!isMobileLakeLayout()) return;

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
    if (!isMobileLakeLayout()) return;

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
