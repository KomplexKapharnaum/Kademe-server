var FULLSCREEN = true
var allowUnload = false

var cookfield = 'name3'

var isElectron = navigator.userAgent.toLowerCase().indexOf('electron/') > -1
var myName = 'anonymous'//Cookies.get(cookfield)
var noSleep = new NoSleep()

var gaugeMax = 8
var gauge = gaugeMax
var gaugeAccel = false
var gaugeAutodec = true
var gaugeSpace = true
var gaugeTimeNormal = 1500
var gaugeTimeFreak = 100
var gaugeTimer = null

var namesCount = 0

var allNames = ['Martin', 'Thomas', 'Simon', 'Richard', 'Camille', 'Sophie', 'Martine', 'Louis', 'Justine']

toastr.options = {
    "closeButton": false,
    "debug": false,
    "newestOnTop": true,
    "progressBar": false,
    "positionClass": "toast-top-left",
    "preventDuplicates": true,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "500",
    "timeOut": "2500",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

/* View in fullscreen */
function openFullscreen() {
    var elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
      elem.msRequestFullscreen();
    }
  }
  
  /* Close fullscreen */
  function closeFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
      document.msExitFullscreen();
    }
  }

function hideKeyboard() { 
    document.activeElement.blur();
	$("input").blur();
};

function hideCursor() {
    // $('html').css("cursor", "none")
}

function showCursor() {
    // $('html').css("cursor", "pointer")
}

function setShutdownOS() {
    var userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
        iosPlatforms = ['iPhone', 'iPad', 'iPod'],
        os = null;

    if (macosPlatforms.indexOf(platform) !== -1) {
        os = 'mac';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        os = 'ios';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        os = 'win';
    } else if (/Android/.test(userAgent)) {
        os = 'andro';
    } else if (!os && /Linux/.test(platform)) {
        os = 'linux';
    }

    if (os) {
        $('#shutdown-gif').attr("src", "/img/shutdown-"+os+".gif")
        $('.suhtdownoverlay').addClass('shutdowncolor-'+os)
    }

    console.log("shutdown image:", "/img/shutdown-"+os+".gif")
}

