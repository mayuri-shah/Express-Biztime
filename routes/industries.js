const express = require("express");
const ExpressError = require("../expressError")
const Industryrouter = express.Router();
const db = require("../db");

Industryrouter.get('/',async (req,res,next) => {
    try{
        const results = await db.query(`select * from industries`);
        
        return res.json({industries : results.rows});
    }
    catch (e){
        return next(e)
    }
})

Industryrouter.post('/',async (req,res,next) => {
    try{
        let {code,name} = req.body;
        const results = await db.query(`insert into industries(code,name)
                                         VALUES($1,$2) RETURNING *`,
                                         [code,name]);
        return res.status(201).json({ Industry : results.rows[0] })

    }catch(e){
        return next(e);

    }
})

Industryrouter.get('/:code',async (req,res,next) => {
    try{
        const results = await db.query(`select i.name,c.code from industries i 
                                        left join company_industry ci on i.code = ci.industry_code
                                        left join companies c on ci.comp_code = c.code
                                        where i.code = $1`,[req.params.code]);
        
        return res.json({industries : results.rows});
    }
    catch (e){
        return next(e)
    }
})




module.exports = Industryrouter;