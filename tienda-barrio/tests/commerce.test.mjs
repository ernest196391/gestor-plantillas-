import test from "node:test";
import assert from "node:assert/strict";
import {shipping,whatsappUrl,orderMessage} from "../lib/commerce.mjs";
const order={reference:"2328-ABCD",lines:[{n:"Leche",d:"1 litro",p:800,quantity:2}],subtotal:1600,mode:"pickup",fee:0,fullName:"Cliente",phone:"12345678"};
test("pickup is free regardless of address",()=>assert.equal(shipping("pickup","",""),0));
test("unknown delivery is not zero",()=>assert.equal(shipping("delivery","Plaza","Vedado"),null));
test("only configured locality receives fee",()=>{assert.equal(shipping("delivery","Plaza","Vedado",{"Plaza|Vedado":250}),250);assert.equal(shipping("delivery","Plaza","Otro",{"Plaza|Vedado":250}),null)});
test("invalid fee is never used",()=>assert.equal(shipping("delivery","Plaza","Vedado",{"Plaza|Vedado":-1}),null));
test("WhatsApp needs valid destination and encodes text",()=>{assert.equal(whatsappUrl("","hola"),null);assert.equal(whatsappUrl("+53 12345678","a & b"),"https://wa.me/5312345678?text=a%20%26%20b")});
test("pickup message contains quantities and no delivery address",()=>{const t=orderMessage({...order,address:"NO MOSTRAR",municipality:"NO MOSTRAR"});assert.ok(t.includes("2 × Leche (1 litro)"));assert.ok(!t.includes("NO MOSTRAR"));assert.ok(t.includes("Subtotal:"));assert.ok(t.includes("Total:"));assert.ok(!/registrado|reservado|pagado/.test(t))});
test("unknown shipping is explicitly pending",()=>{const t=orderMessage({...order,mode:"delivery",fee:null,municipality:"Plaza",locality:"Vedado",address:"Calle 23",location:"23,-82"});assert.ok(t.includes("Total: Pendiente"));assert.ok(t.includes("Mensajería: Por confirmar"));assert.ok(t.includes("query=23,-82"))});
test("known fee is included in total",()=>{const t=orderMessage({...order,mode:"delivery",fee:400});assert.ok(t.includes("Total: "+new Intl.NumberFormat("es-CU").format(2000)+" CUP"))});

import {readFileSync} from "node:fs";
const tenant=JSON.parse(readFileSync(new URL("../config/tenant.json",import.meta.url),"utf8"));
test("el WhatsApp del negocio es un destino v\u00e1lido",()=>{
  const url=whatsappUrl(tenant.whatsapp,"pedido");
  assert.ok(url&&url.startsWith("https://wa.me/"),"revisa whatsapp en config/tenant.json: "+tenant.whatsapp);
});
test("todas las tarifas son n\u00fameros utilizables",()=>{
  const r=tenant.shippingRates;
  assert.ok(Object.keys(r).length>0,"config/tenant.json no tiene ni una tarifa");
  for(const [zona,n] of Object.entries(r))
    assert.ok(Number.isFinite(n)&&n>=0,"tarifa inv\u00e1lida en "+zona+": "+n);
});
test("cada tarifa apunta a una localidad que existe",()=>{
  const loc=JSON.parse(readFileSync(new URL("../config/localities.json",import.meta.url),"utf8"));
  for(const zona of Object.keys(tenant.shippingRates)){
    const [mun,localidad]=zona.split("|");
    assert.ok(loc[mun]?.includes(localidad),"la zona \u00ab"+zona+"\u00bb no existe en localities.json");
  }
});
test("el mensaje de pedido usa el punto de recogida del negocio",()=>{
  const t=orderMessage(order,tenant);
  assert.ok(t.includes(tenant.pickupPoint),"el mensaje no nombra el punto de recogida");
  assert.ok(t.includes(tenant.orderTitle),"el mensaje no lleva el t\u00edtulo del negocio");
});
