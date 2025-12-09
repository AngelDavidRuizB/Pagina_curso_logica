# Laboratorio de Lógica (Plantilla)

Plantilla educativa con secciones para que los estudiantes escriban y ejecuten pequeños fragmentos de JavaScript relacionados con conceptos de programación básica. Se usó la opción A para editor simple (textarea) y animaciones predefinidas. No se implementó un motor avanzado de ejecución (paso 3 omitido).

## Cómo usar
1. Abre `index.html` en tu navegador.
2. Usa la barra lateral para elegir el concepto.
3. Escribe tu código en el textarea de la sección.
4. Presiona **Ejecutar** y observa la animación en el panel derecho.

## Funciones de animación disponibles
- `animateVariable(nombre, valor)`
- `animateIfElse(condicion)`
- `animateFor(iteracion, total)`
- `animateWhile(iteracion, limite)`
- `animateNested(fila, col, limite)`
- `animateArray(arreglo)`
- `animateFunction(entrada, salida)`

Ejemplos pre-cargados se encuentran en cada sección dentro del textarea.

## Notas para docentes
- La ejecución es simple con `new Function` y sin sandbox avanzado.
- Cada clic en "Ejecutar" limpia y redibuja la animación de la sección.
- Si deseas más seguridad, considera mover la ejecución a un iframe sandbox o Web Worker (no incluido por solicitud).

## Ediciones permitidas para estudiantes
- Solo el contenido de cada `<textarea>`.
- Pueden llamar a las funciones de animación mencionadas arriba.