//
//  Run
//
$(function() {

    var timeout = null;
    $('video').on('mousemove touchend', function() {
        showCursor()
        // $('.red5pro-media-control-bar').css("bottom","0px");
        // timeout = setTimeout(function() {
        //     $('.red5pro-media-control-bar').css("bottom","-65px");
        //     hideCursor()
        // }, 4000);
    });

    $('video').on('click touchend', function() {
        var video=document.getElementById('red5pro-subscriber') ; 
        video.muted = false;
        video.volume = 0.99
        video.play()
        console.log('unmute')
    })

    // Devmode
    document.onkeyup = function(e) {
       if (e.ctrlKey && e.altKey && e.key == 'K' /*&& myName.startsWith('Dick Cheney')*/) 
        $(".controls").show()
    };


    // Set FULLSCREEN
    function goFullscreen() {
        // Prevent Closing (Alt+F4)
        window.onbeforeunload = (e) => { if (!allowUnload) e.returnValue = false; };
        noSleep.enable();
        openFullscreen()
        window.addEventListener("orientationchange", function() {
            openFullscreen()
        }, false);

        if (isElectron) ipcRenderer.sendSync('fullscreen')

        $('.fs').hide()
        $('.exit').show()
    }

    // Welcome
    //
    $('#accept-welcome').on('click touchend', ()=>{
        introduceMe()
        // var video=document.getElementById('red5pro-subscriber') ; 
        // video.muted = false;
        // video.volume = 0.99
        //goFullscreen()
    })    

    // Get Name
    //
    function introduceMe() {
        socket.emit('iam', myName)  

        // Fullscreen
        //if (FULLSCREEN) goFullscreen()

        $('#red5pro-subscriber').muted = false;
    }

    // Gauge Apply
    function applyGauge(fadeSpeed) {
        $('.gauge-container').css("background-image", "url(/img/Jauge_"+gauge+".png)");
        if (gaugeSpace) {
            $('.spaceoverlay').stop();
            $('.spaceoverlay').fadeTo(fadeSpeed, (gaugeMax-gauge-1)/(gaugeMax*1.1));
        }
    }


    // Key BINDINGS
    //
    $(document).keyup(function(event) { 
        if(event.keyCode == 32 && gaugeSpace) spaceBar()
        
        else if (event.keyCode == 17 && $(".widget-ctrl").is(":visible")) {
            $('#winner-btn').click()
        }

        // console.warn(event.code )

        event.preventDefault();
        return false;
    }); 

    // $(document).on('touchend', ()=>{
    //     $("#red5pro-subscriber").play()
    //     //goFullscreen()
    // })

    // Init Kontroller
    //
    var kontroller = {

        // Name request
        //
        name: () => 
        {   
            // $("#red5pro-subscriber").prop('muted', true)

            // Show
            $('.widget').hide()
            $('.widget-name').show()
            $('.widget-exit').show()
            $('.widget-fs').show()
            showCursor()

            // Validate name
            //
            $('#nameok').unbind().on('click touchend', () => 
            {
                hideKeyboard()
                var newname = $('#namenem').val().trim()
                if (newname != '') {
                    myName = newname
                    Cookies.set(cookfield, myName)
                    
                    $('.namedisplay').html(myName)
                    kontroller['welcome']()
                }
            })
            $('#namenem').unbind().keyup(function(e){
                if(e.keyCode == 13) $('#nameok').click()
            });
        },

        // Welcome
        //
        welcome: () => 
        {
            showCursor()
            // $("#red5pro-subscriber").prop('muted', true)
            // Show
            $('.widget').hide()
            $('.widget-welcome').show()
            $('.widget-exit').show()
            $('.widget-fs').show()       
        },

        // Intro
        //
        intro: () => 
        {
            // $("#red5pro-subscriber").prop('muted', true)
            
            // Show
            $('.widget').hide()
            $('.widget-intro').show()
            $('.widget-exit').show()
            $('.widget-fs').show()

            showCursor()
            $('.fs').hide()
            $('.exit').show()
        },

        // Live
        //
        live: () => 
        {
            $("#red5pro-subscriber").prop('muted', false)

            // Show
            $('.widget').hide()
            $('.widget-live').show()
            $('.widget-exit').show()
            $('.widget-fs').show()

        },

        // Test
        //
        test: () => 
        {
            if (!$(".controls").is(":visible")) return;

            // Show
            $('.widget').hide()
            $('.widget-live').show()
            $('.widget-exit').show()
            $('.widget-fs').show()
            $("#red5pro-subscriber").prop('muted', false)

        },

        // Quit
        //
        end: () =>
        {
            console.log('end')
            // $("#red5pro-subscriber").prop('muted', true)

            $('.widget').hide()
            $('.widget-end').show()

            allowUnload = true

            if (isElectron) setTimeout(() => { ipcRenderer.sendSync('quit') }, 4000)
            else closeFullscreen()
            
            showCursor()
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
            Cookies.remove(cookfield)
            kontroller['reload']()
        }


    } 
    


    // SocketIO
    //
    var socket = io();

    socket.on('connect', () => {
        console.log('connected to socketio')

        // Name missing => goto name display
        if (myName == undefined || myName == '') {
            kontroller['name']()
        }
        // Name ok: welcome
        else {
            $('.namedisplay').html(myName)
            kontroller['welcome']()
        }
    }); 
    
    // Receive Cmd => call action
    //
    socket.on('cmd', (data) => {
        console.log('cmd received: ', data)
        if (data['action'] == 'phase') kontroller[data['arg']](data['from'])
        else kontroller[data['action']](data['arg'], data['from']);
    })

    // Names
    socket.on('allNames', (data) => {
        console.log('allNames received: ', data)
        allNames = data
        if (!$('.widget-intro').is(":visible")) return;
        for(n of allNames) toastr.success('est en ligne', n)

    })

    socket.on('newName', (data) => {
        console.log('newName received: ', data)
        allNames.push(data)
        if (!$('.widget-intro').is(":visible")) return;
        toastr.success('a rejoint le groupe', data)
    })

    socket.on('goneName', (data) => {
        if (!data) return
        //console.log('goneName received: ', data)
        //console.log(allNames, )
        var index = allNames.indexOf(data);
        if (index > -1) allNames.splice(index, 1);
        console.log(allNames)
        if (!$('.widget-intro').is(":visible")) return;
        toastr.error('n\'est plus en ligne', data)
    })


    // Bind Controls BTNS -> Send cmd to server in order to broadcast
    //
    $(".ctrlBtn").on('click', function(event){
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        let cmd = {
            'action':   $(this).data('action'),
            'arg':      $(this).data('arg'),
            'from':     myName
        }
        socket.emit('cmd', cmd)
    });

        
    (function (red5prosdk) {

        var targetSubscriber;
        
        var retryTimeout;
        var connected = false;
        function retryConnect () {
            clearTimeout(retryTimeout);
            if (!connected) retryTimeout = setTimeout(connect, 500)
        }

        function setConnected (value) {
            connected = value;
            if (!connected) retryConnect();
        }

        // Local lifecycle notifications.
        function onSubscriberEvent (event) {
            if (event.type !== 'Subscribe.Time.Update') {
                console.log('[Red5ProSubscriber] ' + event.type + '.');
            }
            if (event.type === red5prosdk.SubscriberEventTypes.CONNECTION_CLOSED || event.type === red5prosdk.SubscriberEventTypes.CONNECT_FAILURE) {
                setConnected(false);
            }
            if (event.type === 'Subscribe.VideoDimensions.Change') {
                console.log('[Red5ProSubscriber] resolution: ', event.data.width, event.data.height);
            }

            // The name of the event:
            var type = event.type;
            // The dispatching publisher instance:
            var subscriber = event.subscriber;
            // Optional data releated to the event (not available on all events):
            var data = event.data;
            // console.log(type, subscriber, data)
        }
        function onSubscribeFail (message) {
            console.error('[Red5ProSubsriber] Subscribe Error :: ' + message);
        }
        function onSubscribeSuccess (subscriber) {
            console.log('[Red5ProSubsriber] Subscribe Complete.');
        }

        // CONNECT
        function connect() {
            clearTimeout(retryTimeout);

            var subscriber = new red5prosdk.Red5ProSubscriber()
            subscriber.on(red5prosdk.SubscriberEventTypes.CONNECT_FAILURE, function () {
                setConnected(false);
            });
            subscriber.init({
                protocol: 'wss',
                port: 443,
                host: 'red5.kxkm.net',
                app: 'live',
                streamName: 'stream1',
                rtcConfiguration: {
                    iceServers: [{urls: 'stun:stun2.l.google.com:19302'}],
                    iceCandidatePoolSize: 2,
                    bundlePolicy: 'max-bundle'
                }, // See https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/RTCPeerConnection#RTCConfiguration_dictionary
                mediaElementId: 'red5pro-subscriber',
                subscriptionId: Math.floor(Math.random() * 0x10000).toString(16),
                videoEncoding: 'NONE',
                audioEncoding: 'NONE'        
            })
            .then(function (subscriberImpl) {
                targetSubscriber = subscriberImpl
                targetSubscriber.on('*', onSubscriberEvent);
                return targetSubscriber.subscribe()
            })
            .then(function () {
                onSubscribeSuccess(targetSubscriber);
                setConnected(true);
            })
            .catch(function (error) {
                var jsonError = typeof error === 'string' ? error : JSON.stringify(error, null, 2);
                console.error('[Red5ProSubscriber] :: Error in subscribing - ' + jsonError);
                onSubscribeFail(jsonError);
                setConnected(false);
            });
        }
        connect();
      
    })(window.red5prosdk);

});
