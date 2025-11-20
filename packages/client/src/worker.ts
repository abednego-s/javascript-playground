self.onmessage = function (e) {
  let timer = 0;
  if (e.data === "start_timer") {
    timer = setTimeout(() => {
      self.postMessage({
        type: "timer_expired",
        message: "Timer expired",
      });
      clearTimeout(timer);
    }, 5 * 60 * 1000);
  }
};
