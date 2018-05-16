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
				
				if($(".tool-input:checked").length==5){
					if(result>=5 && result<=6){
						$(".tool-result .class").text("Class A. Least severe liver disease");
					}else if(result>=7 && result <= 9){
						$(".tool-result .class").text("Class B. Moderately severe liver disease");
					}else if(result>=10 && result <= 15){
						$(".tool-result .class").text("Class C. Most severe liver disease");
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