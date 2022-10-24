//@ts-check
import Carousel from '../../components/user/detail-lapangan/Carousel'
import CardJadwal from '../../components/user/detail-lapangan/CardJadwal'
import useSWR from "swr";
import Router, { useRouter } from 'next/router';
import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'
import { useEffect } from 'react';
import { Alert } from 'react-bootstrap';


export default function MitraTambahTransaksi({ namaVenueProps }) {

    //Router
    const router = useRouter()
    const { idLapangan, namaVenue, namaLapangan } = router.query
    const { data: session } = useSession();
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    let todayVar = yyyy + '-' + mm + '-' + dd;
    let available = true
    let jamTerisi = []
    let jamFilter = []
    let hari = ''
    var currentdate = new Date();
    var dateDate = currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear()
    var dateHours = + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds();
    console.log(dateDate)
    console.log(dateHours)


    //State of Decay
    const [_dataMain, setDataMain] = useState({});
    const [tglMain, setTglMain] = useState(todayVar);
    const [jadwalPesan, setJadwalPesan] = useState([]);
    // const [available, setAvailable] = useState(true);
    const [totalHarga, setTotalHarga] = useState(0);

    //Perubahan
    // let isCheck = []
    const [isCheck, setIsCheck] = useState(true);


    //Suwir
    const fetcher = (...args) => fetch(...args).then((res) => res.json())
    const { data: data, error } = useSWR(`/api/detaillapangandb?idLapangan=${idLapangan}&namaVenueReq=${namaVenue}&namaLapanganReq=${namaLapangan}&tglMainReq=${tglMain}`, fetcher, { refreshInterval: 1000 })

    console.log(tglMain)
    if (!data) {
        return <div className="spinner"></div>
    } else if (error) {
        return <div>Something went wrong</div>
    }

    //Deklarasi Array JSON SWR
    let lapanganRes = data['message']
    let infoLapangan = lapanganRes.infoLapangan[0]
    let namaHasil = infoLapangan.namaLapangan.split(" ").join("");

    const kembali = () => {
        Router.back()
    }

    //Function SetAvailable dan Input Date
    const setTglMainFunc = (data) => {
        setTglMain(data)
        setJadwalPesan([])
        setTotalHarga(0)
        setAvailableJam()
        setAvailableJamFilter()
        setAvailableHari()


    }

    const setAvailableJam = () => {
        // console.log('Jam Booked')
        for (let i = 0; i < lapanganRes.infoTransaksi.length; i++) {
            for (let j = 0; j < lapanganRes.infoTransaksi[i].jadwalMain.length; j++) {
                jamTerisi.push(lapanganRes.infoTransaksi[i].jadwalMain[j])
            }
        }
        // console.log(jamTerisi)
    }

    const setAvailableJamFilter = () => {
        // console.log('Jam Booked')
        jamFilter = jadwalPesan.filter(value => jamTerisi.includes(value));
        // console.log(jamTerisi)
        console.log('Jam Filter')
        console.log(jamFilter)
        console.log(infoLapangan)
    }

    const setAvailableHari = () => {
        let hariTemp = lapanganRes.infoVenue[0].hariOperasional.split(" - ")
        // console.log(hariTemp)

        let day = new Date()
        const weekday = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        const weekdayHitung = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
        let today = weekday[day.getUTCDay()]
        // console.log('Available Hari')
        // console.log(today)

        let indexAwalHari = weekdayHitung.indexOf(hariTemp[0])
        let indexAkhirHari = weekdayHitung.indexOf(hariTemp[1])
        // console.log(indexAwalHari)
        // console.log(indexAkhirHari)

        let totalIndex = indexAkhirHari - indexAwalHari
        let arrayAvailableHariTemp = []
        // console.log(totalIndex)
        for (let i = 0; i <= totalIndex; i++) {
            arrayAvailableHariTemp[i] = weekdayHitung[i]
        }
        // console.log('Sudah Jadi:')
        // console.log(arrayAvailableHariTemp)
        // console.log('Hari UTC TGl MAIN')
        let dateCheckerInit = new Date(tglMain)
        let dateChecker = weekday[dateCheckerInit.getUTCDay()]
        hari = dateChecker

        if (arrayAvailableHariTemp.indexOf(dateChecker) === -1) {
            available = false
        } else {
            available = true
        }
    }

    setAvailableJam()
    setAvailableJamFilter()
    setAvailableHari()


    // Penggabungan Harga dan Jadwal
    let keyJadwalPagi = Object.keys(infoLapangan.jadwalPagi)
    let keyJadwalMalam = Object.keys(infoLapangan.jadwalMalam)
    let gabunganJadwal = keyJadwalPagi.concat(keyJadwalMalam)
    let gabunganHarga = []

    for (let i = 0; i < keyJadwalPagi.length; i++) {
        gabunganHarga.push(infoLapangan.hargaPagi)
    }

    for (let i = 0; i < keyJadwalMalam.length; i++) {
        gabunganHarga.push(infoLapangan.hargaMalam)
    }

    let transaksiArr = lapanganRes.infoTransaksi.filter((tblDat) => {
        if (tglMain == "") {
            return tblDat
        } else if (tblDat.tglMain === tglMain) {
            return tblDat
        }
    })
    // console.log('Hasil Filter')
    // console.log(transaksiArr)

    const setChange = (e, harga, jadwal) => {
        setIsCheck(e.target.checked)
        if (e.target.checked === true) {
            /*  tohar = tohar + parseInt(harga)
             setTotalHarga(tohar) */
            setTotalHarga(totalHarga => totalHarga + parseInt(harga))
            setJadwalPesan(arr => [...arr, jadwal]);
        } else {
            /* tohar = tohar - parseInt(harga)
            setTotalHarga(tohar) */
            setTotalHarga(totalHarga => totalHarga - parseInt(harga))
            // let filteredArray = jadwalPesan.filter(item => item !== data)
            // console.log(data)
            let index = jadwalPesan.indexOf(jadwal)
            setJadwalPesan(tim => [...tim.slice(0, index), ...tim.slice(index + 1)])
        }
        /*  {
             isCheck ? setTotalHarga(totalHarga => totalHarga + parseInt(harga)) : setTotalHarga(totalHarga => totalHarga - parseInt(harga))
         } */

        setAvailableJam()
        setAvailableJamFilter()
    }

    //Handle Post Update DataMain Lapangan

    //Penggabungan Harga dan Jadwal

    const checkValue = () => {
        let check = document.getElementsByName('jadwal')
        for (let i = 0; i < check.length; i++) {
            console.log(`index ke-${i}`)
            console.log(JSON.parse(check[i].value))
        }
        let date = document.getElementById('tglMain').value
        console.log(date)
    }


    return (
        <div className="container mt-4">
            <h1 className='mb-3 mt-4'>{infoLapangan.namaLapangan}</h1>
            <div className="row mb-3">
                <div className="col md-3 mb-4">
                    {/* SLIDER */}
                    <div id={`${namaHasil}`} className="carousel slide" data-bs-ride="carousel">
                        <div className="carousel-indicators">
                            {infoLapangan.gambar.map((data, i) => (
                                <>
                                    {i == 0 ?
                                        (<button type="button" data-bs-target={`#${namaHasil}`} data-bs-slide-to={i} className="active" aria-current="true" aria-label={`Slide ${i}`} />) :
                                        (<button type="button" data-bs-target={`#${namaHasil}`} data-bs-slide-to={i} aria-label={`Slide ${i}`} />)}

                                </>
                            ))}
                        </div>
                        <div className="carousel-inner row p-1 col-12">
                            {infoLapangan.gambar.map((data, i) => (
                                <>
                                    {i == 0 ?
                                        (<div className="carousel-item active ">
                                            <img src={`${data}`} className="img-fluid" />
                                        </div>) :
                                        (<div className="carousel-item">
                                            <img src={`${data}`} className="img-fluid" />
                                        </div>)}
                                </>
                            ))}

                        </div>
                        <button className="carousel-control-prev" type="button" data-bs-target={`#${namaHasil}`} data-bs-slide="prev">
                            <span className="carousel-control-prev-icon" aria-hidden="true" />
                            <span className="visually-hidden">Previous</span>
                        </button>
                        <button className="carousel-control-next" type="button" data-bs-target={`#${namaHasil}`} data-bs-slide="next">
                            <span className="carousel-control-next-icon" aria-hidden="true" />
                            <span className="visually-hidden">Next</span>
                        </button>
                    </div>

                    {/* END SLIDER */}
                </div>
            </div>
            <div className='row mb-4' style={{ color: "black" }}>

                <h5 className='text-start'> Deskripsi Lapangan</h5>

                <div>
                    <div className="d-flex justify-content-between">
                        <span>{infoLapangan.deskripsi}</span>
                    </div>
                </div>
            </div>
            <div className='mt-3'>
                <form>
                    <h4 className='text-start' style={{ color: '#EE8F00' }}>Jadwal Lapangan</h4>
                    <input type='date' id='tglMain' value={tglMain} onChange={(e) => setTglMainFunc(e.target.value)} className='form-control mb-4' required></input>
                    <h5 style={{ color: 'blue' }}><b>Hari Operasional: </b>{lapanganRes.infoVenue[0].hariOperasional} </h5>
                    <div className='card p-3'>
                        <h5>{hari}</h5>
                        <div className='row' style={{ color: 'white' }}>
                            {/* THIS IS CARD */}

                            {/* THIS IS CARD */}
                            {available &&
                                <>

                                    {gabunganJadwal.map((data, index) => (

                                        <div className='col-6 col-lg-3 mb-2'>
                                            <div>

                                                <input type="checkbox" className="btn-check" id={`btn-check${index + 1}`}
                                                    autoComplete="off" onChange={(e) => setChange(e, gabunganHarga[index], data)}
                                                    name='jadwal'

                                                    disabled={true}
                                                    value={JSON.stringify([`${data}`, gabunganHarga[index]])} />
                                                <label className="btn btn-outline-success" style={jamTerisi.indexOf(data) === -1 ? ({}) : ({ backgroundColor: 'red', color: 'white' })} htmlFor={`btn-check${index + 1}`}>{data}<br />Rp {gabunganHarga[index].toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".")}</label><br />
                                            </div>
                                        </div>
                                    ))}
                                </>
                            }
                            {!available &&
                                <>
                                    <h4 className='text-black' style={{ color: 'red' }}>Mitra tidak beroperasi pada hari {hari}</h4>
                                </>
                            }
                            <div className='row mt-3'>
                                <div className='col-12 d-grid col-lg-12 mb-4'>
                                    <button type="button" className="btn btn-outline-secondary" onClick={kembali} style={{ borderRadius: '5cm' }}>Kembali</button>
                                </div>
                            </div>

                        </div>
                    </div>
                </form>

            </div>
        </div>

    )
}
