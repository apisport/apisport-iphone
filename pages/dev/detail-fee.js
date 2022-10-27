import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link'
import useSWR from 'swr';
import Router from 'next/router';

export default function DetailMitra() {
    let router = useRouter()
    const { namaVenueReq } = router.query
    //Date Now
    var currentdate = new Date('20 Oct 2022');
    var dateTime = (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear()
    //Date Before
    var dateTimePrev = (currentdate.getMonth()) + "/"
        + currentdate.getFullYear()
    if (currentdate.getMonth() == 0) {
        dateTimePrev = 12 + "/"
            + (currentdate.getFullYear() - 1)
    }
    const fetcher = (...args) => fetch(...args).then((res) => res.json())
    const { data: data, error } = useSWR(`/api/detailfeedb?namaVenueReq=${namaVenueReq}&diterimaTglReq=${dateTime}&diterimaTglReqPrev=${dateTimePrev}`, fetcher, { refreshInterval: 1000 })
    if (!data) {
        return <div className="spinner"></div>
    } else if (error) {
        return <div>Something went wrong</div>
    }
    const fee = data.message
    //NOW
    let total1 = 0
    for (let i = 0; i < fee.bulanIni.length; i++) {
        total1 = total1 + fee.bulanIni[i].harga
    }

    //1 MONTH BEFORE
    let total2 = 0
    for (let i = 0; i < fee.bulanLalu.length; i++) {
        total2 = total2 + fee.bulanLalu[i].harga
    }
    const kembali = () => {
        Router.back()
    }
    const rupiah = (number) => {
        return new Intl.NumberFormat("id-ID", {
            style: 'currency',
            currency: 'IDR'
        }).format(number);
    }
    let total1x = rupiah(total1)
    let total2x = rupiah(total2)

    return (
        <div className="limiter">
            <div className="container-login100">
                <form className="login100-form validate-form">
                    <span className="login100-form-title">
                        DETAIL FEE MITRA
                    </span>
                    <div className="p-3 py-5">
                        <div className="row">
                            <div className=" col-md-12">
                                <label className="labels"><b>Fee yang harus dibayar Bulan ini - {dateTime}</b></label><i style={{ color: '#ff0000', fontSize: 'larger' }}>*</i>
                                <input type="text" className="form-control"
                                    value={total1x}
                                    readOnly
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className=" col-md-12">
                                <label className="labels"><b>Fee Bulan Lalu - {dateTimePrev}</b></label><i style={{ color: '#ff0000', fontSize: 'larger' }}>*</i>
                                <input type="text" className="form-control"
                                    value={total2x}
                                    readOnly
                                />
                            </div>
                        </div>
                        <div></div>
                        <div className='row mt-3'>
                            <div className='col-12 d-grid col-lg-12 mb-4'>
                                <button type="button" className="btn btn-outline-secondary" onClick={kembali} style={{ borderRadius: '5cm' }}>Kembali</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}