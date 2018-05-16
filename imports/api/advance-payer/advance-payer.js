/*if (Meteor.isServer) {
	//For closing Db connection and application
    var closeAndExit = function() {
        liveDb.end();
        process.exit();
    };

    process.on('SIGTERM', closeAndExit);
    // Close connections on exit (ctrl + c)
    process.on('SIGINT', closeAndExit);
	
    
    //
    Meteor.publish('getPatientsGenotypeCirrhosis', function() {
        var query = 'select count(*) as count,hcv_genotype,hcv_cirrhosis from HCV_patients group by hcv_genotype,hcv_cirrhosis;';

        return liveDb.select(query, [{
            table: "HCV_patients"
        }]);
    });

    //get list of insurance plan from patients
    Meteor.publish('getClaimsInsurancePlans', function() {
        var query = 'select distinct claims_insurancePlan from HCV_patients';
        return liveDb.select(query, [{
            table: "HCV_patients"
        }]);
    });

    //get list of genotype from patients
    Meteor.publish('getGenotypeList', function() {
        var query = 'select distinct hcv_genotype from HCV_patients order by hcv_genotype';
        return liveDb.select(query, [{
            table: "HCV_patients"
        }]);
    });

    //get list of year data
    Meteor.publish('getListOfYear', function() {
        var query = 'select (max(year(dischargeDate))-min(year(dischargeDate)))+1 as year from HCV_patients;';
        return liveDb.select(query, [{
            table: "HCV_patients"
        }]);
    });

    //get patient count treated,untreated,treating
    Meteor.publish('getAdvPayer_PatientsCount', function() {
        var query = 'select (select count(*) from HCV_patients  where medication!="" and dischargeDate is not null) as treated,'+
            '(select count(*) from HCV_patients  where medication = " " and dischargeDate is null ) as untreated,'+
            '(select count(*) from HCV_patients  where medication!="" and dischargeDate is  null) as treating;';
        
        return liveDb.select(query, [{
            table: "HCV_patients"
        }]);
    });
}
 */