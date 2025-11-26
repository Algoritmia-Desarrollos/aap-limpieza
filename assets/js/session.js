// Verifica si hay sesión y si el rol es correcto
export function checkAuth(requiredRole = null) {
    const userStr = localStorage.getItem('cvo_usuario');
    
    // 1. Si no hay usuario, mandar al login
    if (!userStr) {
        window.location.href = '/index.html'; // Ajusta la ruta relativa según necesites
        return null;
    }

    const user = JSON.parse(userStr);

    // 2. Si se requiere un rol específico (ej: 'admin') y no lo tiene
    if (requiredRole && user.rol !== requiredRole) {
        // Si intenta entrar a admin siendo operario, lo mandamos a su dashboard
        if (user.rol === 'operario') window.location.href = '/operario/dashboard.html';
        if (user.rol === 'admin') window.location.href = '/admin/dashboard.html';
        return null;
    }

    return user;
}

export function logout() {
    localStorage.removeItem('cvo_usuario');
    window.location.href = '/index.html';
}