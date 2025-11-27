import { supabase } from '../../assets/js/supabaseClient.js';
import { checkSession, logout, getFormattedDate } from '../../assets/js/utils.js';
import { renderBottomNav } from '../components/bottomNav.js';
import { toast } from '../../assets/js/toast.js';

const user = checkSession('operario');
if (!user) throw new Error("No user session");

renderBottomNav('dashboard');

// Referencias UI
const ui = {
    scanBtn: document.getElementById('scanBtn'),
    scannerModal: document.getElementById('scannerModal'),
    closeScannerBtn: document.getElementById('closeScannerBtn'),
    scanState: document.getElementById('scanState'),
    activeTaskState: document.getElementById('activeTaskState'),
    finishTaskBtn: document.getElementById('finishTaskBtn'),
    timerDisplay: document.getElementById('taskTimer'),
    currentLocation: document.getElementById('currentLocationName'),
    taskList: document.getElementById('taskList'),
    weeklyList: document.getElementById('weeklyScheduleContainer'), // Referencia nueva
    reader: document.getElementById('reader')
};

let html5QrcodeScanner = null;
let activeInterval = null;

init();

async function init() {
    document.getElementById('dateDisplay').innerText = getFormattedDate();
    document.getElementById('welcomeMsg').innerText = `Hola, ${user.nombre.split(' ')[0]}`;
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if(confirm("¿Cerrar sesión?")) logout();
    });

    await checkActiveTask(); 
    await loadDailyTasks(); 
    await loadWeeklySchedule(); // Cargar la agenda
}

// ... (El código del Escáner y Tarea Activa se mantiene IGUAL que antes) ...
// PEGA AQUÍ LA LÓGICA DE checkActiveTask, showActiveState, showIdleState, startScanner, etc.
// QUE YA TENÍAS EN EL ARCHIVO ANTERIOR. 
// (Para ahorrar espacio, solo pongo lo NUEVO y lo de DailyTasks abajo)

// --- SISTEMA DE ESCANEO (Resumido para contexto, usa el que ya tenías) ---
ui.scanBtn.addEventListener('click', () => { ui.scannerModal.classList.remove('hidden'); startScanner(); });
ui.closeScannerBtn.addEventListener('click', stopScanner);

function startScanner() {
    if (!document.getElementById("reader")) return;
    html5QrcodeScanner = new Html5Qrcode("reader");
    html5QrcodeScanner.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess)
    .catch(err => { console.error(err); ui.scannerModal.classList.add('hidden'); toast.error("Error de cámara"); });
}
function stopScanner() {
    if (html5QrcodeScanner) { html5QrcodeScanner.stop().then(() => { html5QrcodeScanner.clear(); ui.scannerModal.classList.add('hidden'); }); } 
    else { ui.scannerModal.classList.add('hidden'); }
}
async function onScanSuccess(decodedText) {
    stopScanner();
    if (navigator.vibrate) navigator.vibrate(200);
    try {
        const { data: lugar } = await supabase.from('limp_lugares').select('id, nombre').eq('codigo_qr', decodedText).single();
        if (!lugar) { toast.warning("QR no reconocido"); return; }
        const { data: newRecord } = await supabase.from('limp_registros').insert([{ operario_id: user.id, lugar_id: lugar.id, inicio_tarea: new Date().toISOString(), estado: 'en_progreso' }]).select('*, limp_lugares(nombre)').single();
        toast.success(`Iniciado: ${lugar.nombre}`);
        showActiveState(newRecord);
    } catch (err) { toast.error("Error al iniciar"); }
}
// ... Fin resumen escáner ...

