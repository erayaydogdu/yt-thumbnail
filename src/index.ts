function getElementByIdOrDie(elementId: string): HTMLElement {
    const element = document.getElementById(elementId);
    if (element === null) {
        throw new Error(`Could not find element with id '${elementId}'`);
    }
    return element;
}

interface Config {
    title: string;
    width: number;
    fontSize: number;
    padX: number;
    padY: number;
    fillStyle?: string;

}

function renderThumbnail(ctx: CanvasRenderingContext2D, ytThumb: HTMLImageElement, config: Config): void {
    const aspect = ytThumb.height / ytThumb.width;
    const height = aspect * config.width;

    ctx.canvas.width  = config.width;
    ctx.canvas.height = height;

    ctx.drawImage(ytThumb, 0, 0, config.width, height);
    let gradient = ctx.createLinearGradient(
        config.width * 0.5, height,
        config.width * 0.5, 0);
    gradient.addColorStop(0.0, 'black');
    gradient.addColorStop(1.0, '#00000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, config.width, height);
    ctx.font = `${config.fontSize}px UbuntuNerdFont`;
    ctx.fillStyle = 'white';
    ctx.fillText(config.title, config.width - config.padX, height - config.padY);
    localStorage.setItem('thumbnailConfig', JSON.stringify(config));
}

window.onload = () => {
    const ytCanvas = getElementByIdOrDie("yt-canvas") as HTMLCanvasElement;
    const ytLink = getElementByIdOrDie("yt-link") as HTMLInputElement;
    const ytError = getElementByIdOrDie("yt-error") as HTMLElement;
    const ytThumb = getElementByIdOrDie("yt-thumb") as HTMLImageElement;
    const ytTitle = getElementByIdOrDie("yt-title") as HTMLInputElement;
    const ytWidth = getElementByIdOrDie("yt-width") as HTMLInputElement;
    const ytWidthDisplay = getElementByIdOrDie("yt-width-display") as HTMLOutputElement;
    const ytFont = getElementByIdOrDie("yt-text") as HTMLInputElement;
    const ytFontDisplay = getElementByIdOrDie("yt-text-display") as HTMLOutputElement;
    const ytPadX = getElementByIdOrDie("yt-padx") as HTMLInputElement;
    const ytPadXDisplay = getElementByIdOrDie("yt-padx-display") as HTMLOutputElement;
    const ytPadY = getElementByIdOrDie("yt-pady") as HTMLInputElement;
    const ytPadYDisplay = getElementByIdOrDie("yt-pady-display") as HTMLOutputElement;
    const btnSave = getElementByIdOrDie("btnSave") as HTMLButtonElement;
    const btnReset = getElementByIdOrDie("btnReset") as HTMLButtonElement;
    
    const ctx = ytCanvas.getContext('2d');
    if (ctx === null) {
        throw new Error(`Could not initialize 2d context`);
    }

    ytWidthDisplay.value = ytWidth.value;
    ytFontDisplay.value = `${ytFont.value}px`;
    ytPadXDisplay.value = ytPadX.value;
    ytPadYDisplay.value = ytPadY.value;

    let config : Config = {
        title: "Add Some Text Here!!!",
        width: 400,
        fontSize: 20,
        padX: 375,
        padY: 35,
    };

    const storedConfig = localStorage.getItem('thumbnailConfig');
    if (storedConfig) {
        config = JSON.parse(storedConfig);
        ytWidth.value = config.width.toString();
        ytFont.value = config.fontSize.toString();
        ytPadX.value = config.padX.toString();
        ytPadY.value = config.padY.toString();
        ytTitle.value = config.title;
    }

    ytWidth.oninput = () => {
        ytWidthDisplay.value = ytWidth.value;
        config.width = Number(ytWidth.value);
        renderThumbnail(ctx, ytThumb, config);
    }
    ytFont.oninput = () => {
        ytFontDisplay.value = `${ytFont.value}px`;
        config.fontSize = Number(ytFont.value);
        renderThumbnail(ctx, ytThumb, config);
    }
    ytPadX.oninput = () => {
        ytPadXDisplay.value = ytPadX.value;
        config.padX = Number(ytPadX.value);
        renderThumbnail(ctx, ytThumb, config);
    }
    ytPadY.oninput = () => {
        ytPadYDisplay.value = ytPadY.value;
        config.padY = Number(ytPadY.value);
        renderThumbnail(ctx, ytThumb, config);
    }
    ytTitle.oninput = () => {
        config.title = ytTitle.value;
        renderThumbnail(ctx, ytThumb, config);
    }
    ytThumb.onload = () => renderThumbnail(ctx, ytThumb, config);
    ytLink.oninput = () => {
        try {
            ytError.innerText = '';
            ytThumb.src = '';
            const url = new URL(ytLink.value);
            const ytHostRegexp = new RegExp('^(.+\.)?youtube\.com$');
            if (ytHostRegexp.test(url.hostname)) {
                const ytVideoId = url.searchParams.getAll('v').join('')
                ytThumb.src = `http://i3.ytimg.com/vi/${ytVideoId}/maxresdefault.jpg`;
            } else {
                throw new Error('Only YouTube Links are supported');
            }
        } catch(error : any) {
            ytError.innerText = error.message;
            ytError.toggleAttribute('hidden', false)
        }
    };

    btnSave.onclick = () => {
        let drawImage = ytCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); ;
        let link = document.createElement('a');
        link.download = 'thumbnail.png';
        link.href = drawImage;
        link.click();
    };

    btnReset.onclick = () => {
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
