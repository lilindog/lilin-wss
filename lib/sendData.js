"use strict";

const encode = require("./encodeFrame.js");

/**
 * 
 * 发送数据帧的函数，这里大于50kb的数据会分帧发送
 * 这里分包会使用递归发送，sock发送是异步的，递归到当前数据发送完成为止
 * @params sock <Object> sock对象
 * @data sock <String> 文本数据，如JSON
 * create by lilin on 2019/1/27
 * 
 */ 
function sendData(sock, data){
    data = data.split("");
    
    //判断一下，大量的数据分为多个帧来依次发送， 如果数据量大且不分，浏览器会报错。这里暂定50KB大小为分包阈值
    let list = [], chunkSize = 51200
    for(;data.length > 0;){
        data.length >= chunkSize && list.push( data.splice(0, chunkSize).join("") );
        data.length < chunkSize && list.push( data.splice(0, data.length).join("") );
    }

    let sendIndex = 0;
    loopSend();

    function loopSend(){
        if(list.length === 0) return;
        sendIndex++;

        let frame = {
            data: list.splice(0, 1)[0],
            FIN: sendIndex < list.length ? 0 : 1,
            opcode: sendIndex === 1 ? 1 : 0
        };

        sock.write(encode(frame), null, err=>{
            if(err){
                console.log("sendData发生错误：" + err);
                process.exit();
            }
            loopSend();
        });
    }
}

module.exports = sendData;