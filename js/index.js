"use strict";
function getElementByIdOrDie(elementId) {
    var element = document.getElementById(elementId);
    if (element === null) {
        throw new Error("Could not find element with id '".concat(elementId, "'"));
    }
    return element;
}
function renderThumbnail(ctx, ytThumb, config) {
    var aspect = ytThumb.height / ytThumb.width;
    var height = aspect * config.width;
    ctx.canvas.width = config.width;
    ctx.canvas.height = height;
    ctx.drawImage(ytThumb, 0, 0, config.width, height);
    var gradient = ctx.createLinearGradient(config.width * 0.5, height, config.width * 0.5, 0);
    gradient.addColorStop(0.0, 'black');
    gradient.addColorStop(1.0, '#00000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, config.width, height);
    ctx.font = "".concat(config.fontSize, "px UbuntuNerdFont");
    ctx.fillStyle = 'white';
    ctx.fillText(config.title, config.width - config.padX, height - config.padY);
    localStorage.setItem('thumbnailConfig', JSON.stringify(config));
}
window.onload = function () {
    var ytCanvas = getElementByIdOrDie("yt-canvas");
    var ytLink = getElementByIdOrDie("yt-link");
    var ytError = getElementByIdOrDie("yt-error");
    var ytThumb = getElementByIdOrDie("yt-thumb");
    var ytTitle = getElementByIdOrDie("yt-title");
    var ytWidth = getElementByIdOrDie("yt-width");
    var ytWidthDisplay = getElementByIdOrDie("yt-width-display");
    var ytFont = getElementByIdOrDie("yt-text");
    var ytFontDisplay = getElementByIdOrDie("yt-text-display");
    var ytPadX = getElementByIdOrDie("yt-padx");
    var ytPadXDisplay = getElementByIdOrDie("yt-padx-display");
    var ytPadY = getElementByIdOrDie("yt-pady");
    var ytPadYDisplay = getElementByIdOrDie("yt-pady-display");
    var btnSave = getElementByIdOrDie("btnSave");
    var btnReset = getElementByIdOrDie("btnReset");
    var ctx = ytCanvas.getContext('2d');
    if (ctx === null) {
        throw new Error("Could not initialize 2d context");
    }
    ytWidthDisplay.value = ytWidth.value;
    ytFontDisplay.value = "".concat(ytFont.value, "px");
    ytPadXDisplay.value = ytPadX.value;
    ytPadYDisplay.value = ytPadY.value;
    var config = {
        title: "Add Some Text Here!!!",
        width: 400,
        fontSize: 20,
        padX: 375,
        padY: 35,
    };
    var storedConfig = localStorage.getItem('thumbnailConfig');
    if (storedConfig) {
        config = JSON.parse(storedConfig);
        ytWidth.value = config.width.toString();
        ytFont.value = config.fontSize.toString();
        ytPadX.value = config.padX.toString();
        ytPadY.value = config.padY.toString();
        ytTitle.value = config.title;
    }
    ytWidth.oninput = function () {
        ytWidthDisplay.value = ytWidth.value;
        config.width = Number(ytWidth.value);
        renderThumbnail(ctx, ytThumb, config);
    };
    ytFont.oninput = function () {
        ytFontDisplay.value = "".concat(ytFont.value, "px");
        config.fontSize = Number(ytFont.value);
        renderThumbnail(ctx, ytThumb, config);
    };
    ytPadX.oninput = function () {
        ytPadXDisplay.value = ytPadX.value;
        config.padX = Number(ytPadX.value);
        renderThumbnail(ctx, ytThumb, config);
    };
    ytPadY.oninput = function () {
        ytPadYDisplay.value = ytPadY.value;
        config.padY = Number(ytPadY.value);
        renderThumbnail(ctx, ytThumb, config);
    };
    ytTitle.oninput = function () {
        config.title = ytTitle.value;
        renderThumbnail(ctx, ytThumb, config);
    };
    ytThumb.onload = function () { return renderThumbnail(ctx, ytThumb, config); };
    ytLink.oninput = function () {
        try {
            ytError.innerText = '';
            ytThumb.src = '';
            var url = new URL(ytLink.value);
            var ytHostRegexp = new RegExp('^(.+\.)?youtube\.com$');
            if (ytHostRegexp.test(url.hostname)) {
                var ytVideoId = url.searchParams.getAll('v').join('');
                ytThumb.src = "http://i3.ytimg.com/vi/".concat(ytVideoId, "/maxresdefault.jpg");
            }
            else {
                throw new Error('Only YouTube Links are supported');
            }
        }
        catch (error) {
            ytError.innerText = error.message;
            ytError.toggleAttribute('hidden', false);
        }
    };
    btnSave.onclick = function () {
        var drawImage = ytCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        ;
        var link = document.createElement('a');
        link.download = 'thumbnail.png';
        link.href = drawImage;
        link.click();
    };
    btnReset.onclick = function () {
        config = {
            title: "Add Some Text Here!!!",
            width: 400,
            fontSize: 20,
            padX: 375,
            padY: 35,
        };
        ytWidth.value = config.width.toString();
        ytFont.value = config.fontSize.toString();
        ytPadX.value = config.padX.toString();
        ytPadY.value = config.padY.toString();
        ytTitle.value = config.title;
        localStorage.setItem('thumbnailConfig', JSON.stringify(config));
        renderThumbnail(ctx, ytThumb, config);
    };
    ytLink.dispatchEvent(new Event("input"));
};
