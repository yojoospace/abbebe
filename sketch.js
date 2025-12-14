// ================================
// To: My Fox Mr. Chu (Alpha)
// From: Joo
// V9.2: V9.1完美版 + 气泡音效 (Bubble Sound)
// ================================

/* ========= 物理参数 (不动) ========= */
const TEXT_SIZE = 18; 
const FLOAT_EASE = 0.015;
const MAX_CHARS = 50; 

const PARTICLE_COUNT = 60;
const PARTICLE_SPEED = 2;
const PARTICLE_LIFE = 120;

const UI_W = 240; 

/* ========= 全局变量 ========= */
let inputBox, sendBtn, tipLabel; 
let myFont;
// 🔥【新增】声音变量
let popSound; 

let thoughts = [];
let inputBottomY; 
let uiCenterX; 

function preload() {
  myFont = loadFont('myfont.ttf');
  
  // 🔥【新增】加载音效
  // 浏览器通常支持 mp3，为了保险可以指定格式
  soundFormats('mp3', 'ogg');
  popSound = loadSound('bubble.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  inputBottomY = height - 100;
  uiCenterX = (windowWidth - UI_W) / 2;

  textAlign(CENTER, CENTER);
  textFont(myFont);
  textSize(TEXT_SIZE);

  // --- 1. 输入框 ---
  inputBox = createElement('textarea', '');
  inputBox.attribute('placeholder', '......');
  
  inputBox.style('font-family', 'sans-serif');
  inputBox.style('font-size', '14px');
  inputBox.style('background', 'transparent');
  inputBox.style('border', 'none');
  inputBox.style('border-bottom', '1px solid #ccc'); 
  inputBox.style('outline', 'none');
  inputBox.style('resize', 'none'); 
  inputBox.style('color', '#333');
  inputBox.style('line-height', '1.4');
  inputBox.style('padding', '5px 0');
  inputBox.style('overflow', 'hidden'); 

  inputBox.size(UI_W, 30); 
  inputBox.position(uiCenterX, inputBottomY - 30);
  inputBox.input(checkInput);

  // --- 2. 提示文字 ---
  tipLabel = createSpan('不着急，慢慢说');
  tipLabel.position(uiCenterX, inputBottomY + 10); 
  tipLabel.style('font-size', '10px');
  tipLabel.style('color', '#999'); 
  tipLabel.style('display', 'none'); 

  // --- 3. 按钮 ---
  sendBtn = createButton("↑"); 
  sendBtn.position(uiCenterX + UI_W + 20, inputBottomY - 30);
  sendBtn.size(40, 40);
  
  sendBtn.style('font-family', 'Arial'); 
  sendBtn.style('font-size', '20px');
  sendBtn.style('background', 'transparent');
  sendBtn.style('color', '#333');
  sendBtn.style('border', 'none'); 
  sendBtn.style('cursor', 'pointer');
  sendBtn.style('display', 'flex'); 
  sendBtn.style('justify-content', 'center');
  sendBtn.style('align-items', 'center');
  
  sendBtn.mouseOver(() => sendBtn.style('background', '#f0f0f0'));
  sendBtn.mouseOut(() => sendBtn.style('background', 'transparent'));
  
  // 🔥【重要】为了保证声音能播放，点击按钮时会触发 AudioContext
  sendBtn.mousePressed(() => {
    userStartAudio(); // 告诉浏览器用户已经交互了，可以放声音了
    submitThought();
  });
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  inputBottomY = height - 100;
  uiCenterX = (windowWidth - UI_W) / 2;
  
  let currentHeight = parseFloat(inputBox.style('height')); 
  inputBox.position(uiCenterX, inputBottomY - currentHeight);
  tipLabel.position(uiCenterX, inputBottomY + 10);
  sendBtn.position(uiCenterX + UI_W + 20, inputBottomY - 40);
}

function draw() {
  background(245); 

  for (let i = thoughts.length - 1; i >= 0; i--) {
    thoughts[i].update();
    thoughts[i].display();

    if (thoughts[i].isFinished()) {
      thoughts.splice(i, 1);
    }
  }
}

function checkInput() {
  let str = inputBox.value();
  if (str.length > MAX_CHARS) {
    inputBox.value(str.substring(0, MAX_CHARS));
    tipLabel.style('display', 'block');
  } else {
    tipLabel.style('display', 'none');
  }

  inputBox.style('height', '30px');
  let scHeight = inputBox.elt.scrollHeight;
  inputBox.style('height', scHeight + 'px');
  inputBox.position(uiCenterX, inputBottomY - scHeight);
}

function submitThought() {
  let txt = inputBox.value();
  if (txt.trim() === "") return;

  let formattedTxt = "";
  for(let i = 0; i < txt.length; i++) {
      formattedTxt += txt[i];
      if((i + 1) % 10 === 0 && i !== txt.length - 1) {
          formattedTxt += "\n";
      }
  }

  thoughts.push(new Thought(formattedTxt));
  
  inputBox.value(""); 
  inputBox.style('height', '30px'); 
  inputBox.position(uiCenterX, inputBottomY - 30);
  tipLabel.style('display', 'none'); 
}

/* ========= Thought 类 ========= */
class Thought {
  constructor(txt) {
    this.txt = txt;
    this.x = width / 2; 
    this.y = height - 120; 
    this.vy = random(3.5, 5.5); 
    this.targetY = random(height * 0.2, height * 0.4);
    this.scale = 1;
    this.state = "RISE";
    this.particles = [];
  }

  update() {
    if (this.state === "RISE") {
      this.y -= this.vy;
      this.scale = lerp(this.scale, 1.1, 0.05);
      this.vy *= (1 - FLOAT_EASE); 

      if (this.y <= this.targetY || (this.vy < 0.1 && this.y < height/2)) {
        this.pop();
      }
    }

    if (this.state === "POP") {
      for (let p of this.particles) {
        p.update();
      }
    }
  }

  display() {
    if (this.state === "RISE") {
      push();
      translate(this.x, this.y);
      scale(this.scale);
      fill(50); 
      rectMode(CENTER);
      textAlign(CENTER, CENTER);
      textLeading(24); 
      text(this.txt, 0, 0); 
      pop();
    }

    if (this.state === "POP") {
      for (let p of this.particles) {
        p.display();
      }
    }
  }

  pop() {
    this.state = "POP";
    
    // 🔥【新增】播放气泡音效
    // 稍微改变一点点播放速度(Rate)，让每次“啵”的声音都不完全一样，更自然
    if (popSound && popSound.isLoaded()) {
        popSound.rate(random(0.9, 1.1)); 
        popSound.play();
    }

    let pCount = PARTICLE_COUNT + floor(this.txt.length / 2);
    for (let i = 0; i < pCount; i++) {
      this.particles.push(new Particle(this.x, this.y));
    }
  }

  isFinished() {
    if (this.state !== "POP") return false;
    return this.particles.every(p => p.life <= 0);
  }
}

/* ========= Particle 类 (不动) ========= */
class Particle {
  constructor(x, y) {
    this.x = x + random(-20, 20); 
    this.y = y + random(-10, 10);
    let angle = random(TWO_PI);
    let speed = random(0.3, PARTICLE_SPEED);
    this.vx = cos(angle) * speed * random(0.5, 1.5);
    this.vy = sin(angle) * speed * random(0.5, 1.5);
    this.size = random(1, 3);
    this.life = PARTICLE_LIFE;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
  }

  display() {
    noStroke();
    fill(80, map(this.life, 0, PARTICLE_LIFE, 0, 180));
    ellipse(this.x, this.y, this.size);
  }
}