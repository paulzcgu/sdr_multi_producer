// RX_single.js
// This is the js file to monitor a specific RX
// argv:
//	- cfg.sdr_name
//	- cfg.threshold
//	- cfg.offset_center
//	- debug
rename('RX_single')

print(''.concat('Starting RX task: ', argv(0), 'with Threshold: ',argv(1), ' with Offset: ', argv(2)));

var rx_no = argv(0);
var debug = Boolean(argv(4));
var dest_folder = argv(3);

// get device
var rx = new JSRadio(argv(0));
print('Radio : ', argv(0), ' is at Freq = ', rx.getRxCenterFreq() );

// create working queues and objects
var fifo_from_rx = Queues.create( 'input'.concat(argv(0)));
var fifo_to_file = Queues.create( 'output'.concat(argv(0)));
var fifo_to_null = Queues.create( 'tonull'.concat(argv(0)));
var IQBlock = new IQData('iq'.concat(argv(0)));


// create output file
print('create out queue');
var null_filename = ''.concat('/tmp/transcriber/null_',argv(0),'.cs8');
print(null_filename);
IO.fdelete(null_filename);
fifo_to_null.writeToFile(null_filename);
print('connect queue to receiver - '.concat(argv(0)));


// engage streaming
if( !fifo_from_rx.ReadFromRx( rx ) ) {
    print('Cannot stream from rx');
    exit();
}

var recording = 0;
var slice = new DDC(rx_no);
slice.setOutBandwidth(16e3); // 24 kHz output
slice.setCenter( argv(2) ) ; // shift frequency from center

print('starting rx process (baseline - 20 blocks) - ', argv(0));


var baseline=0;
for (var a=0; a< 20; a++) {
    
    if( IQBlock.readFromQueue( fifo_from_rx )) { 
    // load samples from input queue into IQBlock object
	slice.write( IQBlock );	
	var ifdata = slice.read();
	while( ifdata.getLength() > 0 ) {
	    //print('Writing ...', ifdata.getLength());
	    print(ifdata.rms().toFixed(2),'  *** Create baseline ... ', rx_no, '-', a);
	    if (a > 0 ) {
		baseline += parseFloat(ifdata.rms().toFixed(2));
	    }
	    fifo_to_null.enqueue( ifdata ); 		// write the samples in the output queue
	    ifdata = slice.read();				// read more
	}	
    } else {
	fifo_from_rx.stop();
    }
}

var offset_center = 10;
trigger = (baseline/19) + offset_center;
print (rx_no, ' - Baseline level on last 20 blocks :', baseline/19, ' -  set trigger level : ' , trigger);

print(rx_no, ' - waiting for signal ...');

var retry_max = 10;

var retry = 0;
while(retry < retry_max){

while( fifo_from_rx.isFromRx() ) { 
    // if we have something in the input
    if( IQBlock.readFromQueue( fifo_from_rx ) ) {	 
    // load samples from input queue into IQBlock object
	slice.write( IQBlock );				 
	// write the samples in the DDC object
	var ifdata = slice.read();
	// print( 'Trigger : ', trigger);
	while( ifdata.getLength() > 0 ) {		 // if we have something
	    if  (ifdata.rms() > trigger ) {
		if (recording==0) {
		// create new file based on timestamp
		    var timestamp = new Date().toISOString().replace(/[^\w]/g, "");
		    var date = timestamp.slice(0, -4);
		    var datenow =  date.replace("T", "-") ;
		    var new_file = dest_folder + 'F_' + (rx.getRxCenterFreq() + (offset_center/1e6)).toFixed(3) + '_' + datenow + '.cf32';
		    print('New file :',  new_file) ;
		    fifo_to_file.writeToFile( new_file);
		}
		recording=1;
		print(ifdata.rms().toFixed(2),'  *** Recording ... ');
		fifo_to_file.enqueue( ifdata );		
		// write the samples in the output queue
		ifdata = slice.read();
		recording=1;		
	    } else {
		if (recording==1) {
		    print('End record');
		    Queues.delete( 'output');
		    fifo_to_file = Queues.create( 'output');
		    IO.fdelete(null_filename);
		    // createTask('start_whisper.js', '/tmp/F_' + (rx.getRxCenterFreq() + (offset_center/1e6)).toFixed(3) + '_' + datenow + '.wav' );
		    createTask('FM_demod_remote.js',new_file);
		}

		//if (debug) { print(ifdata.rms().toFixed(2),'  *** No signal !  - Trigger : ', trigger.toFixed(2));}
		fifo_to_null.enqueue( ifdata );                 
		// write the samples in the output queue
		ifdata = slice.read();
		recording=0;
	    }
	}   
    }
}
sleep(10000);
retry = retry + 1;
}
