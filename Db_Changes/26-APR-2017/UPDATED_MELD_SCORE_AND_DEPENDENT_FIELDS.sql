USE `IMS_LRX_AmbEMR_Dataset`;

DROP function IF EXISTS `pin_fn_getSodiumTestStatus`;

DELIMITER $$
USE `IMS_LRX_AmbEMR_Dataset`$$
CREATE DEFINER=`root`@`%` FUNCTION `pin_fn_getSodiumTestStatus`(PatientID INT(25)) RETURNS varchar(100) CHARSET latin1
BEGIN
	DECLARE sodiumValue VARCHAR(100);
	SELECT VALUE_TXT INTO sodiumValue FROM RESULTS WHERE TEST_NM = "SODIUM" AND PATIENT_ID_SYNTH = PatientID 
	AND VALUE_TXT <> 'XYXYXY'
	AND VALUE_TXT <> 'PENDING'
	AND VALUE_TXT <> 'NEGATIVE'
	AND VALUE_TXT <> ''
	LIMIT 1;
	RETURN sodiumValue;
END$$

DELIMITER ;




USE `IMS_LRX_AmbEMR_Dataset`;

DROP function IF EXISTS `pin_fn_getMeldScoreData`;

DELIMITER $$
USE `IMS_LRX_AmbEMR_Dataset`$$
CREATE DEFINER=`root`@`%` FUNCTION `pin_fn_getMeldScoreData`(PatientID INT(25), bilirubin VARCHAR(100), creatinine VARCHAR(100), inr VARCHAR(100), sodium varchar(100)) RETURNS float(10,3)
BEGIN
/****
Get Meldscore for patient based on fourmula
Discarded empty value text

Author		Date 		 Comments
Yuvraj		16/11/2016	 Intial - Added basic logic 
Arvind		14/12/2016	 Improved lgoic for Meldscore calculation for each test
Arvind		15/12/2016	 Added order by and added more filter criteria to get most of result
Arvind		16/12/2016	 Added default MELDScore value null instead of 0
Pramveer 	10/03/2017   Modified function to get values by params instead of fetching them.  
****/
	
	DECLARE MELDScore FLOAT default null;
    
	/*
    DECLARE bilirubin VARCHAR(100);
	DECLARE creatinine VARCHAR(100);
	DECLARE inr VARCHAR(100);
    */
    /*
    -- OLD Query
	SELECT VALUE_TXT INTO bilirubin FROM RESULTS WHERE  PATIENT_ID_SYNTH = PatientID AND  (TEST_NM like '%BILIRUBIN TOTAL%' or TEST_NM in('BILIRUBIN;TOTAL','BILIRUBIN,TOTAL','TOTAL BILIRUBIN','BILIRUBINTOTAL','BILIRUBIN TOTAL','BILIRUBIN, TOTAL') ) AND VALUE_TXT <> '' AND VALUE_TXT REGEXP '^[0-9]+\\.?[0-9]*$' LIMIT 1;
	SELECT VALUE_TXT INTO creatinine FROM RESULTS WHERE PATIENT_ID_SYNTH = PatientID AND TEST_NM = "creatinine SERUM"  AND VALUE_TXT <> '' AND VALUE_TXT REGEXP '^[0-9]+\\.?[0-9]*$' LIMIT 1;
	SELECT VALUE_TXT INTO inr FROM RESULTS WHERE  PATIENT_ID_SYNTH = PatientID AND TEST_NM = "inr"   AND VALUE_TXT <> '' AND VALUE_TXT REGEXP '^[0-9]+\\.?[0-9]*$' LIMIT 1;

*/

