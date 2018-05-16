var parts = new Array();
	var result = "";
	var eq_metric = "parts['weight']/((parts['height']/100)*(parts['height']/100))";
	var eq_us = "parts['weight']*703/((parts['height'])*(parts['height']))";
	var eq = eq_us;
	$(document).ready(function(){
		//$(".tool-input").addClass("empty").tipTip({maxWidth: "250px", edgeOffset: 0, delay: 0, defaultPosition: "right", fadeIn: 50});
		$(".tool-input").addClass("empty").tipTip({maxWidth: "250px", edgeOffset: 0, delay: 0, defaultPosition: "left", fadeIn: 50});
		$(".tool-input").focusin(function(){
			$(this).parent().removeClass("empty");
			if($(this).val()==""){
				$(this).parent().addClass("ready");
			}
		}).focusout(function(){
			if($(this).val()==""){
				$(this).parent().addClass("empty").removeClass("ready");
			}	
			$(this).parent().removeClass("ready");
		});
		
		
		$(".tool-check").change(function(){
			if($(this).val()=="us"){
				$(".container-height .units").text("in inches (in)");
				$(".container-weight .units").text("in pounds (lb)");
				eq = eq_us;
			}else{
				$(".container-height .units").text("in centimeters (cm)");
				$(".container-weight .units").text("in kilograms (kg)");
				eq = eq_metric;
			}
		}).change();
		
		$(".tool-input").keyup(function(){
			
			if($(this).val()!=""){
				$(this).parent().removeClass("ready");
			}else{
				$(this).parent().addClass("ready");
			}
			
			$(".tool-input").each(function(){
				if($(this).val()==""){
					return;
				}
				var numeric = !isNaN(parseFloat($(this).val())) && isFinite($(this).val());
				var val = 1.0;
				if (!numeric || (numeric && $(this).val()<1)){
					val = 1.0;
				}else{
					val = $(this).val();
					if(val!=0){
						val = val.replace(/^0+/,'');
					}
				}
				var elem = "parts['"+$(this).attr("id")+"'] = "+val+";";
				console.log(elem);
				eval(elem);
			});
			result = eval(eq);
			if(!isNaN(result)){
				result = result.toFixed(1);
				$(".tool-result .figure").text(result);
			}else{
				$(".tool-result .figure").text("");
			}
			
			if(result>=0 && result<18.5){
				$(".tool-result-interpretation .class").text("Underweight");
			}else if(result>=18.5 && result < 25.0){
				$(".tool-result-interpretation .class").text("Normal");
			}else if(result>=25.0 && result < 30.0){
				$(".tool-result-interpretation .class").text("Overweight");
			}else if(result>=30){
				$(".tool-result-interpretation .class").text("Obese");
			}else{
				$(".tool-result-interpretation .class").html("&nbsp;");
			}
		}).click(function(){
			$(this).keyup();
		});
	});