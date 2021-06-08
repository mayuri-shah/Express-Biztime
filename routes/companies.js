const express = require("express");
const ExpressError = require("../expressError")
const companyrouter = express.Router();
const db = require("../db");

companyrouter.get('/',async (req,res,next) => {
    try{
        const results = await db.query(`select * from companies`);
        
        return res.json({companies : results.rows});
    }
    catch (e){
        return next(e)
    }
})
companyrouter.get('/:code',async (req,res,next) => {
    try{
        
        const results = await db.query(
            `select c.code,c.name,c.description , i.name from companies c
            left join company_industry ci  on c.code = ci.comp_code
            left join industries i on  ci.industry_code = i.code 
            where c.code = $1`,[req.params.code]);

        let {code,name,description} = results.rows[0];
        let listIndustry = results.rows.map(r => r.name)
        return res.json({code,name,description,listIndustry});
    }
    catch (e){
        return next(e);
    }
})

companyrouter.post('/',async (req,res,next) => {
    try{
        let {code,name,description} = req.body;
        const results = await db.query(`insert into companies(code,name,description) VALUES($1,$2,$3) RETURNING *`,[code,name,description]);
        return res.status(201).json({ company : results.rows[0] })

    }catch(e){
        return next(e);

    }
})

companyrouter.patch('/:code',async (req,res,next) => {
    try{
        let {code} = req.params;
        let {name,description} = req.body;
        const results = await db.query(`update companies set name=$1,description=$2 where code = $3 RETURNING *`,[name,description,code]);
        return res.json({ company : results.rows[0] })
    }catch(e){
        return next(e);
    }
})

companyrouter.delete('/:code',async (req,res,next) => {
    try{
        let {code} = req.params;
        const results = await db.query(`delete from companies where code = $1`,[code]);
        return res.json({msg : 'Deleted'})
    }catch(e){
        return next(e);
    }
})


module.exports = companyrouter;