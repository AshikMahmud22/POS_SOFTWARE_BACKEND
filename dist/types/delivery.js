"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeliveryCostCollection = void 0;
const getDeliveryCostCollection = (db) => {
    return db.collection("deliveryCosts");
};
exports.getDeliveryCostCollection = getDeliveryCostCollection;
