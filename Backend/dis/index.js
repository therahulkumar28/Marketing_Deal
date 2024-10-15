"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.send('Hi there');
});
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