/*
SELECT biliru.VALUE_TXT, creat.VALUE_TXT, inrs.VALUE_TXT
INTO bilirubin, creatinine, inr
FROM RESULTS as biliru
INNER JOIN RESULTS as creat
	ON (biliru.PROVIDER_ID_SYNTH = creat.PROVIDER_ID_SYNTH AND biliru.RECED_DT = creat.RECED_DT)
INNER JOIN RESULTS as inrs
	ON (biliru.PROVIDER_ID_SYNTH = inrs.PROVIDER_ID_SYNTH AND biliru.RECED_DT = inrs.RECED_DT)
WHERE biliru.PATIENT_ID_SYNTH = PatientID
	AND  (
		biliru.TEST_NM like '%BILIRUBIN TOTAL%' OR
		biliru.TEST_NM in('BILIRUBIN;TOTAL','BILIRUBIN,TOTAL','TOTAL BILIRUBIN','BILIRUBINTOTAL','BILIRUBIN TOTAL','BILIRUBIN, TOTAL') 
        )
    AND ( 
		(creat.TEST_NM LIKE '%creatinine%' OR creat.PANEL_DESC LIKE '%creatinine%' ) 
		AND creat.TEST_NM NOT LIKE '%RATIO%'  
        AND creat.TEST_NM NOT LIKE '%URINE%'  
        AND creat.PANEL_DESC NOT LIKE '%RATIO%'  
        AND creat.PANEL_DESC NOT LIKE '%URINE%'
		)
	AND (   
		inrs.TEST_NM  IN ('inr','INRATIO2','INTERNATIONAL RATIO','PROTIME','INTERNATIONAL NORMALIZED RATIO','PROTIME-INR')
		OR  inrs.PANEL_DESC  IN ('inr','INRATIO2','INTERNATIONAL RATIO','PROTIME','INTERNATIONAL NORMALIZED RATIO','PROTIME-INR')
        )
	AND biliru.PROVIDER_ID_SYNTH <> 0 
	AND biliru.VALUE_TXT <> '' 
    AND biliru.VALUE_TXT REGEXP '^[0-9]+\\.?[0-9]*$' 
    AND creat.VALUE_TXT <> '' 
    AND creat.VALUE_TXT REGEXP '^[0-9]+\\.?[0-9]*$'
    AND inrs.VALUE_TXT <> '' 
    AND inrs.VALUE_TXT REGEXP '^[0-9]+\\.?[0-9]*$'
    
ORDER BY biliru.RECED_DT ASC LIMIT 1;
	
*/

/*
Reference : https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3290919/

Formula:
MELD=9.57×ln(cr)+3.78×ln(bili)+11.20×ln(INR)+6.43

IF(bilirubin IS NULL OR creatinine IS NULL OR inr IS NULL) THEN
	SET MELDScore = NULL;
ELSE
	set MELDScore = 10*((0.957*ln(creatinine)) + (0.378*ln(bilirubin)) + (1.12*ln(inr))) + 6.43;
END IF;
    
*/
	
/*
updated Formula (Yuvraj - April 26th 17)
MELD(i) = round1[ 0.378 * loge(bilirubin)) + (1.120*loge(INR)) + (0.957*loge(creatinine)) + 0.643 ] * 10

1 rounded to the tenth decimal place.

MELD = MELD(i) + 1.32 * (137-Na) - [0.033*MELD(i)*(137-Na)]

*/

IF(bilirubin IS NULL OR creatinine IS NULL OR inr IS NULL OR sodium IS NUll) THEN
	SET MELDScore = NULL;
ELSE
	IF (sodium < 125) THEN
		SET sodium  = 125;
	END IF;
    
    IF (sodium > 137) THEN
		SET sodium  = 137;
	END IF;
    
    IF (creatinine < 1) THEN
		SET creatinine = 1;
    END IF;
    
    IF (inr < 1) THEN
		SET inr = 1;
    END IF;
    
    IF (bilirubin < 1) THEN
		SET bilirubin = 1;
    END IF;
    
	SET MELDScore = 10 * ( (0.378*ln(bilirubin)) + (1.120*ln(inr)) + (0.957*ln(creatinine))  + 0.643 );
    
    -- MELD(i) score less than 12 do not require Serum Sodium correction.
    IF(MELDScore >= 12) THEN
		set MELDScore = MELDScore + 1.32 * (137 - sodium) - (0.033 * MELDScore * (137 - sodium));
    END IF;
END IF;

RETURN MELDScore; 

END$$

DELIMITER ;




-- UPDATE sodium column in Patient table.
SET SQL_SAFE_UPDATES = 0;
UPDATE IMS_HCV_PATIENTS SET SODIUM = pin_fn_getSodiumTestStatus(PATIENT_ID_SYNTH);

-- UPDATE MELD_SCORE column in Patient table.
UPDATE IMS_HCV_PATIENTS SET MELD_SCORE = pin_fn_getMeldScoreData( PATIENT_ID_SYNTH, BILIRUBIN, CREATININE, INR_VALUE, SODIUM);

-- UPDATE CIRRHOSIS STATUS COLUMN

UPDATE  IMS_HCV_PATIENTS set CIRRHOSIS='No';

-- Update cirrhosis column value to 'Yes' based on matching criteria
UPDATE  IMS_HCV_PATIENTS set CIRRHOSIS='Yes' where (FibrosureValue>=0.74 or MELD_SCORE>=25 or APRI>=1.5);

-- update CIRRHOSISTYPE  column
update IMS_HCV_PATIENTS SET CIRRHOSISTYPE='Compensated'  WHERE (ALBUMIN <3.5 and INR_VALUE>1.3 and PLATELET_COUNT <=140 and AST/ALT>=1) and CIRRHOSIS='YES';

update IMS_HCV_PATIENTS SET CIRRHOSISTYPE='Decompensated' WHERE  CIRRHOSISTYPE <> 'Compensated' and CIRRHOSIS='yes';

update IMS_HCV_PATIENTS SET CIRRHOSISTYPE=null WHERE  CIRRHOSIS='no';