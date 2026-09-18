// El banco no puede devolver la foto de otro producto. Una foto equivocada
// en una tienda es peor que no tener foto.
import test from "node:test";
import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
import {readFileSync,writeFileSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";

const aquí=dirname(fileURLToPath(import.meta.url));
const banco=JSON.parse(readFileSync(join(aquí,"banco.json"),"utf8")).productos;

const buscar=consultas=>{
  const tmp=join(aquí,".consulta-prueba.txt");
  writeFileSync(tmp,consultas.join("\n"));
  const salida=execFileSync("node",[join(aquí,"buscar.mjs"),"--archivo",tmp],{encoding:"utf8"});
  return salida;
};

test("cada producto del banco se encuentra a sí mismo, no a un hermano",()=>{
  const consultas=banco.map(p=>p.nombre+" "+p.presentacion);
  const salida=buscar(consultas);
  const fallos=[];
  banco.forEach((p,i)=>{
    const linea=salida.split("\n").find(l=>l.includes(consultas[i]));
    if(!linea||!linea.trim().startsWith("✓")) return fallos.push(`${p.nombre}: no se encontró`);
    if(!linea.includes(p.imagen)) fallos.push(`${p.nombre}: devolvió ${linea.split("→")[1].trim().split(" ")[0]}`);
  });
  assert.deepEqual(fallos,[],"el banco devuelve fotos equivocadas:\n  "+fallos.join("\n  "));
});

test("las variantes de una misma marca no se confunden",()=>{
  // tinto contra blanco, mango contra tropical: el caso que más duele
  const pares=[["Casillero del Diablo tinto","casillero-tinto"],
               ["Casillero del Diablo blanco","casillero-blanco"],
               ["Jugo de mango Mozo Juice","jugo-mozo-mango"],
               ["Jugo Tropical Mozo Juice","jugo-mozo-tropical"]]
    .filter(([,slug])=>banco.some(p=>p.slug===slug));
  if(!pares.length) return;
  const salida=buscar(pares.map(([q])=>q));
  for(const [q,slug] of pares){
    const linea=salida.split("\n").find(l=>l.includes(q));
    assert.ok(linea&&linea.includes(slug+".webp"),`«${q}» debería dar ${slug}, dio: ${linea||"nada"}`);
  }
});

test("lo que no está en el banco no se inventa",()=>{
  const salida=buscar(["Pollo entero congelado","Huevos cartón de 30","Pan suave"]);
  for(const q of ["Pollo entero congelado","Huevos cartón de 30","Pan suave"]){
    const linea=salida.split("\n").find(l=>l.includes(q));
    assert.ok(linea&&linea.trim().startsWith("·"),`«${q}» no está en el banco y no debería emparejarse: ${linea}`);
  }
});

test("cada entrada del banco tiene su archivo de imagen",()=>{
  for(const p of banco) readFileSync(join(aquí,p.imagen)); // lanza si falta
});
