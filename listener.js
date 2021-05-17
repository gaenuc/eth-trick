var Web3 = require('web3');
var Tx = require('ethereumjs-tx').Transaction;
const httpReq = require('http');
var constants = require('./parameters');
const host = 'localhost';
const port = 8000;
var events = require('events');
var eventEmitter = new events.EventEmitter();
var http =constants.http;
var webSocket =constants.webSocket;
var web3 = new Web3(webSocket);
var httpWeb3 = new Web3(http);
var WebSocketServer = require('websocket').server;
var sender = constants.sender;


const subscription = web3.eth.subscribe('pendingTransactions', (err, res) => {
    if (err) console.error(err);
});

const server = httpReq.createServer(function(request, response) {
    // Qui possiamo processare la richiesta HTTP
    // Dal momento che ci interessano solo le WebSocket, non dobbiamo implementare nulla
});
server.listen(1337, function() { });
// Creazione del server
wsServer = new WebSocketServer({
    httpServer: server
});

wsServer.on('request', function(request) {

    const connection = request.accept(null, request.origin);
    connection.sendUTF(JSON.stringify({messageType: 'connection', message: sender}));   
    console.log('Listening...');
    connection.on('message' , function(message) {
        console.log(message);
        if (message.type ==='utf8' && message.utf8Data ==='quit') {
            
            process.exit();
        }
    })
    
    subscription.on('data', (txHash) => {
        setTimeout(async () => {
            try {
                let tx = await web3.eth.getTransaction(txHash);
                // console.log(txHash);
                if (tx) {
                    connection.sendUTF(JSON.stringify({messageType: 'check', message: 'Checking'}));
                // sendData('Tx: ' + txHash)
                    if (tx.to == sender) {
                        connection.sendUTF(JSON.stringify({messageType: 'caught', message: tx.from}));
                        console.log(tx);                    
                        confirmAndSend(txHash);
                        // connection.sendUTF(txHash);
                    }
                }
                
            } catch (err) { 
                console.error(err);
            }
        })
    });

    function send() { 
        
    
        var receiver = constants.receiver;
        //var receiver =  process.argv['4'];
       
        httpWeb3.eth.getBalance(sender).then((balance) => {
            if (balance > 0) {
                httpWeb3.eth.getGasPrice().then((gasPrice) => {
                
                    httpWeb3.eth.getTransactionCount(sender).then((nonce) => {
                        
                        var transactionObject = {
                            from: sender,
                            to: receiver,
                            nonce: web3.utils.toHex (nonce),
                            gasPrice: web3.utils.toHex (gasPrice),
                            
                        }
                        httpWeb3.eth.estimateGas(transactionObject).then((gasLimit) => {
                            var transactionFee = gasPrice * gasLimit;
                            // var privateKey =process.argv['3'];
                            var privateKey ='67245710a999c21b767f9de7b5921cc52542a7c1728b436a18d3922e84eda76e';
                            transactionObject.gas = web3.utils.toHex (gasLimit);
                            transactionObject.value = web3.utils.toHex ( balance - transactionFee);
                            var privKey = new Buffer.from(privateKey, 'hex');
                            var tx = new Tx(transactionObject,{'chain':'ropsten'});
                            tx.sign(privKey);
                            var serializedTx = tx.serialize();
                            httpWeb3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'))
                            .then((hash) => {
                                connection.sendUTF(JSON.stringify({messageType: 'transaction', message: hash.transactionHash}));
                                //sendData(txHash);
                                // requestListener(data);
                                console.log('Transfer: ' + hash)
                               
                            }).catch((error) => {
                                console.error(error);
                                error.messageType= 'error';
                                connection.sendUTF(JSON.stringify(error));
                                // process.exit();
                            });
                            
                        }).catch((error) => {
                            console.error(error);
                            error.messageType= 'error';
                                connection.sendUTF(JSON.stringify(error));
                            // process.exit();
                        });                                
                    }).catch((error) => {
                        console.error(error);
                        error.messageType= 'error';
                                connection.sendUTF(JSON.stringify(error));
                        // process.exit();
                    });            
                }).catch((error) => {
                    console.error(error);
                    error.messageType= 'error';
                                connection.sendUTF(JSON.stringify(error));
                    // process.exit();
                });  
            }                                      
            }).catch((error) => {
                console.error(error);
                error.messageType= 'error';
                connection.sendUTF(JSON.stringify(error));
            // process.exit();
        });        
    }
    
    async function getConfirmations(txHash) {
        try {
          // Instantiate web3 with HttpProvider
          
      
          // Get transaction details
          const trx = await httpWeb3.eth.getTransaction(txHash)
      
          // Get current block number
          const currentBlock = await httpWeb3.eth.getBlockNumber()
      
          // When transaction is unconfirmed, its block number is null.
          // In this case we return 0 as number of confirmations
          return trx.blockNumber === null ? 0 : currentBlock - trx.blockNumber
        }
        catch (error) {
          console.log(error)
        }
    }
    
    function confirmAndSend(txHash, confirmations = 1) {
        
    
        const interval = setInterval(async () => {
          
          const trxConfirmations = await getConfirmations(txHash)      
          console.log('Transaction with hash ' + txHash + ' has ' + trxConfirmations + ' confirmation(s)')  
          if (trxConfirmations >= confirmations) {
            // Handle confirmation event according to your business logic
            connection.sendUTF(JSON.stringify({messageType:'transaction', message: 'Transaction with hash ' + txHash + ' has been successfully confirmed'}))
            send();
            
            console.log('Transaction with hash ' + txHash + ' has been successfully confirmed')
            clearInterval(interval);
            return;
          }
          // Recursive call
          // return confirmAndSend(txHash, confirmations);
        }, 3 * 1000)
    }

    connection.on('close', function(connection) {
        // Metodo eseguito alla chiusura della connessione
    });

});
console.log(sender);
console.log(constants.name);




