// nuko.js: https://github.com/adryd325/oneko.js (Forked and customized for Nuko)

(function nuko() {
  const isReducedMotion =
    window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

  if (isReducedMotion) return;

  const nukoEl = document.createElement("div");
  let persistPosition = true;

  let nukoPosX = 32;
  let nukoPosY = 32;
  
  let mousePosX = 0;
  let mousePosY = 0;

  let frameCount = 0;
  let idleTime = 0;
  let idleAnimation = null;
  let idleAnimationFrame = 0;

  const nukoSpeed = 10;
  const spriteSets = {
    // --- BLUSHEX (Patting/Standing) - 14 Frames ---
    // Row 1: 8 frames, Row 2: 6 frames
    idle: [[0, 0]],
    alert: [[1, 0]],
    scratchSelf: [
      [0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], 
      [0, -1], [1, -1], [2, -1], [3, -1], [4, -1], [5, -1]
    ],
    scratchWallN: [[0, 0], [1, 0]],
    scratchWallS: [[0, 0], [1, 0]],
    scratchWallE: [[0, 0], [1, 0]],
    scratchWallW: [[0, 0], [1, 0]],

    // --- TRANSITION (Tired) ---
    // Mixing the end of blushex and the start of zzz for a smooth 8-frame sleep transition
    tired: [
      [3, -1], [4, -1], [5, -1], [6, -1], 
      [1, -4], [2, -4], [3, -4], [4, -4]
    ],

    // --- ZZZ (Sleeping) - 15 Frames ---
    // Row 5: 7 frames, Row 6: 8 frames
    sleeping: [
      [1, -4], [2, -4], [3, -4], [4, -4], [5, -4], [6, -4], [7, -4],
      [0, -5], [1, -5], [2, -5], [3, -5], [4, -5], [5, -5], [6, -5], [7, -5]
    ],

    // --- SPIN (Moving) - 15 Frames ---
    // Row 2: 2 frames, Row 3: 8 frames, Row 4: 5 frames - Mapped to all directions so Nuko spins wherever it goes
    N:  [[6, -1], [7, -1], [0, -2], [1, -2], [2, -2], [3, -2], [4, -2], [5, -2], [6, -2], [7, -2], [0, -3], [1, -3], [2, -3], [3, -3], [4, -3]],
    NE: [[6, -1], [7, -1], [0, -2], [1, -2], [2, -2], [3, -2], [4, -2], [5, -2], [6, -2], [7, -2], [0, -3], [1, -3], [2, -3], [3, -3], [4, -3]],
    E:  [[6, -1], [7, -1], [0, -2], [1, -2], [2, -2], [3, -2], [4, -2], [5, -2], [6, -2], [7, -2], [0, -3], [1, -3], [2, -3], [3, -3], [4, -3]],
    SE: [[6, -1], [7, -1], [0, -2], [1, -2], [2, -2], [3, -2], [4, -2], [5, -2], [6, -2], [7, -2], [0, -3], [1, -3], [2, -3], [3, -3], [4, -3]],
    S:  [[6, -1], [7, -1], [0, -2], [1, -2], [2, -2], [3, -2], [4, -2], [5, -2], [6, -2], [7, -2], [0, -3], [1, -3], [2, -3], [3, -3], [4, -3]],
    SW: [[6, -1], [7, -1], [0, -2], [1, -2], [2, -2], [3, -2], [4, -2], [5, -2], [6, -2], [7, -2], [0, -3], [1, -3], [2, -3], [3, -3], [4, -3]],
    W:  [[6, -1], [7, -1], [0, -2], [1, -2], [2, -2], [3, -2], [4, -2], [5, -2], [6, -2], [7, -2], [0, -3], [1, -3], [2, -3], [3, -3], [4, -3]],
    NW: [[6, -1], [7, -1], [0, -2], [1, -2], [2, -2], [3, -2], [4, -2], [5, -2], [6, -2], [7, -2], [0, -3], [1, -3], [2, -3], [3, -3], [4, -3]],
  };


  function init() {
    let nukoFile = "./nuko.gif"
    const curScript = document.currentScript
    if (curScript && curScript.dataset.cat) {
      nukoFile = curScript.dataset.cat
    }
    if (curScript && curScript.dataset.persistPosition) {
      if (curScript.dataset.persistPosition === "") {
        persistPosition = true;
      } else {
        persistPosition = JSON.parse(curScript.dataset.persistPosition.toLowerCase());
      }
    }
  
    if (persistPosition) {
      let storedNuko = JSON.parse(window.localStorage.getItem("nuko"));
      if (storedNuko !== null) {
        nukoPosX = storedNuko.nukoPosX;
        nukoPosY = storedNuko.nukoPosY;
        mousePosX = storedNuko.mousePosX;
        mousePosY = storedNuko.mousePosY;
        frameCount = storedNuko.frameCount;
        idleTime = storedNuko.idleTime;
        idleAnimation = storedNuko.idleAnimation;
        idleAnimationFrame = storedNuko.idleAnimationFrame;
        nukoEl.style.backgroundPosition = storedNuko.bgPos;
      }
    }
  
    nukoEl.id = "nuko";
    nukoEl.ariaHidden = true;
    nukoEl.style.width = "32px";
    nukoEl.style.height = "32px";
    nukoEl.style.position = "fixed";
    nukoEl.style.pointerEvents = "none";
    nukoEl.style.imageRendering = "pixelated";
    nukoEl.style.left = `${nukoPosX - 16}px`;
    nukoEl.style.top = `${nukoPosY - 16}px`;
    nukoEl.style.zIndex = 2147483647;

    nukoEl.style.backgroundImage = `url(${nukoFile})`;
    
    document.body.appendChild(nukoEl);

    document.addEventListener("mousemove", function (event) {
      mousePosX = event.clientX;
      mousePosY = event.clientY;
    });
    
    if (persistPosition) {
      window.addEventListener("beforeunload", function (event) {
        window.localStorage.setItem("nuko", JSON.stringify({
          nukoPosX: nukoPosX,
          nukoPosY: nukoPosY,
          mousePosX: mousePosX,
          mousePosY: mousePosY,
          frameCount: frameCount,
          idleTime: idleTime,
          idleAnimation: idleAnimation,
          idleAnimationFrame: idleAnimationFrame,
          bgPos: nukoEl.style.backgroundPosition
        }));
      });
    }
    
    window.requestAnimationFrame(onAnimationFrame);
  }

  let lastFrameTimestamp;

  function onAnimationFrame(timestamp) {
    // Stops execution if the nuko element is removed from DOM
    if (!nukoEl.isConnected) {
      return;
    }
    if (!lastFrameTimestamp) {
      lastFrameTimestamp = timestamp;
    }
    if (timestamp - lastFrameTimestamp > 100) {
      lastFrameTimestamp = timestamp;
      frame();
    }
    window.requestAnimationFrame(onAnimationFrame);
  }

  function setSprite(name, frame) {
    const sprite = spriteSets[name][frame % spriteSets[name].length];
    nukoEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
  }

  function resetIdleAnimation() {
    idleAnimation = null;
    idleAnimationFrame = 0;
  }

  function idle() {
    idleTime += 1;

    // every ~ 20 seconds
    if (
      idleTime > 10 &&
      Math.floor(Math.random() * 200) == 0 &&
      idleAnimation == null
    ) {
      let avalibleIdleAnimations = ["sleeping", "scratchSelf"];
      if (nukoPosX < 32) {
        avalibleIdleAnimations.push("scratchWallW");
      }
      if (nukoPosY < 32) {
        avalibleIdleAnimations.push("scratchWallN");
      }
      if (nukoPosX > window.innerWidth - 32) {
        avalibleIdleAnimations.push("scratchWallE");
      }
      if (nukoPosY > window.innerHeight - 32) {
        avalibleIdleAnimations.push("scratchWallS");
      }
      idleAnimation =
        avalibleIdleAnimations[
          Math.floor(Math.random() * avalibleIdleAnimations.length)
        ];
    }

    switch (idleAnimation) {
      case "sleeping":
        if (idleAnimationFrame < 8) {
          setSprite("tired", 0);
          break;
        }
        setSprite("sleeping", Math.floor(idleAnimationFrame / 4));
        if (idleAnimationFrame > 192) {
          resetIdleAnimation();
        }
        break;
      case "scratchWallN":
      case "scratchWallS":
      case "scratchWallE":
      case "scratchWallW":
      case "scratchSelf":
        setSprite(idleAnimation, idleAnimationFrame);
        if (idleAnimationFrame > 9) {
          resetIdleAnimation();
        }
        break;
      default:
        setSprite("idle", 0);
        return;
    }
    idleAnimationFrame += 1;
  }

  function frame() {
    frameCount += 1;
    const diffX = nukoPosX - mousePosX;
    const diffY = nukoPosY - mousePosY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (distance < nukoSpeed || distance < 48) {
      idle();
      return;
    }

    idleAnimation = null;
    idleAnimationFrame = 0;

    if (idleTime > 1) {
      setSprite("alert", 0);
      // count down after being alerted before moving
      idleTime = Math.min(idleTime, 7);
      idleTime -= 1;
      return;
    }

    let direction;
    direction = diffY / distance > 0.5 ? "N" : "";
    direction += diffY / distance < -0.5 ? "S" : "";
    direction += diffX / distance > 0.5 ? "W" : "";
    direction += diffX / distance < -0.5 ? "E" : "";
    setSprite(direction, frameCount);

    nukoPosX -= (diffX / distance) * nukoSpeed;
    nukoPosY -= (diffY / distance) * nukoSpeed;

    nukoPosX = Math.min(Math.max(16, nukoPosX), window.innerWidth - 16);
    nukoPosY = Math.min(Math.max(16, nukoPosY), window.innerHeight - 16);

    nukoEl.style.left = `${nukoPosX - 16}px`;
    nukoEl.style.top = `${nukoPosY - 16}px`;
  }

  init();
})();
