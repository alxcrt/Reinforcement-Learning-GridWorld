class GridWorld {
  constructor(rows, cols, res = 100) {
    // Define Grid Size
    this.cols = cols;
    this.rows = rows;
    this.res = res;
    this.grid = this.createGrid();
    this.copyGrid = this.createGrid();
    this.Q = this.createQTable();
    this.V = this.createVTable()
    this.state = null;
    this.epsilon = 1;
    this.gamma = 0.8;
    this.lr = 0.5;
    this.steps = 0
    // Define Action Space
    this.action = [
      createVector(0, 1),
      createVector(-1, 0),
      createVector(0, -1),
      createVector(1, 0)
    ];
    this.mouseInitState = null;
  }

  render() {
    for (let i = 0; i < this.cols; ++i) {
      for (let j = 0; j < this.rows; ++j) {
        let col,
          tag = this.grid[i][j].tag;

        rect(i * this.res, j * this.res, this.res, this.res);
        if (tag == "big_cheese") {
          image(big_cheese, i * this.res, j * this.res, this.res, this.res)
        } else if (tag == "poison") {
          image(poison, i * this.res, j * this.res, this.res, this.res)
        } else if (tag == "obstacle") {
          image(obstacle, i * this.res, j * this.res, this.res, this.res)
        } else if (tag == "mouse") {
          image(mouse, i * this.res, j * this.res, this.res, this.res)
        } else if (tag == "cheese") {
          image(cheese, i * this.res, j * this.res, this.res, this.res)
        } else if (tag == "blank") {
          textSize(this.res / 4);
          textAlign(CENTER, CENTER);
          let s = this.cols * this.grid[i][j].state.y + this.grid[i][j].state.x;
          text(this.V[s].toFixed(2), i * this.res + this.res / 2, j * this.res + this.res / 2);


          push()
          tint(255, 100);
          translate(i * this.res + this.res / 2, j * this.res + this.res / 2);
          let angle,
            action = this.argmax(this.Q, this.grid[i][j].state);

          // console.log(action);
          // console.log(this.action[action]);

          switch (action) {
            // DOWN
            case 0:
              angle = PI / 2;
              break;

            // LEFT
            case 1:
              angle = PI;
              break;

            // UP
            case 2:
              angle = -PI / 2;
              break;

            // RIGHT
            case 3:
              angle = 0;
              break;

            default:
              angle = 0;
              break;
          }



          rotate(angle);
          image(arrow, 0, 0, this.res / 2, this.res / 2)
          pop()

          // this.Arrow(i * this.res, j * this.res, res / 2);
        }


      }
    }
  }

  update_Q_table(reward, action, next_state = null) {
    let s = this.cols * this.state.y + this.state.x;
    let next_s = this.cols * next_state.y + next_state.x;

    let current = this.Q[s][action];
    let target;
    if (
      this.grid[next_state.x][next_state.y].tag == "poison" ||
      this.grid[next_state.x][next_state.y].tag == "big_cheese"
    ) {
      target = reward;
    } else {
      let best_action = this.argmax(this.Q, next_state);

      // console.log(this.V[])
      target = reward + this.gamma * this.Q[next_s][best_action];
    }


    this.V[s] = (reward + this.gamma * this.V[next_s]);
    this.Q[s][action] = (current + this.lr * (target - current));

    // console.log("current ", current);
    // console.log("target ", target);
  }

  epsilon_greedy() {
    if (Math.random() > this.epsilon) {
      let best_action = this.argmax(this.Q, this.state);
      return best_action;
    } else {
      let i = Math.floor(Math.random() * (3 + 1));
      // console.log("i= ", i);
      return i;
    }
  }

  step(action_index) {
    this.steps++;
    let next_state, reward, done;
    next_state = p5.Vector.add(this.state, this.action[action_index]);

    // Verify if we inside the world after taking the action
    if (
      next_state.x >= 0 &&
      next_state.x < this.cols &&
      next_state.y >= 0 &&
      next_state.y < this.rows
    ) {
      // console.log("next_state = ", next_state);
      // console.log("next_state tag ", this.grid[next_state.x][next_state.y].tag);
      // console.log(this.grid[next_state.x][next_state.y].tag);
      switch (this.grid[next_state.x][next_state.y].tag) {
        case "blank":
          done = false;
          reward = -0.05;
          this.grid[this.state.x][this.state.y].tag = "blank";
          this.grid[next_state.x][next_state.y].tag = "mouse";
          break;

        case "obstacle":
          done = false;
          reward = -0.05;
          this.grid[this.state.x][this.state.y].tag = "mouse";
          next_state = this.state;
          break;

        case "big_cheese":
          done = true;
          reward = 10;
          // this.grid[this.state.x][this.state.y].tag = "blank";
          // this.grid[next_state.x][next_state.y].tag = "mouse";
          break;

        case "poison":
          done = true;
          reward = -10;
          break;

        case "cheese":
          done = false;
          reward = 0.5;
          this.grid[this.state.x][this.state.y].tag = "blank";
          this.grid[next_state.x][next_state.y].tag = "mouse";
          break;
      }
    } else {
      done = false;
      reward = -0.05;
      // this.grid[this.state.x][this.state.y].tag = "mouse";
      next_state = this.state;
    }

    // if (this.steps > this.cols * this.rows) {
    //   done = true;
    //   reward = -25;
    //   this.steps = 0;
    // }

    // this.grid[this.state.x][this.state.y].tag = "blank";
    // this.grid[next_state.x][next_state.y].tag = "mouse";

    return [next_state, reward, done];
  }

  reset() {



    for (let i = 0; i < this.cols; ++i) {
      for (let j = 0; j < this.rows; ++j) {
        this.grid[i][j].tag = this.copyGrid[i][j].tag;
        if (this.copyGrid[i][j].tag == "mouse") {
          this.state = this.copyGrid[i][j].state;
        }
      }
    }



    return this.state;
  }

  createGrid() {
    let grid = [];
    for (let i = 0; i < this.cols; ++i) {
      grid[i] = [];
      for (let j = 0; j < this.rows; ++j) {
        let state = createVector(i, j);
        grid[i][j] = new Cell("blank", state);
      }
    }

    return grid;
  }

  createQTable() {
    let Q = [];
    // Create Q TABLE
    for (let i = 0; i < this.rows * this.cols; ++i) {
      Q[i] = [];
      for (let j = 0; j < 4; ++j) {
        Q[i][j] = 0;
      }
    }
    return Q;
  }

  createVTable() {
    let V = [];
    // Create Q TABLE
    for (let i = 0; i < this.rows * this.cols; ++i) {
      V[i] = 0;
    }
    return V;
  }

  argmax(Q, state) {
    let s = this.cols * state.y + state.x;
    let best_action = 0,
      bestQ = -9999999999;
    for (let j = 0; j < 4; ++j) {
      if (Q[s][j] > bestQ) {
        best_action = j;
        bestQ = Q[s][j];
      }
    }
    return best_action;
  }
}
