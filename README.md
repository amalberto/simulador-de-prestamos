Proyecto: Simulador de préstamos

Este es un simulador de préstamos, hecho con HTML, CSS y JavaScript. Podés ingresar, modificar, buscar, eliminar, filtrar, imprimir, y simular distintos tipos de créditos como, hipotecario, automotor, de estudios, entre otros. 


🧩 Cosas que hace 

- Te permite ingresar un pedido que: 
- contiene el nombre del cliente 
- define el tipo de crédito elegido 
- aclara cuanta plata se solicita
- define en cuantas cuotas se va a pagar 
- contiene una tasa de interés (que se puede cambiar o no, dependiendo el tipo) 
- contiene validaciones estrictas de formulario. 

Al ingresar un pedido se genera una vista que:
- te muestra ese pedido, así como todos los anteriores que hayas ingresado. 
- te da la posibilidad de editar y borrar pedidos uno por uno. 
- te da una opción para eliminar todos los pedidos juntos. 
- contiene un botón que te da la posibilidad de filtrar por tipos de crédito. 
- contiene un botón que te permite calcular toda la plata solicitada. 
- valida si el préstamo está preaprobado o no (según el monto y la cantidad de cuotas elegidas). 
- te permite imprimir cada pedido por separado (dentro de un recuadro). 

--- 

▶️ ¿Cómo se usa? 

1. Elegí qué crédito querés del menú desplegable.
2. Llená los espacios del formulario: 
- Poné tu nombre completo (nombre y apellido). 
- Ingresá el tipo, cuánta plata, cuántas cuotas (y usas el tipo 'Simulación', la tasa). 
3. Pulsá "Registrar solicitud" para guardar la solicitud. 
4. Los pedidos van a aparecer abajo del formulario. 
5. Desde cada tarjeta podés: 
- Editar el pedido. 
- Eliminarlo. 
- Imprimirlo. 
- Verificar si está preaprobado. 
6. También podés: 
- Buscar por tipo de crédito. 
- Calcular toda la plata solicitada
- Borrar todos los pedidos

--- 

📋 Cosas que valida

- Nombre y apellido con la primera letra mayúscula, mínimo tres letras para nombre y dos para apellido.
- Monto del pedido dentro de los rangos permitidos, según el tipo de préstamo seleccionado. 
- Cuotas dentro del rango seleccionable, según el tipo.  
- No permite registrar la solicitud si faltan datos o son erroneos.

💽 Tecnologías utilizadas

- HTML5 
- Maquetado con CSS y Bootstrap 
- Javascript con diseño modular para facilitar la lectura del código

## 📁 Estructura del proyecto
.
├── index.html
├── styles.css
├── tiposPrestamo.json
├── js/
│ ├── interfaz.js
│ ├── solicitudes.js
│ ├── tiposPrestamo.js
│ └── main.js
└── README.md