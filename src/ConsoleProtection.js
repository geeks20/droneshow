// Console Protection Module
export class ConsoleProtection {
    constructor() {
        this.isProduction = window.location.hostname !== 'localhost' && 
                           window.location.hostname !== '127.0.0.1' &&
                           !window.location.hostname.includes('192.168.');
        
        if (this.isProduction) {
            this.disableConsole();
            this.preventDevTools();
            this.protectAgainstManipulation();
        }
    }
    
    disableConsole() {
        // Store original console methods for internal use only
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        const originalInfo = console.info;
        const originalDebug = console.debug;
        
        // Override all console methods
        const noop = () => {};
        console.log = noop;
        console.warn = noop;
        console.error = noop;
        console.info = noop;
        console.debug = noop;
        console.trace = noop;
        console.dir = noop;
        console.dirxml = noop;
        console.group = noop;
        console.groupCollapsed = noop;
        console.groupEnd = noop;
        console.time = noop;
        console.timeEnd = noop;
        console.count = noop;
        console.assert = noop;
        console.profile = noop;
        console.profileEnd = noop;
        console.table = noop;
        console.clear = noop;
        
        // Prevent console restoration
        Object.defineProperty(window, 'console', {
            value: console,
            writable: false,
            configurable: false
        });
    }
    
    preventDevTools() {
        // Detect DevTools using multiple methods
        let devtools = {open: false, orientation: null};
        const threshold = 160;
        
        // Method 1: Window size detection
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                this.handleDevToolsOpen();
            }
        }, 500);
        
        // Method 2: Console timing detection
        let checkStatus = false;
        const element = new Image();
        Object.defineProperty(element, 'id', {
            get: function() {
                checkStatus = true;
                throw new Error("DevTools detected");
            }
        });
        
        setInterval(() => {
            checkStatus = false;
            console.log(element);
            console.clear();
            if (checkStatus) {
                this.handleDevToolsOpen();
            }
        }, 1000);
        
        // Method 3: Debugger detection
        setInterval(() => {
            const start = performance.now();
            debugger;
            const end = performance.now();
            if (end - start > 100) {
                this.handleDevToolsOpen();
            }
        }, 1000);
        
        // Disable right-click
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });
        
        // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        document.addEventListener('keydown', (e) => {
            if (e.keyCode === 123 || // F12
                (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
                (e.ctrlKey && e.shiftKey && e.keyCode === 74) || // Ctrl+Shift+J
                (e.ctrlKey && e.keyCode === 85)) { // Ctrl+U
                e.preventDefault();
                return false;
            }
        });
    }
    
    handleDevToolsOpen() {
        // Clear the page and show warning
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background: #000;
                color: #fff;
                font-family: Arial, sans-serif;
                text-align: center;
                direction: rtl;
            ">
                <div>
                    <h1>⚠️ تحذير أمني</h1>
                    <p>تم اكتشاف محاولة فتح أدوات المطور</p>
                    <p>Developer tools access denied</p>
                </div>
            </div>
        `;
        
        // Stop all animations
        if (window.gsap) {
            window.gsap.globalTimeline.clear();
        }
        
        // Clear all intervals and timeouts
        const highestId = setTimeout(() => {});
        for (let i = 0; i < highestId; i++) {
            clearTimeout(i);
            clearInterval(i);
        }
    }
    
    protectAgainstManipulation() {
        // Freeze important objects
        Object.freeze(Object.prototype);
        Object.freeze(Array.prototype);
        Object.freeze(Function.prototype);
        
        // Prevent property definition on window
        Object.seal(window);
        
        // Monitor for DOM manipulation attempts
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                // Check for script injection
                mutation.addedNodes.forEach((node) => {
                    if (node.tagName === 'SCRIPT' || 
                        (node.innerHTML && node.innerHTML.includes('<script'))) {
                        node.remove();
                        this.handleDevToolsOpen();
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
        });
        
        // Prevent iframe embedding
        if (window.top !== window.self) {
            window.top.location = window.self.location;
        }
    }
}