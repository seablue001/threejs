var Colors = {
   red:0xf25346,    
   white:0xd8d0d1,  
   brown:0x59332e,  
   pink:0xF5986E,   
   brownDark:0x23190f,  
   blue:0x68c3c0
};




/**
 * [createScene 创建场景]
 * @return {[type]} [description]
 */
var scene,camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,renderer, container;
function createScene() {
	// 获取屏幕宽高，并用它们来设置相机的宽高比，以及渲染器的尺寸
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;

	scene = new THREE.Scene();

	// 为场景添加雾的效果，颜色与css中设置的背景色一致
	scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

	//  创建相机
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 60;
	nearPlane = 1;
	farPlane = 10000;
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
	    aspectRatio,
	    nearPlane,
	    farPlane
		);

	// 设置相机位置
	camera.position.x = 0;  
	camera.position.z = 200;    
	camera.position.y = 100; 

	// 创建渲染器
	renderer = new THREE.WebGLRenderer({
		// 在 css 中设置背景色透明显示渐变色
		alpha: true,

		// 开启抗锯齿，但这样会降低性能。
  		// 不过，由于我们的项目基于低多边形的，那还好
  		antialias: true
	});

	renderer.setSize(WIDTH, HEIGHT);

	// 开启阴影地图
	renderer.shadowMap.enabled = true;

	// 在 HTML 创建的容器中添加渲染器的 DOM 元素
	container = document.getElementById('world');   
  	container.appendChild(renderer.domElement);

	// 监听屏幕，缩放屏幕更新相机和渲染器的尺寸
	window.addEventListener('resize', handleWindowResize, false);
}

function handleWindowResize() {
	// 更新渲染器的高度和宽度以及相机的纵横比
   HEIGHT = window.innerHeight; 
   WIDTH = window.innerWidth;           
   renderer.setSize(WIDTH, HEIGHT); 
   camera.aspect = WIDTH / HEIGHT;        
   camera.updateProjectionMatrix();
}

/**
 * [createLights 添加光源]
 * @return {[type]} [description]
 */
var hemisphereLight, shadowLight;
function createLights() {
   // 半球光是渐变的光
   // 第一个参数是天空的颜色，第二个参数是地上的颜色，第三个参数是光源的强度
   hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000,.9);

   // 方向光是从一个特定方向照射
   // 类似太阳，即所有光线是平行的
   // 第一个参数是光线颜色，第二个参数是光源强度
   shadowLight = new THREE.DirectionalLight(0xffffff,.9);

   // 设置光源的方向
   // 位置不同，方向光作用于物体的面也不同，看到的颜色不同
   shadowLight.position.set(150, 350, 350);

   // 开启光源投影
   shadowLight.castShadow = true;

   // 定义可见区域的投射阴影
   shadowLight.shadow.camera.left = -400;
   shadowLight.shadow.camera.right = 400;
   shadowLight.shadow.camera.top = 400;
   shadowLight.shadow.camera.bottom = -400;
   shadowLight.shadow.camera.near = 1;
   shadowLight.shadow.camera.far = 1000;

   // 定义阴影的分辨率；虽然分辨率越高越好，但是需要付出更加昂贵的代价维持高性能表现。
   shadowLight.shadow.mapSize.width = 2048;
   shadowLight.shadow.mapSize.height = 2048;

   // 为了使这些光源呈现效果，只需要将它们添加到场景中
   scene.add(hemisphereLight);
   scene.add(shadowLight);
   
}


/**
 * [createSea 添加大海]
 * @return {[type]} [description]
 */
var Sea = function(){
	// 创建一个圆柱几何体
	// 参数为：顶面半径，高度，半径分段，高度分段
	var geom = new THREE.CylinderGeometry(600,600,800,40,10);

	// 在 x 轴旋转几何体
	geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2))

	// 创建材质
	var mat = new THREE.MeshPhongMaterial({
		color: Colors.blue,
		transparent: true,
		opacity: 6,
		shading: THREE.FlatShading
	});

	// 在three.js 中创建一个物体， 我们必须创建网格用来组合几何体和一些材质
	this.mesh = new THREE.Mesh(geom, mat);

	// 允许大海对象接受阴影
	this.mesh.receiveShadow = true;
}

// 实例化大海对象，并添加至场景
var sea;

function createSea() {
	sea = new Sea();

	// 在场景底部， 稍微推挤一下
	sea.mesh.position.y = -600;

	// 添加大海的网格至场景
	scene.add(sea.mesh);
}



/**
 * [init 初始化函数]
 * @return {[type]} [description]
 */
function init() {
	// 创建场景、渲染器
	createScene();

	createLights();

	createSea();

	loop();
}


function loop(){
	sea.mesh.rotation.z += .005;
	renderer.render(scene, camera);
	requestAnimationFrame(loop);
}

window.addEventListener('load', init, false);