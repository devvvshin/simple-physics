//http://www.gotoandplay.it/_articles/2005/08/advCharPhysics.php

import React, { Component } from 'react';

class FreeFallVerletIntergration extends Component {

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
      vel: [1, 0],
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
    const { pos, wind, vel, acc, ball } = this.testSet;
    const { canvas } = this.refs;
    const { width, height, clientLeft, clientTop } = canvas;

    dt /= 100;

    // Euler method : https://ko.wikipedia.org/wiki/%EC%98%A4%EC%9D%BC%EB%9F%AC_%EB%B0%A9%EB%B2%95
    // Taylor series : https://ko.wikipedia.org/wiki/%ED%85%8C%EC%9D%BC%EB%9F%AC_%EA%B8%89%EC%88%98

    // a : acceleration
    // v₁ : previous-velocity
    // v₂ : current-velocity
    // d₁ : previous-distance
    // d₂ : current-distance
    // dt : delta-time, time between previous-velocity and current-velocity

    // a = (v₁ - v₂) / dt
    // v₂ = a * dt + v₁
    // d₂ = d₁ + v₂ * dt

    vel[0] += acc[0] * dt;
    vel[1] += acc[1] * dt;

    pos[0] += vel[0] * dt;
    pos[1] += vel[1] * dt;

    //check bound
    const ballRadius = ball.radius + ball.lineWidth;
    const bounds = {
      left: clientLeft + ballRadius,
      right: clientLeft + width - ballRadius,
      top: clientTop + ballRadius,
      bottom: clientTop + height - ballRadius,
    }
    if (pos[1] >= bounds.bottom) {
      pos[1] = bounds.bottom;
      vel[1] *= -0.7;
    }
    if (pos[0] >= bounds.right) {
      pos[0] = bounds.right;
      vel[0] *= -0.7;
    }
    if (pos[0] <= bounds.left) {
      pos[0] = bounds.left;
      vel[0] *= -0.7;
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

export default FreeFallVerletIntergration;
