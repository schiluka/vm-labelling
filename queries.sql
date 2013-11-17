create database vm;

CREATE TABLE vm_videos (
		videoId MEDIUMINT NOT NULL AUTO_INCREMENT,
		boxLink char(100) NOT NULL,
		lableIds char(200) NOT NULL,
     PRIMARY KEY (videoId)
);

CREATE TABLE vm_labels (
		labelId MEDIUMINT NOT NULL AUTO_INCREMENT,
		category char(50) NOT NULL,
		label char(50),
     PRIMARY KEY (labelId)
);


select * from vm_videos;

select * from vm_labels;

SELECT 1 + 1 AS solution;

SELECT 123 * 123 AS solution;