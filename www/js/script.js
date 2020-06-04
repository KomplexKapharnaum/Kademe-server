var FULLSCREEN = true

var allowUnload = false
var isElectron = navigator.userAgent.toLowerCase().indexOf('electron/') > -1
var myName = Cookies.get('name')

//
//  Run
//
$(function() {

    // Electron specific
    //
    if (isElectron) 
    {
        const { ipcRenderer } = require('electron')

        ipcRenderer.on('devmode', (event, arg) => {
            console.log('devmode');
        })
    }

    // Prevent Closing (Alt+F4)
    //
    if (FULLSCREEN) window.onbeforeunload = (e) => { if (!allowUnload) e.returnValue = false; };
    
    // Devmode
    document.onkeyup = function(e) {
       if (e.ctrlKey && e.altKey  && e.which == 75) $(".controls").show()
    };


    function introduceMe() {
        $('.namedisplay').html(myName)
        socket.emit('iam', myName)  

        // Fullscreen
        if (FULLSCREEN) {
            document.body.requestFullscreen();
            window.addEventListener("orientationchange", function() {
                document.body.requestFullscreen();
            }, false);
        }
    }

    var kontroller = {

        // Name request
        //
        name: () => 
        {   
            // Show
            $('.widget').hide()
            $('.widget-name').show()

            // Validate name
            //
            $('#nameok').unbind().on('click touchend', () => 
            {
                var newname = $('#namenem').val().trim()
                if (newname != '') {
                    myName = newname
                    Cookies.set('name', myName)
                    introduceMe()
                }
            })
            $('#namenem').unbind().keyup(function(e){
                if(e.keyCode == 13) $('#nameok').click()
            });
        },

        // Intro
        //
        intro: () => 
        {
            // Show
            $('.widget').hide()
            $('.widget-intro').show()
        },

        // Live
        //
        live: () => 
        {
            // Show
            $('.widget').hide()
            $('.widget-live').show()
        },

        // Shutdown
        //
        shutdown: () =>
        {
            console.log('shutdown')
            if (isElectron) ipcRenderer.sendSync('shutdown') 
            
            // fake shutdown
            else {
                // TODO !!!
                setTimeout(kontroller['quit'], 5000)
            }
        },

        // Quit
        //
        quit: () =>
        {
            console.log('quit')
            allowUnload = true
            if (isElectron) ipcRenderer.sendSync('quit') 

            // browser quit
            else  {
                // TODO !!!
                document.exitFullscreen();
            }
        },

        // Reload
        //
        reload: () =>
        {
            console.log('reload')
            allowUnload = true
            if (isElectron) ipcRenderer.sendSync('reload') 
            else location.reload()
        },

        // Clear
        //
        clear: () =>
        {
            console.log('clear')
            Cookies.remove('name')
            kontroller['reload']()
        }


    } 


    // SocketIO
    //
    var socket = io();

    socket.on('connect', () => {
        console.log('connected')

        // Name missing => goto name display
        if (myName == undefined || myName == '') {
            kontroller['name']()
        }
        // Name ok: declare to server
        else introduceMe()
    }); 
    
    // Receive Cmd => call action
    //
    socket.on('cmd', (data) => {
        console.log('cmd received: ', data)
        if (data['action'] == 'phase') kontroller[data['arg']]()
        else kontroller[data['action']](data['arg']);
    })

    // Bind Controls BTNS -> Send cmd to server in order to broadcast
    //
    $(".ctrlBtn").on('click', function(event){
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        let cmd = {
            'action':   $(this).data('action'),
            'arg':      $(this).data('arg')
        }
        socket.emit('cmd', cmd)
    });

    
    // PLAYER
    //
    var streamId = "724747693896597453572303";
    // var streamId = "streamtest";

    function playVideo() {
	   $("#remoteVideo").show();
	   document.getElementById("remoteVideo").play().then(function(value){
           //autoplay started
		   $("#play_button").hide();
       }).catch(function(error) {
			$("#play_button").show();
			console.log("User interaction needed to start playing");
       });

	}

	var pc_config = null;
    
	var webRTCAdaptor = new WebRTCAdaptor({
		websocket_url : "wss://kademe2.kxkm.net:5443/WebRTCAppEE/websocket",
		mediaConstraints : { video : false, audio : false },
		peerconnection_config : pc_config,
		sdp_constraints : { OfferToReceiveAudio : true, OfferToReceiveVideo : true },
		remoteVideoId : "remoteVideo",
		isPlayMode: true,
		debug: true,
		callback : function(info, description) {
			if (info == "initialized") {
				console.log("initialized");
				webRTCAdaptor.getStreamInfo(streamId);
			}
			else if (info == "streamInformation") {
				console.log("stream information");
				webRTCAdaptor.play(streamId);
			}
			else if (info == "play_started") {
				//joined the stream
				console.log("play started");
				$("#video_info").hide();
				playVideo();
			} else if (info == "play_finished") {
				//leaved the stream
				console.log("play finished");
				//check that publish may start again
				setTimeout(function(){
					webRTCAdaptor.getStreamInfo(streamId);
				}, 3000);
			}
			else if (info == "closed") {
				console.log("Connection closed");
				if (typeof description != "undefined") {
					console.log("Connecton closed: " + JSON.stringify(description));
				}
			}
		},
		callbackError : function(error) {
			//some of the possible errors, NotFoundError, SecurityError,PermissionDeniedError
			console.log("error callback: " + JSON.stringify(error));
			
			if (error == "no_stream_exist") {
				setTimeout(function(){
					webRTCAdaptor.getStreamInfo(streamId);
				}, 3000);
			}
			//alert(JSON.stringify(error));
		}
	});

});