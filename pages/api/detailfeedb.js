import Router from 'next/router';
const { connectToDatabase } = require('../../lib/mongodb');
const ObjectId = require('mongodb').ObjectId;
// mengambil data dari collection Transaksi

async function getVenue(req, res) {
    const { namaVenueReq, diterimaTglReq, diterimaTglReqPrev } = req.query
    try {
        // connect to the database
        let { db } = await connectToDatabase();
        let transaksi1 = await db
            .collection('transaksi')
            .aggregate([
                {
                    $match: {
                        "namaVenue": { $regex: `${namaVenueReq}`, $options: "i" },
                        "diterimaTgl": { $regex: `${diterimaTglReq}`, $options: "i" },
                        "status": { $ne: 'pending' }
                    }
                },
                {
                    $project: {
                        harga: 1,
                    }
                }
            ])
            .toArray()
        let transaksi2 = await db
            .collection('transaksi')
            .aggregate([
                {
                    $match: {
                        "namaVenue": { $regex: `${namaVenueReq}`, $options: "i" },
                        "diterimaTgl": { $regex: `${diterimaTglReqPrev}`, $options: "i" },
                        "status": { $ne: 'pending' }
                    }
                },
                {
                    $project: {
                        harga: 1,
                    }
                }
            ])
            .toArray()
        // return the posts
        let hasil = {}
        hasil['bulanIni'] = transaksi1
        hasil['bulanLalu'] = transaksi2
        return res.json({
            message: JSON.parse(JSON.stringify(hasil)),
            success: true,
        });
    } catch (error) {
        // return the error
        return res.json({
            message: new Error(error).message,
            success: false,
        });
    }
}

// CRUD handler
export default async function handler(req, res) {
    // switch the methods
    switch (req.method) {
        case 'GET': {
            return getVenue(req, res);
        }
        case 'POST': {
            return addFavorit(req, res);
        }
        case 'PUT': {
            return updateFavorit(req, res);
        }
        case 'DELETE': {
            return deleteFavorit(req, res);
        }
    }
}