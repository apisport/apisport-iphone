//@ts-check
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react'
import useSWR from "swr";

export default function Pembayaran() {

  var currentdate = new Date();
  var dateTime = currentdate.getDate() + "/"
    + (currentdate.getMonth() + 1) + "/"
    + currentdate.getFullYear() + " | "
    + currentdate.getHours() + ":"
    + currentdate.getMinutes() + ":"
    + currentdate.getSeconds();


  const [nama, setNama] = useState('');
  const [lapangan, setLapangan] = useState('');
  const [noWa, setNoWa] = useState('');
  const [tim, setTim] = useState('');
  const [noRekening, setNoRekening] = useState('');
  const [opsiBayar, setOpsiBayar] = useState('');
  const [buktiBayar, setBuktiBayar] = useState('');
  const [createObjectURL, setCreateObjectURL] = useState(null);
  const [message, setMessage] = useState('');
  const [image, setImage] = useState('');
  let namaVenue = ''
  let tglMain = ''
  let jadwalMain = []
  let harga = 0
  const [hargaDP, setHargaDP] = useState('-');
  const [opsiBayarDP, setOpsiBayarDP] = useState(false);
  const [diterima, setDiterima] = useState(dateTime);
  let status = 'lunas'
  const [error1, setError1] = useState('')
  const [stateDummy, setStateDummy] = useState('')
  const [uploading, setUploading] = useState(false)
  const { data: session } = useSession()

  //Router
  let router = useRouter()
  const { jadwalPesanReq,
    totalHargaReq,
    namaVenueReq,
    namaLapanganReq,
    tglMainReq,
    diterimaTglReq,
    diterimaJamReq,
    idTransaksiReq
  } = router.query


  // console.log('idTransaksi:')
  // console.log(idTransaksiReq)

  //Suwir
  const fetcher = (...args) => fetch(...args).then((res) => res.json())
  let url = ''
  if (session) {
    url = `/api/pembayarandb?emailReq=${session.user.email}&namaVenueReq=${namaVenueReq}`
  }
  const { data: data, error } = useSWR(url, fetcher)

  if (!data) {
    return <div>Access denied</div>
  } else if (error) {
    return <div>Something went wrong</div>
  }
  const profil = data['message']

  //Pemanggilan Function
  const setValue = () => {
    jadwalMain = JSON.parse(jadwalPesanReq)
    harga = totalHargaReq
    namaVenue = namaVenueReq
    lapangan = namaLapanganReq
    tglMain = tglMainReq
    nama = nama
    noWa = noWa
    diterima = dateTime

  }
  setValue()

  const aturOpsiBayar = (data) => {
    setOpsiBayar(data)
    if (data == 'DP') {
      hitungHargaDP()
      setOpsiBayarDP(true)
    } else {
      setOpsiBayarDP(false)
      setHargaDP('-')
    }
    // console.log(opsiBayarDP)

  }

  const hitungHargaDP = () => {
    let DPhitung = parseInt(profil.infoVenue[0].DP)
    let hargaDPHitung = harga - (((DPhitung / 100) * harga))
    let hargaDPhitungString = hargaDPHitung.toString()
    setHargaDP(hargaDPhitungString)
    // console.log(hargaDP)
  }

  const handlePost = async (e) => {
    e.preventDefault();

    //Cloudinary Single
    let imageUrl = ''
    //Uploading
    setUploading(true)
    //Uploading
    const body = new FormData();
    //console.log("file", image)
    body.append("file", image);
    body.append('upload_preset', 'my-uploads');
    const response = await fetch('https://api.cloudinary.com/v1_1/api-sport/image/upload', {
      method: 'POST',
      body
    }).then(r => r.json());
    imageUrl = response.secure_url
    //Uploading
    if (imageUrl != '') {
      setUploading(false)
    }
    //Uploading

    //Cloudinary End
    console.log(buktiBayar)

    // reset error and message
    setMessage('');
    // fields check
    if (!nama || !noWa || !opsiBayar || !buktiBayar || !namaVenue || !tglMain || !jadwalMain || !harga || !status || !hargaDP || !diterima) {
      alert('Tolong isi semua kolom')
      return setError1('All fields are required');
    }

    // get the data
    let jamTerisi = []
    let url = ''
    if (session) {
      url = `/api/pembayarandb?emailReq=${session.user.email}&namaVenueReq=${namaVenueReq}&tglMainReq=${tglMainReq}&jadwalPesanReq=${jadwalPesanReq}&lapanganReq=${namaLapanganReq}&idTransaksiReq=${idTransaksiReq}`
    }
    let response1 = await fetch(url, {
      method: 'GET'
    });
    let data1 = await response1.json();
    console.log(`JSON Test:`)
    let transaksiCheck = data1['message'].transaksi
    console.log(transaksiCheck)
    for (let i = 0; i < transaksiCheck.length; i++) {
      for (let j = 0; j < transaksiCheck[i].jadwalMain.length; j++) {
        jamTerisi.push(transaksiCheck[i].jadwalMain[j])
      }
    }

    console.log(`Jam Pesan:`)
    console.log(jadwalMain)

    console.log(`Jam Terisi:`)
    console.log(jamTerisi)

    // let jamFilter = jamTerisi.filter(val => !jadwalMain.includes(val));
    const jamFilter = jadwalMain.filter(value => jamTerisi.includes(value));
    console.log(`Jam Filter:`)
    console.log(jamFilter)

    if (opsiBayar == 'DP' || opsiBayar == 'Bayar di Tempat') {
      status = 'diterima'

    }
    if (jamFilter.length == 0) {
      e.preventDefault();
      // reset error and message
      setMessage('');
      // fields check
      try {
        // Update post
        let update = await fetch('/api/transaksimitradb', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nama: nama,
            tim: tim,
            noRekening: noRekening,
            opsiBayar: opsiBayar,
            buktiBayar: imageUrl,
            hargaDP: hargaDP,
            objectId: idTransaksiReq,
            status: status
          }),
        });
        router.push('/mitra/home')
        return alert(`Penambahan Transaksi Sukses`)
      } catch (error) {
        // Stop publishing state
        console.log('Not Working')
        return console.log('Not Working')
      }
    } else {
      alert('Mohon Maaf, timeslot telah dipesan, mohon untuk memilih jadwal kembali')
      router.back()
    }
    // post structure

  };

  const uploadToClient = (event) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];
      setBuktiBayar(i.name)
      setImage(i);
      setCreateObjectURL(URL.createObjectURL(i));
    }
  };



  return (
    <div className="container-xxl p-3">
      <div className="d-flex flex-row justify-content-center">
        <h1 className="mb-3">Form Pembayaran</h1>
      </div>

      <div className="p-3">
        <div className="container-xxl card p-3 shadow-lg">
          <div className="row">
            <div className="px-md-5 p-3 col-md-12 align-items-start justify-content-center" >
              <h1><b>{namaVenue}</b></h1>
              <h3 ><b>Lapangan:</b>&nbsp;{lapangan}</h3>
              <h4><b>Tgl Main:</b>&nbsp;{tglMain}</h4><br></br>
              <div className="row">
                <h3><b>Jadwal Main:</b></h3>
                {jadwalMain.map((data, i) => (
                  <>
                    <div className='col-12 col-sm-4 mb-2'>
                      <div className='card'>
                        <div className='card-body'>
                          <h3>{data}</h3>
                        </div>
                      </div>
                    </div>
                  </>
                ))}
              </div>
              <h5>Pesanan dibuat pada: <b>{`${diterimaTglReq} | ${diterimaJamReq}`}</b></h5>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <div className="container">
          <form onSubmit={handlePost}>
            <div className="form-group">
              <label htmlFor="exampleFormControlInput1">Nama Pemesan : </label>
              <input value={nama} type="text" className="form-control" onChange={(e) => setNama(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="exampleFormControlInput1">No. WA Pemesan: </label>
              <input type="number" className="form-control" value={noWa} onChange={(e) => setNoWa(e.target.value)} />
            </div>
            <div className="form-group">
              <label htmlFor="exampleFormControlInput1">Total Bayar : </label>
              <input type="text" className="form-control" value={`Rp ${harga.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".")}`} readOnly />
            </div><div className="form-group">
              <label htmlFor="exampleFormControlInput1">Tim : </label>
              <input type="text" className="form-control" value={tim} onChange={(e) => setTim(e.target.value)} />
            </div>
            {opsiBayarDP &&
              <div className="form-group">
                <label htmlFor="exampleFormControlInput1">Persen DP: </label>
                <input type="text" className="form-control" value={`${profil.infoVenue[0].DP}%`} readOnly />
              </div>
            }
            {opsiBayarDP &&
              <div className="form-group">
                <label htmlFor="exampleFormControlInput1">Total Bayar (DP): </label>
                <input type="text" className="form-control" value={`Rp ${hargaDP.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".")}`} readOnly />
              </div>
            }
            <div className="form-group">
              <label>Opsi Bayar</label>
              <select className=" form-select" onChange={(e) => aturOpsiBayar(e.target.value)}>
                <option>--Pilih Opsi Bayar--</option>
                {profil.infoVenue[0].opsiBayar.map((data, i) => (
                  <option value={data}>{data}</option>
                ))}
              </select>
            </div>
            {opsiBayar != 'Bayar di Tempat' &&
              <div className="form-group">
                <label htmlFor="exampleFormControlSelect1">No. Rekening</label>
                <select className="form-control form-select" id="exampleFormControlSelect1" onChange={(e) => setNoRekening(e.target.value)}>
                  <option>--Pilih No. Rekening--</option>
                  {profil.infoVenue[0].rekening.map((data, i) => (
                    <option value={data}>{data}</option>
                  ))}
                </select>
              </div>
            }
            <div className="form-group">
              <div className="mt-2 col-md-12"><label className="labels" htmlFor="formFile">Bukti Bayar</label>
                <input type="file"
                  id="validatedCustomFile"
                  className="form-control form-file"
                  name="myImage" onChange={uploadToClient}
                  required
                />
              </div>
            </div>

            <div className="mt-4 text-center">
              <img src={createObjectURL} className="img-fluid" />
            </div>
            <div className="d-grid gap-2 py-4 ">
              <button className="btn btn-primary p-3 fw-bold" type="submit" style={{ backgroundColor: '#006E61' }} disabled={uploading === false ? (false) : (true)} >Kirim</button>
              {uploading &&
                <>
                  <div className='d-flex flex-row'>
                    <div className="spinner-loading">
                    </div>
                    <span>Sedang upload gambar, Mohon Tunggu...</span>
                  </div>
                </>
              }
            </div>
          </form>
        </div>
      </div>
    </div>

  )
}