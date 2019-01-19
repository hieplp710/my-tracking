ALTER TABLE `tracking_devices` ADD COLUMN `sim_infor_bak` 
VARCHAR(500) NULL AFTER `current_state_mobile`; 

UPDATE tracking_devices SET sim_infor_bak = sim_infor ;

UPDATE tracking_devices SET sim_infor = REPLACE(sim_infor,'84122','8477') WHERE sim_infor LIKE '84122%';