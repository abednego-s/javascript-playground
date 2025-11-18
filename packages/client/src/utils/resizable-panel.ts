export class ResizablePanel {
  container: HTMLElement;
  leftPanel: HTMLElement;
  rightPanel: HTMLElement;
  resizer: HTMLElement;
  isResizing: boolean;
  currentWidth: number;
  options: {
    minWidth: number;
    maxWidth: number;
    defaultWidth: number;
    storageKey: string;
  };
  startX: number;
  startWidth: number;

  constructor(containerId: string, options = {}) {
    this.container = document.getElementById(containerId)!;
    this.leftPanel = document.getElementById("leftPanel")!;
    this.rightPanel = document.getElementById("rightPanel")!;
    this.resizer = document.getElementById("resizer")!;

    this.options = {
      minWidth: 200,
      maxWidth: window.innerWidth * 0.8,
      defaultWidth: 700,
      storageKey: "resizablePanelWidth",
      ...options,
    };

    this.isResizing = false;
    this.currentWidth = this.options.defaultWidth;

    this.init();
    this.startX = 0;
    this.startWidth = 0;
  }

  init() {
    this.setPanelWidth(this.currentWidth);
    this.attachEventListeners();
  }

  attachEventListeners() {
    // Mouse events
    this.resizer.addEventListener("mousedown", this.startResize.bind(this));
    document.addEventListener("mousemove", this.resize.bind(this));
    document.addEventListener("mouseup", this.stopResize.bind(this));

    // Touch events for mobile
    this.resizer.addEventListener("touchstart", this.startResize.bind(this));
    document.addEventListener("touchmove", this.resize.bind(this));
    document.addEventListener("touchend", this.stopResize.bind(this));

    // Prevent text selection while resizing
    this.resizer.addEventListener("selectstart", (e) => e.preventDefault());

    // Window resize handler
    window.addEventListener("resize", this.handleWindowResize.bind(this));
  }

  startResize(e: any) {
    e.preventDefault();
    this.isResizing = true;
    this.resizer.classList.add("dragging");
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    // Store initial position
    this.startX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
    this.startWidth = this.leftPanel.offsetWidth;
  }

  resize(e: any) {
    if (!this.isResizing) return;

    e.preventDefault();
    const currentX = e.type.includes("mouse")
      ? e.clientX
      : e.touches[0].clientX;
    const deltaX = currentX - this.startX;
    let newWidth = this.startWidth + deltaX;

    // Apply constraints
    newWidth = Math.max(this.options.minWidth, newWidth);
    newWidth = Math.min(this.options.maxWidth, newWidth);

    this.setPanelWidth(newWidth);
    this.currentWidth = newWidth;
  }

  stopResize() {
    if (!this.isResizing) return;

    this.isResizing = false;
    this.resizer.classList.remove("dragging");
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }

  setPanelWidth(width: number) {
    this.leftPanel.style.width = `${width}px`;
  }

  reset() {
    this.currentWidth = this.options.defaultWidth;
    this.setPanelWidth(this.currentWidth);
  }

  handleWindowResize() {
    // Adjust max width based on window size
    this.options.maxWidth = window.innerWidth * 0.8;

    // Ensure current width is still valid
    if (this.currentWidth > this.options.maxWidth) {
      this.currentWidth = this.options.maxWidth;
      this.setPanelWidth(this.currentWidth);
    }
  }
}
