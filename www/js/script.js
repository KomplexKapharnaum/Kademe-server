
// No Sleep
var noSleep = new NoSleep();

var corpus = []
var corpusSpeed = 0
var corpusIndex = 0

function showCorpus() {
    i = corpusIndex + 1
    if (i >= corpus.length) i = 0;
    corpusIndex = i

    if (i < corpus.length)  {
        var txt = corpus[i].split('§')[0]
        if (txt.startsWith('#')) { 
            $('.content').css("background-color", txt.trim())
            $('.content').css("background-image", "")
            $('#textzone').html("   ")
        }
        else if (txt.startsWith('@') || txt.startsWith('%')) { 
            $('.content').css("background-color", "black")
            $('.content').css("background-image", "url(/media/"+txt.substr(1)+")" )
            $('#textzone').html("   ")
            console.log("url(/media/"+txt.substr(1)+")")
        }
        else { 
            $('.content').css("background-color", "black")
            $('.content').css("background-image", "")
            $('#textzone').html(txt)
        }
    }
    else {
        $('.content').css("background-color", "black")
        $('.content').css("background-image", "")
        $('#textzone').html(" ")
    }
}

 

//
//  Run
//
$(function() {

    var dummyVideo = document.querySelector('#dummyVideo');
    setInterval(()=>{
        dummyVideo.play();
        console.log('nosleep video');
    }, 1000*5)


    // Redirect to facebook
    $('.toFB').on('click touchstart', () => {
        window.location.href = "https://www.facebook.com/beaucoupbeaucoupdamour/";
    })

    // Enable no sleep
    $('.touchme').on('click touchend', () => {

        dummyVideo.load();
        dummyVideo.play();

        $('.touchme').hide()
        noSleep.enable();
        document.body.requestFullscreen();
        console.log('touched')
    })

    
    // SocketIO
    var socket = io();
    socket.on('connect', function(socket){
        console.log('connected')
    }); 
    socket.on('mqtt', function(data){

        console.log(data)

        if (data.topic == '/add' && !corpus.includes(data.payload)) {
            corpus.push(data.payload);
            console.log('payload', data.payload)
        }

        else if (data.topic == '/text') {
            corpus = [data.payload];
        }
            
        else if (data.topic == '/rm') {
            for( var i = 0; i < corpus.length; i++) 
                if (corpus[i] === data.payload) 
                    corpus.splice(i, 1);
        }

        else if (data.topic == '/clear')
            corpus = []

        showCorpus()    
        console.log('corpus', corpus)
    });

    // ROTATION
    window.addEventListener("orientationchange", function() {
        // Announce the new orientation number
        document.body.requestFullscreen();
    }, false);
    

});