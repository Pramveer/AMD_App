var Efficacy = (function() {

	var drawChart = function() {

		var svgDimension = 200;

		var transX = svgDimension / 2;
		var transY = svgDimension / 2;

		var strokeWidth = 15;
		var radius = (svgDimension / 2) - strokeWidth;

		$('.efficacyBubble').each(function(index, bubble) {

			var innerText = $(bubble).data('text');

			var svg = d3.select(bubble).append("svg").attr("height", svgDimension).attr("width", svgDimension).style("background", "");
			var group = svg.append('g').attr("transform", "translate(" + transX + "," + transY + ")");

			group.append('circle')
				.attr("cx", 0)
				.attr("cy", 0)
				.attr("r", radius)
				.style("fill", "#102330")
				.style("stroke", "#DEE0DF")
				.style("stroke-width", strokeWidth)
				.style("opacity", 1);

			group.append("text")
				.attr("class", "drugNameDisplayText")
				.attr("x", 0)
				.attr("y", 0)
				.style("text-anchor", "middle")
				.style("font-size", "17px")
				.style("font-weight", "bold")
				.style("font-family", "Open Sans, sans-serif")
				.style("fill", "white")
				.style("opacity", 0.4)
				.text(getPadded(innerText) + '%');

			group.append("line")
				.style("stroke", "black")
				.attr("x1", 0)
				.attr("y1", -strokeWidth)
				.attr("x2", 0)
				.attr("y2", -(radius + strokeWidth));
		});
	};

	function getPadded(number) {
		var digit = getlength(number);
		var str = number.toString();
		if (digit == 1) {
			var str = pad(number, 2);
		}
		return str;
	}

	function pad(num, size) {
		var s = num + "";
		while (s.length < size) s = "0" + s;
		return s;
	}

	function getlength(number) {
		return number.toString().length;
	}

	return {
		drawChart: drawChart
	};

})();