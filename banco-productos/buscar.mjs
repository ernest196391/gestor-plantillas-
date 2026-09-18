#!/usr/bin/env node
// Busca los productos de un negocio en el banco compartido.
//
//   node buscar.mjs "Trapiche Malbec" "Cerveza Cristal" "Carne de cerdo"
//   node buscar.mjs --archivo inventario.txt      (un producto por línea)
//
// Devuelve qué fotos ya existen y cuáles hay que conseguir.
import {readFileSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";

const aquí=dirname(fileURLToPath(import.meta.url));
const banco=JSON.parse(readFileSync(join(aquí,"banco.json"),"utf8")).productos;

const limpiar=s=>s.toLowerCase()
  .normalize("NFD").replace(/[̀-ͯ]/g,"")   // fuera acentos
  .replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();

const palabras=s=>limpiar(s).split(" ").filter(w=>w.length>2);

// Dos palabras casan si una empieza como la otra: "lays" con "lay",
// "champiñones" con "champinon". Así el nombre que escribe cada bodega
// no tiene que coincidir letra por letra con el del banco.
const casan=(a,b)=>a===b||(a.length>=3&&b.length>=3&&(a.startsWith(b)||b.startsWith(a)));

function buscar(consulta){
  const q=palabras(consulta);
  const puntuados=banco.map(p=>{
    const nombre=palabras(p.nombre), marca=palabras(p.marca);
    const cand=[...nombre,...marca,...palabras(p.presentacion)];
    const enCand=q.filter(w=>cand.some(c=>casan(w,c))).length;
    const enConsulta=nombre.filter(w=>q.some(c=>casan(w,c))).length;
    const marcaCasa=marca.length&&marca.every(w=>q.some(c=>casan(w,c)));
    const nombreEntero=nombre.length&&enConsulta===nombre.length;
    // Sin recortar: si se recorta antes de comparar, dos productos de la misma
    // marca empatan y gana el primero por orden alfabético — así es como
    // "Casillero tinto" devolvía la foto del blanco.
    let punt=0;
    if(q.length) punt+=0.5*enCand/q.length;
    if(nombre.length) punt+=0.5*enConsulta/nombre.length;
    if(marcaCasa) punt+=0.35;
    if(nombreEntero) punt+=0.25;
    return {p,punt};
  }).sort((a,b)=>b.punt-a.punt);

  const [mejor,segundo]=puntuados;
  if(!mejor||mejor.punt<=0) return null;
  // Si el segundo pisa los talones al primero, casi siempre son dos variantes
  // de la misma marca (tinto/blanco, mango/tropical). Eso no se decide solo.
  const ambiguo=segundo&&(mejor.punt-segundo.punt)<0.12;
  return {...mejor.p,
          confianza:Math.round(Math.min(mejor.punt,1)*100),
          ambiguo,
          alternativa:ambiguo?segundo.p.nombre:null};
}

const args=process.argv.slice(2);
let consultas=args;
const i=args.indexOf("--archivo");
if(i!==-1) consultas=readFileSync(args[i+1],"utf8").split("\n").map(s=>s.trim()).filter(Boolean);
if(!consultas.length){console.error("Uso: node buscar.mjs \"Producto 1\" \"Producto 2\"…");process.exit(1)}

const ALTA=62, MEDIA=45;   // por debajo de MEDIA se considera que no está

const hay=[],dudosos=[],faltan=[];
for(const c of consultas){
  const r=buscar(c);
  if(r&&r.confianza>=ALTA&&!r.ambiguo) hay.push({consulta:c,...r});
  else if(r&&r.confianza>=MEDIA) dudosos.push({consulta:c,...r});
  else faltan.push(c);
}

console.log(`\nYA EN EL BANCO — usar tal cual: ${hay.length} de ${consultas.length}`);
for(const h of hay) console.log(`  ✓ ${h.consulta}  →  ${h.imagen}  (${h.marca}, ${h.confianza}%)`);

if(dudosos.length){
  console.log(`\nPOSIBLES — que alguien confirme si es el mismo producto: ${dudosos.length}`);
  for(const d of dudosos) console.log(`  ? ${d.consulta}  →  ${d.imagen}  (${d.nombre}, ${d.marca}, ${d.confianza}%)`+(d.alternativa?`  \u2014 se parece igual a \u00ab${d.alternativa}\u00bb`:""));
}

if(faltan.length){
  console.log(`\nHAY QUE CONSEGUIR FOTO: ${faltan.length}`);
  for(const f of faltan) console.log(`  · ${f}`);
}

const seguro=Math.round(hay.length/consultas.length*100);
const conDudosos=Math.round((hay.length+dudosos.length)/consultas.length*100);
console.log(`\nAhorro seguro: ${seguro}%. Si se confirman las dudosas: ${conDudosos}%.\n`);
