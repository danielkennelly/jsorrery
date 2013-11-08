

define(
	[
		'jsorrery/NameSpace',
		'jsorrery/scenario/CommonCelestialBodies',
		'jsorrery/scenario/ApolloNumbers',
		'jsorrery/graphics2d/Labels'
	], 
	function(ns, common, apolloNumbers, Labels) {
		//apollo 10, 11, 13 & 17 don't work. 13 and 17 in particular seem to have errors in the numbers, as the orbits are very far from the moon. 10 & 11 need a correction of about 1° to seem more accurate
		var apolloNumber = '8';
		var earthRadius = common.earth.radius;
		var earthTilt = common.earth.tilt;
		var apolloEarthOrbit = apolloNumbers.get('earth', 'Apollo'+apolloNumber);
		var apolloTLIOrbit = apolloNumbers.get('TLI', 'Apollo'+apolloNumber);
		var epoch = apolloTLIOrbit.epoch;

		var apolloBase = {
			title : 'Apollo '+apolloNumber,
			relativeTo : 'earth',
			mass : 1,
			/*//CSM
			((62845 + 19900 + 3951) * ns.LB_TO_KG) + 
			//S-IVB
			//dry                       propellant at start of 2nd burn
			((25926+1626) * ns.LB_TO_KG) + (160333 * ns.LB_TO_KG),/**/
			radius : 2,
			color : "#00ffff",
			traceColor : '#ffffff',
			vertexDist : 100000,
			forceTrace : true,
			data : {
			},
			logForces : true
		};
		/*
		var apollo8TLIBurnTime = 317.72 * 1000;
		var apollo8 = _.extend(
			{},
			apolloBase,
			{
				
				events : {
					TLI : {
						when : new Date('1968-12-21T15:47:05.000Z').getTime() - apollo8TLIBurnTime,
						burnTime : apollo8TLIBurnTime,
						thrust : 201777 * ns.LBF_TO_NEWTON,
						burnMassDelta : 149510 * ns.LB_TO_KG
					}
				},	
				onOrbitCompleted : function() {
					console.log(ns.U.epochTime / 60);
				},
				afterCompleteMove : function(elapsedTime, absoluteDate){

					if(!this.events.TLI.maxSpeed || this.speed > this.events.TLI.maxSpeed){
						this.events.TLI.maxSpeed = this.speed;
					}
					if(!this.events.TLI.minSpeed || this.speed < this.events.TLI.minSpeed){
						this.events.TLI.minSpeed = this.speed;
					}
					

					this.dbg = this.dbg || $('<div style="position:absolute;bottom:0;right:0;color:#fff">').appendTo('body');
					if(!absoluteDate) return;
					if(typeof this.TliStatus == 'undefined' && absoluteDate.getTime() >= this.events.TLI.when) {
						this.TliStatus = 1;
						this.events.TLI.endTime = this.events.TLI.when + this.events.TLI.burnTime;
						
						var dataSpeed = 25567 * ns.FT_TO_M;

						console.log('velocity', this.speed);
						console.log('max velocity', this.events.TLI.maxSpeed);
						console.log('min velocity', this.events.TLI.minSpeed);
						console.log('velocity (data)',dataSpeed);
						console.log('mass',this.mass);

					} else if(this.TliStatus === 1 && absoluteDate.getTime() >= this.events.TLI.endTime) {
						console.log('****************');
						console.log(elapsedTime, this.events.TLI.endTime);
						console.log('velocity',this.speed);
						var dataSpeed = 35505.41 * ns.FT_TO_M;
						console.log('velocity (data)',dataSpeed);
						console.log('mass',this.mass);
						this.TliStatus = 2; 
					}

					var dist = Math.abs(this.position.clone().sub(ns.U.getBody('moon').position).length()) / 1000;
					
					if(!this.events.TLI.minMoonDist || dist < this.events.TLI.minMoonDist){
						this.events.TLI.minMoonDist = dist;
						this.dbg.html('min moon dist '+dist+'km');
					}

					if(elapsedTime % 500 === 0){
						//this.dbg.html('velocity b '+this.speed+'<br>velocity o '+ns.U.getBody('apolloTLI').speed);
					}

				},
				beforeMove : function(deltaT) {
					this.events.TLI.pos = this.getPosToEarth();
					if(this.TliStatus === 1) {
						this.force.add(this.movement.clone().normalize().multiplyScalar(this.events.TLI.thrust));
					}
				},
				afterMove : function(deltaT) {
					if(this.TliStatus === 1 || this.TliStatus === 2) {
						this.mass = this.mass - ((this.events.TLI.burnMassDelta / (this.events.TLI.burnTime/1000)) * (deltaT));
						this.verlet.invMass = 1 / this.mass;
						if(this.TliStatus === 2) this.TliStatus = 0;
					}
				},
				getPosToEarth : function(){
					return this.position.clone().sub(ns.U.getBody('earth').position);
				}
			}
		);
		/**/
		var apolloTLI = _.extend(
			{},
			apolloBase,
			{
				customInitialize : function(){
					this.dbg = this.dbg || $('<div style="position:absolute;bottom:0;right:0;color:#fff;width:300px;padding:4px;">').appendTo('body');
				},

				afterCompleteMove : function(elapsedTime, absoluteDate, deltaT){
					var dist;
					
					if(!this.data.isOnReturnTrip) {
						if(!this.data.hasTLILabel && this.relativePosition.x != 0){
							Labels.addEventLabel('Trans Lunar Injection', this.relativePosition.clone(), ns.U.getBody(this.relativeTo));
							this.data.hasTLILabel = true;
						}


						dist = Math.abs(this.position.clone().sub(ns.U.getBody('moon').position).length()) / 1000;
						var moonSpeed = 0;
						if(this.data.lastMoonDist){
							moonSpeed = ((this.data.lastMoonDist-dist) / deltaT) * 1000;
						}

						if(!this.data.minMoonDist || dist < this.data.minMoonDist){
							this.data.minMoonDist = dist;
							//this.dbg.html('min moon dist '+dist+'km');
						} else if(this.data.lastMoonDist == this.data.minMoonDist){
							Labels.addEventLabel('Closest distance to<br>the Moon: '+Math.round(this.data.minMoonDist)+' km', this.previousRelativePosition.clone(), ns.U.getBody(this.relativeTo));
							this.data.isOnReturnTrip = true;
							//ns.U.stop();
						}

						
						if(!this.data.hasEnteredMoonInfluence && dist < 100000 && this.speed > this.data.minSpeed){
						//if(!this.data.hasEnteredMoonInfluence && this.forces.earth < this.forces.moon){
							this.data.hasEnteredMoonInfluence = true;
							Labels.addEventLabel('Entered Moon influence (calculated)<br>'+
								'Dist to Moon: '+Math.round(dist)+' km<br>'+
								'Speed towards Moon: '+moonSpeed+' m/s<br>'+
								'Speed (absolute): '+this.speed+' m/s<br>'+
								'Earth/Moon attraction ratio: ' + (this.forces.earth / this.forces.moon)
								, this.previousRelativePosition.clone(), ns.U.getBody(this.relativeTo));
						}

						this.dbg.html(
							'earth force: '+(this.forces.earth && this.forces.earth.toFixed(5))+' N<br>'+
							'moon force: '+(this.forces.moon && this.forces.moon.toFixed(5))+' N<br>'+
							'abs. speed: '+ Math.round(this.speed)+' m/s<br>'+
							'moon speed: '+moonSpeed+' m/s<br>'+
							'moon dist: '+dist+' km'
							);
						this.data.lastMoonDist = dist;
						this.data.minMoonSpeed = !this.data.minMoonSpeed || (this.data.minMoonSpeed > moonSpeed) ? moonSpeed : this.data.minMoonSpeed;
						this.data.minSpeed = !this.data.minSpeed || (this.data.minSpeed > this.speed) ? this.speed : this.data.minSpeed;

					} else {
						dist = Math.abs(this.position.clone().sub(ns.U.getBody('earth').position).length()) / 1000;
						if(!this.data.minEarthDist || dist < this.data.minEarthDist){
							this.data.minEarthDist = dist;
							//this.dbg.html('min moon dist '+dist+'km');
						} else if(this.data.lastEarthDist == this.data.minEarthDist && dist < (Math.abs(this.position.clone().sub(ns.U.getBody('moon').position).length()) / 1000)){
							Labels.addEventLabel('Closest distance to<br>the Earth: '+Math.round(this.data.minEarthDist)+' km<br>Simulation stopped', this.previousRelativePosition.clone(), ns.U.getBody(this.relativeTo));
							
							ns.U.stop();
						}

						this.data.lastEarthDist = dist
						
					}
				}
			}
		);

		var system = {
			name : 'Apollo',
			title : 'Apollo '+apolloNumber+' free return trajectory',
			commonBodies : ['earth', 'moon'/*, 'sun', 'mercury', 'venus', 'mars'/**/],
			secondsPerTick : 500,
			calculationsPerTick : 500,
			calculateAll : true,
			defaultsGuiSettings : {
				date: epoch//epoch
			},
			bodies : {
				earth:{
					map:'img/earthmap1k.jpg'
				},
				moon : {
					isPerturbedOrbit : true
				},				
				apolloTLI : _.extend({},
					apolloTLI,
					apolloTLIOrbit,
					{
						title : 'Apollo '+apolloNumber,
					}
				)/*,
				apolloEO : _.extend({},
					apolloNumber === '8' ? apollo8 : apolloBase,
					apolloEarthOrbit,
					{
						title : 'Apollo '+apolloNumber+' EO',
					}
				)/**/
			},
			help : "Paths of Apollo <a href=\"http://en.wikipedia.org/wiki/Free_return_trajectory\" target=\"_blank\">free return trajectories</a> are calculated from data available on Nasa's website. Data for every Moon mission is available, but all don't work perfectly in the simulation. I chose to display Apollo 8, because it was the first mission to get to the moon. The return path doesn't get exactly to Earth's atmosphere, but keep in mind that the simulated trajectory that you see here does not depend solely on Apollo's numbers, but also on the Moon's and the Earth's calculated positions, velocities and masses. Furthermore, I can't pretend that the algorithm I programmed to calculate the forces resulting from gravity is on par with what Nasa scientists can do. Still, the simulation is precise enough to get a very good idea of the shape of the free return trajectory and the genius behind it."
		};


		return system;
		
	}
);