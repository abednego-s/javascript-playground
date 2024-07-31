(function () {
  const ws = new WebSocket("ws://localhost:8081/")

  ws.onopen = function () {
    console.log('Connected to WebSocket')
  }

  ws.onmessage = function (e) {
    document.open()
    document.write(e.data)
    document.close()
  }
})()