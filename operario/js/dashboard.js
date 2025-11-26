import { supabase } from '../../assets/js/supabaseClient.js';
import { checkSession, logout, getFormattedDate } from '../../assets/js/utils.js';
import { renderBottomNav } from '../components/bottomNav.js';

// 1. Seguridad y UI Base
const user = checkSession('operario');
renderBottomNav('dashboard');

// 2. Renderizar Header
document.getElementById('dateDisplay').innerText = getFormattedDate();
document.getElementById('welcomeMsg').innerText = `Hola, ${user.nombre}`;

// 3. Listeners
document.getElementById('logoutBtn').addEventListener('click', logout);
document.getElementById('scanBtn').addEventListener('click', () => {
    alert("Próximamente: Abrir Cámara para escanear QR");
});

// 4. Cargar Rutinas desde Supabase
async function loadDailyTasks() {
    const taskList = document.getElementById('taskList');
    
    // Calcular día de la semana (1 = Lunes en tu DB según vimos)
    let today = new Date().getDay(); 
    if (today === 0) today = 7; // Convertir domingo 0 a 7

    try {
        console.log(`Buscando rutinas para Operario ${user.id} en día ${today}`);

        const { data: rutinas, error } = await supabase
            .from('limp_rutinas')
            .select(`
                *,
                limp_lugares ( nombre )
            `)
            .eq('operario_default_id', user.id)
            .contains('dias_semana', [today]); // Filtra si el array incluye hoy

        if (error) throw error;

        // Renderizar
        taskList.innerHTML = '';
        
        if (rutinas.length === 0) {
            taskList.innerHTML = `
                <div class="flex flex-col items-center justify-center py-8 opacity-50">
                    <span class="material-symbols-outlined text-4xl mb-2">bedtime</span>
                    <p>No tienes rutinas asignadas hoy.</p>
                </div>`;
            return;
        }

        rutinas.forEach(rutina => {
            const card = document.createElement('div');
            card.className = "bg-[#182234] p-4 rounded-xl border border-white/5 flex justify-between items-center shadow-sm";
            card.innerHTML = `
                <div>
                    <h4 class="font-bold text-white text-lg">${rutina.limp_lugares.nombre}</h4>
                    <p class="text-gray-400 text-sm">${rutina.titulo}</p>
                    <div class="mt-2 flex items-center gap-2">
                        <span class="text-xs bg-primary/20 text-primary px-2 py-1 rounded">
                            ${rutina.hora_inicio_sugerida.slice(0,5)} hs
                        </span>
                        <span class="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                            ${rutina.duracion_estimada_minutos} min
                        </span>
                    </div>
                </div>
                <div class="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center">
                    <span class="material-symbols-outlined text-gray-400">chevron_right</span>
                </div>
            `;
            taskList.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        taskList.innerHTML = `<p class="text-red-400 text-center">Error cargando rutinas</p>`;
    }
}

// Iniciar carga
loadDailyTasks();