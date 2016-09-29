//http://www.gotoandplay.it/_articles/2005/08/advCharPhysics.php

// * understand for formular
// * how to apply force for initiate direction
// * how to apply constraints and dampping effect on constraints
// * implement rigid body things
// * implement soft body things

// * friction?

import React, { Component } from 'react';

class FreeFallEulerMethod extends Component {

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

    this.testSet = {
      acc: {
        x: 0,
        y: 10,
      },
      pt: -1,
      body: {
        points: [
          {
            prevPos: {
              x: canvas.width / 2,
              y: 0,
            },
            currPos: {
              x: canvas.width / 2,
              y: 0,
            },
            radius: 8,
            lineWidth: 2,
          },
          {
            prevPos: {
              x: canvas.width / 3,
              y: 0,
            },
            currPos: {
              x: canvas.width / 3,
              y: 0,
            },
            radius: 8,
            lineWidth: 2,
          },
        ],
      },
    };

    window.addEventListener('keydown', ({ key }) => {
      const { wind, vel, acc, body } = this.testSet;
      const { prevPos, currPos} = body.points[0];
      if (key == 'a') {
        prevPos.x = currPos.x + 3;
        prevPos.y = currPos.y + 10;
      }
      else if (key == 'd') {
        prevPos.x = currPos.x - 3;
        prevPos.y = currPos.y + 10;
      }
    });

    setTimeout(() => {
      requestAnimationFrame((time) => this.renderToCanvas(time));
    }, 2000);
  }

  update(dt) {
    const { pos, oldPos, wind, vel, acc, body } = this.testSet;
    const { points } = body;
    const { canvas } = this.refs;
    const { width, height, clientLeft, clientTop } = canvas;

    dt /= 100;
    const friction = 0.99;
    points.forEach((point) => {
      const { prevPos, currPos, radius, lineWidth } = point;
      const nx = currPos.x + (currPos.x - prevPos.x) * friction + acc.x * dt * dt;
      const ny = currPos.y + (currPos.y - prevPos.y) * friction + acc.y * dt * dt;

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

  }

  renderToCanvas(time) {
    const { ctx, canvas, testSet } = this;
    const { points } = testSet.body;

    if (testSet.pt == -1) {
      testSet.pt = time;
    }

    this.update(time - testSet.pt);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

export default FreeFallEulerMethod;
