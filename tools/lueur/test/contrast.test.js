import test from "node:test";import assert from "node:assert/strict";import {contrastRatio,inspectPair,normalizeHex} from "../src/contrast.js";
test("normalizes shorthand",()=>assert.equal(normalizeHex("#fff"),"#ffffff"));
test("white on black is 21",()=>assert.equal(contrastRatio("#fff","#000"),21));
test("high contrast passes AAA",()=>assert.equal(inspectPair("#fff","#111").aaaNormal,true));
test("gray on white fails normal AA",()=>assert.equal(inspectPair("#777","#fff").aaNormal,false));
test("invalid colors throw",()=>assert.throws(()=>normalizeHex("red"),/Invalid hex color/));