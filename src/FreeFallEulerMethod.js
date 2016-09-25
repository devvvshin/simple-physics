//http://www.gotoandplay.it/_articles/2005/08/advCharPhysics.php

// * understand for formular
// * how to apply force for initiate direction
// * how to apply constraints and dampping effect on constraints
// * implement rigid body things
// * implement soft body things

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
    })
    this.canvas = canvas;

    this.ctx = ctx;

    this.testSet = {
      pos: [canvas.width / 2, 0],
      oldPos: [canvas.width / 2, 0],
      acc: [0, 10],
      pt: -1,
      ball: {
        radius: 16,
        lineWidth: 2,
      }
    }

    setTimeout(() => {
      requestAnimationFrame((time) => this.renderToCanvas(time));
    }, 2000);
  }

  update(dt) {
    const { pos, oldPos, wind, vel, acc, ball } = this.testSet;
    const { canvas } = this.refs;
    const { width, height, clientLeft, clientTop } = canvas;

    dt /= 100;

    const newPos = [];
    newPos[0] = 2 * pos[0] - oldPos[0] + acc[0] * dt * dt;
    newPos[1] = 2 * pos[1] - oldPos[1] + acc[1] * dt * dt;

    //check bound
    const ballRadius = ball.radius + ball.lineWidth;
    const bounds = {
      left: clientLeft + ballRadius,
      right: clientLeft + width - ballRadius,
      top: clientTop + ballRadius,
      bottom: clientTop + height - ballRadius,
    }

    const xPosGap = newPos[0] - pos[0];
    const yPosGap = newPos[1] - pos[1];

    if (Math.abs(yPosGap) < 1. && Math.abs(newPos[1] - bounds.bottom) < 2.) {
      pos[1] = oldPos[1] = bounds.bottom;
    }
    else if (newPos[1] >= bounds.bottom) {
      pos[1] = bounds.bottom - (newPos[1] - bounds.bottom ) * 0.7;
      oldPos[1] = pos[1] + yPosGap * 0.7;
    }
    else {
      oldPos[1] = pos[1];
      pos[1] = newPos[1];
    }

    if (newPos[0] >= bounds.right) {
      pos[0] = bounds.right - (newPos[0] - bounds.right ) * 0.7;
      oldPos[0] = pos[0] + xPosGap * 0.7;
    }
    else if (newPos[0] <= bounds.left) {
      pos[0] = bounds.left - (newPos[0] - bounds.left ) * 0.7;
      oldPos[0] = pos[0] + xPosGap * 0.7;
    }
    else {
      oldPos[0] = pos[0];
      pos[0] = newPos[0];
    }

  }

  renderToCanvas(time) {
    const { ctx, canvas, testSet } = this;
    const { pos, ball } = testSet;

    if (testSet.pt == -1) {
      testSet.pt = time;
    }

    this.update(time - testSet.pt);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(pos[0], pos[1], ball.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.lineWidth = ball.lineWidth;
    ctx.strokeStyle = '#003300';
    ctx.stroke();

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
