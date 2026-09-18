// Centinela de la plantilla: ningún fichero de CÓDIGO puede nombrar a un
// negocio concreto. Solo los ficheros de DATOS pueden hacerlo.
// Si esta prueba falla, la plantilla dejó de ser reutilizable.
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,readdirSync,statSync} from "node:fs";
import {join} from "node:path";

const raiz=new URL("..",import.meta.url).pathname;
const tenant=JSON.parse(readFileSync(join(raiz,"config/tenant.json"),"utf8"));
// Ficheros que SÍ describen al negocio y por eso quedan fuera del centinela.
const DATOS=["config/tenant.json","lib/catalog.js"];

function codigo(dir,salida=[]){
  for(const n of readdirSync(join(raiz,dir))){
    const rel=join(dir,n);
    if(statSync(join(raiz,rel)).isDirectory()){codigo(rel,salida);continue}
    if(!/\.(js|mjs|css|json)$/.test(n))continue;
    if(DATOS.includes(rel))continue;
    salida.push(rel);
  }
  return salida;
}
const ficheros=[...codigo("app"),...codigo("lib"),"package.json"];

// Los nombres de archivo también cuentan: "hero-mercado.png" nombra un negocio.
function nombresDeArchivo(dir,salida=[]){
  for(const n of readdirSync(join(raiz,dir))){
    const rel=join(dir,n);
    if(statSync(join(raiz,rel)).isDirectory()){nombresDeArchivo(rel,salida);continue}
    salida.push(rel);
  }
  return salida;
}

const señas=[tenant.name,tenant.shortName,tenant.whatsapp,tenant.slug,
             tenant.logoTitle.top+"<",tenant.assistant.name,
             tenant.addressLines[0],tenant.orderTitle];

test("el código no nombra a ningún negocio concreto",()=>{
  const sucios=[];
  for(const f of ficheros){
    const texto=readFileSync(join(raiz,f),"utf8");
    for(const s of señas) if(s && texto.includes(s)) sucios.push(`${f} → «${s}»`);
  }
  assert.deepEqual(sucios,[],"hay negocio a fuego en el código:\n  "+sucios.join("\n  "));
});

test("tampoco lo nombran los archivos de public/",()=>{
  const partes=[tenant.name,tenant.shortName,tenant.slug,tenant.assistant.name]
    .filter(Boolean).map(x=>x.toLowerCase().replace(/\s+/g,"-"));
  const sucios=nombresDeArchivo("public").filter(f=>partes.some(p=>f.toLowerCase().includes(p)));
  assert.deepEqual(sucios,[],"hay archivos que nombran al negocio:\n  "+sucios.join("\n  "));
});

test("el negocio se describe entero en un solo fichero",()=>{
  for(const clave of ["slug","name","shortName","tagline","address","whatsapp","hours",
                      "seo","hero","theme","assistant","shippingRates","orderPrefix"])
    assert.ok(tenant[clave],"falta «"+clave+"» en config/tenant.json");
});
