precision highp float;

attribute vec4 data;
attribute float y;

uniform float t;

varying mediump vec3 coord;
varying highp vec4 fdata;

void main(void) {
  float spawnt=data.y;
  float y = data.x;
  float pos = t-spawnt;
  pos = pos<=0.0 ? 0.0 : sqrt(pos);//(pos*pos + pos)/2.0;
  gl_Position = vec4(2.0*pos-1.0,2.0*y-1.0,0,1);
  
  if (data.z==0.0) coord=vec3(1,0,0);
  else if (data.z==1.0) coord=vec3(0,1,0);
  else if (data.z==2.0) coord=vec3(0,0,1);
  // else coord = vec3(1,1,1);

  fdata = vec4(sin(5.0+1000.0*spawnt),t,y,sin(5.0+0.007*spawnt));
}