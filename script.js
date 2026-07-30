// ====================================
// WINDOWS 2000 PORTFOLIO
// Window Manager v1
// ====================================

// ====================================
// AUTOMATIC WEBSITE BOOT SEQUENCE
// ====================================

document.body.classList.add("booting");

window.addEventListener("DOMContentLoaded", () => {

    const bootScreen =
        document.getElementById("startup-boot-screen");

    const settingsScreen =
        document.getElementById("startup-settings-screen");

    // Black Windows 2000 boot screen

    window.setTimeout(() => {

        bootScreen.classList.add("hidden");

        settingsScreen.classList.remove("hidden");

     startWelcomeFireworks();

    }, 3500);

    // Loading personal settings

    window.setTimeout(() => {

        settingsScreen.classList.add("hidden");

        document.body.classList.remove("booting");
        document.body.classList.add("desktop-loaded");
document
    .getElementById("wallpaper-video")
    .play();

    }, 5200);

});


const desktopIcons = document.querySelectorAll(".icon");
const windows = document.querySelectorAll(".window");

let highestZ = 100;
let galleryOffset = 0;

const taskbarWindows = document.getElementById("taskbar-windows");


// ====================================
// DESKTOP ICONS
// Open and bring windows to front
// ====================================

desktopIcons.forEach(icon => {

    icon.addEventListener("click", () => {

        const id =
            icon.dataset.window;

        const windowElement =
            document.querySelector(
                `[data-window-id="${id}"]`
            );

        if (!windowElement) {
            return;
        }

        openWindow(windowElement);

        /*
         * Run once after the browser has restored
         * the window's display and dimensions.
         */
        requestAnimationFrame(() => {

            bringToFront(windowElement);

            document
                .querySelectorAll(".task-button")
                .forEach(button => {
                    button.classList.remove(
                        "active"
                    );
                });

            if (windowElement.taskButton) {
                windowElement.taskButton.classList.add(
                    "active"
                );
            }

        });

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

        // About Me always opens in the same place
        if (windowElement.id === "about-window") {

            windowElement.style.left = "120px";
            windowElement.style.top = "90px";

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
    windowElement.id === "disney-window" ||
    windowElement.id === "miku-window" ||
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

    /*
     * Find the highest z-index currently used by
     * any open window. This prevents highestZ from
     * becoming out of sync.
     */
    const currentHighestZ = Array
        .from(document.querySelectorAll(".window"))
        .reduce((highestValue, currentWindow) => {

            const currentZIndex =
                Number.parseInt(
                    window.getComputedStyle(
                        currentWindow
                    ).zIndex,
                    10
                );

            if (Number.isNaN(currentZIndex)) {
                return highestValue;
            }

            return Math.max(
                highestValue,
                currentZIndex
            );

        }, highestZ);

    highestZ = currentHighestZ + 1;

    windowElement.style.zIndex =
        String(highestZ);
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

                windowElement.dataset.width=
                windowElement.style.width;

                windowElement.dataset.height=
                windowElement.style.height;

                windowElement.style.left="0";

                windowElement.style.top="0";

                windowElement.style.width="100vw";

                windowElement.style.height="calc(100vh - 38px)";

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
        photography: "assets/icons/photography.ico",
        "disney 2010": "assets/icons/photography.ico",
        "miku 2010": "assets/icons/photography.ico",
        "graphic-arts": "assets/icons/graphic arts.ico",
        "graphic-project-one": "assets/icons/graphic arts.ico",
        "graphic-project-two": "assets/icons/graphic arts.ico",
        music: "assets/icons/music.ico",
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

    button.appendChild(icon);
    button.appendChild(text);

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
// IMAGE PREVIEW NAVIGATION
// ====================================

const previewWindow =
    document.getElementById("image-preview-window");

const previewImage =
    document.getElementById("preview-image");

const previewTitle =
    document.getElementById("preview-title");

const previousPhotoButton =
    document.getElementById("previous-photo");

const nextPhotoButton =
    document.getElementById("next-photo");

const photoCounter =
    document.getElementById("photo-counter");

let currentGalleryImages = [];
let currentPhotoIndex = 0;


// Displays one photo in the preview window
function showPreviewPhoto(index) {

    if (currentGalleryImages.length === 0) {
        return;
    }

    // Clicking Previous on the first photo opens the last photo
    if (index < 0) {
        index = currentGalleryImages.length - 1;
    }

    // Clicking Next on the last photo opens the first photo
    if (index >= currentGalleryImages.length) {
        index = 0;
    }

    currentPhotoIndex = index;

    const selectedImage =
        currentGalleryImages[currentPhotoIndex];

    previewImage.src = selectedImage.src;

    previewImage.alt =
        selectedImage.alt || "Gallery photo";

    previewTitle.textContent =
        selectedImage.alt || "Photo";

    photoCounter.textContent =
        `${currentPhotoIndex + 1} / ${currentGalleryImages.length}`;
}


// Opens the clicked photo
document
    .querySelectorAll(
        ".project-gallery img, .graphic-project-gallery img"
    )
    .forEach(img => {

    img.addEventListener("click", () => {

        const gallery =
    img.closest(
        ".project-gallery, .graphic-project-gallery"
    );

        currentGalleryImages =
            Array.from(gallery.querySelectorAll("img"));

        currentPhotoIndex =
            currentGalleryImages.indexOf(img);

        showPreviewPhoto(currentPhotoIndex);

        openWindow(previewWindow);

    });

});


// Previous button
previousPhotoButton.addEventListener("click", () => {

    showPreviewPhoto(currentPhotoIndex - 1);

});


// Next button
nextPhotoButton.addEventListener("click", () => {

    showPreviewPhoto(currentPhotoIndex + 1);

});

// ====================================
// IMAGE PREVIEW KEYBOARD CONTROLS
// ====================================

document.addEventListener("keydown", event => {

    if (
        previewWindow.classList.contains("hidden") ||
        currentGalleryImages.length === 0
    ) {
        return;
    }

    if (event.key === "ArrowLeft") {

        showPreviewPhoto(currentPhotoIndex - 1);

    }

    if (event.key === "ArrowRight") {

        showPreviewPhoto(currentPhotoIndex + 1);

    }

    if (event.key === "Escape") {

        closeWindow(previewWindow);

    }

});


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

    item.addEventListener("click",()=>{

        startMenu.classList.add("hidden");

        const windowElement =
        document.querySelector(
            `[data-window-id="${item.dataset.window}"]`
        );

        if(windowElement){

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

const letterboxdIcon = document.getElementById("letterboxd-icon");

if (letterboxdIcon) {
    letterboxdIcon.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        window.open(
            "https://letterboxd.com/bibihn/",
            "_blank",
            "noopener,noreferrer"
        );
    });
}

const lastfmIcon = document.getElementById("lastfm");

if (lastfmIcon) {
    lastfmIcon.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        window.open(
            "https://www.last.fm/user/bibihn",
            "_blank",
            "noopener,noreferrer"
        );
    });
}

const instagramIcon = document.getElementById("instagram");

if (instagramIcon) {
    instagramIcon.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        window.open(
            "https://www.instagram.com/bibiguimaraesz/",
            "_blank",
            "noopener,noreferrer"
        );
    });
}

const spotifyIcon = document.getElementById("spotify");

if (spotifyIcon) {
    spotifyIcon.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        window.open(
            "http://open.spotify.com/user/beasita?si=cce4b8725f00479a&nd=1&dlsi=e168b904d5aa4e68",
            "_blank",
            "noopener,noreferrer"
        );
    });
}

// ====================================
// CLICK SPARKLE EFFECT
// ====================================

document.addEventListener("click", event => {
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

        await wait(20);
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
            1 + Math.random() * 4
        );
    }

    await wait(
        10 + Math.random() * 25
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
            320 + Math.random() * 380
        );
    }

    await wait(500);

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

    await wait(260);

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
    await wait(120);

    if (currentSequenceId !== trojanSequenceId) {
        return;
    }

    trojanWindow.classList.add(
        "trojan-glitch"
    );

    await wait(450);

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