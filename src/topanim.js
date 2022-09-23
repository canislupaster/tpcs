//writing IDIOMATIC js with ES6 MODULES!!! hype!

import frag from "./frag.glsl";
import vert from "./vert.glsl";

function topAnim() {
  let obj = {
    elems: [0,1,2,1,2,3],
    pts: [{y: 1, t:0, i:0}, {y: 0, t:0, i:1}, {y: 1, t: -1, i:2}, {y: 0, t:-1, i:0}],
  
    spawn_n: 0, spawned: 0, lifetime: 10000, pts_lim: 1000,
  
    minline_t: 0,
    line: [0,1],

    canvas_w: 1080,
    enabled: false,

    fps: null,
    first_t: null,
    prev_t: null,

    render: (t) => {
      if (!this.first_t) {
        this.first_t = t; this.prev_t=t;

        requestAnimationFrame(render);
        return;
      }

      if (!this.fps) this.fps = 1000/(t-this.prev_t);
      else this.fps = 0.5*this.fps + 500/(t-this.prev_t)

      let tnorm = (t-this.first_t)/this.lifetime;
      let update = false;

      for (let ei=0; ei<this.elems.length; ei+=3) {
        if (tnorm>this.pts[this.elems[ei]].t+1 && tnorm>this.pts[this.elems[ei+1]].t+1 && tnorm>this.pts[this.elems[ei+2]].t+1) { //TODO: cache the next expiring triangle
          this.elems.splice(ei,3);
          ei -= 3;
          update=true;
        }
      }

      while (tnorm > this.pts[0].t + 1) {
        if (this.elems.includes(0) || this.line.includes(0)) break;

        this.pts.shift();
        for (let i in this.elems) this.elems[i]--;
        for (let i in this.line) this.line[i]--;

        update=true;
      }

      for (; this.spawned < tnorm * this.spawn_n && this.pts.length<this.pts_lim; this.spawned++) {
        let line_i = 1;
        let insy = Math.random();
        while (insy==0 || insy==1) insy = Math.random();

        for (; line_i<this.line.length; line_i++) {
          if (this.pts[this.line[line_i]].y<insy) break;
        }

        this.pts.push({t: tnorm+Math.random(), y: insy, i: (this.pts[this.line[line_i]].i+1)^(this.pts[this.line[line_i-1]].i+1)-1});
        this.line.splice(line_i,0,this.pts.length-1);
        if (this.pts[this.pts.length-1].t<minline_t) minline_t=this.pts[this.pts.length-1].t;
        this.elems.push(this.pts.length-1, this.line[line_i+1], this.line[line_i-1]);

        update=true;
      }

      if (fps>60) {
        this.spawn_n++;
        this.spawned += tnorm;
      } else if (fps<60) {
        this.spawn_n--;
        this.spawned -= tnorm;
      }

      while (tnorm>=this.minline_t) {
        let new_minline_t = Infinity;
        for (let line_i=0; line_i<this.line.length; line_i++) {
          if (this.pts[this.line[line_i]].t<=this.minline_t) {
            if (line_i>0 && line_i<this.line.length-1) {
              this.elems.push(this.line[line_i-1], this.line[line_i], this.line[line_i+1]);
              this.line.splice(line_i,1);
              line_i--;
            } else if (line_i==0) {
              this.pts.push({t: tnorm+1+Math.random(), y: 1, i:(this.pts[this.line[line_i+1]].i+1)^(this.pts[this.line[line_i]].i+1)-1});
              this.elems.push(this.pts.length-1, this.line[line_i], this.line[line_i+1]);
              this.line[line_i] = this.pts.length-1;
            } else if (line_i==this.line.length-1) {
              this.pts.push({t: tnorm+1+Math.random(), y: 0, i:(this.pts[this.line[line_i]].i+1)^(this.pts[this.line[line_i-1]].i+1)-1});
              this.elems.push(this.pts.length-1, this.line[line_i], this.line[line_i-1]);
              this.line[line_i] = this.pts.length-1;
            }
          }

          if (this.pts[this.line[line_i]].t<new_minline_t) {
            new_minline_t = this.pts[this.line[line_i]].t;
          }
        }

        this.minline_t = new_minline_t;
        update=true;
      }

      let min = this.pts[this.line[0]].t;
      for (let line_i=1; line_i<this.line.length; line_i++) {
        if (this.pts[this.line[line_i]].t<min) {
          min = this.pts[this.line[line_i]].t;
        }
      }

      if (update) {
        // this.gl.bindBuffer(this.gl.ARRAY_BUFFER, ybuf);
        // this.gl.bufferData(this.gl.ARRAY_BUFFER, Float32Array.from(pts.map((pt) => pt.y)), this.gl.DYNAMIC_DRAW);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.tbuf);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, Float32Array.from(this.pts.flatMap((pt) => [pt.y,pt.t,pt.i,0])), this.gl.DYNAMIC_DRAW);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.elembuf);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, Uint32Array.from(this.elems), this.gl.DYNAMIC_DRAW);
      }

      this.gl.uniform1f(tuniform, tnorm);

      // this.gl.bindVertexArray(vao);
      this.gl.drawElements(this.gl.TRIANGLES, this.elems.length, this.gl.UNSIGNED_INT, 0);

      this.prev_t=this.t;
      if (!this.enabled) requestAnimationFrame(this.render);
    },

    //MDN boilerplate...
    loadShader: (gl, type, source) => {
      const shader = gl.createShader(type);

      gl.shaderSource(shader, source);

      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    },

    initShaderProgram: (gl, vsSource, fsSource) => {
      const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vsSource);
      const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

      const shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);

      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
        return null;
      }

      return shaderProgram;
    },

    enable: () => {
      this.enabled=true;
      this.first_t = null;
      requestAnimationFrame(this.render);
    },

    disable: () => {
      this.enabled=false;
    }
  };

  window.onload = () => {
    const canvas = document.querySelector("#bg");
    obj.gl = canvas.getContext("webgl2");

    if (obj.gl === null) return;

    new ResizeObserver(() => {
      canvas.height = canvas.clientHeight;
      canvas.width = canvas.clientWidth;
      obj.gl.viewport(0,0,canvas.clientWidth,canvas.clientHeight);
    }).observe(canvas);

    obj.gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Clear the color buffer with specified clear color
    obj.gl.clear(obj.gl.COLOR_BUFFER_BIT);

    const shaderProgram = obj.initShaderProgram(obj.gl, vert, frag);

    // vao = gl.createVertexArray();
    // gl.bindVertexArray(vao);

    // ybuf = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, ybuf);
    // gl.bufferData(gl.ARRAY_BUFFER, null, gl.DYNAMIC_DRAW);

    // let yattrib = gl.getAttribLocation(shaderProgram, "y");
    // gl.bindBuffer(gl.ARRAY_BUFFER, ybuf);
    // gl.vertexAttribPointer(yattrib,1,gl.FLOAT,false,0,0);
    // gl.enableVertexAttribArray(yattrib);

    obj.tbuf = obj.gl.createBuffer();
    obj.gl.bindBuffer(obj.gl.ARRAY_BUFFER, obj.tbuf);
    obj.gl.bufferData(obj.gl.ARRAY_BUFFER, new Float32Array(), obj.gl.DYNAMIC_DRAW);

    let tattrib = obj.gl.getAttribLocation(shaderProgram, "data");
    obj.gl.bindBuffer(obj.gl.ARRAY_BUFFER, obj.tbuf);
    obj.gl.vertexAttribPointer(tattrib,4,obj.gl.FLOAT,false,0,0);
    obj.gl.enableVertexAttribArray(tattrib);

    elembuf = obj.gl.createBuffer();
    obj.gl.bindBuffer(obj.gl.ELEMENT_ARRAY_BUFFER, obj.elembuf);
    obj.gl.bufferData(obj.gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(), obj.gl.DYNAMIC_DRAW);

    obj.gl.useProgram(shaderProgram);

    obj.tuniform = obj.gl.getUniformLocation(shaderProgram, "t");
  };

  return obj;
}

export {topAnim};