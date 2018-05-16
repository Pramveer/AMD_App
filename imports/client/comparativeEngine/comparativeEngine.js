// Create an immediately invoked functional expression to wrap our code
(function () {

    // Define our constructor
    this.ComparativeEngine = function () {

        // Create global element references
        this.closeButton = null;
        this.modal = null;
        this.overlay = null;

        // Define option defaults
        var defaults = {
            className: 'fade-and-drop',
            tabName: 'pharmaTab'
        }

        // Create options by extending defaults with the passed in arugments
        if (arguments[0] && typeof arguments[0] === "object") {
            this.options = extendDefaults(defaults, arguments[0]);
        }

    }

    // Utility method to extend defaults with user options
    function extendDefaults(source, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }
        return source;
    }


    //Public Methods
    ComparativeEngine.prototype.testMethod = function () {
        console.log(this.options);
        alert("test method is called from comparative engine");
    }



    //Public Methods
    ComparativeEngine.prototype.renderCompareOptiosView = function () {
        // console.log(this.options);    
        // let tabName = getTabName(this.options);
       //  let viewConfig = getViewAndConfigByTabName(tabName).config;
      //  renderOptiosView(viewConfig);
        renderOptiosView();
    }


    ComparativeEngine.prototype.renderCompareEngineView = function () {
        // console.log(this.options);    
        let config = {
            compareConfig : getCompareConfigurations(this.options)
        }
        renderCompareView(config);
        // renderCompareView(tabName);
    }


    // suppoting Functions

    /*
    *  this functions will take the congigurations and render the first view with all the options that can be compare fo rthat perticular tab.
    */
    let renderOptiosView = () => {
        // view configurations
        // console.log(config);

        var modalBox = $('#comparativeEngineOptionsView');
        modalBox.show();

        // show loading wheel
        // pending

        // Insert OptionsView Template
        $('#ce_optionsView_container').empty();

        UI.render(Template.CompareOptionsView, $('#ce_optionsView_container').get(0));

        // assign Close event to the popup.
        assignEventToOptiosViewPopup();

        // Hide Loading wheel
        // pending

    }

    /*
    *   This function will get the tab name based on that we wil render the compare view accordingly.
    */

    let renderCompareView = (config) => {
        // view configurations
        // console.log("********************** Render Compare View *********************");
        // console.log(config);
        // console.log(tabName);

        // show loading wheel
        // pending

        // Insert CompareView Template (get compare View Template First)
        $('#ce_optionsView_container').empty();

        //UI.insert( UI.render( Template.TreatmentEfficacyCompareEngine ), $( '#ce_optionsView_container' ).get(0) );
        // let viewTemplate = getViewAndConfigByTabName(tabName).template;
        // UI.renderWithData(Template[viewTemplate], config, $('#ce_optionsView_container').get(0));

        UI.renderWithData(Template.CompareEngineView, config, $('#ce_optionsView_container').get(0));

        // assign Close event to the popup.
        assignEventToOptiosViewPopup();

        // Hide Loading wheel
        // pending

    }

    // Additional Functions
    let getTabName = (options) => {
        return options.tabName;
    }

    let getViewAndConfigByTabName = (tabName) => {
        console.log(tabName);
        let config = {};
        let template = "";

        switch (tabName) {
            case 'TreatmentEfficacyTab-Pharma':

                config = {
                    tabName: tabName,
                    compareOptions: ["SVR Trend - Viral load on Y axis", "SVR Trend - Patients count on Y axis"],
                    conpareAgainst: ["Genotype", "Medications", "Risks", "Age"]
                };

                template = "TreatmentEfficacyCompareEngine";

                break;

            case 'CompetitorAnalysisTab-Pharma':

                config = {
                    tabName: tabName,
                    compareOptions: ["Year Wise Medication usage", "Overall Cure Rate", "Genotype wise Cure Rate"],
                    conpareAgainst: ["Medications", "Risks", "Age"]
                };

                template = "CompetitorCompare";

                break;

            case 'MedicationCostTab-Pharma':

                config = {
                    tabName: tabName,
                    compareOptions: ["Year Wise Medication usage", "Overall Cure Rate", "Genotype wise Cure Rate"],
                    conpareAgainst: ["Medications", "Risks", "Age"]
                };

                template = "MedicationCostCompareEngine";

                break;

            case 'ComporbidityAnalyticsTab-Pharma':

                config = {
                    tabName: tabName,
                    compareOptions: ["Year Wise Medication usage", "Overall Cure Rate", "Genotype wise Cure Rate"],
                    conpareAgainst: ["Medications", "Risks", "Age"]
                };

                template = "ComporbidityAnalyticsCompareEngine";

                break;

            case 'DrugOccuranceTab-Pharma':

                config = {
                    tabName: tabName,
                    compareOptions: ["Year Wise Medication usage", "Overall Cure Rate", "Genotype wise Cure Rate"],
                    conpareAgainst: ["Medications", "Risks", "Age"]
                };

                template = "DrugOccuranceCompareEngine";

                break;
            
             case 'AdvanceAnalyticsTab-Pharma':

                config = {
                    tabName: tabName,
                    compareOptions: ["Year Wise Medication usage", "Overall Cure Rate", "Genotype wise Cure Rate"],
                    conpareAgainst: ["Medications", "Risks", "Age"]
                };

                template = "AdvanceAnalyticsCompareEngine";

                break;
            
            case 'compareEngineOptions':

                config = {
                    tabName: tabName,
                    compareOptions: ["Year Wise Medication usage", "Overall Cure Rate", "Genotype wise Cure Rate"],
                    conpareAgainst: ["Medications", "Risks", "Age"]
                };

                template = "compareEngineOptions";

                break;
                
            default:
                console.log("TabName does not matched with anything.");
        }

        return { config: config, template: template };
    }


    let getCompareConfigurations = (options) => {
        return options.compareConfigurations;
    }


    // assign close event to the popup
    function assignEventToOptiosViewPopup() {
        $('[data-popup-close]').on('click', function (e) {
            var targeted_popup_class = jQuery(this).attr('data-popup-close');
            $('[data-popup="' + targeted_popup_class + '"]').fadeOut(350);
            e.preventDefault();
        });
    }

} ());