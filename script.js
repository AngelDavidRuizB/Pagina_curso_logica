// ================================================
// Laboratorio de Lógica - Motor de Animaciones Didácticas
// ================================================

// --- Sistema de Navegación ---
const navButtons = document.querySelectorAll('.nav-btn');
const panels = document.querySelectorAll('[data-section]');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        
        // Actualizar botones
        navButtons.forEach(b => b.classList.toggle('active', b === btn));
        
        // Actualizar paneles
        panels.forEach(p => {
            if (p.id === target) {
                p.classList.remove('hidden');
                // Pequeña animación de entrada
                p.style.opacity = '0';
                setTimeout(() => p.style.opacity = '1', 50);
            } else {
                p.classList.add('hidden');
            }
        });
    });
});

// --- Referencias a áreas visuales ---
const visuals = {
    variables: document.querySelector('[data-visual="variables"]'),
    condicionales: document.querySelector('[data-visual="condicionales"]'),
    for: document.querySelector('[data-visual="for"]'),
    while: document.querySelector('[data-visual="while"]'),
    anidados: document.querySelector('[data-visual="anidados"]'),
    estructuras: document.querySelector('[data-visual="estructuras"]'),
    funciones: document.querySelector('[data-visual="funciones"]')
};

// --- Funciones de Animación Didáctica ---

// 1. Variables: "Cajas de memoria"
window.crearVariable = function(nombre, valor) {
    const area = visuals.variables;
    
    const card = document.createElement('div');
    card.className = 'variable-box';
    
    const nameEl = document.createElement('div');
    nameEl.className = 'var-name';
    nameEl.textContent = nombre;
    
    const valEl = document.createElement('div');
    valEl.className = 'var-value';
    
    // Si es string, poner comillas visuales
    if (typeof valor === 'string') {
        valEl.textContent = `"${valor}"`;
        valEl.style.color = '#a5f3fc'; // Cyan claro para strings
    } else {
        valEl.textContent = valor;
        valEl.style.color = '#fcd34d'; // Amarillo para números
    }
    
    card.appendChild(nameEl);
    card.appendChild(valEl);
    area.appendChild(card);
};

// 2. Condicionales: "Diagrama de flujo"
window.animarCondicional = function(condicion, textoCondicion) {
    const area = visuals.condicionales;
    
    const container = document.createElement('div');
    container.className = 'flow-container';
    
    // Nodo Inicio
    container.innerHTML = `
        <div class="flow-node">Inicio</div>
        <div style="height: 20px; border-left: 2px solid #64748b;"></div>
        <div class="flow-diamond">
            <span>${textoCondicion || '?'}</span>
        </div>
        <div class="flow-branch">
            <div class="branch-path ${condicion ? 'active' : ''}">
                <span class="branch-label">VERDADERO</span>
                <div style="height: 30px; border-left: 2px dashed currentColor;"></div>
                <div class="flow-node" style="border-color: var(--success)">Ejecutar Bloque IF</div>
            </div>
            <div class="branch-path ${!condicion ? 'active' : ''}">
                <span class="branch-label">FALSO</span>
                <div style="height: 30px; border-left: 2px dashed currentColor;"></div>
                <div class="flow-node" style="border-color: var(--danger)">Ejecutar Bloque ELSE</div>
            </div>
        </div>
    `;
    
    area.appendChild(container);
};

// 3. Ciclo For: "Pista de iteraciones"
window.animarCicloFor = function(i, total) {
    const area = visuals.for;
    
    // Si es la primera iteración (o no existe el track), crearlo
    let track = area.querySelector('.loop-track');
    if (!track) {
        track = document.createElement('div');
        track.className = 'loop-track';
        area.appendChild(track);
    }
    
    const step = document.createElement('div');
    step.className = 'loop-step current';
    step.textContent = i;
    step.title = `Iteración ${i}`;
    
    // Quitar clase 'current' a los anteriores
    const prev = track.querySelectorAll('.loop-step');
    prev.forEach(p => p.classList.remove('current'));
    
    track.appendChild(step);
};

