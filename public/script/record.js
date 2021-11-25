let start_button = document.querySelector("#start-record");
let stop_button = document.querySelector("#stop-record");

var options = {
    controls: true,
    width: 500,
    height: 300,
    responsive: true,
    plugins: {
        record: {
            audio: true,
            video: true,
            maxLength: 3600,
            displayMilliseconds: false,
            debug: true
        }
    }
};
var player = videojs('myVideo', options);

var video = document.getElementById("myVideo");
player.ready(function() {
    player.record().getDevice();
});


player.on('deviceError', function() {
    console.log('device error:', player.deviceErrorCode);
});

player.on('error', function(element, error) {
    console.error(error);
});


start_button.addEventListener('click', function() {
    player.record().start();
});
stop_button.addEventListener('click', function() {
    player.record().stop();
});

player.on('finishRecord', function() {

    console.log('finished recording: ', player.recordedData);
    var data = player.recordedData;
    data['name'] = "Noone.webm";
    console.log(data['name']);
    let fd = new FormData()
    let obj_id=stop_button.value;
    let id=start_button.value;
    fd.append('data', data)
    $.ajax({
        type: 'POST',
        url: '/uploadvideo/'+document.getElementById('participant_name').textContent+'/'+id,
        data: fd,
        processData: false,
        contentType: false
    }).done(function(data) {
        console.log(data)
    })
});