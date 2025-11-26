export function renderSidebar(activePage) {
    const sidebarHTML = `
    <!-- Mobile: Hamburger Button -->
    <button id="mobileSidebarToggle" 
            class="md:hidden fixed top-4 right-4 z-50 p-3 bg-white rounded-xl shadow-lg border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all"
            aria-label="Abrir menú">
        <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
    </button>
    
    <!-- Overlay para cerrar sidebar en móvil -->
    <div id="sidebarOverlay" 
         class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 hidden md:hidden transition-opacity"
         aria-hidden="true"></div>
    
    <!-- Sidebar con animación slide -->
    <aside class="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col justify-between z-50
                  transform -translate-x-full md:translate-x-0 transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none"
           id="sidebar"
           role="navigation"
           aria-label="Menú principal">
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
    
    // Configurar toggle del sidebar en móvil
    setTimeout(() => {
        const toggle = document.getElementById('mobileSidebarToggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        function openSidebar() {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
        
        function closeSidebar() {
            sidebar.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
            document.body.style.overflow = '';
        }
        
        toggle?.addEventListener('click', openSidebar);
        overlay?.addEventListener('click', closeSidebar);
        
        // Cerrar con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !sidebar.classList.contains('-translate-x-full')) {
                closeSidebar();
            }
        });
        
        // Cerrar al hacer click en un link (solo móvil)
        if (window.innerWidth < 768) {
            const links = sidebar.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', closeSidebar);
            });
        }
    }, 100);
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