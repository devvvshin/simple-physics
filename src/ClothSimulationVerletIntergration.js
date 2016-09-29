//http://www.gotoandplay.it/_articles/2005/08/advCharPhysics.php

// * understand for formular
// * how to apply force for initiate direction
// * how to apply constraints and dampping effect on constraints
// * implement rigid body things
// * implement soft body things

// * friction?

// http://www.futuredatalab.com/blobfamily/
// http://cowboyprogramming.com/2007/01/05/blob-physics/

import React, { Component } from 'react';

class ClothSimulationVerletIntergration extends Component {

  componentDidMount() {
    const { canvas } = this.refs;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth * 0.92;
    canvas.height = window.innerHeight * 0.92
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth * 0.92
      canvas.height = window.innerHeight * 0.92
    });

    this.canvas = canvas;

    this.ctx = ctx;

    const starMeta = this.genStarMeta();
    const clothMeta = this.genClothMeta();

    this.testSet = {
      gravity: {
        x: 0,
        y: 10,
      },
      body: {
        points: clothMeta.points,
        constraints: clothMeta.constraints,
      },
      pt: -1,
    };

    let selected = false;
    canvas.onmousedown = (e) => {
      const rect = canvas.getBoundingClientRect();
      let mx = (e.clientX - rect.left);
      let my = (e.clientY - rect.top);

      const { gravity, body } = this.testSet;
      const { points } = body;

      points.forEach(({ currPos, prevPos, radius, lineWidth, pin }, i) => {
        const px = currPos.x + rect.left;
        const py = currPos.y + rect.top;

        const dx = Math.abs(mx - px);
        const dy = Math.abs(my - py);

        if (!pin && ((radius + lineWidth) * 2 > dx) && ((radius + lineWidth) * 2 > dy)) {
          selected = true;

          canvas.onmousemove = (e) => {
            mx = (e.clientX - rect.left);
            my = (e.clientY - rect.top);
            if (selected) {
              prevPos.x = currPos.x;
              prevPos.y = currPos.y;

              currPos.x = mx;
              currPos.y = my;
            }
          };

          canvas.onmouseup = (e) => {
            mx = (e.clientX - rect.left);
            my = (e.clientY - rect.top);

            prevPos.x = currPos.x;
            prevPos.y = currPos.y;

            currPos.x = mx;
            currPos.y = my;

            selected = false;
          };
        }
      });
    };

    window.addEventListener('keydown', ({ key }) => {
      const { gravity, body } = this.testSet;
      const { points } = body;

      points.forEach(({ prevPos, currPos }) => {
        if (key == 'a') {
          prevPos.x = currPos.x + 10;
        } else if (key == 'd') {
          prevPos.x = currPos.x - 10;
        } else if (key == 's') {
          prevPos.y = currPos.y - 10;
        } else if (key == 'w') {
          prevPos.y = currPos.y + 10;
        }
      });

      if (key == 'v') {
        for (let i = 10; i < 30; i++) {
          for (let j = 0; j < 10; j++) {
            points[26 * i + j].prevPos.x = points[26 * i + j].currPos.x + 10;
            points[26 * i + j].prevPos.y = points[26 * i + j].currPos.y + 10;
          }
        }
      }

    });

    setTimeout(() => {
      requestAnimationFrame((time) => this.renderToCanvas(time));
    }, 2000);
  }

  genStarMeta() {
    const pointsMeta = [[0, 0], [0, 100], [100, 100], [100, 0], [-25 + 50, 50], [50, -25 + 50], [25 + 50, 50], [50, 25 + 50]];

    const points = pointsMeta.map((p, i) => {
      return {
        prevPos: {
          x: p[0],
          y: p[1],
        },
        currPos: {
          x: p[0],
          y: p[1],
        },
        radius: 4,
        lineWidth: 2,
      }
    });

    const constraints = points.reduce((res, p, i, points) => {
      const baseIdx = i;
      i++;
      for (i; i < points.length; i++) {
        if (baseIdx == 0 && i == 1) continue;
        if (baseIdx == 0 && i == 3) continue;
        if (baseIdx == 1 && i == 2) continue;
        if (baseIdx == 2 && i == 3) continue;

        res.push({
          len: this.distance(points[baseIdx].currPos, points[i].currPos),
          link: [baseIdx, i],
        });
      }

      return res;
    }, []);

    return {
      points,
      constraints,
    };
  }

  distance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) * (p1.x - p2.x)  + (p1.y - p2.y) * (p1.y - p2.y));
  }

  genClothMeta() {
    const { canvas } = this.refs;
    const rCnt = 26;
    const cCnt = 40;
    const edgeLen = 30;
    const initPos = { x: (canvas.width - cCnt * edgeLen) / 2, y: 10 };

    const pointsMeta = [];

    Array.from(new Array(rCnt * cCnt)).forEach((t, i) => {
      const p = [];
      const c = i % cCnt;
      const r = Math.floor(i / cCnt);

      p[0] = initPos.x + c * edgeLen;
      p[1] = initPos.y + r * edgeLen;
      p[2] = (r == 0); //pin

      pointsMeta.push(p);
    });

    const points = pointsMeta.map((p, i) => {
      return {
        prevPos: {
          x: p[0],
          y: p[1],
        },
        currPos: {
          x: p[0],
          y: p[1],
        },
        radius: 0.1,
        lineWidth: 0.2,
        pin: p[2],
      };
    });

    const constraints = points.reduce((res, p, i, points) => {
      const c = i % cCnt;
      const r = Math.floor(i / cCnt);

      if (c < cCnt - 1) {
        const cp = points[i];
        const rp = points[i + 1];
        res.push({
          len: this.distance(cp.currPos, rp.currPos),
          link: [i, i + 1],
          elasticity: 0.5,
        });
      }

      if (r < rCnt - 1) {
        const cp = points[i];
        const rp = points[i + cCnt];
        res.push({
          len: this.distance(cp.currPos, rp.currPos),
          link: [i, i + cCnt],
          elasticity: 0.5,
        });
      }

      return res;
    }, []);

    return {
      points,
      constraints,
    };
  }

  update(dt) {
    const { pos, oldPos, wind, vel, gravity, body } = this.testSet;
    const { points, constraints } = body;
    const { canvas } = this.refs;
    const { width, height, clientLeft, clientTop } = canvas;

    dt /= 100;
    const friction = 0.99;
    points.forEach((point) => {
      const { prevPos, currPos, radius, lineWidth, pin } = point;
      if (pin) {
        return;
      }

      const nx = currPos.x + (currPos.x - prevPos.x) * friction + gravity.x * dt * dt;
      const ny = currPos.y + (currPos.y - prevPos.y) * friction + gravity.y * dt * dt;

      //check bound
      const ballRadius = radius + lineWidth;
      const bounds = {
        left: clientLeft + ballRadius,
        right: clientLeft + width - ballRadius,
        top: clientTop,
        bottom: clientTop + height - ballRadius,
      };

      if (nx >= bounds.right) {
        const dx = (nx - currPos.x);
        currPos.x = bounds.right;
        prevPos.x = currPos.x + dx * 0.7;
      } else if (nx <= bounds.left) {
        const dx = (nx - currPos.x);
        currPos.x = bounds.left;
        prevPos.x = currPos.x + dx * 0.7;
      } else {
        prevPos.x = currPos.x;
        currPos.x = nx;
      }

      if (ny >= bounds.bottom) {
        const dy = (ny - currPos.y);
        currPos.y = bounds.bottom;
        prevPos.y = currPos.y + dy * 0.7;
      } else {
        prevPos.y = currPos.y;
        currPos.y = ny;
      }

    });

    //constraints
    for (let i = 0; i < 10; i++) {
      constraints.forEach(({ link, len, elasticity }) => {
        const p1 = points[link[0]].currPos;
        const p2 = points[link[1]].currPos;

        const dp = {
          x: p1.x - p2.x,
          y: p1.y - p2.y,
        };

        let deltaLen = this.distance(p1, p2);

        let diff = (len - deltaLen) / deltaLen;

        if (points[link[0]].pin) {
          p2.x -= dp.x * diff;
          p2.y -= dp.y * diff;
        } else {
          p1.x += dp.x * elasticity * diff;
          p1.y += dp.y * elasticity * diff;

          p2.x -= dp.x * elasticity * diff;
          p2.y -= dp.y * elasticity * diff;
        }
      });
    }
  }

  renderToCanvas(time) {
    const { ctx, canvas, testSet } = this;
    const { points, constraints } = testSet.body;

    if (testSet.pt == -1) {
      testSet.pt = time;
    }

    this.update(time - testSet.pt);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    constraints.forEach(({ link }) => {
      const fromIdx = link[0];
      const toIdx = link[1];
      ctx.beginPath();
      ctx.moveTo(points[fromIdx].currPos.x, points[fromIdx].currPos.y);
      ctx.lineTo(points[toIdx].currPos.x, points[toIdx].currPos.y);
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#000';
      ctx.stroke();
    });

    points.forEach(({ currPos, radius, lineWidth }) => {
      ctx.beginPath();
      ctx.arc(currPos.x, currPos.y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'green';
      ctx.fill();
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = '#003300';
      ctx.stroke();
    });

    testSet.pt = time;

    requestAnimationFrame((t) => this.renderToCanvas(t));
  }

  render() {

    return (
      <div ref='layout'>
        <canvas ref='canvas' />
      </div>
    )
  }
}

export default ClothSimulationVerletIntergration;
