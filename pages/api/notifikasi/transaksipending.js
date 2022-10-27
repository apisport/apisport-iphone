import { Novu } from '@novu/node';

async function sendMail(req, res) {
    const novu = new Novu(process.env.NOVU_TOKEN);
    const {userReq, tglMainReq, lapanganReq, namaVenueReq, emailReq} = req.query
    let work = {
        nama: 'yes'
    }
    await novu.trigger('transaksi-pending', {
        to: {
            subscriberId: emailReq,
            email: emailReq
        },
        payload: {
            namaVene: namaVenueReq,
            user: userReq,
            lapangan: lapanganReq,
            tglMain: tglMainReq
            
        }
    });

    return res.json(work)
}

export default async function handler(req, res) {
    // switch the methods
    switch (req.method) {
        case 'GET': {
            return sendMail(req, res);
        }
        case 'POST': {
            return addMitra(req, res);
        }
        case 'PUT': {
            return updateMitra(req, res);
        }
        case 'DELETE': {
            return deleteMitra(req, res);
        }
    }
}