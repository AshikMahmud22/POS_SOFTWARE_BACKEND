"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfitCollection = void 0;
const getProfitCollection = (db) => {
    return db.collection("profits");
};
exports.getProfitCollection = getProfitCollection;
