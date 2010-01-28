MTKonamicode
===========

MTKonamicode gives you a small little 'Feature' for your Website.
There are some sites having Konamicodes in it (check http://www.konamicodesites.com) and here is the MooTools way to integrate it in your website / webapp

Check http://en.wikipedia.org/wiki/Konami_Code for more info

![Screenshot](http://mtkonamicode.cbeloch.de/Docs/images/logo.png)

How to use
----------

Include the mtkonamicode.js in your project.

Use Code like this:

	#JS
	var konamievent = new MTKonamicode({
		onWin: function(){
			alert("You successfully entered the konamicode! Go and get a cookie!");
		}
	});

Other example with custom keys

	#JS
	new MTKonamicode({
		keys: ['up','down'],
		onWin: function(){
			alert('Do it!');
		}
	});