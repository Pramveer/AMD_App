USE `IMS_LRX_AmbEMR_Dataset`;
DROP function IF EXISTS `pin_fn_getTreatmentStatus`;

DELIMITER $$
USE `IMS_LRX_AmbEMR_Dataset`$$
CREATE DEFINER=`root`@`%` FUNCTION `pin_fn_getTreatmentStatus`(PatientID INT(25)) RETURNS varchar(100) CHARSET latin1
BEGIN
/****
DO NOT DECLARE SAME VARIABLE NAME AS COLUMN NAME IN TABLE

Get Treatment type status from  test.Pin_YP_ViralLoadResults (which extarcted from AmbEMR.RESULTS  table)
--Below coment Added by Arvind
Previously we have calculated Naive and Experienced based on Patient's Viral Load Test Results due to that we didn’t have any Naive patient’s records for Provider Tab as Provider tab depends on viral load and Naive doesn’t have any viral Load Test.

So,Now For Naive and Experienced we have calculated from Patient’s Medication if patients have taken multiple medication then that patient should be considered as Experienced otherwise he is Naive. 
Based on new logic for Treatment , Way to find Relapsed condition also changes as it is previously depend on only viral load data.


Author		Date 		 Comments
Yuvraj		16/11/2016	 Intial - Check treatment naive or experenced based on 'HCV RNA'  test exist in Result Table.
Arvind		12/12/2016	 Improved logic for naive and experenced based on viral load result for HCV RNA and other test result
Praveen		04/27/2017	 changed table from test to IMS
Arvind      28-Apr-2017  Updated logic for populating naive and experience condition.
****/
	DECLARE patientCount INT DEFAULT 0;
	DECLARE Treatment VARCHAR(100) DEFAULT 'Naive';
    
    -- Here I have used reference table for viral load results from calculated table `test.Pin_YP_ViralLoadResults`
	-- We are setting up Experinced if patient exist in `test.Pin_YP_ViralLoadResults` which means patients have viral load test with some meaning full value.
   /* 
    IF EXISTS (SELECT 1  FROM test.Pin_YP_ViralLoadResults 
    Where PatientId=PatientID LIMIT 1)
    THEN 
	SET Treatment= 'Experienced';
    ELSE
		SET Treatment= 'Naive';
END IF;
*/

/*
IF (SELECT PatientId  FROM test.Pin_YP_ViralLoadResults 
    Where PatientId=PatientID LIMIT 1) IS NOT NULL THEN
    SET Treatment= 'Experienced';
   -- do whatever
END IF;
*/
    -- IF EXISTS (SELECT PatientId  FROM test.Pin_YP_ViralLoadResults 
	-- OLD Code 
    /*
    IF EXISTS (SELECT PatientId  FROM ALL_VIRAL_LOAD_RESULTS
		Where PatientId=Patient_ID LIMIT 1)
	THEN 
		RETURN 'Experienced';
	ELSE 
		RETURN 'Naive';
	END IF;
RETURN 'Naive';

*/
    
    IF EXISTS (
          select count(*)as count,a.*  from (SELECT * FROM 
 PATIENT_MEDICATIONS WHERE IS_PREACTING_ANTIVIRAL = 'NO' and 
 TREATMENT_PERIOD IN (8,12,16,24,36,48)
 and PATIENT_ID_SYNTH=PatientID
GROUP BY PATIENT_ID_SYNTH , MEDICATION ) a GROUP BY 
a.PATIENT_ID_SYNTH HAVING COUNT(*) > 1 limit 1
)
THEN 
	RETURN 'Experienced';
ELSE 
	RETURN 'Naive';
END IF;
RETURN 'Naive';
END$$

DELIMITER ;

