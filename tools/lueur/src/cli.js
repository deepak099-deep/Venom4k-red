#!/usr/bin/env node
import fs from "node:fs";
import {inspectPair} from "./contrast.js";
const args=process.argv.slice(2);
if(args.includes("--help")||args.includes("-h")){console.log("Lueur - check WCAG contrast\n\nUsage: lueur <foreground> <background>\n       lueur --json <foreground> <background>\n       lueur --file pairs.json");process.exit(0);}
try{
 const json=args.includes("--json"), file=args.indexOf("--file");
 const pairs=file>=0?JSON.parse(fs.readFileSync(args[file+1],"utf8")):[{foreground:args.filter(a=>a!=="--json")[0],background:args.filter(a=>a!=="--json")[1]}];
 if(!Array.isArray(pairs)||!pairs.length) throw new Error("Provide at least one color pair.");
 const results=pairs.map((p,i)=>({index:i+1,...inspectPair(p.foreground,p.background)})), passed=results.every(r=>r.aaNormal);
 if(json) console.log(JSON.stringify({passed,results},null,2)); else {console.log("PAIR  FOREGROUND  BACKGROUND  RATIO  AA-NORMAL  AA-LARGE  AAA-NORMAL  AAA-LARGE");for(const r of results) console.log(`${r.index}     ${r.foreground}    ${r.background}    ${r.ratio.toFixed(2)}    ${r.aaNormal}       ${r.aaLarge}      ${r.aaaNormal}        ${r.aaaLarge}`);}
 process.exit(passed?0:1);
}catch(e){console.error("Error: "+e.message);process.exit(2);}