uniform sampler2D t_oPos;
uniform sampler2D t_pos;
uniform sampler2D t_start;
uniform float dT;

uniform float exploded;
uniform float alive;

uniform vec3 target;
uniform vec3 direction;

uniform float explosion;

varying vec2 vUv;


$simplex
$curl

void main(){


  
  vec4 oPos = texture2D( t_oPos , vUv );
  vec4 pos  = texture2D( t_pos , vUv );

  vec3 vel  = pos.xyz - oPos.xyz;
  vec3 p    = pos.xyz;

  float life = pos.w;
  
  vec3 f = vec3( 0. , 0. , 0. );
  if( life < 0. ){
    life = 0.;
  }else{
    if( exploded < .5 ){
     // life += dT*10.* (abs(sin( vUv.x * 1000. * cos( vUv.y * 500. )))+4.) ;
    }
  }
  
 
  if( exploded < .5 ){
    f += vec3(p.x , -4. , p.z ) * .005;
  }else{
    
    vec3 curl = curlNoise( pos.xyz * .02 );
     f+= curl* .005;
    f += vec3(0. , -.007 ,0.);
 
  }
 
 /* vec3 curl = curlNoise( pos.xyz * .002 );
  f+= curl* .5;
*/



  vel += f;
  vel *= .99;//dampening;






  if( length(vel) > 5. ){

    vel = normalize( vel ) * 5.;

  }


  if( life > 10. ){
     p = texture2D( t_start , vUv ).xyz + target.xyz;
     vel *= 0.;
     life = -1.;

  }

  if( life == 0. ){
 
    p = texture2D( t_start , vUv ).xyz + target.xyz;

    vel = direction;
   // vel *= 0.;

  }


  if( explosion > .1 ){
     

    //p = texture2D( t_start , vUv ).xyz + target.xyz;
    //vel = direction * 
    
   // vel = direction* .0;
    vec3 curl = curlNoise( pos.xyz * .01 * sin(vUv.y) * cos(vUv.x));
    //vel += curl * 6.;  

    // pastry:
   // vec3 esp = vec3(sin(vUv.y* 100.) , cos( vUv.y*100. ) , sin( vUv.x * vUv.y * 100. ) )  * 5.;  


    vec3 esp = vec3( 1. * floor( vUv.x * 6. ) +sin(vUv.y* 100.)*.3  , 1. ,  1. * floor( vUv.y * 6. )+sin(vUv.x* 100.)*.3   ) + direction;    

    //wha:
    //vec3( vUv.x , vUv.y , length( vUv ) );


    vel += esp*2.; //+ direction;//vec3( vUv.x -.5, vUv.y-.5 , length( vUv )-1. ) * 3.;
  
 
    life = .1;
   // vel += vec3( 0. , 10. , 0. );
  }
  
  p += vel * 1.;//speed;



  gl_FragColor = vec4( p , life  );

}
