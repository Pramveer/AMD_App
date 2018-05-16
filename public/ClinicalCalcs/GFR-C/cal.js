var parts = new Array();
	var result = "";
	var eq = "175*Math.pow(parts['creatinine'],-1.154)*Math.pow(parts['age'],-0.203)*parts['race']*parts['sex']";
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
			var val = $(this).parents(".tool-container").find("input:checked").val();
			if(isNaN(val)){
				val = "'"+val+"'";
			}
			var elem = "parts['"+$(this).attr("name")+"'] = "+val+";";
			console.log(elem);
			eval(elem);
			
			$(".tool-input").keyup();
			
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
				if (!numeric || (numeric && $(this).val()<=0)){
					val = 0.1;
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
				$(".tool-result .units").html("mL/min/1.73m<sup>2</sup>");
			}else{
				$(".tool-result .figure").text("");
			}
			
		}).click(function(){
			$(this).keyup();
		}).change(function(){
			$(this).keyup();
		});
	});