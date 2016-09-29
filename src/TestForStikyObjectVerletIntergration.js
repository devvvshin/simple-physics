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

class BodySimulationVerletIntergration extends Component {

  componentDidMount() {
    const { canvas } = this.refs;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth / 2;
    canvas.height = window.innerHeight / 2;
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth / 2;
      canvas.height = window.innerHeight / 2;
    });

    this.canvas = canvas;

    this.ctx = ctx;

    const starMeta = this.genStarMeta();
    const blobMeta = this.genBlobMeta();

    this.testSet = {
      gravity: {
        x: 0,
        y: 5,
      },
      body: {
        points: blobMeta.points,
        constraints: blobMeta.constraints,
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

      points.forEach(({ currPos, prevPos, radius, lineWidth }, i) => {
        const px = currPos.x + rect.left;
        const py = currPos.y + rect.top;

        const dx = Math.abs(mx - px);
        const dy = Math.abs(my - py);

        if (((radius + lineWidth) * 2 > dx) && ((radius + lineWidth) * 2 > dy)) {
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

  genBlobMeta() {
    const { canvas } = this.refs;
    const radius = 50;
    const innerRadius = radius * 0.8;
    const center = { x: canvas.width / 2 - radius / 2, y: canvas.height / 2 - radius / 2 };
    const steps = 20;

    const pointsMeta = [];

    Array.from(new Array(steps * 2)).forEach((t, i) => {
      const p = [];
      const r = (i < steps) ? radius : innerRadius;
      p.push(center.x + r * Math.cos(2 * Math.PI * i / steps));
      p.push(center.y + r * Math.sin(2 * Math.PI * i / steps));
      pointsMeta.push(p);
    });

    //last point (center)
    pointsMeta.push([center.x, center.y]);

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

      if (i == points.length - 1) return res;

      if (i < steps) { //for outer point

        //outer point connect with its neighbors, diagonal and symmetrical inner point.
        if (baseIdx == steps - 1) {  //outer last point

          const symmetricalInnerIdx = steps + baseIdx;
          res.push({  //symmetrical inner point
            len: this.distance(points[baseIdx].currPos, points[symmetricalInnerIdx].currPos),
            link: [baseIdx, symmetricalInnerIdx],
            elasticity: 0.5,
          });

          const diagonalInnerIdx = steps + 0;
          res.push({  //diagonal inner point
            len: this.distance(points[baseIdx].currPos, points[diagonalInnerIdx].currPos),
            link: [baseIdx, diagonalInnerIdx],
            elasticity: 0.5,
          });

          res.push({  //neighbor
            len: this.distance(points[baseIdx].currPos, points[0].currPos),
            link: [baseIdx, 0],
            elasticity: 0.5,
          });
        } else {

          const symmetricalInnerIdx = steps + baseIdx;
          res.push({  //symmetrical inner point
            len: this.distance(points[baseIdx].currPos, points[symmetricalInnerIdx].currPos),
            link: [baseIdx, symmetricalInnerIdx],
            elasticity: 0.5,
          });

          const diagonalInnerIdx = steps + baseIdx + 1;
          res.push({  //diagonal inner point
            len: this.distance(points[baseIdx].currPos, points[diagonalInnerIdx].currPos),
            link: [baseIdx, diagonalInnerIdx],
            elasticity: 0.5,
          });

          res.push({  //neighbor
            len: this.distance(points[baseIdx].currPos, points[baseIdx + 1].currPos),
            link: [baseIdx, baseIdx + 1],
            elasticity: 0.5,
          });
        }
      } else { //for inner point
        //inner point connect with center
        const centerIdx = points.length - 1;
        res.push({
          len: this.distance(points[baseIdx].currPos, points[centerIdx].currPos),
          link: [baseIdx, centerIdx],
          elasticity: 0.02,
        });

        //inner point connect with its neighbors
        if (baseIdx == points.length - 2) {  //last
          res.push({
            len: this.distance(points[baseIdx].currPos, points[steps].currPos),
            link: [baseIdx, steps],
            elasticity: 0.5,
          });
        } else {
          res.push({
            len: this.distance(points[baseIdx].currPos, points[baseIdx + 1].currPos),
            link: [baseIdx, baseIdx + 1],
            elasticity: 0.5,
          });
        }
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
      const { prevPos, currPos, radius, lineWidth } = point;
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
    for(let i = 0 ; i < 10; i++) {
      constraints.forEach(({ link, len, elasticity }) => {
        const p1 = points[link[0]].currPos;
        const p2 = points[link[1]].currPos;
        const dp = {
          x: p1.x - p2.x,
          y: p1.y - p2.y,
        };

        let deltaLen = this.distance(p1, p2);

        const diff = (len - deltaLen) / deltaLen;

        if (Math.abs(diff) < 1) {
          p1.x += dp.x * elasticity * diff;
          p1.y += dp.y * elasticity * diff;

          p2.x -= dp.x * elasticity * diff;
          p2.y -= dp.y * elasticity * diff;
        } else {
          p1.x = points[link[0]].prevPos.x;
          p1.y = points[link[0]].prevPos.y;

          p2.x = points[link[1]].prevPos.x;
          p2.y = points[link[1]].prevPos.y;
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

export default BodySimulationVerletIntergration;
