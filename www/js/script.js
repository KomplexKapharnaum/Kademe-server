var FULLSCREEN = true
var allowUnload = false

var cookfield = 'name3'

var isElectron = navigator.userAgent.toLowerCase().indexOf('electron/') > -1
var myName = Cookies.get(cookfield)
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
    $('html').css("cursor", "none")
}

function showCursor() {
    $('html').css("cursor", "pointer")
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

    // Electron specific
    //
    if (isElectron) 
    {
        console.log('running inside Electron');
        var { ipcRenderer } = require('electron')

        ipcRenderer.on('devmode', (event, arg) => {
            console.log('devmode');
        })

        $('.fs').hide()
        $('.exit').hide()
    }
    else {
        console.log('running outside Electron');

        $('.fs').show()
        $('.exit').hide()
    }

    // Fake Shutdown screen 
    setShutdownOS()

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
        $("#red5pro-subscriber").play()
        goFullscreen()
    })    

    // Get Name
    //
    function introduceMe() {
        socket.emit('iam', myName)  

        // Fullscreen
        if (FULLSCREEN) goFullscreen()

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

            applyGauge(gaugeTimeNormal+100)

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

        applyGauge(300)
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
        
        else if (event.keyCode == 17 && $(".widget-ctrl").is(":visible")) {
            $('#winner-btn').click()
        }

        // console.warn(event.code )

        event.preventDefault();
        return false;
    }); 

    $('.spaceoverlay').on('touchend', ()=>{
        if(gaugeSpace) spaceBar()
    })

    $(document).on('touchend', ()=>{
        $("#red5pro-subscriber").play()
        goFullscreen()
    })

    $('.exit').on('click touchend', (event)=>{
        console.log('exit')
        if (isElectron) ipcRenderer.sendSync('quit')
        else {
            closeFullscreen();
            $('.fs').show()
            $('.exit').hide()
        }
        event.preventDefault();
        return false;
    })

    $('.fs').on('click touchend', goFullscreen)

    // Add names ?
    function pushName() {
        namesCount += 1
        name = allNames[Math.floor(Math.random() * allNames.length)]
        if (namesCount == 0) $('.names-container').html('&lt;id=who data=" <span class="namename">Qui décide ?</span> "&gt;<br />')
        else if (namesCount == 1) $('.names-container').append('&lt;const="<span class="namename"> '+allNames.length+' participants.</span> "&gt;<br />')
        else if (namesCount == 2) $('.names-container').append('&lt;const="<span class="namename"> Un seul décide.</span> "&gt;<br /><br >')
        
        else if (namesCount < 12) $('.names-container').append('&nbsp;&nbsp;&nbsp;&nbsp;&lt;src=" <span class="namename">'+name+'</span> ? "&gt;<br />')
        else if (namesCount > 14) namesCount = -1
    }

    setInterval(pushName, 434)
    

    // Init Kontroller
    //
    var kontroller = {

        // Name request
        //
        name: () => 
        {   
            $("#red5pro-subscriber").prop('muted', true)

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
            $("#red5pro-subscriber").prop('muted', true)
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
            $("#red5pro-subscriber").prop('muted', true)
            
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

            hideCursor()
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

            hideCursor()
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

            $("#red5pro-subscriber").prop('muted', false)

            // Show
            $('.widget').hide()
            $('.widget-live').show()
            $('.widget-space').show()

            hideCursor()
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

            $("#red5pro-subscriber").prop('muted', false)

            // Show
            $('.widget').hide()
            $('.widget-live').show()
            $('.widget-space').show()

            hideCursor()
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

            $("#red5pro-subscriber").prop('muted', false)

            // Show
            $('.widget').hide()
            $('.widget-live').show()
            $('.widget-space').show()

            hideCursor()
        },

        // Hide
        //
        hide: () => 
        {   
            gaugeAutodec = false
            gaugeSpace = false
            gauge = gaugeMax

            $("#red5pro-subscriber").prop('muted', false)

            // Show
            $('.widget').hide()
            $('.widget-live').show()

            hideCursor()
        },

        // Refill
        //
        stepdown: () => 
        {   
            gaugeAutodec = false
            gaugeSpace = false
            applyGauge()
            gauge -= 1
            if (gauge < 0) gauge = 0
            
            $("#red5pro-subscriber").prop('muted', false)

            // Show
            $('.widget').hide()
            $('.widget-live').show()
            $('.widget-space').show()

            hideCursor()
        },

        // Freak
        //
        freak: () => 
        {
            freakGauge()

            $("#red5pro-subscriber").prop('muted', false)

            // Show
            $('.widget').hide()
            $('.widget-live').show()
            $('.widget-space').show()

            hideCursor()
        },

        // Names
        //
        names: () => 
        {    
            $("#red5pro-subscriber").prop('muted', false)

            $('.widget').hide()
            $('.widget-live').show()

            $('.names-container').html(" ")
            namesCount = -1            
            $('.widget-names').show()

            hideCursor()
        },

        // Ctrl
        //
        ctrl: () => 
        {    
            $('.widget-ctrl').show()
            hideCursor()
        },

        // Winner
        //
        winner: (from) => 
        {    
            $("#red5pro-subscriber").prop('muted', true)

            $('.widget').hide()
            $('.widget-live').show()
            $('.widget-winner').show()
            $('.thewinner').html(from)
            $('.winner2').hide()
            setTimeout(()=>{
                $('.winner2').show()
            },4000)
            hideCursor()
        },

        // Shutdown
        //
        fakeshot: () =>
        {
            $("#red5pro-subscriber").prop('muted', true)

            console.log('fakeshot')

            // fake shutdown
            $('.widget').hide()
            $('.widget-shutdown').show()
            hideCursor()
        },

        // Shutdown
        //
        realshot: (arg, from) =>
        {   
            console.log('realshot')
            $("#red5pro-subscriber").prop('muted', true)

            $('.widget').hide()
            hideCursor()

            // real shutdown
            if (isElectron) {
                ipcRenderer.sendSync('shutdown') 
            }
        },

        // Quit
        //
        end: () =>
        {
            console.log('end')
            $("#red5pro-subscriber").prop('muted', true)

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
