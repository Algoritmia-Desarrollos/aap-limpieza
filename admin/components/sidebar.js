export function renderSidebar(activePage) {
    const sidebarHTML = `
    <aside class="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col justify-between z-30 hidden md:flex">
        <div class="p-6">
            <div class="flex items-center gap-3 mb-8">
                <div class="w-10 h-10 bg-[#256af4] rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
                    CVO
                </div>
                <div>
                    <h1 class="font-bold text-gray-800">Admin Panel</h1>
                    <p class="text-xs text-gray-500">Gestión de Limpieza</p>
                </div>
            </div>

            <nav class="flex flex-col gap-1">
                ${createLink('dashboard', 'dashboard', 'Dashboard', activePage)}
                ${createLink('operarios', 'group', 'Operarios', activePage)}
                ${createLink('rutinas', 'list_alt', 'Rutinas', activePage)}
                ${createLink('reportes', 'bar_chart', 'Reportes', activePage)}
            </nav>
        </div>

        <div class="p-4 border-t border-gray-100">
            <button id="logoutBtnSidebar" class="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl w-full transition-colors font-medium">
                <span class="material-symbols-outlined">logout</span>
                Cerrar Sesión
            </button>
        </div>
    </aside>
    `;

    document.getElementById('sidebar-container').innerHTML = sidebarHTML;
}

// Helper para crear links con estado activo
function createLink(page, icon, label, activePage) {
    const isActive = page === activePage;
    const activeClasses = isActive 
        ? "bg-blue-50 text-blue-600 font-semibold" 
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900";

    return `
    <a href="${page}.html" class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeClasses}">
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${isActive ? 1 : 0};">${icon}</span>
        ${label}
    </a>
    `;
}