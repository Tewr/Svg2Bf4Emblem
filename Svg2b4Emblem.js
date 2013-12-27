/*
Copyright (C) 2013 Tor Knutsson

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var Svg2b4Emblem = {
	convert : function(svgText, log) {
		log = log || function() {};
		
		var svgDoc;
		
		try {
			svgDoc = (new DOMParser()).parseFromString(svgText, "text/xml");
		} catch (e) {
			log("Unable to load svg: " + e);
			return;
		}
		
		/* Private functions */
		var r2d = (180 / Math.PI);

		var asinDeg = function(quote) {
			return r2d * Math.asin(quote);
		}

		var acosDeg = function(quote) {
			return r2d * Math.acos(quote);
		}

		var getAccumulatedSign = function() {
			var sign = 1;
			for(var i = 0; i < arguments.length; i++) {
				sign *= ((arguments[i] < 0) ? -1 : 1);
			}
			return sign;
		}

		var getTransformationCalls = function(transformCall) {
			var calls = [];
			var r = /([a-z]*)\(([0-9\-\. ]*)\)/g; 
			
			var matches = r.exec(transformCall);
			while (matches != null) {
				calls.push({ 
					"func" : matches[1], 
					"args" : $.map(matches[2].split(" "), function(item) { return parseFloat(item); })
				});
				matches = r.exec(transformCall);
			};
			
			return calls;
		}

		var flattenGroups = function(ix, item) {
			if (item.tagName == "g") {
				return $.makeArray($(item).children().map(flattenGroups));
			}
			
			return [ item ];
		}
		
		var treatItem = function(item) {
			var fill = $(item).attr("fill");
			if (fill == "none")
			{
				fill = "#000000";
			}
			
			var opacity = $(item).attr("opacity") || 1;
			
			if (item.tagName == "line") 
			{
				fill = $(item).attr("stroke");
				if (fill == "none")
				{
					fill = "#000000";
				}
			
				var left = parseFloat($(item).attr("x1"));
				var top = parseFloat($(item).attr("y1"));
				var right = $(item).attr("x2");
				var bottom = $(item).attr("y2");
				var heightDiff = bottom - top;
				var height = Math.abs(heightDiff);
				var width = $(item).attr("stroke-width") || 1;
				var angle;
				var oppositeDiff = right - left;
				var oppositeLength = Math.abs(oppositeDiff);
				var sign = oppositeDiff < 0 ? 1 : -1;
				
				// Right & bottom must be transposed to height & angle unless line is straight
				if (right == left){
					angle = 0;
				} else {
					// Pythagora
					height = Math.sqrt(Math.pow(oppositeLength, 2) + Math.pow(height, 2));
					var angle = asinDeg(oppositeLength / height) * sign;
				}
				
				// Move starting point coords as pivot is on line center
				left = left + (oppositeDiff / 2);
				top = top + (heightDiff / 2);
			
				return {
					"asset" : "Stroke",
					"left" : left,
					"top" : top,
					"fill" : fill,
					"width" : width,
					"height": height,
					"angle" : angle,
					"opacity": opacity,
					"selectable": true
				};
			}
			
			if (item.tagName == "rect") 
			{
				
				var left = parseFloat($(item).attr("x"));
				var top = parseFloat($(item).attr("y"));
				
				var width = parseFloat($(item).attr("width"));
				var height = parseFloat($(item).attr("height"));
				
				var transform = $(item).attr("transform");
				var angle = 0;
				if (transform) {
					var calls = getTransformationCalls(transform);
					for (var i = 0; i < calls.length; i++) {
						var call = calls[i];
						if (call.func == "matrix") { 
							// call looks like matrix(a b c d e f). a is the result of -cos(x) in this case, so arccosDeg(a) = -x.
							// other matrix components can be ignored - only 2d rotations around a mid-point pivot is supported.
							angle = -getAccumulatedSign(call.args) * acosDeg(Math.abs(call.args[0]));
						}
						else {
							log("WARN: Unsupported transformation for rect: " + transformCall);
						}
					}
				}
				
				// Move starting point coords as pivot is on line center
				left = left + (width / 2);
				top = top + (height / 2);
				
				return {
					"asset" : "Square",
					"left" : left,
					"top" : top,
					"fill" : fill,
					"width" : width,
					"height": height,
					"angle" : angle,
					"opacity": opacity,
					"selectable": true
				}
			}
			
			if (item.tagName == "ellipse") 
			{
				var left = parseFloat($(item).attr("cx"));
				var top = parseFloat($(item).attr("cy"));
				
				var transform = $(item).attr("transform");
				var transform = $(item).attr("transform");
				var angle = 0;
				if (transform) {
					var calls = getTransformationCalls(transform);
					for (var i = 0; i < calls.length; i++) {
						var call = calls[i];
						if (call.func == "matrix") { 
							// call looks like matrix(a b c d e f). a is the result of sin(x) in this case, so arcsinDeg(a) = x.
							// other matrix components can be ignored - only 2d rotations around a mid-point pivot is supported.
							angle = -getAccumulatedSign(call.args) * asinDeg(Math.abs(call.args[0]));
						}
						else {
							log("WARN: Unsupported transformation for rect: " + transformCall);
						}
					}
				}
				
				var width = parseFloat($(item).attr("ry")) * 2;
				var height = parseFloat($(item).attr("rx")) * 2;
				
				return {
					"asset": "Circle",
					"left": left,
					"top": top,
					"width": width,
					"height": height,
					"fill": fill,
					"angle": angle,
					"opacity" : opacity,
					"selectable": true
				};
			}
		
			log("WARN: Skipped unsupported object " + item.tagName);
		}
		
		var results = [];
		$("svg", svgDoc).children().map(flattenGroups).each(function(ix, item) {
			var result = treatItem(item);
			if (result) {
				results.push(result);
			}
		});
		
		if (results.length > 40) {
			log("WARN: Too many objects - some objects will not be visible. Max is 40, found " + results.length);
		}
		
		return results;
	}
}