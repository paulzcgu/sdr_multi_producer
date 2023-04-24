// Record and NBFM demodulate VHF signal, the pipe it to whisper.cpp

include('settings_remote_multi.js');

// MQTT Setup

if (use_mqtt) {
    var stations_rms = {
	'host': mqtt_server,
	'login': '',
	'pass' : '',
	'topic': 'SDR/station_1/rms',
	'mode' : 'write' 
    };
    print('Create MQTT : SDR/station_1/rms');
    MBoxCreate('rms1',stations_rms);
}

// Create RXs 
print('Start Create RXs');
print(sdr_cnt);
print(sdr_conf);

var rxs = [];

print(JSON.stringify(sdr_conf));
for (i = 1; i <= sdr_cnt; i++) {
    print(''.concat('Processing # ', i, 'RX Config'));
    var cfg = sdr_conf[i-1];
    print(JSON.stringify(cfg));

    var query = "".concat('driver=',cfg.sdr_drive,',serial=',cfg.serial_no);
    print(query);
    var rx = Soapy.makeDevice({'query': query, 'device_name':cfg.sdr_name});

    if( typeof rx != 'object' ) {
	print('no radio ?');
	exit();
    }

    if( !rx.isValid()) {
	print('no radio ?');
	exit();
    }

    if( rx.isAvailable() ) {
	// set sample rate
	if( rx.setRxSampleRate( 2e6 )) {
	    print('Sample rate changed');
	}
    } else {
       print('device is already used, we do not change Sampling Rate');
    }

    rx.setRxCenterFreq(cfg.center_freq );
    rx.setGain(cfg.rx_gain);

    print(rx.dump());
    rxs.push(rx);
}

for (i=1; i<=sdr_cnt; i++) {
    print(rxs[i-1].getRxCenterFreq());
}


// Create Tasks
for (i=1; i <= sdr_cnt; i++) {
    var cfg = sdr_conf[i-1];
    var tid = createTask('RX_single.js',cfg.sdr_name,cfg.threshold,cfg.offset_center,dest_folder,debug);
    print(tid);
}

for (;;) {}
