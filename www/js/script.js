var FULLSCREEN = true
var allowUnload = false

var isElectron = navigator.userAgent.toLowerCase().indexOf('electron/') > -1
var myName = Cookies.get('name')

var gaugeMax = 8
var gauge = gaugeMax
var gaugeAccel = false
var gaugeAutodec = true
var gaugeSpace = true
var gaugeTimeNormal = 1500
var gaugeTimeFreak = 100
var gaugeTimer = null

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

    // Get Name
    //
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

        $('#red5pro-subscriber').muted = false;
    }

    // Gauge DOWN
    //
    function normalGauge() {
        if (gaugeTimer) clearTimeout(gaugeTimer)

        var delay = 1
        if (gauge < 0) 
        {
            gauge = 0
            if (gaugeSpace) $('#space-gif').show()
            else $('#space-gif').hide()
            $('.gauge-container').css("background-image", "none");
            delay = Math.min(gaugeTimeNormal, 700)
        }
        else $('#space-gif').hide()

        if (!gaugeSpace) $('.spaceoverlay').hide();
        
        // set gauge image
        setTimeout(function(){

            $('.gauge-container').css("background-image", "url(/img/Jauge_"+gauge+".png)");
            if (gaugeSpace) {
                $('.spaceoverlay').stop();
                $('.spaceoverlay').fadeTo(gaugeTimeNormal+100, (gaugeMax-gauge-1)/(gaugeMax*2));
            }

            // repeat
            if (gaugeAutodec){
                if (gaugeAccel && gaugeTimeNormal > 500) gaugeTimeNormal -= 30        
                gaugeTimer = setTimeout(function() {
                    gauge -= 1
                    normalGauge()
                }, gaugeTimeNormal)  
            }

        }, delay)
    }

    // Gauge UP
    //
    function spaceBar() {
        gauge += 1
        if (gauge > gaugeMax) gauge = gaugeMax

        // set gauge image
        $('#space-gif').hide()

        $('.gauge-container').css("background-image", "url(/img/Jauge_"+gauge+".png)");
        if (gaugeSpace) {
            $('.spaceoverlay').stop();
            $('.spaceoverlay').fadeTo(300, (gaugeMax-gauge-1)/(gaugeMax*2));
        }
    }

    // Gauge freak
    //
    function freakGauge() {
        if (gaugeTimer) clearTimeout(gaugeTimer)

        $('#space-gif').hide()
        $('.spaceoverlay').stop();
        $('.spaceoverlay').css("opacity", 0);

        // set gauge image
        $('.gauge-container').css("background-image", "url(/img/Jauge_"+Math.floor(Math.random()*gaugeMax+1)+".png)");
            
        // repeat
        gaugeTimer = setTimeout(function() {
            freakGauge()
        }, gaugeTimeFreak)  
    }

    // Key BINDINGS
    //
    $(document).keyup(function(event) { 
        if(event.keyCode == 32 && gaugeSpace) spaceBar()
        
        else if (isElectron && event.keyCode == 17 && $(".widget-ctrl").is(":visible")) {
            $('#shutdown-btn').click()
        }

        event.preventDefault();
        return false;
    }); 
    

    // Init Kontroller
    //
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

        // Space
        //
        space: () => 
        {   
            // Prepare gauge
            gauge = gaugeMax
            gaugeTimeNormal = 1500
            gaugeAccel = false
            gaugeAutodec = true
            gaugeSpace = true
            normalGauge()

            // Show
            $('.widget').hide()
            $('.widget-live').show()
            $('.widget-space').show()
        },

        // Space2
        //
        spaceSpeed: () => 
        {   
            // Accelerate gauge
            gaugeTimeNormal = 1500
            gaugeAccel = true
            gaugeAutodec = true
            gaugeSpace = true
            normalGauge()

            // Show
            $('.widget').hide()
            $('.widget-live').show()
            $('.widget-space').show()
        },

        // Off
        //
        off: () => 
        {   
            gaugeTimeNormal = 200
            gaugeAccel = true
            gaugeAutodec = true
            gaugeSpace = false
            normalGauge()

            // Show
            $('.widget').hide()
            $('.widget-live').show()
            $('.widget-space').show()
        },

        // Refill
        //
        refill: () => 
        {   
            gaugeAutodec = false
            gaugeSpace = false
            normalGauge()
            spaceBar()

            // Show
            $('.widget').hide()
            $('.widget-live').show()
            $('.widget-space').show()
        },

        // Freak
        //
        freak: () => 
        {
            freakGauge()

            // Show
            $('.widget').hide()
            $('.widget-live').show()
            $('.widget-space').show()
        },

        // Ctrl
        //
        ctrl: () => 
        {    
            // Show
            $('.widget').hide()
            $('.widget-live').show()
            $('.widget-ctrl').show()
        },

        // Shutdown
        //
        shutdown: (arg, from) =>
        {
            console.log('shutdown')

            $('.widget').hide()
            $('.widget-live').show()
            $('.widget-winner').show()
            $('.thewinner').html(from)

            setTimeout(()=>{
                if (isElectron) {
                    ipcRenderer.sendSync('shutdown') 
                }
                else {
                    $('.widget').hide()
                    $('.widget-shutdown').show()
                    setTimeout(() => {
                        $('#quit-btn').click()
                    }, 7000)
                }
            }, 4000)            
        },

        // Quit
        //
        quit: () =>
        {
            $('.widget').hide()
            $('.widget-quit').show()

            console.log('quit')
            allowUnload = true

            if (isElectron) ipcRenderer.sendSync('quit') 
            else document.exitFullscreen();
            
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
        console.log('connected to socketio')

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
        else kontroller[data['action']](data['arg'], data['from']);
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
            if (!connected) retryTimeout = setTimeout(connect, 1000)
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
                host: 'kademe.kxkm.net',
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