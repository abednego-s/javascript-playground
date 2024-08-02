(function () {
  const ws = new WebSocket("ws://localhost:8081/")

  ws.onopen = function () {
    console.log('Webview is connected to WebSocket')
  }

  ws.onmessage = function (e) {
    const { message } = JSON.parse(e.data)
    document.open()
    document.write(message)
    document.close()
  }
})()