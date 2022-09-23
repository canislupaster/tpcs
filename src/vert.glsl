precision mediump float;

attribute float spawnt;
attribute float y;

uniform float t;

varying mediump vec4 fdata;

void main(void) {
  float pos = t-spawnt;
  pos = pos<=0.0 ? 0.0 : sqrt(pos);//(pos*pos + pos)/2.0;
  gl_Position = vec4(2.0*pos-1.0,2.0*y-1.0,0,1);
  fdata = vec4(spawnt,t,y,sin(spawnt));
}