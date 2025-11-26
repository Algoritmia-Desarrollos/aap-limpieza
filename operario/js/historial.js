import { supabase } from '../../assets/js/supabaseClient.js';
import { checkSession } from '../../assets/js/utils.js';
import { renderBottomNav } from '../components/bottomNav.js';
import { toast } from '../../assets/js/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
    const user = checkSession('operario');
    if (!user) return;

    renderBottomNav('historial');
    loadHistory(user.id);
});

async function loadHistory(userId) {
    const historyList = document.getElementById('historyList');
    
    try {
        const { data: registros, error } = await supabase
            .from('limp_registros')
            .select(`
                *,
                limp_lugares ( nombre )
            `)
            .eq('operario_id', userId)
            .not('fin_tarea', 'is', null)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        if (!registros || registros.length === 0) {
            historyList.innerHTML = `
                <div class="text-center py-12 text-gray-500">
                    <span class="material-symbols-outlined text-4xl mb-2 opacity-50">history_toggle_off</span>
                    <p>No hay tareas registradas aún</p>
                </div>
            `;
            return;
        }

        historyList.innerHTML = registros.map(reg => `
            <div class="bg-[#182234] rounded-xl p-4 border border-white/5 flex justify-between items-center">
                <div>
                    <h3 class="font-bold text-white">${reg.limp_lugares?.nombre || 'Lugar desconocido'}</h3>
                    <p class="text-xs text-gray-400 mt-1 capitalize">
                        ${new Date(reg.inicio_tarea).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="px-2 py-1 rounded-lg text-xs font-bold bg-green-500/20 text-green-400">
                        Completado
                    </span>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading history:', error);
        toast.error('Error al cargar el historial');
        historyList.innerHTML = '<p class="text-center text-red-400 py-4">Error al cargar datos</p>';
    }
}
