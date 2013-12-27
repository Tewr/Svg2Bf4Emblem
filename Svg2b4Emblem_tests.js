/*
Copyright (C) 2013 Tor Knutsson http://tewr.github.io/

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var Svg2b4EmblemTests = function(log) {
	if (!Svg2b4Emblem) {
		var error = "Unable to find object Svg2b4Emblem";
		log(error);
		throw error;
	}
	
	this.obj = Svg2b4Emblem;
	this.log = log;
};
	
$.extend(Svg2b4EmblemTests.prototype,
 {
	runAll: function() {
		this.testLine();
		this.testRectangle();
		this.testEllipse();
		this.testGroupFlattener();
	},
	
	testLine: function() {
		
		var svg = '<?xml version="1.0" encoding="utf-8"?>\
			<!-- Generator: Adobe Illustrator 15.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->\
			<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\
			<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\
				 width="320px" height="320px" viewBox="0 0 320 320" enable-background="new 0 0 320 320" xml:space="preserve">\
			<line fill="none" stroke="#000000" stroke-width="10" stroke-miterlimit="10" x1="178.204" y1="166.592" x2="271.297" y2="251.77"/>\
			</svg>';
			
		var reference = {
		  "asset": "Stroke",
		  "left": 224,
		  "top": 209,
		  "fill": "#000000",
		  "opacity" : 1,
		  "width": 10,
		  "height": 126.18014098105931,
		  "angle": -47.54252337825892,
		  "selectable" : 1
		};
		
		var errors = [];
		var messages = [];
		
		this.testAgainstReference(svg, reference, errors, messages);
		this.assertEmpty(errors, "errors", "testLine");
		this.assertEmpty(messages, "messages", "testLine");
	},
	
	testEllipse: function() {
		
		var svg = '<?xml version="1.0" encoding="utf-8"?>\
			<!-- Generator: Adobe Illustrator 15.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->\
			<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\
			<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\
				 width="320px" height="320px" viewBox="0 0 320 320" enable-background="new 0 0 320 320" xml:space="preserve">\
			<ellipse transform="matrix(-0.5441 -0.839 0.839 -0.5441 198.5936 347.5117)" opacity="0.47" fill="#ED1C24" enable-background="new    " cx="193.708" cy="119.802" rx="49.792" ry="68.958"/>\
			</svg>';
			
		var reference = {
		  "asset": "Circle",
		  "left": 194,
		  "top": 120,
		  "angle": -33,
		  "width": 138,
		  "height": 100,
		  "opacity": 1,
		  "fill": "#ED1C24",
		  "flipX": false,
		  "flipY": false,
		  "selectable": true
		}
		var errors = [];
		var messages = [];
		
		this.testAgainstReference(svg, reference, errors, messages);
		this.assertEmpty(errors, "errors", "testEllipse");
		this.assertEmpty(messages, "messages", "testEllipse");
	},
		
	testRectangle: function() {
		
		var svg = '<?xml version="1.0" encoding="utf-8"?>\
			<!-- Generator: Adobe Illustrator 15.1.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->\
			<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\
			<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\
				 width="320px" height="320px" viewBox="0 0 320 320" enable-background="new 0 0 320 320" xml:space="preserve">\
			<rect x="200.836\" y=\"112.705\" transform=\"matrix(-0.9689 0.2475 -0.2475 -0.9689 532.4979 234.3092)\" fill=\"#27AAE1\" width=\"101.373\" height=\"75.835\"/>\
			</svg>';
			
		var reference = 
		{
		  "asset": "Square",
		  "left": 251,
		  "top": 150,
		  "angle": -14.148994447310963,
		  "width": 102.3603357414132,
		  "height": 76.06827615105013,
		  "opacity": 1,
		  "fill": "#27AAE1",
		  "flipX": false,
		  "flipY": false,
		  "selectable": true
		};
		
		var errors = [];
		var messages = [];
		
		this.testAgainstReference(svg, reference, errors, messages);
		this.assertEmpty(errors, "errors", "testRectangle");
		this.assertEmpty(messages, "messages", "testRectangle");
	},
	
	testGroupFlattener: function() {
		
	},
	
	testAgainstReference: function(svg, references, errors, messages) {
		errors = errors || [];
		messages =  messages || [];
		var results = this.obj.convert(svg, function(t) { messages.push(t); });
		references = $.makeArray(references);
		
		if (references.length != results.length) {
			errors.push("Reference length " + references.length + " !=  " + "results length " + results.length);
			return;
		}
		
		$.each(references, function(ix, reference) {
			var result = results[ix];
			for(key in result) {
				if (!result.hasOwnProperty(key)) {
					continue;
				}
				var ref = reference[key];
				var res = result[key];
				if (ref != res && (typeof(ref) != "number" || Math.abs(ref - res) > 1)) {
					errors.push("Test failed for index " + ix + " property: "   + key + "(" + typeof(ref) + ")" + ". Expected: " + ref + " Actual: " + res + " delta: " + (ref-res));
				}
			}
		});
	},
	
	assertEmpty: function(messages, messageType, context) {
		if (messages.length > 0) {
			var _self = this;
			_self.log("Errors in function " + context + ": unexpected " + messageType + ": ");
			$.each(messages, function(index, item) {
				_self.log(index + " " + item);
			});
		}
	}
});
