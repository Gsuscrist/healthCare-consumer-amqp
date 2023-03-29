const amqplib = require('amqplib');
const axios = require('axios');

(async () => {
    const queueInitial = 'event-initialize';
    const queueNotification = 'notification';
    const queuesubscribcion = 'subscription'
    const conn = await amqplib.connect('amqp://healthCare:secureHealth@44.206.223.169:5672');
    console.log('Conexión exitosa')
    const ch1 = await conn.createChannel();
    console.log('Canal 1 creado')
    const ch3 = await conn.createChannel();
    console.log('canal 3 creado')
    // Sender
    const ch2 = await conn.createChannel();
    console.log('Canal 2 creado')
    // Listener
    ch1.consume(queueInitial, (msg) => {
        if (msg !== null) {
            console.log('Received:', msg.content.toString());
            ch1.ack(msg);

            //Acá iria el código para conectar a una API, un socker o algo
            axios.post('https://healthcares.ddns.net:443/sns/sendNotification',{
                message:'paciente en riesgo, ingrese a su centro de atencion medico mas cercano',
                subject:'ALERTA',
            }).then(function (response) {
                console.log(response);
            })
                .catch(function (error) {
                    console.error(error);
                });

            ch2.sendToQueue(queueNotification, Buffer.from('notificacion enviada'));
        } else {
            console.log('Consumer cancelled by server');
        }
    });

    ch2.consume(queueNotification, (msg)=>{
        if(msg!== null){
            ch2.ack(msg);

            //peticion
            axios.post('https://healthcares.ddns.net:443/sns/sendNotification',{
                message:'',
                subject:'NEW USER REGISTERED',
            }).then(function (response) {
                console.log(response);
            })
                .catch(function (error) {
                    console.error(error);
                });
            //mas enrutaje
        }else {
            console.log('consumer cancelled by server')
        }
    })

    ch3.consume(queuesubscribcion, (msg)=>{
        if (msg !== null) {
            console.log('Received:', msg.content.toString());


            //Acá iria el código para conectar a una API, un socker o algo
            axios.post('https://healthcares.ddns.net:443/sns/subscribe',{
                email:msg.content.email
            }).then(function (response) {
                console.log(response);
            })
                .catch(function (error) {
                    console.error(error);
                });

            axios.post('https://healthcares.ddns.net:443/sns/subscribe',{
                email:msg.content.emergencyEmail
            }).then(function (response) {
                console.log(response);
            })
                .catch(function (error) {
                    console.error(error);
                });
            ch3.ack(msg);
        } else {
            console.log('Consumer cancelled by server');
        }
    })

})();
