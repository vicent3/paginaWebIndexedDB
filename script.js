
let db;

document.addEventListener("DOMContentLoaded", () => {
    const request = window.indexedDB.open("TiendaDB", 1);

    request.onerror = (error) => console.log("Error al abrir la base de datos:", error);
    request.onsuccess = (event) => {
        db = event.target.result;
        // console.log("Base de datos lista");
        mostrarClientes();
        mostrarPedidos();
    };

    request.onupgradeneeded = (event) => {
        db = event.target.result;

        const clientesStore = db.createObjectStore("clientes", { keyPath: "id", autoIncrement: true });
        clientesStore.createIndex("nombre", "nombre", { unique: false });
        clientesStore.createIndex("ci", "ci", { unique: false });

        const pedidosStore = db.createObjectStore("pedidos", { keyPath: "id", autoIncrement: true });
        pedidosStore.createIndex("producto", "producto", { unique: false });
        pedidosStore.createIndex("cantidad", "cantidad", { unique: false });
        pedidosStore.createIndex("cliente", "cliente", { unique: false });

        console.log("Estructura creada correctamente");
    };

    document.getElementById("btnAgregarCliente").addEventListener("click", agregarCliente);
    document.getElementById("btnBorrarClientes").addEventListener("click", borrarTodosClientes);
    document.getElementById("btnAgregarPedido").addEventListener("click", agregarPedido);
});

// ========== CLIENTES ==========
function agregarCliente() {
    const nombre = document.getElementById("nombreCliente").value.trim();
    const ci = document.getElementById("ciCliente").value.trim();
    if (!nombre || !ci) return alert("Debe llenar todos los campos");

    const tx = db.transaction(["clientes"], "readwrite");
    const store = tx.objectStore("clientes");
    store.add({ nombre, ci });

    tx.oncomplete = () => {
        console.log("Cliente agregado correctamente");
        document.getElementById("nombreCliente").value = "";
        document.getElementById("ciCliente").value = "";
        mostrarClientes();
    };
}

function mostrarClientes() {
    const tabla = document.getElementById("tablaClientes");
    tabla.innerHTML = `<tr><th>Nombre</th><th>CI</th><th></th><th></th></tr>`;
    const select = document.getElementById("clienteSelect");
    select.innerHTML = "";

    const tx = db.transaction(["clientes"], "readonly");
    const store = tx.objectStore("clientes");
    const request = store.openCursor();

    request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            const { id, nombre, ci } = cursor.value;
            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${nombre}</td>
            <td>${ci}</td>
            <td><button onclick="editarCliente(${id})">Editar</button></td>
            <td><button onclick="borrarCliente(${id})">Borrar</button></td>
          `;
            tabla.appendChild(row);

            const option = document.createElement("option");
            option.value = nombre;
            option.textContent = nombre;
            select.appendChild(option);

            cursor.continue();
        }
    };
}

function borrarCliente(id) {
    const tx = db.transaction(["clientes"], "readwrite");
    const store = tx.objectStore("clientes");
    store.delete(id);
    tx.oncomplete = () => {
        console.log("Cliente eliminado");
        mostrarClientes();
    };
}

function borrarTodosClientes() {
    if (!confirm("¿Seguro que deseas borrar todos los clientes?")) return;

    const tx = db.transaction(["clientes"], "readwrite");
    const store = tx.objectStore("clientes");
    store.clear();

    tx.oncomplete = () => {
        console.log("Todos los clientes fueron eliminados");
        mostrarClientes();
    };
}

function editarCliente(id) {
    const nuevoNombre = prompt("Nuevo nombre:");
    const nuevoCI = prompt("Nuevo CI:");
    if (!nuevoNombre || !nuevoCI) return;

    const tx = db.transaction(["clientes"], "readwrite");
    const store = tx.objectStore("clientes");
    const request = store.get(id);

    request.onsuccess = (event) => {
        const cliente = event.target.result;
        cliente.nombre = nuevoNombre;
        cliente.ci = nuevoCI;
        store.put(cliente);
    };

    tx.oncomplete = () => {
        console.log("Cliente actualizado");
        mostrarClientes();
    };
}

// ========== PEDIDOS ==========
function agregarPedido() {
    const producto = document.getElementById("productoPedido").value.trim();
    const cantidad = document.getElementById("cantidadPedido").value.trim();
    const cliente = document.getElementById("clienteSelect").value;
    if (!producto || !cantidad || !cliente) return alert("Todos los campos son obligatorios");

    const tx = db.transaction(["pedidos"], "readwrite");
    const store = tx.objectStore("pedidos");
    store.add({ producto, cantidad, cliente });

    tx.oncomplete = () => {
        console.log("Pedido agregado correctamente");
        document.getElementById("productoPedido").value = "";
        document.getElementById("cantidadPedido").value = "";
        mostrarPedidos();
    };
}

function mostrarPedidos() {
    const tabla = document.getElementById("tablaPedidos");
    tabla.innerHTML = `<tr><th>Producto</th><th>Cantidad</th><th>Cliente</th><th></th><th></th></tr>`;
    const tx = db.transaction(["pedidos"], "readonly");
    const store = tx.objectStore("pedidos");
    const request = store.openCursor();

    request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            const { id, producto, cantidad, cliente } = cursor.value;
            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${producto}</td>
            <td>${cantidad}</td>
            <td>${cliente}</td>
            <td><button onclick="editarPedido(${id})">Editar</button></td>
            <td><button onclick="borrarPedido(${id})">Borrar</button></td>
          `;
            tabla.appendChild(row);
            cursor.continue();
        }
    };
}

function borrarPedido(id) {
    const tx = db.transaction(["pedidos"], "readwrite");
    const store = tx.objectStore("pedidos");
    store.delete(id);
    tx.oncomplete = () => {
        console.log("Pedido eliminado");
        mostrarPedidos();
    };
}

function editarPedido(id) {
    const nuevoProducto = prompt("Nuevo producto:");
    const nuevaCantidad = prompt("Nueva cantidad:");
    const nuevoCliente = prompt("Nuevo cliente:");
    if (!nuevoProducto || !nuevaCantidad || !nuevoCliente) return;

    const tx = db.transaction(["pedidos"], "readwrite");
    const store = tx.objectStore("pedidos");
    const request = store.get(id);

    request.onsuccess = (event) => {
        const pedido = event.target.result;
        pedido.producto = nuevoProducto;
        pedido.cantidad = nuevaCantidad;
        pedido.cliente = nuevoCliente;
        store.put(pedido);
    };

    tx.oncomplete = () => {
        console.log("Pedido actualizado");
        mostrarPedidos();
    };
}