import { Template } from 'meteor/templating';
import {
    Meteor
} from 'meteor/meteor';
import './comporbidityAnalyticsCompareEngine.html';

import {
    Promise
} from 'meteor/promise';


Template.ComporbidityAnalyticsCompareEngine.onCreated(function() {

});

Template.ComporbidityAnalyticsCompareEngine.rendered = function() {

     ////Set eaqual height for each compare row
       equalHeight($(".pin-comp-col1"));
        equalHeight($(".pin-comp-col2"));
        equalHeight($(".pin-comp-col3"));
        ////Set padding dynamic for each row in compare view
         $(".pin-comp-col1-header").css('padding-top', (($(".pin-comp-col1").height() / 2) - 15));
        $(".pin-comp-col2-header").css('padding-top', (($(".pin-comp-col2").height() / 2) - 15));
        $(".pin-comp-col3-header").css('padding-top', (($(".pin-comp-col3").height() / 2) - 15));
        
        if ($(".pin-comp-body-single-drug").length <= 3) {
            //// Set Dynamic Width for vertical column based on count
            $(".pin-comp-body-single-drug").css('width', ($(".pin-comp-body").width() - ($(".pin-comp-body-single-drug").length * 10)) / $(".pin-comp-body-single-drug").length);
            $(".pin-comp-body-scroll").css('width', (($(".pin-comp-body-single-drug").length * $(".pin-comp-body-single-drug").outerWidth()) + ($(".pin-comp-body-single-drug").length * 10)));
        }
        else {
            //// Set Dynamic scroll view based on total width for each vertical column
            $(".pin-comp-body-scroll").css('width', (($(".pin-comp-body-single-drug").length * $(".pin-comp-body-single-drug").outerWidth()) + ($(".pin-comp-body-single-drug").length * 10)));
        }

}

function generateCompareData(){
    //// Prepare Header dynamic based on provided measure
let headerHtml=`<div class="pin-comp-header">
            <div class="pin-comp-col1">Year Wise Medication usage</div>
            <div class="pin-comp-col2">Overall Cure Rate</div>
            <div class="pin-comp-col3">Genotype wise Cure Rate</div>
        </div>`;
        //// Prepare body for each each measure based on feature(Medication,Comorbidities)
let bodyHtml=`  <div class="pin-comp-body">`;
////This will be loop
bodyHtml+=`<div class="pin-comp-body-single-drug">
                <div class="pin-comp-col1">
                    <table>
                        <tbody>
                            <tr>
                                <td>2013</td>
                                <td>10%</td>
                            </tr>
                            <tr>
                                <td>2014</td>
                                <td>10%</td>
                            </tr>
                            <tr>
                                <td>2015</td>
                                <td>10%</td>
                            </tr>
                            <tr>
                                <td>2016</td>
                                <td>10%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="pin-comp-col2">
                    <div>Undetectable SVR  12.6%</div>
                    <div>Detectable SVR  12.6%</div>
                </div>
                <div class="pin-comp-col3">
                    <table>
                        <tbody>
                            <tr>
                                <td>1a</td>
                                <td>2013</td>
                                <td>10%</td>
                            </tr>
                            <tr>
                                <td>1a</td>
                                <td>2014</td>
                                <td>10%</td>
                            </tr>
                            <tr>
                                <td>1a</td>
                                <td>2015</td>
                                <td>10%</td>
                            </tr>
                            <tr>
                                <td>1a</td>
                                <td>2016</td>
                                <td>10%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>`+'</div>';
            ////Add End tag in body for class 'pin-comp-body'
         //   bodyHtml=+'</div>';
    let finalHtml=headerHtml+bodyHtml +bodyHtml+bodyHtml+'</div>';
}

function DisplayPharmaCompareData(){

     var compareHtml = '<div class="grid-fix-cell">' +

                '<div class="cprsHeaader c-drug-tbl-div">' +
                '<div class="cprsDrug_Cell c-drug-tbl-title" title="' + filterDrugs[i].DrugName + '"><p>' + drugName + '</p></div>' +
                '</div>' +
                '<div class="cprsInnerdivContainer">' +
                '<div class="cprsInnerdiv">' +
                '<div class="cplsLables">&nbsp;</div>' +
                '<div class="cplsMeasures">' + fixToInteger(filterDrugs[i].Efficacy.Efficacy) + '%</div>' +
                '</div>' +
                '<div class="cprsInnerdiv">' +
                '<div class="cplsLables">&nbsp;</div>' +
                '<div class="cplsMeasures">' + (isNaN(filterDrugs[i].Safety) ? 0 : fixToInteger(filterDrugs[i].Safety)) + '%</div>' +
                '</div>' +
                '<div class="cprsInnerdiv">' +
                '<div class="cplsLables">&nbsp;</div>' +
                '<div class="cplsMeasures">' + fixToInteger(filterDrugs[i].Adherence.Adherence) + '%</div>' +
                '</div>' +
                '<div class="cprsInnerdiv">' +
                '<div class="cplsLables">&nbsp;</div>' +
                '<div class="cplsMeasures">' + fixToInteger(filterDrugs[i].Utilization.Utilization) + '%</div>' +
                '</div>' +
                '<div class="cprsInnerdiv">' +
                '<div class="cplsLables">&nbsp;</div>' +
                '<div class="cplsMeasures">' + GenerateCostSymbol(filterDrugs[i].Cost.TotalCost) + '</div>' +
                // '<div class="cplsMeasures">' + GenerateCostSymbol(filterDrugs[i].Cost.PatientCW12) + '</div>' +
                '</div>' +
                '<div class="cprsInnerdiv">' +
                '<div class="cplsMeasures">' + svgContainer + '</div>' +
                '<div class="cplsLables">&nbsp;</div>' +
                '</div>' +
                '</div>' +

                '</div>';


            $('#compare-content').append(compareHtml);
}
/**
 * Descciption :Set same height for provided element
 *
 */
function equalHeight(group) {
        tallest = 0;
        group.each(function () {
            thisHeight = $(this).height();
            if (thisHeight > tallest) {
                tallest = thisHeight;
            }
        });
        group.height(tallest);
    }