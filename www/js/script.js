
var allowUnload = false
var isElectron = navigator.userAgent.toLowerCase().indexOf('electron/') > -1
var activePhase = 0
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
        const remote = require('electron').remote;

        ipcRenderer.on('devmode', (event, arg) => {
            console.log('devmode'); 
            allowUnload = true
            $('.controls').show()
        })

        // Controls
        $('#quit').on('click', ()=>{ console.log('quit'); ipcRenderer.sendSync('quit') })
        $('#shutdown').on('click', ()=>{ ipcRenderer.sendSync('shutdown') })
        $('#reload').on('click', ()=>{ 
            console.log('reload'); 
            ipcRenderer.sendSync('reload') 
        })
        $('#clear').on('click', ()=>{ 
            console.log('clear'); 
            Cookies.remove('name')
            ipcRenderer.sendSync('reload') 
        })
    }

    // Prevent Closing (Alt+F4)
    //
    window.onbeforeunload = (e) => { if (!allowUnload) e.returnValue = false; };
    
    // Intro  (splash + name)
    //
    function intro() 
    {
        // Hide splash
        //
        $('.connecting').hide()

        // Validate name
        //
        $('#nameok').on('click touchend', () => 
        {
            var newname = $('#namenem').val().trim()
            if (newname != '') {
                myName = newname
                Cookies.set('name', myName)

                // Fullscreen
                //document.body.requestFullscreen();
                window.addEventListener("orientationchange", function() {
                    document.body.requestFullscreen();
                }, false);
                $('.namescreen').hide()
                $('.namedisplay').html(myName)
                $('.info').show()
                $('.content').show()
            }
        })
        $('#namenem').keyup(function(e){
            if(e.keyCode == 13) $('#nameok').click()
        });

        // Name loaded from cookies
        //
        if (myName !== undefined) {
            $('#namenem').val(myName)
            $('#nameok').click()
        }
    }

    // SocketIO
    //
    var socket = io();

    socket.on('connect', (socket) => {
        console.log('connected')
        setTimeout(intro, 500);
    }); 
    
    socket.on('quit',       ()=>{ $('#quit').click() })
    socket.on('shutdown',   ()=>{ $('#shutdown').click() })
    socket.on('reload',     ()=>{ $('#reload').click() })

    socket.on('phase', (data)=>{
        console.log('phase', data)
        activePhase = data

        // TODO phase change
    })

    
    // PLAYER
    //
    var streamId = "777187855142290250008016";
    var streamId = "LiveApp";

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
		websocket_url : "wss://kademe.kxkm.net:5443/WebRTCAppEE/websocket",
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