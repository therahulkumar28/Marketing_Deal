import { Request,Response } from "express" ; 
const express = require('express')
const app = express();

const PORT = process.env.PORT || 3000;
app.get('/', (req :Request, res : Response) => {
    res.send('Hi there');
});


app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});