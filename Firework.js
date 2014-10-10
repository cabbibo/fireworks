function Firework( params ){
  
  var sim = shaders.simulationShaders.firework;

  this.params = _.defaults( params || {} , {

    size: 64


  });

  this.size = this.params.size;


  this.soul = new PhysicsRenderer( this.size , sim , renderer );

  this.soul.setUniform( 'dT' , dT );
  this.soul.setUniform( 'timer' , timer );

  var geo = this.createGeometry();

  this.targetMarker = new THREE.Mesh( new THREE.IcosahedronGeometry( 2 , 2 ) , new THREE.MeshNormalMaterial() );

  //scene.add( this.targetMarker );

  
  this.target = this.targetMarker.position;
  this.direction = new THREE.Vector3();

  this.uniforms = {

    t_pos:{ type:"t" , value:null },
    t_oPos:{ type:"t" , value:null },
    t_audio:t_audio,
    t_sprite:{type:"t", value:THREE.ImageUtils.loadTexture('flare.png')},

    exploded:   { type:"f" , value: 0 },
    explosion:   { type:"f" , value: 0 },
    target:     { type:"v3" , value: this.target },
    direction:  { type:"v3" , value: this.direction },

    alive:      { type:"f" , value: 0 }

  }
 
  var mat = new THREE.ShaderMaterial({

    uniforms: this.uniforms,
    vertexShader: shaders.vertexShaders.firework,
    fragmentShader: shaders.fragmentShaders.firework,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
 
  this.body = new THREE.PointCloud( geo , mat );
  
  this.soul.addBoundTexture( this.body , 't_pos' , 'output' );
  this.soul.addBoundTexture( this.body , 't_oPos' , 'oOutput' );

  var mesh = new THREE.Mesh( new THREE.BoxGeometry(1,1,1,10 ,10,10) );
  
  mesh.rotation.x = Math.PI / 2;
  var posTexture = ParticleUtils.createPositionsTexture( this.size , mesh );
  this.soul.reset( posTexture );

  var t_start = { type:"t" , value: posTexture };
  this.soul.setUniform( 't_start' , t_start );
  this.soul.setUniform( 'target'    , this.uniforms.target );
  this.soul.setUniform( 'exploded'  , this.uniforms.exploded );
  this.soul.setUniform( 'alive'     , this.uniforms.alive );
  this.soul.setUniform( 'direction' , this.uniforms.direction );
  this.soul.setUniform( 'explosion' , this.uniforms.explosion );


  this.alive = true;



}


Firework.prototype.explode = function( start , end , timeToExplode , timeToDissolve , callback ){

  this.target.copy( start );


  this.direction.copy( end );
  this.direction.sub( start );
  this.direction.normalize();


  var tween = new TWEEN.Tween( this.target ).to( end , timeToExplode );
  
  tween.onUpdate( function( t ){

    //console.log('YERP');


  }.bind( this ));

  tween.onComplete( function( t ){

    this.uniforms.exploded.value = 1.;
    this.uniforms.explosion.value = 1.;

    console.log( 't' );
    console.log( this.target );
    var s = { v: 1 }
    var e = { v: 0 }
    var t2 = new TWEEN.Tween( s ).to( e , timeToDissolve );

    t2.onUpdate( function(t){

      this.uniforms.alive.value = 1-t;

    }.bind( this ));

    t2.onComplete( function(){

      this.alive = false;

    }.bind( this ));

    t2.start();
  
  }.bind( this ));

  tween.start();

}

Firework.prototype.debug = function( reducer ){

  var reducer = reducer || .1;
  this.soul.createDebugScene();

  this.soul.debugScene.scale.multiplyScalar( reducer );
  this.soul.addDebugScene( scene );

}




Firework.prototype.update = function(){

  if( this.alive ){
    this.soul.update();
    
    if( this.uniforms.explosion.value == 1. ){
      
      //window.setTimeout( function(){
        this.uniforms.explosion.value = 0.;
      //}.bind( this ) , 10000 );
      
    }
  }

}

Firework.prototype.createGeometry = function(){

  var geo = new THREE.BufferGeometry();
  var positions = new Float32Array( this.size * this.size * 3 );
  var pos = new THREE.BufferAttribute( positions , 3 );

  geo.addAttribute( 'position' , pos );

  var hSize = .5 / this.size;
  for( var i =0; i < this.size; i++ ){
    for( var j = 0; j < this.size; j++ ){

      var index = ((i * this.size ) + j) * 3;

      var x = (i / this.size) + hSize;
      var y = (j / this.size) + hSize;

      positions[ index + 0 ] = x;
      positions[ index + 1 ] = y;
      positions[ index + 2 ] = index / 3;

    }
  }

  return geo;

}

