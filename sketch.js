let video;
let handpose;
let predictions = [];
let gameState = "menu"; // Estados: menu, juego1, juego2
let interactionCircle = { x: 320, y: 240, size: 50, color: [255, 0, 0] };
let score = 0; // Contador de interacciones
let tennisBall = { x: 320, y: 240, speedX: 5, speedY: 3, size: 20 };
let player1 = { y: 200, height: 100, width: 20 };
let player2 = { y: 200, height: 100, width: 20 };
let tennisScore = { player1: 0, player2: 0 };

function setup() {
  createCanvas(640, 480).parent('video-container');
  // Inicializar otros elementos necesarios

  console.log(ml5); // Verificar si ml5 está cargado
  console.log(ml5.handpose); // Verificar si handpose es una función

  // Configurar la cámara
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  // Inicializar Handpose
  if (typeof ml5.handpose === "function") {
    handpose = ml5.handpose(video, modelReady);

    // Escuchar las predicciones
    handpose.on("predict", results => {
      predictions = results;
    });
  } else {
    console.error("ml5.handpose no es una función");
  }
}

function modelReady() {
  console.log("Modelo cargado");
}

function draw() {
  background(0);

  if (gameState === "menu") {
    drawMenu();
  } else if (gameState === "juego1") {
    playGame1();
  } else if (gameState === "juego2") {
    playGame2();
  }
}

function drawMenu() {
  textAlign(CENTER, CENTER);
  textSize(32);
  fill(255);
  text("Elige un Juego y utiliza tus manos", width / 2, height / 3);

  // Botones
  fill(50, 200, 50);
  rect(width / 4 - 75, height / 2 - 25, 150, 50, 10); // Bordes redondeados
  fill(255);
  text("Juego 1", width / 4, height / 2);

  fill(50, 50, 200);
  rect((3 * width) / 4 - 75, height / 2 - 25, 150, 50, 10);
  fill(255);
  text("Juego 2", (3 * width) / 4, height / 2);
}

function playGame1() {
  // Actualizar instrucciones
  document.getElementById('instruction-text').innerText = "Utilizando tu dedo índice, toca el círculo rojo y logra tu mayor puntaje.";

  // Dibujar predicciones
  drawKeypoints();

  // Dibujar círculo interactivo
  fill(interactionCircle.color);
  noStroke();
  ellipse(interactionCircle.x, interactionCircle.y, interactionCircle.size);

  // Verificar interacción
  checkInteraction();

  // Mostrar puntaje
  fill(255);
  textSize(24);
  text(`Puntaje: ${score}`, width / 2, 30);

  // Dibujar botón de regresar
  drawBackButton();
}

function playGame2() {
  // Actualizar instrucciones
  document.getElementById('instruction-text').innerText = "Descubre con tus manos cómo puedes jugar ping-pong.";

  // Dibujar jugadores y pelota
  fill(255);
  rect(20, player1.y, player1.width, player1.height, 5);
  rect(width - 40, player2.y, player2.width, player2.height, 5);
  ellipse(tennisBall.x, tennisBall.y, tennisBall.size);

  moveTennisBall();
  movePlayers();

  // Mostrar puntajes
  textSize(24);
  fill(255);
  textAlign(CENTER, TOP);
  text("Jugador 1: " + tennisScore.player1, width / 4, 10);
  text("Jugador 2: " + tennisScore.player2, (3 * width) / 4, 10);

  // Dibujar botón de regresar
  drawBackButton();
}

function drawBackButton() {
  fill(200, 0, 0);
  rect(10, height - 40, 100, 30, 5);
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);
  text("Volver", 20, height - 25);
}

function drawKeypoints() {
  for (let i = 0; i < predictions.length; i++) {
    const prediction = predictions[i];
    for (let j = 0; j < prediction.landmarks.length; j++) {
      const [x, y, z] = prediction.landmarks[j];

      // Dibujar sombra alrededor de los dedos
      fill(50, 150, 255, 150); // Azul con transparencia
      noStroke();
      ellipse(x, y, 20, 20);

      // Dibujar puntos clave
      fill(255, 255, 0);
      noStroke();
      ellipse(x, y, 10, 10);
    }
  }
}

function checkInteraction() {
  if (predictions.length > 0) {
    const indexFingerTip = predictions[0].landmarks[8]; // Punta del dedo índice
    const [x, y] = indexFingerTip;

    const d = dist(x, y, interactionCircle.x, interactionCircle.y);

    if (d < interactionCircle.size / 2) {
      interactionCircle.color = [0, 255, 0]; // Cambiar a verde si toca el círculo
      interactionCircle.size = random(30, 80); // Cambiar tamaño al azar

      // Reubicar el círculo en una posición aleatoria
      interactionCircle.x = random(interactionCircle.size / 2, width - interactionCircle.size / 2);
      interactionCircle.y = random(interactionCircle.size / 2, height - interactionCircle.size / 2);

      score++; // Incrementar el puntaje
    }
  }
}

function moveTennisBall() {
  tennisBall.x += tennisBall.speedX;
  tennisBall.y += tennisBall.speedY;

  // Verificar colisiones con los bordes superior e inferior
  if (tennisBall.y < 0 || tennisBall.y > height) {
    tennisBall.speedY *= -1;
  }

  // Verificar colisiones con los jugadores
  if (tennisBall.x < 40 && tennisBall.y > player1.y && tennisBall.y < player1.y + player1.height) {
    tennisBall.speedX *= -1;
  } else if (tennisBall.x > width - 40 && tennisBall.y > player2.y && tennisBall.y < player2.y + player2.height) {
    tennisBall.speedX *= -1;
  }

  // Verificar si la pelota sale del campo
  if (tennisBall.x < 0) {
    tennisScore.player2++;
    resetTennisBall();
  } else if (tennisBall.x > width) {
    tennisScore.player1++;
    resetTennisBall();
  }
}

function resetTennisBall() {
  tennisBall.x = width / 2;
  tennisBall.y = height / 2;
  tennisBall.speedX = random([-5, 5]);
  tennisBall.speedY = random([-3, 3]);
}

function movePlayers() {
  if (predictions.length > 0) {
    // Verificar si hay al menos dos manos detectadas
    let leftHand, rightHand;
    for (let i = 0; i < predictions.length; i++) {
      const hand = predictions[i];
      const wrist = hand.landmarks[0]; // Muñeca de la mano

      if (wrist[0] < width / 2 && !leftHand) {
        leftHand = wrist;
      } else if (wrist[0] >= width / 2 && !rightHand) {
        rightHand = wrist;
      }
    }

    if (leftHand) {
      player1.y = leftHand[1] - player1.height / 2;
    }

    if (rightHand) {
      player2.y = rightHand[1] - player2.height / 2;
    }
  }
}

function mousePressed() {
  if (gameState === "menu") {
    if (mouseX > width / 4 - 75 && mouseX < width / 4 + 75 && mouseY > height / 2 - 25 && mouseY < height / 2 + 25) {
      gameState = "juego1";
    } else if (mouseX > (3 * width) / 4 - 75 && mouseX < (3 * width) / 4 + 75 && mouseY > height / 2 - 25 && mouseY < height / 2 + 25) {
      gameState = "juego2";
    }
  } else if (gameState === "juego1" || gameState === "juego2") {
    if (mouseX > 10 && mouseX < 110 && mouseY > height - 40 && mouseY < height - 10) {
      gameState = "menu";
    }
  }
}