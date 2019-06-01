function loadModel() {
	let c = document.getElementById('canvas');
	let parent = document.getElementById('canvas-container');

	let Engine = Matter.Engine,
		Render = Matter.Render,
		World = Matter.World,
		Body = Matter.Body,
		Bodies = Matter.Bodies,
		Common = Matter.Common,
		Composite = Matter.Composite,
		Composites = Matter.Composites,
		Constraint = Matter.Constraint,
		Events = Matter.Events,
		MouseConstraint = Matter.MouseConstraint,
		Runner = Matter.Runner,
		Sleeping = Matter.Sleeping,
		Vertices = Matter.Vertices,
		Vector = Matter.Vector,
		SAT = Matter.SAT;
	let engine = Engine.create();
	let render = Render.create({
		canvas: c,
		engine: engine,
		options: {
			element: document.body,
			pixelRatio: 2,
			wireframes: false,
			width: parent.clientWidth,
			height: parent.clientHeight,
			// showAngleIndicator: true,
			// showIds: true,
			// showBroadphase: true,
			// showPositions: true,
			// showBounds: true,
			// showCollisions: true,
		}
	});

	console.log(render.options.width/render.options.height);

	engine.world.gravity.x = 0.6;
	engine.world.gravity.y = 0;

	let defaultCategory = 0x0001; // everything collides with this category (sidewalls)
	let co2Category = 0x0002; // specifies the stuff that the co2 can collide with (activated mof)
	let ch4Category = 0x0004; // methane can go through MOF regardless of its state
	let MOFCategory = 0x0008; // specifies the stuff that mof can collide with (co2)

	let boundaries = initBoundaries();
	Composite.add(engine.world, boundaries);

	setInterval(createCO2Molecule, 375);
	setInterval(createCH4Molecule, 100);

	let MOFs = initMOFs();
	Composite.add(engine.world, MOFs);

	let collisionFrame = requestAnimationFrame(initCollisions);

	let runner = Engine.run(engine);
	Render.run(render);

	console.log(render.options.width);

	function initBoundaries() {
		let boundaryThickness = Math.floor(0.04194630872*window.innerWidth);
		let topBoundary = Bodies.rectangle(render.options.width/2, boundaryThickness/2, render.options.width*2, boundaryThickness, {
			id: 1000001,
			inertia: Infinity,
			isStatic: true,
			label: "topBoundary",
			render: {
				lineWidth: 0
			}
		});
		let bottomBoundary = Bodies.rectangle(render.options.width/2, render.options.height-boundaryThickness/2, render.options.width*2, boundaryThickness, {
			id: 1000002,
			inertia: Infinity,
			isStatic: true,
			label: "bottomBoundary"
		});
		let focusingTopBoundary = Bodies.rectangle(render.options.width/7, 0, boundaryThickness/1.2, (1.75*render.options.height)/Math.sqrt(2), {
			id: 1000003,
			inertia: Infinity,
			angle: degToRad(-45),
			isStatic: true,
			label: "focusingTopBoundary"
		});
		let focusingBottomBoundary = Bodies.rectangle(render.options.width/7, render.options.height, boundaryThickness/1.2, (1.75*render.options.height)/Math.sqrt(2), {
			id: 1000004,
			inertia: Infinity,
			angle: degToRad(45),
			isStatic: true,
			label: "focusingBottomBoundary"
		});
		let rotatingSeparatorBoundary = Bodies.rectangle(render.options.width/2, render.options.height/2, boundaryThickness/3, boundaryThickness*2.5, {
			id: 1000005,
			inertia: Infinity,
			isStatic: true,
			label: "rotatingSeparatorBoundary",
			angle: degToRad(45)
		});
		let middleBoundary = Bodies.rectangle(3*render.options.width/4, render.options.height/2, render.options.width/2, boundaryThickness/5, {
			id: 1000006,
			inertia: Infinity,
			isStatic: true,
			label: "middleBoundary",
		});
        let garbageCollectBoundary = Bodies.rectangle(render.options.width+2*boundaryThickness, render.options.height/2, 10, render.options.height, {
        	id: 1000007,
        	inertia: Infinity,
        	isStatic: true,
        	label: "garbageCollectBoundary",
        });
		let boundaryComposite = Composite.create({
			bodies: [
				topBoundary, 
				bottomBoundary, 
				focusingTopBoundary, 
				focusingBottomBoundary,
				rotatingSeparatorBoundary,
				middleBoundary,
				garbageCollectBoundary]
		});
		return boundaryComposite;
	}

	function initCollisions() {
		let garbageCollectBoundary = Composite.allComposites(engine.world)[0].bodies[6];
		let topMOF = Composite.allComposites(engine.world)[1].bodies[0];
		let bottomMOF = Composite.allComposites(engine.world)[1].bodies[1];
		let originalPinkColor = 'rgba(255,204,204,1)';
		let pureRedColor = 'rgba(255,0,0,1)';

		for (i = 0; i < Composite.allBodies(engine.world).length; i++) {
			let currBody = Composite.allBodies(engine.world)[i];
			if (currBody.id == 1000001 
				|| currBody.id == 1000002
				|| currBody.id == 1000003
				|| currBody.id == 1000004
				|| currBody.id == 1000005
				|| currBody.id == 1000006
				|| currBody.id == 1000007) continue;
			let garbageCollectCollision = Matter.SAT.collides(garbageCollectBoundary, currBody);
			if (garbageCollectCollision.collided) World.remove(engine.world, currBody);
			let topMOFCollision = Matter.SAT.collides(topMOF, currBody);
			if (topMOFCollision.collided) {
				if (currBody.label == 'CO2' && !topMOF.isCoolDown) {
					topMOF.MOFCapacity++;
					topMOF.render.fillStyle = pSBC(0.025, topMOF.render.fillStyle, pureRedColor, true);
					World.remove(engine.world, currBody);
					if (topMOF.MOFCapacity >= 100) {
						topMOF.MOFCapacity = 0;
						topMOF.isCoolDown = true;
						turnRotatingSeparator(topMOF);
					}
					console.log(topMOF);
				}
			}
			let bottomMOFCollision = Matter.SAT.collides(bottomMOF, currBody);
			if (bottomMOFCollision.collided) {
				if (currBody.label == 'CO2' && !bottomMOF.isCoolDown) {
					bottomMOF.MOFCapacity++;
					bottomMOF.render.fillStyle = pSBC(0.025, bottomMOF.render.fillStyle, pureRedColor, true);
					World.remove(engine.world, currBody);
					if (bottomMOF.MOFCapacity >= 100) {
						bottomMOF.MOFCapacity = 0;
						bottomMOF.isCoolDown = true;
						turnRotatingSeparator(bottomMOF);
					}
					console.log(bottomMOF);
				}
			}

		}

		requestAnimationFrame(initCollisions);
	}

	function initMOFs() {
		let MOFThickness = Math.floor(0.04194630872*window.innerWidth), MOFHeight = render.options.height/2-(21/20)*MOFThickness;
		let topMOF = Bodies.rectangle(6*render.options.width/7, render.options.height/4+(19/40)*MOFThickness, MOFThickness, MOFHeight, {
			id: 1000008,
			inertia: Infinity,
			isStatic: true,
			label: "topMOF",
			collisionFilter: {
				category: MOFCategory,
				mask: defaultCategory | co2Category
			},
			render: {
				fillStyle: "rgba(255, 204, 204, 1)"
			},
			MOFCapacity: 0,
			isCoolDown: false
		});
		let bottomMOF = Bodies.rectangle(6*render.options.width/7, render.options.height-(render.options.height/4+(19/40)*MOFThickness), MOFThickness, MOFHeight, {
			id: 1000009,
			inertia: Infinity,
			isStatic: true,
			label: "bottomMOF",
			collisionFilter: {
				category: MOFCategory,
				mask: defaultCategory | co2Category
			},
			render: {
				fillStyle: "rgba(255, 204, 204, 1)"
			},
			MOFCapacity: 0,
			isCoolDown: false
		});
		return Composite.create({
			bodies: [topMOF, bottomMOF]
		});
	}

	function createCO2Molecule() {
		let moleculeRadius = 0.01310067114*window.innerWidth;
		let x = Math.random()*-20,
			y = Math.random()*(render.options.height-4*moleculeRadius)+2*moleculeRadius;
		let molecule = Bodies.circle(x, y, moleculeRadius, {
			friction: 0,
			frictionStatic: 0,
			restitution: 0.5,
			label: 'CO2',
			render: {
				fillStyle: 'red'
			},
			collisionFilter: {
				category: co2Category,
				mask: defaultCategory | MOFCategory
			}
		});
		Composite.add(engine.world, molecule);		
	}

	function createCH4Molecule() {
		let moleculeRadius = 0.008389926174*window.innerWidth;
		let x = Math.random()*-20,
			y = Math.random()*(render.options.height-4*moleculeRadius)+2*moleculeRadius;
		let molecule = Bodies.circle(x, y, moleculeRadius, {
			friction: 0,
			frictionStatic: 0,
			restitution: 0.5,
			label: 'CH4',
			render: {
				fillStyle: 'blue'
			},
			collisionFilter: {
				category: ch4Category,
				mask: defaultCategory
			}
		});
		Composite.add(engine.world, molecule);
	}

	function turnRotatingSeparator(prevMOF) {
		let rotatingSeparatorBoundary = Composite.allComposites(engine.world)[0].bodies[4];
		let currAngle = rotatingSeparatorBoundary.angle;
		Body.setAngle(rotatingSeparatorBoundary, -currAngle);

		let topMOF = Composite.allComposites(engine.world)[1].bodies[0];
		let bottomMOF = Composite.allComposites(engine.world)[1].bodies[1];
		if (prevMOF == topMOF) {
			// topMOF got saturated
			topMOF.render.fillStyle = "rgba(204,255,255,1)"; // make topMOF blue
			bottomMOF.render.fillStyle = "rgba(255,204,204,1)"; // make bottomMOF red
			bottomMOF.isCoolDown = false;

			topMOF.collisionFilter.mask = defaultCategory;
			bottomMOF.collisionFilter.mask = defaultCategory | co2Category;
		} else {
			// bottomMOF got saturated
			bottomMOF.render.fillStyle = "rgba(204,255,255,1)"; // make bottomMOF blue
			topMOF.render.fillStyle = "rgba(255,204,204,1)"; // make topMOF red
			topMOF.isCoolDown = false;
			bottomMOF.collisionFilter.mask = defaultCategory;
			topMOF.collisionFilter.mask = defaultCategory | co2Category;
		}
	}

}

function degToRad(deg) {
	return deg * Math.PI/180;
}