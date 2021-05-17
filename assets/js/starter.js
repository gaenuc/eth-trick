

import "../../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js";


$(function() {    
    $('#button1, #button2').hide();
    const socket = openSocket();
    startServer(socket);    
    $('#button2').on('click', ()=> {
        console.log('button triggered')
        terminate(socket);
    })
})

$('#button1').on('click', ()=> {
    const socket = openSocket()
    startServer(socket);
    $('#button2').on('click', ()=> {
        console.log('button triggered')
        terminate(socket);
    })
})


function openSocket() {
    return new WebSocket('ws://localhost:1337');
    
}

function startServer(socket) {
    
    
    socket.addEventListener('open', function (event) {
        alert('Socket open');
        $('.spinner-border').removeClass('text-danger');
        $('#button1').hide();
        $('#button2').show();
    });
    socket.addEventListener('close', function (event) {
        alert('Socket closed');
        $('.spinner-border').addClass('text-danger');
        $('#button1').show();
        $('#button2').hide();
    });
    
    // Listen for messages
    socket.addEventListener('message', function (event) {
        console.log(event.data);
        const message =  JSON.parse(event.data);
        switch (message.messageType) {
            case 'check': {
                break;
            }
            case 'caught': {
                $('#results').append('<div> <p>Tx in:' + message.message + '</p> <div>');
                break;
            }
            case 'transaction': {
                $('#results').append('<div> <p>Tx out:' + message.message + '</p> <hr class="my-5 w-25 mx-0"></hr><div>');
                break;
            }
            case 'connection': {

                $('#addressTitle').text(message.message);
            }
            default: {
                console.log(message);
            }
        }
       
        // $('#message').append(event.data+'<br>');
        // console.log(event);
    });
}

function terminate(socket) {
    socket.send('quit');
}