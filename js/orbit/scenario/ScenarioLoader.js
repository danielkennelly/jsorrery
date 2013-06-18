
define(
	[
		'jquery',
		'orbit/NameSpace',
		'orbit/scenario/CommonCelestialBodies',
		'orbit/scenario/SolarSystem',
		'orbit/scenario/CentralSolarSystem',
		'orbit/scenario/EarthMoon',
		'orbit/scenario/ArtificialSatellites',
	],
	function($, ns, common){


		var scenarios = {};
		var scenario;
		for(var i = 3; i< arguments.length; i++) {
			scenario = arguments[i];
			scenario.bodies = scenario.bodies || {};

			if(scenario.commonBodies){
				$.each(scenario.commonBodies, function(i, bodyName) {
					scenario.bodies[bodyName] = $.extend({}, common[bodyName], scenario.bodies[bodyName]);
				});
			}
			scenarios[scenario.name] = scenario;
		}


		return {
			get : function(which) {
				return scenarios[which];
			}
		};
	}
);