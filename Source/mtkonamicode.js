/*
---

script: mtkonamicode.js
version: 0.9.3
description: know the Konamicode? Use this thing to include a MooTools powered easteregg in your website / webapp
license: MIT-style
authors:
- Christopher Beloch
- Arian Stolwijk (0.9 -> 0.9.3 code improvements)

requires: 
  core:1.2.4:
  - Class.Extras
  - Element.Event
  more:1.2.4:
  - Keyboard

provides: [MTKonamicode]

...
*/

var MTKonamicode = new Class({
	Implements: [Options, Events],
	
	options: {
		keys: ["up","up","down","down","left","right","left","right","b","a"]/*,
		onWin: $empty,
		onKeyup: $empty*/
	},
	
	enteredCode: [],
	
	initialize: function(options){
		this.setOptions(options);
		
		keyboardEvent = new Keyboard({
			caseSensitive: true,
//			parentClass: this,
			events: (function(){
				events = {};
				this.options.keys.each(function(key){
					if(events[key]) return; // Do not add the event twice
					events[key] = this.checkKonami.bindWithEvent(this);
				}.bind(this));
				// Return the object with all the events
				return events;
			}.bind(this))()
		}).activate();
	},
	
	checkKonami: function(event){
		if(event.key){
			var key = event.key;
		}else{
			return;
		}
		this.enteredCode.push(key);
		
		var code = this.options.keys.slice(0, this.enteredCode.length);
		
		if(this.enteredCode.join(",") != code.join(","))
		{
			// Code gone wrong... Resetting the Keylog
			this.enteredCode = [];
		} else {
			this.fireEvent('keyup',[key,this.enteredCode]);
			if (this.enteredCode.join(",") == this.options.keys.join(",")) {
				// YOU WIN! Entered Konamicode successfully
				this.fireEvent('win');
				this.enteredCode = []; // Reset Keylog to run konamicode again
			}
		}
	}
});