// arguments : sat_norad, satname, mqtt_filename, subband_bw
rename('FM_demod');
print('Start FM_DEMOD');

include('settings.js');
if (use_mqtt) {
   var stations_demod = {
	'host' : mqtt_server,
	'login': '',
	'pass' : '',
	'topic': 'SDR/station_1/whisper_remote_tasks',
	'mode' : 'write'
   };

   print('Create MQTT : SDR/station_1/whisper_remote_tasks');
   MBoxCreate('whisper_remote_tasks', stations_demod);
}

var input_samplerate=16000;
var output_samplerate=16000;


var IQ = new IQData();
var samples = 0 ;
var filename=argv(0);
var SRinput= {'sample_rate' : 16000};

if( !IQ.loadFromFile( filename, SRinput ) ) {
    print('cannot open file:');
    exit();
}


// Input file : set samplerate
IQ.setSampleRate(parseInt(input_samplerate));
//IQ.setCenterFrequency( 100 );

//Input file : display details
print('\nInput file : ', argv(0));
IQ.dump();
var demodulator = new NBFM('demod');
demodulator.configure( {'modulation_index': 0.5} );
//demodulator.setAGC(true);
var received_audio = demodulator.demodulate( IQ);
received_audio.saveToFile(filename + '.wav');

// optional
/*
print('sox spectrogram ...');
var c = {
	'command' : '/usr/bin/sox', 
	'args' : [filename + '.wav', '-t', 'wav', '-n', 'spectrogram', '-o', filename + '_audio.png']
} ;
var res = System.exec( c );
print(JSON.stringify(c));
sleep(200);
*/

if (use_mqtt) {
   print('MQTT Sending', filename);
   MBoxPost('whisper_remote_tasks', filename);
}

sleep(500);

print('FM_demod end.')

//var tasks = System.ps();
//print( JSON.stringify( tasks ));
