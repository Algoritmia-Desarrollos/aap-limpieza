import { supabase } from '../../assets/js/supabaseClient.js';
import { checkSession } from '../../assets/js/utils.js';
import { renderBottomNav } from '../components/bottomNav.js';
import { toast } from '../../assets/js/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
    const user = checkSession('operario');
    if (!user) return;

    renderBottomNav('perfil');
    
    // Carga paralela de datos
    loadProfile(user);
    loadUserRoutines(user.id);

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        if(confirm("¿Estás seguro de cerrar sesión?")) {
            localStorage.removeItem('cvo_usuario');
            window.location.href = '../index.html';
        }
    });
});

async function loadProfile(user) {
    try {
        document.getElementById('userName').textContent = user.nombre;
        document.getElementById('userInitials').textContent = user.nombre.substring(0, 2).toUpperCase();
        document.getElementById('userPin').textContent = user.pin;
        document.getElementById('userEmail').textContent = user.email || 'No registrado';
    } catch (error) {
        console.error(error);
        toast.error('Error visualizando perfil');
    }
}

// --- NUEVA LÓGICA: CARGAR RUTINAS ---

async function loadUserRoutines(userId) {
    const container = document.getElementById('routinesList');
    
    try {
        const { data: rutinas, error } = await supabase
            .from('limp_rutinas')
            .select(`*, limp_lugares(nombre)`)
            .eq('operario_default_id', userId)
            .order('hora_inicio_sugerida', { ascending: true });

        if (error) throw error;

        container.innerHTML = '';

        if (!rutinas || rutinas.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center py-8 text-gray-500 border border-white/5 rounded-xl bg-[#182234]/50">
                    <span class="material-symbols-outlined text-4xl mb-2 opacity-50">event_busy</span>
                    <p class="text-sm">No tienes rutinas fijas asignadas.</p>
                </div>
            `;
            return;
        }

        rutinas.forEach(r => {
            const diasStr = formatDays(r.dias_semana);
            const hora = r.hora_inicio_sugerida.slice(0,5);
            
            // Calculamos hora fin aproximada
            const horaFin = calculateEndTime(r.hora_inicio_sugerida, r.duracion_estimada_minutos);

            const card = document.createElement('div');
            card.className = "bg-[#182234] p-4 rounded-xl border border-white/5 shadow-sm relative overflow-hidden group";
            
            // Decoración visual (borde izquierdo de color)
            const accent = document.createElement('div');
            accent.className = "absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500";
            card.appendChild(accent);

            card.innerHTML += `
                <div class="pl-2">
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="font-bold text-white text-lg leading-tight">${r.limp_lugares?.nombre}</h4>
                        <span class="text-xs font-mono bg-white/10 px-2 py-1 rounded text-gray-300">
                            ${hora} - ${horaFin}
                        </span>
                    </div>
                    <p class="text-sm text-gray-400 mb-3">${r.titulo}</p>
                    
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary text-base">repeat</span>
                        <span class="text-xs font-bold text-blue-200 uppercase tracking-wide bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
                            ${diasStr}
                        </span>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        container.innerHTML = `<p class="text-center text-red-400 text-sm">No se pudo cargar la agenda.</p>`;
    }
}

// Helpers
function formatDays(daysArray) {
    if (!daysArray || !daysArray.length) return 'Sin asignar';
    const map = { 1:'Lun', 2:'Mar', 3:'Mié', 4:'Jue', 5:'Vie', 6:'Sáb', 7:'Dom' };
    
    // Si son todos los días de semana (L-V)
    const isWeekDays = daysArray.length === 5 && [1,2,3,4,5].every(d => daysArray.includes(d));
    if (isWeekDays) return 'Lunes a Viernes';

    return daysArray.sort().map(d => map[d]).join(', ');
}

function calculateEndTime(startTime, durationMinutes) {
    if(!startTime) return '';
    const [hours, mins] = startTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(mins + durationMinutes);
    return date.toLocaleTimeString('es-AR', {hour: '2-digit', minute:'2-digit'});
}