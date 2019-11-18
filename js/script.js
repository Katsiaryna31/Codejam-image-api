const canvas = document.getElementById("canvas");
const pencil = document.querySelector('.panel-element--pencil');
const bucket = document.getElementById("fillBucket");
const chooseColor = document.getElementById("chooseColor");
const chooseColorLabel = document.querySelector('.panel-element--choice');
const currentColor = document.getElementById("current-color");
const previousColor = document.getElementById("previous-color");
const buttonPrevious = document.querySelector('.panel-element--previous-color');
const redColor = document.querySelector('.panel-element--red');
const blueColor = document.querySelector('.panel-element--blue');

const scaleButtons = document.querySelectorAll('.button-scale');
const button4 = document.getElementById("button-4");
const button2 = document.getElementById("button-2");
const button1 = document.getElementById("button-1");

let cellSize = 4;

const currentCellSize = localStorage.getItem('cellSize');
if (currentCellSize) {
  cellSize = currentCellSize;
  scaleButtons.forEach((button) => {
    button.classList.remove('button-scale--active');
  })
  const activeButton = document.getElementById(`button-${cellSize}`);
  activeButton.classList.add('button-scale--active');
}

const storedCurrentColor = localStorage.getItem('currentColor');
if (storedCurrentColor) {
  currentColor.value = storedCurrentColor;
}

const storedPreviousColor = localStorage.getItem('previousColor');
if (storedPreviousColor) {
  previousColor.value = storedPreviousColor;
}

const changeButton = (num) => {
  cellSize = num;
  localStorage.setItem('cellSize', cellSize);
  scaleButtons.forEach((button) => {
    button.classList.remove('button-scale--active');
  })
  const button = document.getElementById(`button-${num}`);
  button.classList.add('button-scale--active');
  canvas.width = 512 / cellSize;
  canvas.height = 512 / cellSize;
}

button4.addEventListener('click', () => {
  changeButton(4);
});

button2.addEventListener('click', () => {
  changeButton(2);
});

button1.addEventListener('click', () => {
  changeButton(1);
});

canvas.width = 512 / cellSize;
canvas.height = 512 / cellSize;

const ctx = canvas.getContext('2d');

const buttonsConditions = {
  fillBucket: false,
  chooseColor: false,
  pencil: true,
}

const removeActives = () => {
  const activeElements = document.querySelectorAll('.panel-element');
  activeElements.forEach((element) => {
    element.classList.remove('panel-element--active');
  })
}

const clickBucket = () => {
  buttonsConditions.fillBucket = true;
  removeActives();
  bucket.classList.add('panel-element--active');
  buttonsConditions.pencil = false;
  buttonsConditions.chooseColor = false;
}

const clickPencil = () => {
  buttonsConditions.pencil = true;
  removeActives();
  pencil.classList.add('panel-element--active');
  buttonsConditions.fillBucket = false;
  buttonsConditions.chooseColor = false;
}

const clickChoosingColor = () => {
  buttonsConditions.chooseColor = true;
  removeActives();
  chooseColorLabel.classList.add('panel-element--active');
  chooseColor.onchange = (evt) => {
    previousColor.value = currentColor.value;
    currentColor.value = evt.target.value;
  }
  buttonsConditions.fillBucket = false;
}

const drawPicture = (event) => {
  const x = Math.floor(event.offsetX / cellSize);
  const y = Math.floor(event.offsetY / cellSize);
  ctx.fillStyle = currentColor.value;
  ctx.fillRect(x, y, 1, 1);
}

canvas.onmousedown = (evt) => {
  if (buttonsConditions.pencil === true) {
    drawPicture(evt);
    canvas.onmousemove = (e) => {
      drawPicture(e);
    }
    canvas.onmouseup = () => {
      canvas.onmousemove = null;
    }
    buttonsConditions.fillBucket = false;
    buttonsConditions.chooseColor = false;
  }

  if (buttonsConditions.fillBucket === true) {
    ctx.fillStyle = currentColor.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    buttonsConditions.pencil = false;
    buttonsConditions.chooseColor = false;
  }
}

pencil.onclick = () => {
  clickPencil();
}

bucket.onclick = () => {
  clickBucket()
}

chooseColor.onclick = () => {
  clickChoosingColor();
}

currentColor.onclick = (evt) => {
  previousColor.value = currentColor.value;
  currentColor.value = evt.target.value;
}

currentColor.onchange = () => {
 localStorage.setItem('currentColor', currentColor.value);
 localStorage.setItem('previousColor', previousColor.value);
}

buttonPrevious.onclick = () => {
  currentColor.value = previousColor.value;
}

redColor.onclick = () => {
  previousColor.value = currentColor.value;
  currentColor.value = '#F74141';
}

blueColor.onclick = () => {
  previousColor.value = currentColor.value;
  currentColor.value = '#41B6F7';
}

async function searchPhoto() {
  const clientId = "197352b172c98044566554b1231e7de464d770d2f487a0a2e69f9eccd6e64d2e";
  const query = `town,${document.getElementById("search").value}`;
  const url = `https://api.unsplash.com/photos/random?query=${query}&client_id=${clientId}`;
  if (document.getElementById("search").value) {
    ctx.clearRect(0, 0, 512, 512);
    const response = await fetch(url);
    const data = await response.json();

    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = data.urls.small;
    image.onload = () => {
      if (data.width > data.height) {
        const imageHeight = canvas.height * data.height / data.width;
        ctx.drawImage(image, 0, (canvas.height - imageHeight) / 2, canvas.width, imageHeight);
      } else {
        const imageWidth = canvas.width * data.width / data.height;
        ctx.drawImage(image, (canvas.width - imageWidth) / 2, 0, imageWidth, canvas.height);
      }
    }
  }
  
}

const loadPhoto = document.getElementById("load");
loadPhoto.addEventListener("click", searchPhoto);

const cleaningButton = document.getElementById("cleanCanvas");
cleaningButton.addEventListener("click", () => {
  ctx.clearRect(0, 0, 512, 512);
});

window.onbeforeunload = () => {
  localStorage.setItem('canvasImage', canvas.toDataURL());
};

const dataURL = localStorage.getItem('canvasImage');
const img = new Image;
img.src = dataURL;
img.onload = () => {
  ctx.drawImage(img, 0, 0);
};

const grayscale = () => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data } = imageData;
  const blank = (color) => color !== 0;
  if (!data.some(blank)) {
    alert("Load image!");
  } else {
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg; 
      data[i + 1] = avg; 
      data[i + 2] = avg; 
    }
    ctx.putImageData(imageData, 0, 0);
  }
}

const grayscalebtn = document.getElementById('grayscalebtn');
  grayscalebtn.addEventListener('click', grayscale);



