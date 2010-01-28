/*
---

script: mtkonamicode.js
version: 0.9
description: know the Konamicode? Use this thing to include a MooTools powered easteregg in your website / webapp
license: MIT-style
authors:
- Christopher Beloch

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
	
	theKonamiCode: ["up","up","down","down","left","right","left","right","b","a"],
	enteredCode: [],
	
	initialize: function(options){
		this.setOptions(options);
		keyboardEvent = new Keyboard({
			caseSensitive: true,
			parentClass: this,
			events: {
				'up': this.checkKonamiUp,
				'down': this.checkKonamiDown,
				'left': this.checkKonamiLeft,
				'right': this.checkKonamiRight,
				'b': this.checkKonamiB,
				'a': this.checkKonamiA
				
			}
		}).activate();
		
	},
	
	checkKonami: function(key){
		this.enteredCode.extend([key]);
		
		enteredSize = this.enteredCode.length;
		shortenedKonamiCode = this.theKonamiCode.slice(0, enteredSize);
		
		if(this.enteredCode.join(",") != shortenedKonamiCode.join(","))
		{
			// Code gone wrong... Resetting the Keylog
			this.enteredCode = [];
		}
		
		if(this.enteredCode.join(",") == this.theKonamiCode.join(","))
		{
			// YOU WIN! Entered Konamicode successfully
			this.fireEvent('win');
			this.enteredCode = []; // Reset Keylog to run konamicode again
		}
	},
	
	checkKonamiUp: function(){
		this.options.parentClass.checkKonami("up");
	},
	
	checkKonamiDown: function(){
		this.options.parentClass.checkKonami("down");
	},
	
	checkKonamiLeft: function(){
		this.options.parentClass.checkKonami("left");
	},
	
	checkKonamiRight: function(){
		this.options.parentClass.checkKonami("right");
	},
	
	checkKonamiB: function(){
		this.options.parentClass.checkKonami("b");
	},
	
	checkKonamiA: function(){
		this.options.parentClass.checkKonami("a");
	}
});