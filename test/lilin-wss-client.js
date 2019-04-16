"use strict"


/*
* 配合lilin-wss服务使用的库
* created by lilin on 2019.4.3 15:07
*/

!function(){
    window.Ws = Ws;
    /*
    * Evets类
    */
    function Events(){
        this._events = {};
    }
    Events.prototype = {
        consotructor: Events,
        //注册事件
        on: function(eventName, cb){
            if(!eventName || !cb || (typeof cb !== "function") ) throw new Error("注册事件出错");
            !this._events[eventName] && (this._events[eventName] = [cb]) || this._events[eventName].push(cb); 
        },
        //触发事件
        trigger: function(eventName, data){
            this._events[eventName] && this._events[eventName].forEach(cb=>{cb(data)});
        }
    }
    /*
    * wss类
    */
    function Ws(url){
        this._reveiceEvents = new Events();
        this._url = url;
        this._sock = null;
        this._connected = false;

        //初始化websocket
        this._init();
    }
    Ws.prototype._init = function(){
        this._sock = new WebSocket(this._url);
        this._sock.onmessage = e => {
            try {
                let eventObj = JSON.parse(e.data);
                this._reveiceEvents.trigger(eventObj.name, eventObj.data);
            } catch (e) {
                throw new Error("Ws 底层json解析错误");
            }
        }
        this._sock.onopen = () => {
            this._connected = true;
            this._reveiceEvents.trigger("open");
        }
        this._sock.onerror = err => {
            console.error("[lilin-wss-client报错] websocket连接发生意外，正在尝试重连！");
            this._reveiceEvents.trigger("error", err);
        }
        this._sock.onclose = () => {
            //alert("关闭重连");
            this._connected = false;
            this._init();
            this._reveiceEvents.trigger("close");
        }
    }
    Ws.prototype.on = function(eventName, cb){
        if(!eventName || !cb || (typeof cb !== "function") ) throw new Error("注册事件出错");
        this._reveiceEvents.on(eventName, cb);
    }
    Ws.prototype.trigger = function(eventName, data){
        if(!this._connected){
            console.error("[lilin-wss-client报错] websocket已断开，不能trigger事件！");
            return;
        }
        let eventObj = {
            name: eventName,
            data: data
        };
        this._sock.send(JSON.stringify(eventObj));
    }

}();