// --- TAREA ACTIVA ---
async function checkActiveTask() {
    const { data } = await supabase.from('limp_registros').select('*, limp_lugares(nombre)').eq('operario_id', user.id).is('fin_tarea', null).single();
    if (data) showActiveState(data); else showIdleState();
}
function showActiveState(taskData) {
    ui.scanState.classList.add('hidden');
    ui.activeTaskState.classList.remove('hidden');
    ui.currentLocation.innerText = taskData.limp_lugares.nombre;
    startTimer(new Date(taskData.inicio_tarea));
    ui.finishTaskBtn.onclick = () => finishTask(taskData.id);
}
function showIdleState() {
    ui.scanState.classList.remove('hidden');
    ui.activeTaskState.classList.add('hidden');
    stopTimer();
}
async function finishTask(id) {
    ui.finishTaskBtn.disabled = true; ui.finishTaskBtn.innerHTML = "Finalizando...";
    await supabase.from('limp_registros').update({ fin_tarea: new Date().toISOString(), estado: 'completado' }).eq('id', id);
    toast.success("Finalizado"); showIdleState(); loadDailyTasks();
    ui.finishTaskBtn.disabled = false; ui.finishTaskBtn.innerHTML = "FINALIZAR TAREA";
}
function startTimer(start) {
    stopTimer();
    activeInterval = setInterval(() => {
        const diff = new Date() - start;
        if(diff < 0) return;
        const h = Math.floor(diff/3600000).toString().padStart(2,'0');
        const m = Math.floor((diff%3600000)/60000).toString().padStart(2,'0');
        const s = Math.floor((diff%60000)/1000).toString().padStart(2,'0');
        ui.timerDisplay.innerText = `${h}:${m}:${s}`;
    }, 1000);
}
function stopTimer() { clearInterval(activeInterval); ui.timerDisplay.innerText = "00:00:00"; }


// --- 3. CARGA DE TAREAS HOY ---
async function loadDailyTasks() {
    let today = new Date().getDay(); 
    if (today === 0) today = 7;

    const { data: rutinas } = await supabase
        .from('limp_rutinas')
        .select('*, limp_lugares(nombre)')
        .eq('operario_default_id', user.id)
        .contains('dias_semana', [today])
        .order('hora_inicio_sugerida', { ascending: true });

    ui.taskList.innerHTML = '';
    
    if (!rutinas || rutinas.length === 0) {
        ui.taskList.innerHTML = `
            <div class="flex flex-col items-center justify-center py-8 text-gray-500 opacity-60">
                <span class="material-symbols-outlined text-4xl mb-2">event_available</span>
                <p>Todo listo por hoy</p>
            </div>`;
        return;
    }

    rutinas.forEach(rutina => {
        const div = document.createElement('div');
        div.className = "bg-[#182234] p-4 rounded-xl border border-white/5 flex justify-between items-center shadow-lg border-l-4 border-primary";
        div.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <span class="material-symbols-outlined text-xl">location_on</span>
                </div>
                <div>
                    <h4 class="font-bold text-white text-sm">${rutina.limp_lugares.nombre}</h4>
                    <p class="text-gray-400 text-xs">${rutina.titulo}</p>
                </div>
            </div>
            <span class="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded font-mono">
                ${rutina.hora_inicio_sugerida.slice(0,5)}
            </span>
        `;
        ui.taskList.appendChild(div);
    });
}

// --- 4. NUEVA LÓGICA: AGENDA SEMANAL ---
async function loadWeeklySchedule() {
    // Buscar TODAS las rutinas de este usuario
    const { data: rutinas } = await supabase
        .from('limp_rutinas')
        .select('*, limp_lugares(nombre)')
        .eq('operario_default_id', user.id)
        .order('hora_inicio_sugerida', { ascending: true });

    ui.weeklyList.innerHTML = '';

    if (!rutinas || rutinas.length === 0) {
        ui.weeklyList.innerHTML = `<p class="text-gray-500 text-center text-sm">No tienes rutinas asignadas.</p>`;
        return;
    }

    rutinas.forEach(rutina => {
        // Formatear días
        const diasStr = formatDays(rutina.dias_semana);
        
        const card = document.createElement('div');
        // Estilo más apagado que las de "Hoy" para diferenciarlas
        card.className = "bg-[#182234]/60 p-3 rounded-xl border border-white/5 flex flex-col gap-2";
        
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <h4 class="font-semibold text-gray-200 text-sm">${rutina.limp_lugares.nombre}</h4>
                <span class="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded font-mono">
                    ${rutina.hora_inicio_sugerida.slice(0,5)}
                </span>
            </div>
            <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-gray-500 text-sm">calendar_month</span>
                <span class="text-xs text-primary font-medium tracking-wide uppercase">${diasStr}</span>
            </div>
        `;
        ui.weeklyList.appendChild(card);
    });
}

// Helper para formatear días
function formatDays(daysArray) {
    if (!daysArray || !daysArray.length) return '-';
    const map = { 1:'Lun', 2:'Mar', 3:'Mié', 4:'Jue', 5:'Vie', 6:'Sáb', 7:'Dom' };
    const isWeekDays = daysArray.length === 5 && [1,2,3,4,5].every(d => daysArray.includes(d));
    if (isWeekDays) return 'Lunes a Viernes';
    return daysArray.sort().map(d => map[d]).join(', ');
}