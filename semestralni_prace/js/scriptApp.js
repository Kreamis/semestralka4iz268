const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");

class Cell {
    constructor(x, y, symbol, color) {
        this.x = x;
        this.y = y;
        this.symbol = symbol;
        this.color = color;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillText(this.symbol, this.x, this.y)
    }
}


class AsciiEffect {
    _imageCellArray = [];

    _pixels = [];
    _ctx;
    _width;
    _height;
    _image;

    constructor(ctx, image) {
        this._ctx = ctx;
        this._height = canvas.height;
        this._width = canvas.width;
        this._ctx.drawImage(image, 0, 0, this._width, this._height)
        this._pixels = this._ctx.getImageData(0, 0, this._width, this._height);
        this._image = image;
        console.log(this._pixels)
    }

    _convertToSymbol(g) {
        return g < 250 ? "@" : "*";
    }

    _scanImage(cellSize) {
        this._imageCellArray = [];
        for (let y = 0; y < this._pixels.height; y += cellSize) {
            for (let x = 0; x < this._pixels.width; x += cellSize) {
                const posX = x * 4;
                const posY = y * 4;
                const pos = (posY * this._pixels.width) + posX;

                if (this._pixels.data[pos + 3] > 128) {
                    const red = this._pixels.data[pos];
                    const green = this._pixels.data[pos + 1];
                    const blue = this._pixels.data[pos + 2];
                    const total = red + green + blue;
                    const averageColorValue = total / 3;
                    const color = "rgb(" + red + "," + green + "," + blue + ")"
                    const symbol = this._convertToSymbol(averageColorValue)
                    if (total > 200) this._imageCellArray.push(new Cell(x, y, symbol, color));


                }
            }
        }
        console.log(this._imageCellArray);

    }

    _drawAscii() {
        this._ctx.clearRect(0, 0, this._width, this._height)
        for (let i = 0; i < this._imageCellArray.length; i++) {
            this._imageCellArray[i].draw(this._ctx);
        }
    }

    draw(cellSize) {
        this._scanImage(cellSize);
        this._drawAscii()
    }
}

function handleSlider(effect, inputSlider, inputLabel) {
    if (inputSlider.value == 1) {
        inputLabel.innerHTML = 'Original image';
        ctx.drawImage(effect._image, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.font = parseInt(inputSlider.value) * 1.2 + 'px Verdana';
        inputLabel.innerHTML = 'Resolution ' + inputSlider.value + ' px';
        effect.draw(parseInt(inputSlider.value));
    }
}


const fileInput = document.getElementById("fileInput");

fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (file.size > 5_000_000) {
        window.alert("File too big 😩");
        return;
    }

    if (!file.type.startsWith("image/")) {
        window.alert("File is not an image 😩");
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        const image = new Image();
        const size = 500;

        image.src = reader.result;
        image.onload = function () {
            if (image.width >= image.height) {
                canvas.width = size;
                canvas.height = size * (image.height / image.width);
            } else {

                canvas.height = size;
                canvas.width = size * (image.width / image.height);
            }

            const effect = new AsciiEffect(ctx, image);
            const inputSlider = document.getElementById('resolution');
            const inputLabel = document.getElementById('resolutionLabel');


            handleSlider(effect, inputSlider, inputLabel);
            inputSlider.addEventListener("change", () => handleSlider(effect, inputSlider, inputLabel));
        }
    }

    reader.readAsDataURL(file);
});

var button = document.getElementById("download-button");
button.addEventListener("click", function () {
    var dataURL = canvas.toDataURL("image/png");
    var link = document.createElement("a");
    link.href = dataURL;
    link.download = "AsciiArtImage.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});


const upload = (canvas, onUpload) => {
    canvas.toBlob(blob => {
        const form = new FormData();
        const file = new File([blob], "image.png");

        form.append("file", file);

        fetch("https://api.file.coffee/file/upload", {method: "post", body: form})
            .then(response => response.json())
            .then(response => onUpload(response.url));
    });
}

//Facebook
document.getElementById('facebook-share-btn').onclick = function () {
    upload(canvas, (link) => window.open("https://www.facebook.com/sharer/sharer.php?u=" + link));
}
