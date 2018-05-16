var parts = new Array();
	var result = "";
	var eq = "(parts['age']*parts['ast_level'])/(parts['ast_platelet_count']*Math.sqrt(parts['alt']))";
	$(document).ready(function(){
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
		
		
		$(".tool-input").keyup(function(){
			if($(this).val()!=""){
				$(this).parent().removeClass("ready");
			}else{
				$(this).parent().addClass("ready");
			}
			$(".tool-input").each(function(){
				var numeric = !isNaN(parseFloat($(this).val())) && isFinite($(this).val());
				var val = 0;
				if (!numeric || (numeric && $(this).val()<0)){
					val = 0;
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
				$(".tool-result .figure").text(result.toFixed(2));
			}else{
				$(".tool-result .figure").text("");
			}
		}).click(function(){
			$(this).keyup();
		});
	});