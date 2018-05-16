var parts = new Array();
	var result = "";
	$(document).ready(function(){
		
		$(".tool-input").change(function(){
			result = 0;
			$(".tool-input:checked").each(function(){
				result += 1*$(this).val();
			});
			if(!isNaN(result)){
				$(".tool-result .figure").text(result+" points");
				
				/*if($(".tool-input:checked").length==4){
					if(result>=0 && result<=1){
						$(".tool-result-interpretation .class").text("Suggets low risk of problem drinking");
					}else if(result>=2 && result <= 3){
						$(".tool-result-interpretation .class").text("Indicates high suspicion for alcoholism");
					}else if(result>=4){
						$(".tool-result-interpretation .class").text("Is virtually diagnostic for alcoholism");
					}else{
						$(".tool-result-interpretation .class").html("&nbsp;");
					}
				}else{
					$(".tool-result-interpretation .class").html("&nbsp;");
				}*/
			}else{
				$(".tool-result .figure").text("");
			}
			$(this).parent().siblings(".tool-option").removeClass("selected");
			$(this).parent().addClass("selected");
		});
		
		$(".tool-option").mousedown(function(){
			$(this).find("input").click();
		});
	});