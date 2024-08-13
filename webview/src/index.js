(function () {
  const channel = new BroadcastChannel("channel-1")
  channel.onmessage = function (ev) {
    document.open()
    document.write(ev.data)
    document.close()
    console.log("webview received: ", ev.data)
  }
})()