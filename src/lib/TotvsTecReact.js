
// TOTVS Tecnology Namespace
export default {
    // Porta do WebSocket
    internalWSPort:0,

    // Recupera dados do GET enviado via URL
    // http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
    getParam: function (queryField) {
        var url = window.location.href;
        queryField = queryField.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + queryField + "(=([^&#]*)|&|#|$)", "i"),
                results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    },

    // Conecta WebSocket e prepara mensageria global
    connectWS: function (callBack) {
        this.internalWSPort = this.getParam('totvstec_websocket_port');;
        var baseUrl = "ws://localhost:" + this.internalWSPort;

        var socket = new WebSocket(baseUrl);
        socket.onclose = function () { console.error("WebChannel closed"); };
        socket.onerror = function (error) { console.error("WebChannel error: " + error); };
        socket.onopen = function () {
            new QWebChannel(socket, function (channel) {
                window.dialog = channel.objects.mainDialog; 
 
                dialog.advplToJs.connect(function (codeType, codeContent, objectName) {
                    if (codeType == "js") {
                        var fileref = document.createElement('script');
                        fileref.setAttribute("type", "text/javascript");
                        fileref.innerText = codeContent;

                        document.getElementsByTagName("head")[0].appendChild(fileref);
                    }
                    else if (codeType == "css") {
                        var fileref = document.createElement("link");
                        fileref.setAttribute("rel", "stylesheet");
                        fileref.setAttribute("type", "text/css");
                        fileref.innerText = codeContent;

                        document.getElementsByTagName("head")[0].appendChild(fileref)
                    }
                });

                // Executa callback
                callBack();
            });
        }

    }
}