// 4. Ciclo While: "Verificar y Actuar"
window.animarCicloWhile = function(condicion, i) {
    const area = visuals.while;
    
    let track = area.querySelector('.loop-track');
    if (!track) {
        track = document.createElement('div');
        track.className = 'loop-track';
        area.appendChild(track);
    }
    
    const step = document.createElement('div');
    step.className = 'loop-step';
    
    if (condicion) {
        step.classList.add('current');
        step.textContent = i;
        step.style.borderColor = 'var(--success)';
    } else {
        step.textContent = '🛑';
        step.style.borderColor = 'var(--danger)';
        step.style.background = 'rgba(239, 68, 68, 0.2)';
    }
    
    track.appendChild(step);
};

// 5. Ciclos Anidados: "Grid de coordenadas"
window.animarAnidado = function(fila, col, totalFilas, totalCols) {
    const area = visuals.anidados;
    
    // Buscar o crear grid
    let grid = area.querySelector('.grid-container');
    if (!grid) {
        grid = document.createElement('div');
        grid.className = 'grid-container';
        grid.style.gridTemplateColumns = `repeat(${totalCols}, 1fr)`;
        
        // Pre-llenar celdas vacías
        for(let r=0; r<totalFilas; r++) {
            for(let c=0; c<totalCols; c++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.r = r;
                cell.dataset.c = c;
                cell.textContent = `${r},${c}`;
                grid.appendChild(cell);
            }
        }
        area.appendChild(grid);
    }
    
    // Iluminar celda actual
    const cell = grid.querySelector(`.grid-cell[data-r="${fila}"][data-c="${col}"]`);
    if (cell) {
        // Quitar active de otros para efecto de "escaneo"
        const actives = grid.querySelectorAll('.active');
        actives.forEach(a => a.classList.remove('active'));
        
        cell.classList.add('active');
        // Dejar rastro
        cell.style.borderColor = 'var(--accent)';
        cell.style.color = 'white';
    }
};

// 6. Estructuras: "Casilleros de Array"
window.animarArray = function(arr) {
    const area = visuals.estructuras;
    
    const container = document.createElement('div');
    container.className = 'array-container';
    
    arr.forEach((valor, index) => {
        const item = document.createElement('div');
        item.className = 'array-item';
        
        const valBox = document.createElement('div');
        valBox.className = 'array-val';
        valBox.textContent = valor;
        
        const idxLabel = document.createElement('div');
        idxLabel.className = 'array-idx';
        idxLabel.textContent = `index ${index}`;
        
        item.appendChild(valBox);
        item.appendChild(idxLabel);
        container.appendChild(item);
    });
    
    area.appendChild(container);
};

// 7. Funciones: "Máquina de Procesamiento"
window.animarFuncion = function(nombre, entradas, salida) {
    const area = visuals.funciones;
    
    const machine = document.createElement('div');
    machine.className = 'func-machine';
    
    const inBox = document.createElement('div');
    inBox.className = 'func-in';
    inBox.textContent = `IN: ${JSON.stringify(entradas)}`;
    
    const procBox = document.createElement('div');
    procBox.className = 'func-process';
    procBox.textContent = nombre + '()';
    
    const outBox = document.createElement('div');
    outBox.className = 'func-out';
    outBox.textContent = `OUT: ${salida}`;
    
    machine.appendChild(inBox);
    machine.appendChild(procBox);
    machine.appendChild(outBox);
    
    area.appendChild(machine);
};


// --- Motor de Ejecución ---
function runCode(sectionKey) {
    const textarea = document.getElementById(`code-${sectionKey}`);
    const code = textarea.value;
    const area = visuals[sectionKey];
    
    // 1. Limpiar área visual antes de ejecutar
    area.innerHTML = '';
    
    try {
        // 2. Ejecutar código del estudiante
        // Usamos new Function para un sandbox básico
        const fn = new Function(code);
        fn();
    } catch (err) {
        // Manejo de errores visual
        const errorBox = document.createElement('div');
        errorBox.style.color = '#ef4444';
        errorBox.style.background = 'rgba(239,68,68,0.1)';
        errorBox.style.padding = '10px';
        errorBox.style.borderRadius = '4px';
        errorBox.style.border = '1px solid #ef4444';
        errorBox.innerHTML = `<strong>Error:</strong> ${err.message}`;
        area.appendChild(errorBox);
    }
}

// Conectar botones
document.querySelectorAll('[data-run]').forEach(btn => {
    btn.addEventListener('click', () => runCode(btn.dataset.run));
});

// Mensaje de bienvenida en consola
console.log('Laboratorio de Lógica iniciado. ¡Listo para aprender!');
