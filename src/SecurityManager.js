export class SecurityManager {
    constructor() {
        // Protect against prototype pollution - disabled for now
        // this.protectPrototypes();
        // Common NSFW words in multiple languages (Arabic and English)
        this.nsfwWords = [
            // English inappropriate words
            'fuck', 'shit', 'ass', 'damn', 'hell', 'bitch', 'dick', 'cock', 'pussy', 'sex',
            'porn', 'nude', 'naked', 'drugs', 'weed', 'cocaine', 'heroin', 'kill', 'murder', 'rape',
            // Arabic inappropriate words (common ones)
            'خرا', 'زب', 'كس', 'شرموط', 'منيوك', 'نيك', 'طيز', 'عرص', 'وسخ', 'قحبة',
            'لعنة', 'حرام', 'كلب', 'حمار', 'غبي', 'احمق', 'متخلف'
        ];
        
        // Political/sensitive terms to avoid
        this.sensitiveTerms = [
            'israel', 'إسرائيل', 'صهيون', 'يهود',
            'terrorism', 'إرهاب', 'داعش', 'isis', 'alqaeda', 'القاعدة'
        ];
        
        // XSS prevention patterns
        this.dangerousPatterns = [
            /<script[^>]*>[\s\S]*?<\/script>/gi,
            /<iframe[^>]*>[\s\S]*?<\/iframe>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi, // Event handlers like onclick=
            /<embed[^>]*>/gi,
            /<object[^>]*>/gi,
            /eval\(/gi,
            /expression\(/gi,
            /<img[^>]*onerror[^>]*>/gi,
            /<svg[^>]*onload[^>]*>/gi
        ];
        
        // SQL injection patterns
        this.sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
            /(-{2}|\/\*|\*\/)/g, // SQL comments
            /(\'|\"|;|\\)/g, // Quotes and semicolons
            /(\bOR\b\s*\d+\s*=\s*\d+)/gi, // OR 1=1
            /(\bAND\b\s*\d+\s*=\s*\d+)/gi, // AND 1=1
            /(CAST\s*\(|CONVERT\s*\()/gi,
            /(\bHAVING\b|\bGROUP\s+BY\b)/gi,
            /(0x[0-9a-fA-F]+)/g, // Hex values
            /(\bWAITFOR\s+DELAY\b)/gi,
            /(\bBENCHMARK\b)/gi
        ];
    }
    
    // Sanitize input text
    sanitizeInput(text) {
        if (!text || typeof text !== 'string') return '';
        
        // Create a text-only version first
        const div = document.createElement('div');
        div.textContent = text;
        text = div.textContent;
        
        // Remove any HTML tags
        text = text.replace(/<[^>]*>/g, '');
        
        // Remove dangerous patterns
        this.dangerousPatterns.forEach(pattern => {
            text = text.replace(pattern, '');
        });
        
        // Remove SQL injection attempts
        this.sqlPatterns.forEach(pattern => {
            text = text.replace(pattern, '');
        });
        
        // Remove zero-width characters that could be used maliciously
        text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
        
        // Remove Unicode control characters
        text = text.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
        
        // Normalize Unicode to prevent homograph attacks
        text = text.normalize('NFKC');
        
        // Limit length (already done in HTML but double-check)
        text = text.substring(0, 35);
        
        // Remove multiple spaces
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    }
    
    // Check if text contains NSFW content
    containsNSFW(text) {
        if (!text) return false;
        
        const lowerText = text.toLowerCase();
        const arabicText = text;
        
        // Check for NSFW words
        for (const word of this.nsfwWords) {
            if (lowerText.includes(word.toLowerCase()) || arabicText.includes(word)) {
                // NSFW content detected
                return true;
            }
        }
        
        // Check for sensitive terms
        for (const term of this.sensitiveTerms) {
            if (lowerText.includes(term.toLowerCase()) || arabicText.includes(term)) {
                // Sensitive term detected
                return true;
            }
        }
        
        return false;
    }
    
    // Check for suspicious patterns (like repeated characters used to draw inappropriate shapes)
    hasSuspiciousPatterns(text) {
        // Check for excessive repeated characters (might be trying to draw something)
        const repeatedChars = /(.)\1{10,}/g;
        if (repeatedChars.test(text)) {
            // Suspicious repeated characters detected
            return true;
        }
        
        // Check for ASCII art patterns that might be inappropriate
        const asciiArtPatterns = [
            /[8=]+D/gi,  // Inappropriate ASCII
            /\(\.\)\(?\.\)/gi,  // Inappropriate ASCII
            /\b69\b/gi,  // Inappropriate number
            /\b420\b/gi  // Drug reference
        ];
        
        for (const pattern of asciiArtPatterns) {
            if (pattern.test(text)) {
                // Suspicious ASCII pattern detected
                return true;
            }
        }
        
        return false;
    }
    
    // Main validation function
    validateInput(text) {
        // First sanitize the input
        const sanitized = this.sanitizeInput(text);
        
        // Check if it's empty after sanitization
        if (!sanitized || sanitized.length === 0) {
            return {
                valid: false,
                message: 'النص غير صالح',
                messageEn: 'Invalid text'
            };
        }
        
        // Check for NSFW content
        if (this.containsNSFW(sanitized)) {
            return {
                valid: false,
                message: 'يرجى استخدام كلمات مناسبة',
                messageEn: 'Please use appropriate language'
            };
        }
        
        // Check for suspicious patterns
        if (this.hasSuspiciousPatterns(sanitized)) {
            return {
                valid: false,
                message: 'النص يحتوي على أنماط غير مسموحة',
                messageEn: 'Text contains disallowed patterns'
            };
        }
        
        return {
            valid: true,
            sanitized: sanitized
        };
    }
    
    // Rate limiting check (to prevent spam)
    checkRateLimit() {
        const now = Date.now();
        const lastGeneration = parseInt(localStorage.getItem('lastGeneration') || '0');
        const generationCount = parseInt(localStorage.getItem('generationCount') || '0');
        const shortTermCount = parseInt(localStorage.getItem('shortTermCount') || '0');
        const shortTermStart = parseInt(localStorage.getItem('shortTermStart') || '0');
        
        // Check cooldown period (2 seconds between generations - more reasonable)
        if (now - lastGeneration < 2000) {
            return {
                allowed: false,
                message: 'يرجى الانتظار قليلاً',
                messageEn: 'Please wait a moment'
            };
        }
        
        // Check short-term rate limit (10 per minute - much more generous)
        if (now - shortTermStart < 60000) {
            if (shortTermCount >= 10) {
                return {
                    allowed: false,
                    message: 'حد 10 محاولات بالدقيقة',
                    messageEn: 'Limit: 10 attempts per minute'
                };
            }
            localStorage.setItem('shortTermCount', (shortTermCount + 1).toString());
        } else {
            // Reset short-term counter
            localStorage.setItem('shortTermStart', now.toString());
            localStorage.setItem('shortTermCount', '1');
        }
        
        // Reset hourly count if it's been more than an hour
        if (now - lastGeneration > 3600000) {
            localStorage.setItem('generationCount', '1');
            localStorage.setItem('lastGeneration', now.toString());
            return { allowed: true };
        }
        
        // Check hourly limit (100 per hour - doubled)
        if (generationCount >= 100) {
            return {
                allowed: false,
                message: 'تجاوزت الحد الساعي',
                messageEn: 'Hourly limit exceeded'
            };
        }
        
        localStorage.setItem('generationCount', (generationCount + 1).toString());
        localStorage.setItem('lastGeneration', now.toString());
        return { allowed: true };
    }
    
    // Protect against prototype pollution
    protectPrototypes() {
        // Freeze Object prototype
        Object.freeze(Object.prototype);
        Object.freeze(Object);
        
        // Freeze Array prototype
        Object.freeze(Array.prototype);
        Object.freeze(Array);
        
        // Freeze Function prototype
        Object.freeze(Function.prototype);
        Object.freeze(Function);
        
        // Protect localStorage
        const originalSetItem = localStorage.setItem.bind(localStorage);
        localStorage.setItem = function(key, value) {
            // Only allow our specific keys
            const allowedKeys = ['language', 'lastGeneration', 'generationCount', 'shortTermCount', 'shortTermStart'];
            if (allowedKeys.includes(key)) {
                originalSetItem(key, value);
            }
        };
        
        // Protect against __proto__ manipulation
        Object.defineProperty(Object.prototype, '__proto__', {
            get() { return null; },
            set() { return null; },
            configurable: false
        });
        
        // Protect against constructor manipulation
        Object.defineProperty(Object.prototype, 'constructor', {
            get() { return Object; },
            set() { return Object; },
            configurable: false
        });
    }
}