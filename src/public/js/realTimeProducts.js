
const socket = io();

socket.on('productos-actualizados', (productos) => {

    const productList = document.getElementById('productList');
    
    productList.innerHTML = '';

    productos.forEach((product) => {
        const li = document.createElement('li');
        li.textContent = `${product.title} - Precio: $${product.price}`;
        productList.appendChild(li);

        
    });
    console.log("Productos actualizados")
});

