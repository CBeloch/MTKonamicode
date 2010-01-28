//MooTools More, <http://mootools.net/more>. Copyright (c) 2006-2009 Aaron Newton <http://clientcide.com/>, Valerio Proietti <http://mad4milk.net> & the MooTools team <http://mootools.net/developers>, MIT Style License.

/*
---

script: More.js

description: MooTools More

license: MIT-style license

authors:
- Guillermo Rauch
- Thomas Aylott
- Scott Kyle

requires:
- core:1.2.4/MooTools

provides: [MooTools.More]

...
*/

MooTools.More = {
	'version': '1.2.4.2',
	'build': 'bd5a93c0913cce25917c48cbdacde568e15e02ef'
};

/*
---

script: Log.js

description: Provides basic logging functionality for plugins to implement.

license: MIT-style license

authors:
- Guillermo Rauch
- Thomas Aylott
- Scott Kyle

requires:
- core:1.2.4/Class
- /MooTools.More

provides: [Log]

...
*/

(function(){

var global = this;

var log = function(){
	if (global.console && console.log){
		try {
			console.log.apply(console, arguments);
		} catch(e) {
			console.log(Array.slice(arguments));
		}
	} else {
		Log.logged.push(arguments);
	}
	return this;
};

var disabled = function(){
	this.logged.push(arguments);
	return this;
};

this.Log = new Class({
	
	logged: [],
	
	log: disabled,
	
	resetLog: function(){
		this.logged.empty();
		return this;
	},

	enableLog: function(){
		this.log = log;
		this.logged.each(function(args){
			this.log.apply(this, args);
		}, this);
		return this.resetLog();
	},

	disableLog: function(){
		this.log = disabled;
		return this;
	}
	
});

Log.extend(new Log).enableLog();

// legacy
Log.logger = function(){
	return this.log.apply(this, arguments);
};

})();

/*
---

script: Keyboard.js

description: KeyboardEvents used to intercept events on a class for keyboard and format modifiers in a specific order so as to make alt+shift+c the same as shift+alt+c.

license: MIT-style license

authors:
- Perrin Westrich
- Aaron Newton
- Scott Kyle

requires:
- core:1.2.4/Events
- core:1.2.4/Options
- core:1.2.4/Element.Event
- /Log

provides: [Keyboard]

...
*/

(function(){

	var parsed = {};
	var modifiers = ['shift', 'control', 'alt', 'meta'];
	var regex = /^(?:shift|control|ctrl|alt|meta)$/;
	
	var parse = function(type, eventType){
		type = type.toLowerCase().replace(/^(keyup|keydown):/, function($0, $1){
			eventType = $1;
			return '';
		});
		
		if (!parsed[type]){
			var key = '', mods = {};
			type.split('+').each(function(part){
				if (regex.test(part)) mods[part] = true;
				else key = part;
			});
		
			mods.control = mods.control || mods.ctrl; // allow both control and ctrl
			var match = '';
			modifiers.each(function(mod){
				if (mods[mod]) match += mod + '+';
			});
			
			parsed[type] = match + key;
		}
		
		return eventType + ':' + parsed[type];
	};

	this.Keyboard = new Class({

		Extends: Events,

		Implements: [Options, Log],

		options: {
			/*
			onActivate: $empty,
			onDeactivate: $empty,
			*/
			defaultEventType: 'keydown',
			active: false,
			events: {}
		},

		initialize: function(options){
			this.setOptions(options);
			//if this is the root manager, nothing manages it
			if (Keyboard.manager) Keyboard.manager.manage(this);
			this.setup();
		},

		setup: function(){
			this.addEvents(this.options.events);
			if (this.options.active) this.activate();
		},

		handle: function(event, type){
			//Keyboard.stop(event) prevents key propagation
			if (!this.active || event.preventKeyboardPropagation) return;
			
			var bubbles = !!this.manager;
			if (bubbles && this.activeKB){
				this.activeKB.handle(event, type);
				if (event.preventKeyboardPropagation) return;
			}
			this.fireEvent(type, event);
			
			if (!bubbles && this.activeKB) this.activeKB.handle(event, type);
		},

		addEvent: function(type, fn, internal) {
			return this.parent(parse(type, this.options.defaultEventType), fn, internal);
		},

		removeEvent: function(type, fn) {
			return this.parent(parse(type, this.options.defaultEventType), fn);
		},

		activate: function(){
			this.active = true;
			return this.enable();
		},

		deactivate: function(){
			this.active = false;
			return this.fireEvent('deactivate');
		},

		toggleActive: function(){
			return this[this.active ? 'deactivate' : 'activate']();
		},

		enable: function(instance){
			if (instance) {
				//if we're stealing focus, store the last keyboard to have it so the relenquish command works
				if (instance != this.activeKB) this.previous = this.activeKB;
				//if we're enabling a child, assign it so that events are now passed to it
				this.activeKB = instance.fireEvent('activate');
			} else if (this.manager) {
				//else we're enabling ourselves, we must ask our parent to do it for us
				this.manager.enable(this);
			}
			return this;
		},

		relenquish: function(){
			if (this.previous) this.enable(this.previous);
		},

		//management logic
		manage: function(instance) {
			if (instance.manager) instance.manager.drop(instance);
			this.instances.push(instance);
			instance.manager = this;
			if (!this.activeKB) this.enable(instance);
			else this._disable(instance);
		},

		_disable: function(instance) {
			if (this.activeKB == instance) this.activeKB = null;
		},

		drop: function(instance) {
			this._disable(instance);
			this.instances.erase(instance);
		},

		instances: [],

		trace: function(){
			this.enableLog();
			var item = this;
			this.log('the following items have focus: ');
			while (item) {
				this.log(document.id(item.widget) || item.widget || item, 'active: ' + this.active);
				item = item.activeKB;
			}
		}

	});

	Keyboard.stop = function(event) {
		event.preventKeyboardPropagation = true;
	};

	Keyboard.manager = new this.Keyboard({
		active: true
	});
	
	Keyboard.trace = function(){
		Keyboard.manager.trace();
	};
	
	var handler = function(event){
		var mods = '';
		modifiers.each(function(mod){
			if (event[mod]) mods += mod + '+';
		});
		Keyboard.manager.handle(event, event.type + ':' + mods + event.key);
	};
	
	document.addEvents({
		'keyup': handler,
		'keydown': handler
	});

	Event.Keys.extend({
		'pageup': 33,
		'pagedown': 34,
		'end': 35,
		'home': 36,
		'capslock': 20,
		'numlock': 144,
		'scrolllock': 145
	});

})();
