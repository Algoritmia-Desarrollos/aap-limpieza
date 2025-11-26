// Utilidades y helpers para optimización

// Debounce para búsquedas y filtros
export function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle para eventos de scroll
export function throttle(func, limit = 100) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Cache simple para datos
class SimpleCache {
    constructor(ttl = 5 * 60 * 1000) { // 5 minutos por defecto
        this.cache = new Map();
        this.ttl = ttl;
    }

    set(key, value) {
        this.cache.set(key, {
            value,
            timestamp: Date.now()
        });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        const isExpired = Date.now() - item.timestamp > this.ttl;
        if (isExpired) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    clear() {
        this.cache.clear();
    }

    has(key) {
        return this.get(key) !== null;
    }
}

export const dataCache = new SimpleCache();

// Skeleton loader HTML
export function createSkeleton(type = 'table') {
    if (type === 'table') {
        return `
            <tr class="animate-pulse">
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-3/4"></div></td>
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-1/2"></div></td>
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-1/4"></div></td>
                <td class="px-6 py-4"><div class="h-4 bg-gray-200 rounded w-1/3"></div></td>
            </tr>
        `.repeat(3);
    }
    
    if (type === 'card') {
        return `
            <div class="animate-pulse bg-gray-200 rounded-xl h-24"></div>
        `;
    }
}

// Validación de formularios mejorada
export function validateForm(formData, rules) {
    const errors = {};
    
    for (const [field, rule] of Object.entries(rules)) {
        const value = formData[field];
        
        if (rule.required && !value) {
            errors[field] = `${rule.label || field} es requerido`;
            continue;
        }
        
        if (rule.minLength && value.length < rule.minLength) {
            errors[field] = `${rule.label || field} debe tener al menos ${rule.minLength} caracteres`;
        }
        
        if (rule.maxLength && value.length > rule.maxLength) {
            errors[field] = `${rule.label || field} no puede tener más de ${rule.maxLength} caracteres`;
        }
        
        if (rule.pattern && !rule.pattern.test(value)) {
            errors[field] = rule.patternMessage || `${rule.label || field} tiene un formato inválido`;
        }
        
        if (rule.custom && !rule.custom(value)) {
            errors[field] = rule.customMessage || `${rule.label || field} es inválido`;
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}

// Formatear fechas de forma consistente
export function formatDate(date, format = 'short') {
    const d = new Date(date);
    
    if (format === 'short') {
        return d.toLocaleDateString('es-AR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    }
    
    if (format === 'long') {
        return d.toLocaleDateString('es-AR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long',
            year: 'numeric'
        });
    }
    
    if (format === 'time') {
        return d.toLocaleTimeString('es-AR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    if (format === 'datetime') {
        return `${formatDate(d, 'short')} ${formatDate(d, 'time')}`;
    }
    
    return d.toISOString();
}

// Detectar si es móvil
export function isMobile() {
    return window.innerWidth < 768;
}

// Detectar si es touch device
export function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Scroll suave a elemento
export function smoothScrollTo(element, offset = 0) {
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}
