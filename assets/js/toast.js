// Sistema de notificaciones toast moderno
// Reemplaza los alert() nativos con notificaciones elegantes

export function showToast(message, type = 'info', duration = 3000) {
    // Tipos: 'success', 'error', 'warning', 'info'
    
    // Crear contenedor si no existe
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2';
        document.body.appendChild(container);
    }

    // Crear toast
    const toast = document.createElement('div');
    toast.className = `toast-item transform translate-x-full transition-all duration-300 ease-out`;
    
    // Estilos según tipo
    const styles = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-gray-900',
        info: 'bg-blue-500 text-white'
    };

    // Iconos según tipo
    const icons = {
        success: 'check_circle',
        error: 'error',
        warning: 'warning',
        info: 'info'
    };

    toast.innerHTML = `
        <div class="${styles[type]} px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 min-w-[280px] max-w-md">
            <span class="material-symbols-outlined text-2xl">${icons[type]}</span>
            <p class="font-medium text-sm flex-1">${message}</p>
            <button class="toast-close hover:opacity-70 transition">
                <span class="material-symbols-outlined text-lg">close</span>
            </button>
        </div>
    `;

    container.appendChild(toast);

    // Animar entrada
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
        toast.classList.add('translate-x-0');
    }, 10);

    // Cerrar al hacer click
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => removeToast(toast));

    // Auto-cerrar
    setTimeout(() => removeToast(toast), duration);

    // Vibración en móviles para errores
    if (type === 'error' && navigator.vibrate) {
        navigator.vibrate(200);
    }
}

function removeToast(toast) {
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => {
        toast.remove();
        
        // Limpiar contenedor si está vacío
        const container = document.getElementById('toast-container');
        if (container && container.children.length === 0) {
            container.remove();
        }
    }, 300);
}

// Helpers específicos
export const toast = {
    success: (msg, duration) => showToast(msg, 'success', duration),
    error: (msg, duration) => showToast(msg, 'error', duration),
    warning: (msg, duration) => showToast(msg, 'warning', duration),
    info: (msg, duration) => showToast(msg, 'info', duration)
};
