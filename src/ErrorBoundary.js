export class ErrorBoundary {
    constructor() {
        this.setupErrorHandlers();
    }
    
    setupErrorHandlers() {
        // Global error handler
        window.addEventListener('error', (event) => {
            event.preventDefault();
            this.handleError(event.error || event.message);
        });
        
        // Promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            event.preventDefault();
            this.handleError(event.reason);
        });
        
        // Override console.error to catch errors
        const originalError = console.error;
        console.error = (...args) => {
            this.handleError(args[0]);
            // Don't call original in production
        };
    }
    
    handleError(error) {
        // Log sanitized error (no stack traces in production)
        const isProduction = window.location.hostname !== 'localhost' && 
                           !window.location.hostname.includes('192.168.');
        
        if (isProduction) {
            // Send generic error message
            this.showUserError();
        } else {
            // Development - show actual error
            console.warn('Error caught:', error);
        }
    }
    
    showUserError() {
        // Check if error message already shown
        if (document.getElementById('error-boundary-message')) return;
        
        const errorDiv = document.createElement('div');
        errorDiv.id = 'error-boundary-message';
        errorDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(255, 68, 68, 0.9);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 10000;
            backdrop-filter: blur(10px);
            direction: rtl;
        `;
        errorDiv.textContent = 'حدث خطأ. يرجى تحديث الصفحة';
        document.body.appendChild(errorDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}