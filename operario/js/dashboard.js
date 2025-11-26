import { supabase } from '../../assets/js/supabaseClient.js';
import { checkSession, logout, getFormattedDate } from '../../assets/js/utils.js';
import { renderBottomNav } from '../components/bottomNav.js';

// --- CONFIGURACIÓN INICIAL ---
const user = checkSession('operario');
renderBottomNav('dashboard');

// Referencias DOM
const scanBtn = document.getElementById('scanBtn');
const scannerModal = document.getElementById('scannerModal');
const closeScannerBtn = document.getElementById('closeScannerBtn');
const scanState = document.getElementById('scanState');
const activeTaskState = document.getElementById('activeTaskState');
const finishTaskBtn = document.getElementById('finishTaskBtn');
const timerDisplay = document.getElementById('taskTimer');

let html5QrcodeScanner = null;
let activeInterval = null;

// --- INICIO ---
init();

async function init() {
    // UI Header
    document.getElementById('dateDisplay').innerText = getFormattedDate();
    document.getElementById('welcomeMsg').innerText = `Hola, ${user.nombre.split(' ')[0]}`;
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Cargar Datos
    await checkActiveTask(); // ¿Ya estaba trabajando?
    await loadDailyTasks();  // Cargar lista de pendientes
}

// --- 1. GESTIÓN DE TAREA ACTIVA ---

async function checkActiveTask() {
    // Buscamos si hay un registro SIN fecha de fin para este usuario
    const { data, error } = await supabase
        .from('limp_registros')
        .select('*, limp_lugares(nombre)')
        .eq('operario_id', user.id)
        .is('fin_tarea', null) // Tarea abierta
        .single();

    if (data) {
        // Hay tarea activa -> Mostrar UI de "Trabajando"
        showActiveState(data);
    } else {
        // No hay tarea -> Mostrar botón Escanear
        showIdleState();
    }
}

function showActiveState(taskData) {
    scanState.classList.add('hidden');
    activeTaskState.classList.remove('hidden');
    
    document.getElementById('currentLocationName').innerText = taskData.limp_lugares.nombre;
    
    // Iniciar contador visual
    startTimer(new Date(taskData.inicio_tarea));

    // Configurar botón finalizar
    finishTaskBtn.onclick = () => finishTask(taskData.id);
}

function showIdleState() {
    scanState.classList.remove('hidden');
    activeTaskState.classList.add('hidden');
    stopTimer();
}

// --- 2. SISTEMA DE ESCANEO ---

scanBtn.addEventListener('click', () => {
    scannerModal.classList.remove('hidden');
    startScanner();
});

closeScannerBtn.addEventListener('click', stopScanner);

function startScanner() {
    html5QrcodeScanner = new Html5Qrcode("reader");
    
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };
    
    html5QrcodeScanner.start(
        { facingMode: "environment" }, // Usa cámara trasera
        config,
        onScanSuccess,
        (errorMessage) => { /* Ignorar errores de lectura en vacío */ }
    ).catch(err => {
        alert("Error al iniciar cámara: " + err);
    });
}

function stopScanner() {
    if (html5QrcodeScanner) {
        html5QrcodeScanner.stop().then(() => {
            html5QrcodeScanner.clear();
            scannerModal.classList.add('hidden');
        }).catch(err => console.error(err));
    } else {
        scannerModal.classList.add('hidden');
    }
}

async function onScanSuccess(decodedText, decodedResult) {
    // 1. Detener escáner
    stopScanner();
    console.log(`Código escaneado: ${decodedText}`);

    // 2. Buscar qué lugar es en la Base de Datos
    // Suponemos que el QR tiene el texto que guardamos en la columna 'codigo_qr' (ej: QR-NAVE-INT)
    try {
        const { data: lugar, error } = await supabase
            .from('limp_lugares')
            .select('id, nombre')
            .eq('codigo_qr', decodedText)
            .single();

        if (error || !lugar) {
            alert("❌ Código QR no reconocido en el sistema.");
            return;
        }

        // 3. Crear Registro de Inicio (START)
        const { data: newRecord, error: insertError } = await supabase
            .from('limp_registros')
            .insert([
                { 
                    operario_id: user.id,
                    lugar_id: lugar.id,
                    inicio_tarea: new Date().toISOString(),
                    estado: 'en_progreso'
                }
            ])
            .select('*, limp_lugares(nombre)')
            .single();

        if (insertError) throw insertError;

        // 4. Cambiar UI
        alert(`✅ Inicio registrado en: ${lugar.nombre}`);
        showActiveState(newRecord);

    } catch (err) {
        console.error(err);
        alert("Error al procesar el escaneo.");
    }
}

// --- 3. FINALIZAR TAREA ---

async function finishTask(registroId) {
    if (!confirm("¿Confirmar que terminaste la tarea?")) return;

    try {
        // Calcular duración (opcional, también se puede hacer con SQL triggers)
        // Por ahora solo cerramos la fecha
        const { error } = await supabase
            .from('limp_registros')
            .update({ 
                fin_tarea: new Date().toISOString(),
                estado: 'completado'
            })
            .eq('id', registroId);

        if (error) throw error;

        // Volver a estado normal
        showIdleState();
        loadDailyTasks(); // Recargar lista para ver si se actualiza algo

    } catch (err) {
        console.error(err);
        alert("Error al finalizar tarea.");
    }
}

// --- 4. UTILIDADES (Timer y Lista) ---

function startTimer(startTime) {
    stopTimer(); // Limpiar anterior si existe
    activeInterval = setInterval(() => {
        const now = new Date();
        const diff = now - startTime;
        
        // Formato HH:MM:SS
        const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
        const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
        const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
        
        timerDisplay.innerText = `${hours}:${minutes}:${seconds}`;
    }, 1000);
}

function stopTimer() {
    if (activeInterval) clearInterval(activeInterval);
    timerDisplay.innerText = "00:00:00";
}

async function loadDailyTasks() {
    const taskList = document.getElementById('taskList');
    let today = new Date().getDay(); 
    if (today === 0) today = 7;

    const { data: rutinas } = await supabase
        .from('limp_rutinas')
        .select('*, limp_lugares(nombre)')
        .eq('operario_default_id', user.id)
        .contains('dias_semana', [today]);

    taskList.innerHTML = '';
    
    if (!rutinas || rutinas.length === 0) {
        taskList.innerHTML = `<div class="text-center py-8 text-gray-500"><p>No hay rutinas asignadas hoy.</p></div>`;
        return;
    }

    rutinas.forEach(rutina => {
        const div = document.createElement('div');
        div.className = "bg-[#182234] p-4 rounded-xl border border-white/5 flex justify-between items-center shadow-sm";
        div.innerHTML = `
            <div>
                <h4 class="font-bold text-white">${rutina.limp_lugares.nombre}</h4>
                <p class="text-gray-400 text-sm">${rutina.titulo}</p>
                <span class="text-xs bg-primary/20 text-primary px-2 py-1 rounded mt-1 inline-block">${rutina.hora_inicio_sugerida.slice(0,5)} hs</span>
            </div>
        `;
        taskList.appendChild(div);
    });
}