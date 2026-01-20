export class GLRenderer{
constructor(canvas,video){
this.gl=canvas.getContext("webgl")||
canvas.getContext("experimental-webgl");
if(!this.gl){alert("WebGL not supported");throw new Error("No WebGL");}
this.video=video;
this.init();
}
init(){
const g=this.gl;
const vs='attribute vec2 a;varying vec2 v;void main(){gl_Position=vec4(a,0,1);v=(a+1.)/2.;}';
const fs='precision mediump float;varying vec2 v;uniform sampler2D t;void main(){gl_FragColor=texture2D(t,v);}';
const c=(t,s)=>{const sh=g.createShader(t);g.shaderSource(sh,s);g.compileShader(sh);return sh};
const p=g.createProgram();
g.attachShader(p,c(g.VERTEX_SHADER,vs));
g.attachShader(p,c(g.FRAGMENT_SHADER,fs));
g.linkProgram(p);g.useProgram(p);
this.p=p;this.b=g.createBuffer();this.t=g.createTexture();
g.bindTexture(g.TEXTURE_2D,this.t);
g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);
}
draw(corners) {
  const gl = this.gl;

  // ⛔ video not ready yet
  if (this.video.readyState < 2) return;

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const toClip = ([x, y]) => [
    (x / gl.canvas.width) * 2 - 1,
    1 - (y / gl.canvas.height) * 2
  ];

  const positions = corners.flatMap(toClip);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.b);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);

  const loc = gl.getAttribLocation(this.p, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  // 🔑 critical for video textures
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  gl.bindTexture(gl.TEXTURE_2D, this.t);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    this.video
  );

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

}
