let res = 100,
  rows = 5,
  cols = 5;

let env;

let cellType, trainBTN;

let ok = false;
let state,
  t = 0;
let slider, fps;

let mice, cheese, big_cheese, poison, obstacle, arrow;

function preload() {
  mouse = loadImage('assets/mice.png');
  cheese = loadImage('assets/cheese.png');
  big_cheese = loadImage('assets/big_cheese.png');
  poison = loadImage('assets/poison.png');
  obstacle = loadImage('assets/obstacle.png');
  arrow = loadImage('assets/arrow.png');
}

function setup() {
  createCanvas(res * cols + 1, res * rows + 1);
  env = new GridWorld(rows, cols, res);
  env.render();



  fps = createSlider(1, 60, 1);
  trainBTN = createButton("TRAIN");
  trainBTN.mousePressed(() => {
    ok = true;
    let state = env.reset();
  });

  cellType = createSelect();
  cellType.option("big_cheese");
  cellType.option("obstacle");
  cellType.option("poison");
  cellType.option("blank");
  cellType.option("mouse");
  cellType.option("cheese");
}

function draw() {
  frameRate(fps.value());
  if (ok) {
    if (fps.value() < 50) {
      env.render();
    }

    action = env.epsilon_greedy();
    // console.log("init state", env.state)
    // console.log("action", env.action[action]);
    let [next_state, reward, done] = env.step(action);


    // console.log("next state ", next_state);
    // env.grid[(state.x, state.y)].q;

    env.update_Q_table(reward, action, next_state);

    if (!done)
      env.state = next_state;
    ++t;
    if (done) {
      // console.log("new ep");
      state = env.reset();
      // env.render();
      t = 0;
      env.epsilon = max(0.1, env.epsilon * 0.9);
    }

  }

}


function mousePressed() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    let x = floor(mouseX / res);
    let y = floor(mouseY / res);

    for (let i = 0; i < cols; ++i) {
      for (let j = 0; j < rows; ++j) {
        env.copyGrid[x][y].tag = cellType.value();
        env.grid[x][y].tag = cellType.value();
        if (cellType.value() == "mouse") {
          env.mouseInitState = createVector(x, y);
        }
      }
    }
    env.render();
  }
}
