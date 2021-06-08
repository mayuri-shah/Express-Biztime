const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

router.get('/',async (req,res,next) => {
    try{
        const results = await db.query(`select * from invoices`);
        
        return res.json({Invoices: results.rows});
    }
    catch (e){
        return next(e)
    }
})
router.get('/:id',async (req,res,next) => {
    try{
        let {id} = req.params;
        const results = await db.query(
            `select 
            i.*,
            c.*
            from invoices as i 
            join companies as c 
            on (i.comp_code = c.code) 
            where i.id =$1`,[id]);

        if(results.rows.length === 0){
            throw new ExpressError('Invalid InvoiceId',404)
        }

        let data = results.rows[0];
        let invoice = {
            id : data.id,
            amt : data.amt,
            paid : data.paid,
            add_date :data.add_date,
            paid_date : data.paid_date,
            company : {code:data.code,name : data.name,description:data.description}
        }
        return res.json({Invoice : invoice});
    }
    catch (e){
        return next(e);
    }
})

router.post('/',async (req,res,next) => {
    try{
        let {comp_code,amt,paid,add_date,paid_date} = req.body;
        const results = await db.query(`insert into invoices(comp_code,amt,paid,add_date,paid_date)
                                 VALUES($1,$2,$3,$4,$5) RETURNING *`,
                                 [comp_code,amt,paid,add_date,paid_date]);
        return res.status(201).json({ company : results.rows[0] })

    }catch(e){
        return next(e);

    }
})

router.patch('/:id',async (req,res,next) => {
    try{
        let {id} = req.params;
        let {amt,paid} = req.body;
        let paid_date = null;
        if(paid){
             paid_date = new Date();
        }
        const results = await db.query(`update invoices set amt=$1,paid=$2,paid_date=$3 where id = $4 RETURNING *`,
            [amt,paid,paid_date,id]);
        if(results.rows.length === 0){
            throw new ExpressError('Invalid InvoiceId',404)
        }
        return res.json({ company : results.rows[0] })
    }catch(e){
        return next(e);
    }
})

router.delete('/:id',async (req,res,next) => {
    try{
        let {id} = req.params;
        const results = await db.query(`delete from invoices where id = $1`,[id]);
        if(results.rows.length === 0){
            throw new ExpressError('Invalid InvoiceId',404)
        }
        return res.json({msg : 'Deleted'})
    }catch(e){
        return next(e);
    }
})


module.exports = router;