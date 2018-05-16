var parts = new Array();
	var result = "";
	var eq = "((140-parts['age'])*parts['weight']*parts['system'])/(72*parts['creatinine'])*parts['sex']";
	$(document).ready(function(){
	//	$(".tool-input").addClass("empty").tipTip({maxWidth: "250px", edgeOffset: 0, delay: 0, defaultPosition: "right", fadeIn: 50});
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
					
				}
				var elem = "parts['"+$(this).attr("id")+"'] = "+val+";";
				console.log(elem);
				eval(elem);
			});
			result = eval(eq);
			if(!isNaN(result)){
				result = result.toFixed(1);
				$(".tool-result .figure").text(result);
				$(".tool-result .units").text("mL/min");
			}else{
				$(".tool-result .figure,.tool-result .units").text("");
			}
			
		}).click(function(){
			$(this).keyup();
		}).change(function(){
			$(this).keyup();
		});
	});