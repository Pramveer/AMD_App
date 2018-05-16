var parts = new Array();
var result = "";
var result_na = "";
var final_result = "";

var eq = "0.378*Math.log(parts['bilirubin'])+1.120*Math.log(parts['inr'])+0.957*Math.log(parts['creatinine'])+0.643";
var eq_na = "parts['meld']+1.32*(137-parts['sodium'])-(0.033*parts['meld']*(137-parts['sodium']))";
$(document).ready(function() {
    $(".tool-input").addClass("empty").tipTip({ maxWidth: "250px", edgeOffset: 0, delay: 0, defaultPosition: "left", fadeIn: 50 });

    $(".result-meld-na").addClass("inactive");
    $(".used").hide();

    $(".tool-check").change(function() {
        if ($(this).attr("name") == "dialysis") {
            if ($(this).val() == 1) {
                $("#creatinine").val("4.0").attr("disabled", "disabled").keyup();
            } else {
                $("#creatinine").removeAttr("disabled").keyup();
            }
            $("#creatinine").keyup();
        }
    });

    $(".tool-input").focusin(function() {
        $(this).parent().removeClass("empty");
        if ($(this).val() == "") {
            $(this).parent().addClass("ready");
        }
    }).focusout(function() {
        if ($(this).val() == "") {
            $(this).parent().addClass("empty").removeClass("ready");
        }
        $(this).parent().removeClass("ready");

        if ($(this).attr("id") == "creatinine") {
            if ($(this).val() > 4) {
                $(this).val(4);
                $(this).keyup();
            }
        }
    });


    $(".tool-input").keyup(function() {
        if ($(this).val() != "") {
            $(this).parent().removeClass("ready");
        } else {
            $(this).parent().addClass("ready");
        }

        if ($("#bilirubin").val() == "" || $("#creatinine").val() == "" || $("#inr").val() == "" || $("#sodium").val() == "" || (!$("#dialysis_0").prop("checked") && !$("#dialysis_1").prop("checked"))) {
            $(".score .figure").text(" ");
            $(".tool-result-na .figure").text(" ");
            $(".result-meld").removeClass("inactive");
            $(".result-meld-na").addClass("inactive");
            $(".used").hide();
            $(".not-used").show();

            return;
        }

        $(".tool-input").each(function() {

            var numeric = !isNaN(parseFloat($(this).val())) && isFinite($(this).val());

            var val = 1.0;
            if (!numeric || (numeric && $(this).val() < 1)) {
                val = 1.0;
            } else {
                val = $(this).val();
                if (val != 0) {
                    val = val.replace(/^0+/, '');
                }
            }

            if ($(this).attr("id") == "creatinine") {
                if (val > 4) {
                    val = 4;
                }
            }

            var elem = "parts['" + $(this).attr("id") + "'] = " + val + ";";
            console.log(elem);
            eval(elem);
        });
        result = eval(eq);
        if (!isNaN(result)) {
            result = result.toFixed(1) * 10;
            if (result > 40) {
                result = 40;
            }

            final_result = result;

            $(".score .figure").text(result.toFixed(0));
            $(".tool-result-na .figure").text(result.toFixed(0));
            $("#meld").val(result.toFixed(0));

            if (result.toFixed(0) > 11) {
                //If the initial meld result is greater than 11, execute MELD NA

                $(".result-meld-na").removeClass("inactive");
                $(".used").show();
                $(".not-used").hide();

                if ($("#sodium").val() == "") {
                    $(".tool-result-na .figure").text("");
                    $(".tool-result-interpretation .class").html("&nbsp;");
                    final_result = "";
                    return;
                } else if (parts['sodium'] < 125) {
                    parts['sodium'] = 125;
                } else if (parts['sodium'] > 137) {
                    parts['sodium'] = 137;
                } else {

                }

                console.log("parts['sodium'] = " + parts['sodium'] + ";");

                result_na = eval(eq_na);
                final_result = result_na.toFixed(0);

                if (!isNaN(result_na)) {
                    if (result_na > 40) {
                        result_na = 40;
                    }
                    $(".tool-result-na .figure").text(result_na.toFixed(0));
                } else {
                    $(".tool-result-na .figure").text("");
                }
            } else {
                $(".tool-result-na .figure").text(result.toFixed(0));
                $(".result-meld-na").removeClass("inactive");
                $(".used").hide();
                $(".not-used").show();
            }

            if (final_result >= 0 && final_result < 10) {
                $(".tool-result-interpretation .class").text("1.9% mortality");
            } else if (final_result >= 10 && final_result < 20) {
                $(".tool-result-interpretation .class").text("6.0% mortality");
            } else if (final_result >= 20 && final_result < 30) {
                $(".tool-result-interpretation .class").text("19.6% mortality");
            } else if (final_result >= 30 && final_result < 40) {
                $(".tool-result-interpretation .class").text("52.6% mortality");
            } else if (final_result >= 40) {
                $(".tool-result-interpretation .class").text("71.3% mortality");
            } else {
                $(".tool-result-interpretation .class").html("&nbsp;");
            }
        } else {
            $(".score .figure").text("");
        }
    }).click(function() {
        $(this).keyup();
    });
});