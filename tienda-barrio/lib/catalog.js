// Catálogo del negocio. Un objeto por producto.
//   id  · número único, no se repite
//   n   · nombre como lo dice el cliente
//   d   · presentación: marca, envase, peso
//   c   · categoría; las categorías de la tienda salen de aquí
//   p   · precio, número entero, sin símbolo
//   img · foto en public/products/
export const products=[
{id:1,n:"Refresco de cola",d:"Lata 355 mL",c:"Bebidas",p:250,img:"/products/ejemplo-1.webp"},
{id:2,n:"Agua natural",d:"Botella 1,5 L",c:"Bebidas",p:180,img:"/products/ejemplo-2.webp"},
{id:3,n:"Jugo de naranja",d:"Cartón 1 L",c:"Bebidas",p:420,img:"/products/ejemplo-3.webp"},
{id:4,n:"Arroz",d:"Bolsa 1 kg",c:"Despensa",p:600,img:"/products/ejemplo-4.webp"},
{id:5,n:"Frijoles negros",d:"Bolsa 500 g",c:"Despensa",p:850,img:"/products/ejemplo-5.webp"},
{id:6,n:"Aceite de girasol",d:"Botella 1 L",c:"Despensa",p:1400,img:"/products/ejemplo-6.webp"},
{id:7,n:"Galletas dulces",d:"Paquete 200 g",c:"Snacks",p:320,img:"/products/ejemplo-7.webp"},
{id:8,n:"Chocolate",d:"Tableta 100 g",c:"Snacks",p:900,img:"/products/ejemplo-8.webp"},
{id:9,n:"Caramelos surtidos",d:"Bolsa",c:"Snacks",p:550,img:"/products/ejemplo-9.webp"}
];
