ALTER TABLE `device_locations`
DROP PRIMARY KEY,
ADD PRIMARY KEY (`id`, `created_at`);

ALTER TABLE `device_locations`
 PARTITION BY RANGE(MONTH(created_at)) (
	PARTITION part0 VALUES LESS THAN (1),
    PARTITION part1 VALUES LESS THAN (2),
    PARTITION part2 VALUES LESS THAN (3),
    PARTITION part3 VALUES LESS THAN (4),
    PARTITION part4 VALUES LESS THAN (5),
    PARTITION part5 VALUES LESS THAN (6),
    PARTITION part6 VALUES LESS THAN (7),
    PARTITION part7 VALUES LESS THAN (8),
    PARTITION part8 VALUES LESS THAN (9),
    PARTITION part9 VALUES LESS THAN (10),
    PARTITION part10 VALUES LESS THAN (11),
    PARTITION part11 VALUES LESS THAN (12),
    PARTITION part12 VALUES LESS THAN MAXVALUE) ;