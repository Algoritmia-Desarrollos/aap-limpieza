export function renderBottomNav(activePage) {
    const navHTML = `
    <nav class="fixed bottom-0 left-0 right-0 h-20 bg-[#101622]/95 backdrop-blur-md border-t border-white/5 z-20 flex items-center justify-around px-4">
        <a href="dashboard.html" class="flex flex-col items-center gap-1 ${activePage === 'dashboard' ? 'text-[#256af4]' : 'text-[#90a4cb] hover:text-white'} transition-colors">
            <span class="material-symbols-outlined">checklist</span>
            <span class="text-xs font-bold">Tareas</span>
        </a>
        <a href="historial.html" class="flex flex-col items-center gap-1 ${activePage === 'historial' ? 'text-[#256af4]' : 'text-[#90a4cb] hover:text-white'} transition-colors">
            <span class="material-symbols-outlined">history</span>
            <span class="text-xs font-medium">Historial</span>
        </a>
        <a href="perfil.html" class="flex flex-col items-center gap-1 ${activePage === 'perfil' ? 'text-[#256af4]' : 'text-[#90a4cb] hover:text-white'} transition-colors">
            <span class="material-symbols-outlined">person</span>
            <span class="text-xs font-medium">Perfil</span>
        </a>
    </nav>
    `;
    document.getElementById('nav-container').innerHTML = navHTML;
}