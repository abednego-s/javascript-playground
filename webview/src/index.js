(async function () {
  const cache = await caches.open("jsplaycache")

  const cacheEntries = {
    javascript: {
      filename: "/src/script.js",
      contentType: "text/javascript",
      initialContent: "console.log('hello world!');"
    },
    css: {
      filename: "/src/style.css",
      contentType: "text/css",
      initialContent: "h1 {\n\tcolor: green; \n}"
    }
  }

  async function init() {
    const cacheEntriesKeys = Object.keys(cacheEntries)

    for (const key of cacheEntriesKeys) {
      cache.delete(key)
    }

    cacheEntriesKeys.forEach((key) => {
      cacheContent(key, cacheEntries[key].initialContent)
    })

    const html = "<html>\n<head>\n\t<title>Document</title>\n</head>\n<body>\n\t<h1>Hello World</h1>\n</body>\n</html>"
    buildPage(html)
  }

  async function cacheContent(type, content) {
    const response = new Response(content, {
      headers: {
        "Content-Type": cacheEntries[type].contentType
      }
    })

    await cache.put(cacheEntries[type].filename, response)
  }

  async function getAssetsCache(type) {
    const cacheKey = cacheEntries[type].filename
    const assetCache = await cache.match(cacheKey)
    const assetCacheContent = await assetCache.text()
    return assetCacheContent
  }

  async function buildPage(html) {
    const parser = new DOMParser()
    // html
    const doc = parser.parseFromString(html, "text/html")
    const head = doc.getElementsByTagName("head")[0]
    // css
    const styleElement = document.createElement("style")
    styleElement.textContent = await getAssetsCache("css")
    head.appendChild(styleElement)
    // js 
    const scriptElement = document.createElement("script")
    const js = await getAssetsCache("javascript")
    // scriptElement.textContent = `(function(){${js}})()`
    scriptElement.textContent = js
    doc.body.appendChild(scriptElement)

    const serializer = new XMLSerializer();
    const updatedHtml = serializer.serializeToString(doc)
    document.open()
    document.write(updatedHtml)
    document.close()
    // console.clear()
  }

  init()

  const channel = new BroadcastChannel("channel-1")
  channel.onmessage = async function (ev) {
    const { type, content } = ev.data
    await cacheContent(type, content)
    await buildPage(content)
  }
})()