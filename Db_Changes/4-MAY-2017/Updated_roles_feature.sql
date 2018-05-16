USE `IMS_LRX_AmbEMR_Dataset`;

Alter table login_master add column is_super_user tinyint default 0; 

Insert into IMS_LRX_AmbEMR_Dataset.organization_master (org_id, name, network_id) values(255, 'PHS', 1);


USE `IMS_LRX_AmbEMR_Dataset`;
DROP procedure IF EXISTS `AddUser`;

DELIMITER $$
USE `IMS_LRX_AmbEMR_Dataset`$$
CREATE DEFINER=`root`@`%` PROCEDURE `AddUser`(IN `usr` VARCHAR(50), IN `pass` VARCHAR(50), IN `email` VARCHAR(50), IN `orgid` INT, IN `roleid` INT, IN `fname` VARCHAR(50), IN `lname` VARCHAR(50), IN `op_mode` VARCHAR(10), IN `tabs` VARCHAR(500),IN `gender` VARCHAR(20), `superuser` tinyint)
IF `op_mode`="I" or "i" THEN
INSERT INTO `login_master`(`username`, `password`, `status`, `Email`, `org_id`,`role`,`first_name`,`last_name`,`tabs_name`,`gender`,`is_super_user`)
VALUES (usr,
        AES_ENCRYPT(pass,'pin!@#$%'),
        1,
        email,
        orgid,
        roleid,
        fname,
        lname,
        tabs,
        gender,
        superuser);

 ELSEIF `op_mode`="U" or op_mode="u" THEN
UPDATE `login_master`
SET `Email`=email,
    `role`=roleid,
    `first_name`=fname,
    `last_name`=lname,
    `tabs_name`=tabs,
    `is_super_user`= superuser
WHERE `username` =usr;

 END IF$$

DELIMITER ;



USE `IMS_LRX_AmbEMR_Dataset`;
DROP procedure IF EXISTS `validateUser`;

DELIMITER $$
USE `IMS_LRX_AmbEMR_Dataset`$$
CREATE DEFINER=`root`@`localhost` PROCEDURE `validateUser`(IN `usr` VARCHAR(50), IN `pass` VARCHAR(50))
BEGIN
	
    Select Count(*) as UserCount,username,email,om.name as organization,lm.org_id,lm.role,rm.role_name,lm.tabs_name,lm.gender,first_name, is_super_user from login_master lm join organization_master om on lm.org_id=om.org_id
join role_master rm on lm.role=rm.role_id   WHERE (lm.username=usr or lm.email=usr) and lm.password=AES_ENCRYPT(pass,'pin!@#$%') and lm.status=1;
END$$

DELIMITER ;
