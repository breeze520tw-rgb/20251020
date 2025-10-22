//學習7程式碼所在
//學習5程式碼所在
// 全域變數
let score = 0;
let popSound; // 用來儲存爆破音效
let soundEnabled = false; // 追蹤音效是否開啟
let soundButton; // 用來創建音效開關按鈕

// 【新增】音效按鈕隱藏後的計數器
let centerClickCount = 0;
// 【新增】設定中央點擊的有效範圍（中央 50x50 像素的區域）
const CENTER_TOLERANCE = 25; 

let circles = [];
const colors = ['#d8e2dc', '#ffffff', '#f4acb7', '#9d8189']; // 圓形可用的顏色
let bursts = [];

// 在 setup 之前載入音效
function preload() {
    // !!重要!!：請確保您的音效檔案 (pop.mp3) 存在於正確的路徑 (例如：專案中的 assets 資料夾)
    try {
        popSound = loadSound('assets/pop.mp3'); 
    } catch (e) {
        console.error("音效載入失敗，將無法播放聲音。請檢查檔案路徑。", e);
        popSound = null; 
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    background('#ffcad4');

    for (let i = 0; i < 40; i++) {
        circles.push(new Circle());
    }

    // 創建音效開關按鈕
    soundButton = createButton('點此啟用音效 (啟用後自動隱藏)');
    // 樣式設定
    soundButton.style('background-color', '#9a8c98');
    soundButton.style('color', 'white');
    soundButton.style('border', 'none');
    soundButton.style('padding', '10px 20px');
    soundButton.style('font-size', '16px');
    
    // 定位在視窗正中央
    soundButton.position(width / 2, height / 2);
    soundButton.center(); 
    
    soundButton.mousePressed(toggleSound);
}

function draw() {
    background('#ffcad4');

    for (let circle of circles) {
        circle.update();
        circle.display();
    }

    for (let i = bursts.length - 1; i >= 0; i--) {
        bursts[i].update();
        bursts[i].display();
        if (bursts[i].isDead()) {
            bursts.splice(i, 1);
        }
    }
    
    // 顯示文字和分數
    fill('#9a8c98'); // 設定文字顏色為 9a8c98
    textSize(32); // 設定文字大小為 32PX

    // 1. 左上角上方文字
    textAlign(LEFT, TOP);
    text("414730183", 20, 20); // 距離左邊和頂部 20px

    // 2. 右上角得分
    textAlign(RIGHT, TOP);
    text("得分: " + score, width - 20, 20); // 距離右邊和頂部 20px
}

// 滑鼠點擊事件處理
function mousePressed() {
    // 1. 氣球爆破檢查
    let clickedBalloon = false;
    for (let i = circles.length - 1; i >= 0; i--) {
        if (circles[i].checkClick()) {
            clickedBalloon = true;
            break;
        }
    }
    
  // 2. 解決瀏覽器音效限制：首次點擊時嘗試解鎖音頻上下文
  if (popSound && typeof popSound.isLoaded === 'function' && !popSound.isLoaded()) {
    try { userStartAudio(); } catch(e){}
  }

    // 3. 【新增】隱藏按鈕的再顯示邏輯
    // 只有在音效啟用中且按鈕被隱藏時才檢查
    if (soundEnabled && soundButton && !soundButton.elt.offsetParent) {
        
        let centerX = width / 2;
        let centerY = height / 2;
        let tolerance = CENTER_TOLERANCE;
        
        // 檢查點擊是否在中心區域
        if (mouseX > centerX - tolerance && 
            mouseX < centerX + tolerance && 
            mouseY > centerY - tolerance && 
            mouseY < centerY + tolerance) {
            
            centerClickCount++;
            
            if (centerClickCount >= 5) {
                // 連續點擊 5 次，重新顯示按鈕
                soundButton.show();
                soundButton.html('音效已啟用 (點擊關閉)');
                centerClickCount = 0; // 重設計數器
            }
        } else {
            // 點擊不在中心區域，重設連續計數器
            centerClickCount = 0;
        }
    }
}

// 【新增】音效開關函數
function toggleSound() {
    soundEnabled = !soundEnabled; // 切換狀態
    
    if (soundEnabled) {
        // 音效啟用，隱藏按鈕
        soundButton.html('音效已啟用');
        soundButton.hide(); 
        centerClickCount = 0; 
    } else {
        // 音效禁用，顯示按鈕並更新文字 (此情況只會在按鈕重新顯示後發生)
        soundButton.html('音效已禁用 (點此啟用)');
    }
    
    try { userStartAudio(); } catch(e){}
}

// 當視窗大小改變時，重新調整畫布大小並移動按鈕
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    background('#ffcad4');
    // 將按鈕重新置於中央
    if (soundButton) soundButton.center(); 
}

