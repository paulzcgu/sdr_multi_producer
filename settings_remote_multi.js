
// SDR 
// =========== SDR Conf Start =========
// Total count of SDR 
var sdr_cnt = 2;

var sdr_conf = 
    [
	{
	    "sdr_name"       : "rx01",
	    "serial_no"      : "99",
	    "sdr_drive"      : "rtlsdr",
	    "rx_freq"        : 462.5625,
	    "offset_center"  : 250e3,
	    "center_freq"    : 462.5600,
	    "rx_gain"        : 35,
	    "threshold"      : 10
	},
	{
	    "sdr_name"       : "rx02",
	    "serial_no"      : "02",
	    "sdr_drive"      : "rtlsdr",
	    "rx_freq"        : 462.6625,
	    "offset_center"  : 250e3,
	    "center_freq"    : 462.6600,
            "rx_gain"        : 35,
	    "threshold"      : 10
	}
    ];

// ========== SDR Conf End===========


// MQTT
// Get messages :
// mosquitto_sub -h <mqtt_server_ip> -t SDR/station_1/rms will display received level on terminal.
// transcoded messages from WAV : mosquitto_sub -h <mqtt_server_ip> -t SDR/station_1/whisper

var use_mqtt = true;   //  true/false
var mqtt_server = '192.168.2.1';



// destination directory for IQ, WAV and txt files (with trailing /)
var dest_folder='/tmp/transcriber/';

// Add more messages (signal level , whisper stdout + stderr)
var debug=false;   // true/false

// Retry in case something happened
var max_retry_per_task = 5;
