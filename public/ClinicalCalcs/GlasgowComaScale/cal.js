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
				
				if($(".tool-input:checked").length==3){
					if(result>=13 && result<=15){
						$(".tool-result .class").text("Mild brain injury");
					}else if(result>=9 && result <= 12){
						$(".tool-result .class").text("Moderate brain injury");
					}else if(result>=3 && result <= 8){
						$(".tool-result .class").text("Severe brain injury");
					}else{
						$(".tool-result .class").html("&nbsp;");
					}
				}else{
					$(".tool-result .class").html("&nbsp;");
				}
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