// 定義一個 Circle 類別來管理每個圓形的屬性
class Circle {
  constructor() {
    this.reset();
  }

  // 設定或重設圓形的初始屬性
  reset() {
    // 隨機選擇一個顏色
    this.color = random(colors);
    
    // 隨機設定大小 (直徑)
    this.diameter = random(50, 200);
    
    // 圓形從畫布底部開始
    this.x = random(width);
    this.y = height + this.diameter / 2; 
    
    // 隨機設定向上漂浮的速度 (速度越快，值越大)
    this.speed = random(0.5, 3); 
    
    // 隨機設定透明度 (0 到 255)
    this.alpha = random(80, 200);
  }

  // 更新圓形的位置
  update() {
    this.y -= this.speed; // 向上移動

    // 【已移除】隨機爆破觸發邏輯

    // 如果圓形完全漂浮到畫布頂部上方，就將其重設到畫布底部
    if (this.y < -this.diameter / 2) {
      this.reset();
      // 為了讓它們在畫布底部有隨機的起始位置，
      // 我們重新設定 x 座標，但保留其他屬性。
      this.x = random(width);
      this.y = height + this.diameter / 2;
    }
  }
    
  // 【新增】檢查滑鼠點擊是否在氣球內，並處理得分與爆破
  checkClick() {
    // 計算滑鼠與圓心之間的距離
    let distance = dist(this.x, this.y, mouseX, mouseY);

    // 如果距離小於半徑，表示點擊在氣球內
    if (distance < this.diameter / 2) {
      
      // 處理得分邏輯
      if (this.color === '#f4acb7') {
        score += 1; // 顏色 f4acb7：加一分
      } else {
        score -= 1; // 其他顏色：扣一分
      }

      // 執行爆破效果
      this.explode();

      // 重設氣球到畫布底部
      this.reset();
      this.x = random(width);
      this.y = height + this.diameter / 2;

      return true; // 返回 true 表示點擊成功，讓 mousePressed 停止迭代
    }
    return false;
  }

  // 爆裂：生成多個爆破粒子
  explode() {
  // !!若您已載入音效並開啟音效，則播放音效!!
  if (soundEnabled && popSound) { try { popSound.play(); } catch (e) {} }

    // 粒子數量與圓大小相關
    let count = floor(random(12, 28));
    for (let i = 0; i < count; i++) {
      let angle = random(TWO_PI);
      // 粒子速度依直徑而定（大氣球碎片飛更遠）
      let speed = random(1, map(this.diameter, 50, 200, 2, 6));
      let vx = cos(angle) * speed;
      let vy = sin(angle) * speed;
      bursts.push(new BurstParticle(this.x, this.y, vx, vy, this.color, this.alpha));
    }
  }

  // 繪製圓形
  display() {
    noStroke(); // 無邊框
    
    // 為了使用透明度，我們需要將顏色轉換為 p5.js 的 color() 物件
    let c = color(this.color);
    c.setAlpha(this.alpha); // 設定透明度
    fill(c);
    
    // 繪製圓形
    ellipse(this.x, this.y, this.diameter, this.diameter);

    // 在圓右上方繪製白色透明方形 (保持不變)
    let squareSize = this.diameter / 7;
    let offset = (this.diameter / 2) - (squareSize / 2);
    let safeOffset = offset - squareSize / 4;
    let squareX = this.x + safeOffset * cos(PI / 4);
    let squareY = this.y - safeOffset * sin(PI / 4);

    let squareColor = color(255, 255, 255, 120); // 120為透明度
    fill(squareColor);
    noStroke();
    rectMode(CENTER);
    rect(squareX, squareY, squareSize, squareSize);
  }
}

// 爆破粒子類別 (保持不變)
class BurstParticle {
  constructor(x, y, vx, vy, col, baseAlpha) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.col = col;
    this.baseAlpha = baseAlpha || 200;
    this.lifespan = 255;
    this.size = random(3, 8);
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    // 微小重力與摩擦
    this.vy += 0.06;
    this.vx *= 0.99;
    this.vy *= 0.995;
    this.lifespan -= 6; // 漸隱速度
  }

  display() {
    noStroke();
    let c = color(this.col);
    // 根據剩餘壽命調整透明度
    let a = (this.lifespan / 255) * this.baseAlpha;
    c.setAlpha(max(0, a));
    fill(c);
    ellipse(this.x, this.y, this.size, this.size);
  }

  isDead() {
    return this.lifespan <= 0 || this.y > height + 50;
  }
}
