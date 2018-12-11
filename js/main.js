            if ( WEBGL.isWebGLAvailable() === false ) {
				document.body.appendChild( WEBGL.getWebGLErrorMessage() );
			}
            
			var orbitControls;
			var container, camera, scene, renderer, loader,effect;
			var gltf, mixer, gui;

			var scenes = {
				gtlfTest: {
					url: './models/gltf/gltfDraco.gltf',
					cameraPos: new THREE.Vector3( 0, 2, 2 ),
					objectRotation: new THREE.Euler( - Math.PI / 2, 0, 1 ),
                    objectPosition: new THREE.Euler(0,0.67,0),
                    objectScale: new THREE.Vector3( 5, 5, 5 ),
					addLights: true,
                    shadows: true,
                    addGround: true,
				},
                remesh: {
					url: './models/gltf/remeshDraco.gltf',
					cameraPos: new THREE.Vector3( 0, 2, 2 ),
					objectRotation: new THREE.Euler( - Math.PI / 2, 0, 0 ),
                    objectPosition: new THREE.Euler(0,0.67,0),
                    objectScale: new THREE.Vector3( 5, 5, 5 ),
					addLights: true,
                    shadows: true,
                    addGround: true,
				},
				shell: {
					url: './models/gltf/shellDraco.gltf',
					cameraPos: new THREE.Vector3( 0, 2, 2 ),
					objectRotation: new THREE.Euler( - Math.PI / 2, 0, 0 ),
                    objectPosition: new THREE.Euler(0,0.67,0),
                    objectScale: new THREE.Vector3( 5, 5, 5 ),
					addLights: true,
                    addGround: true,
				},
			};

			var state = {
				scene: Object.keys( scenes )[ 0 ],
				
			};

			function onload() {

				window.addEventListener( 'resize', onWindowResize, false );

				buildGUI();
				initScene( scenes[ state.scene ] );
				animate();

			}

			function initScene( sceneInfo ) {

				container = document.getElementById( 'container' );

				scene = new THREE.Scene();
				scene.background = new THREE.Color( 0x222222 );

				camera = new THREE.PerspectiveCamera( 45, container.offsetWidth / container.offsetHeight, 0.001, 1000 );
				scene.add( camera );
                
                

				var spot1;

				if ( sceneInfo.addLights ) {

					var ambient = new THREE.AmbientLight( 0x222222 );
					scene.add( ambient );

					var directionalLight = new THREE.DirectionalLight( 0xdddddd, 4 );
					directionalLight.position.set( 0, 0, 1 ).normalize();
					scene.add( directionalLight );

					spot1 = new THREE.SpotLight( 0xffffff, 1 );
					spot1.position.set( 5, 10, 5 );
					spot1.angle = 0.50;
					spot1.penumbra = 0.75;
					spot1.intensity = 100;
					spot1.decay = 2;

					if ( sceneInfo.shadows ) {

						spot1.castShadow = true;
						spot1.shadow.bias = 0.0001;
						spot1.shadow.mapSize.width = 2048;
						spot1.shadow.mapSize.height = 2048;

					}

					scene.add( spot1 );

				}

				// RENDERER

				// TODO: Reuse existing WebGLRenderer, GLTFLoaders, and so on
				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.gammaOutput = true;
				renderer.physicallyCorrectLights = true;

                var helper = new THREE.GridHelper( 1200, 60, 0xFF4444, 0x404040 );
				this.scene.add( helper );
                
				if ( sceneInfo.shadows ) {

					renderer.shadowMap.enabled = true;
					renderer.shadowMap.type = THREE.PCFSoftShadowMap;

				}

				container.appendChild( renderer.domElement );

				orbitControls = new THREE.OrbitControls( camera, renderer.domElement );

				if ( sceneInfo.addGround ) {

					var groundMaterial = new THREE.MeshPhongMaterial( { color: 0xFFFFFF } );
					var ground = new THREE.Mesh( new THREE.PlaneBufferGeometry( 3072, 3072 ), groundMaterial );
					ground.receiveShadow = !! sceneInfo.shadows;

					if ( sceneInfo.groundPos ) {

						ground.position.copy( sceneInfo.groundPos );

					} else {

						ground.position.z = - 70;

					}

					ground.rotation.x = - Math.PI / 2;

					scene.add( ground );

				}

				loader = new THREE.GLTFLoader();

				THREE.DRACOLoader.setDecoderPath( 'js/libs/draco/gltf/' );
				loader.setDRACOLoader( new THREE.DRACOLoader() );

				var url = sceneInfo.url;

				var loadStartTime = performance.now();

				loader.load( url, function ( gltf ) {

					var object = gltf.scene;

					console.info( 'Load time: ' + ( performance.now() - loadStartTime ).toFixed( 2 ) + ' ms.' );

					if ( sceneInfo.cameraPos ) {

						camera.position.copy( sceneInfo.cameraPos );

					}

					if ( sceneInfo.center ) {

						orbitControls.target.copy( sceneInfo.center );

					}

					if ( sceneInfo.objectPosition ) {

						object.position.copy( sceneInfo.objectPosition );

						if ( spot1 ) {

							spot1.target.position.copy( sceneInfo.objectPosition );

						}

					}

					if ( sceneInfo.objectRotation ) {

						object.rotation.copy( sceneInfo.objectRotation );

					}

                    
                    if ( sceneInfo.objectPosition ) {

						object.position.copy( sceneInfo.objectPosition );

					}

                    
					if ( sceneInfo.objectScale ) {

						object.scale.copy( sceneInfo.objectScale );

					}

	

					object.traverse( function ( node ) {

						if ( node.isMesh || node.isLight ) node.castShadow = true;

					} );

					

					scene.add( object );
					onWindowResize();

				}, undefined, function ( error ) {

					console.error( error );

				} );

			}

			function onWindowResize() {

				camera.aspect = container.offsetWidth / container.offsetHeight;
				camera.updateProjectionMatrix();
				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function animate() {

				requestAnimationFrame( animate );

				orbitControls.update();

				render();

			}

			function render() {

				renderer.render( scene, camera );

			}

			function buildGUI() {

				gui = new dat.GUI( { width: 100 } );
				gui.domElement.parentElement.style.zIndex = 101;

				var sceneCtrl = gui.add( state, 'scene', Object.keys( scenes ) );
				sceneCtrl.onChange( reload );

				updateGUI();

			}
			function updateGUI() {

				var sceneInfo = scenes[ state.scene ];

			}

			function reload() {

				if ( container && renderer ) {

					container.removeChild( renderer.domElement );

				}

				if ( loader && mixer ) mixer.stopAllAction();

				updateGUI();
				initScene( scenes[ state.scene ] );

			}

			onload();