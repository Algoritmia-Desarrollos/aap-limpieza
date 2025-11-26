// Verifica sesión y rol. Si falla, redirige.
export function checkSession(requiredRole) {
    const userStr = localStorage.getItem('cvo_usuario');
    
    // 1. Si no hay usuario, volver al login (root)
    if (!userStr) {
        window.location.href = '/index.html'; 
        return null;
    }

    const user = JSON.parse(userStr);

    // 2. Si el rol no coincide (Ej: operario queriendo entrar a admin)
    if (requiredRole && user.rol !== requiredRole) {
        if (user.rol === 'admin') window.location.href = '/admin/dashboard.html';
        else window.location.href = '/operario/dashboard.html';
        return null;
    }

    return user;
}

// Cerrar sesión
export function logout() {
    localStorage.removeItem('cvo_usuario');
    window.location.href = '/index.html';
}

// Fecha bonita: "Lunes 27 de Octubre"
export function getFormattedDate() {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date().toLocaleDateString('es-AR', options);
}