import Pagination from '../components/Pagination'
import CardRekomendasi from '../components/user/lapangan/CardRekomendasi'
import Carilokasi from "../components/provinsi";
import { useState } from 'react'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import Link from 'next/link'
import Router from 'next/router';


export default function CariLapangan() {
    const [currentPage, setCurrentPage] = useState(1)
    const [postsPerPage, setPostsPerPage] = useState(6)
    const [filterSearch, setFilterSearch] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

    let router = useRouter()
    const { provinsi, kabupaten, kecamatan, kategori } = router.query
    const fetcher = (...args) => fetch(...args).then((res) => res.json())
    const { data: data, error } = useSWR(`/api/carilokasidb?provinsi=${provinsi}&kabupaten=${kabupaten}&kecamatan=${kecamatan}&kategori=${kategori}`, fetcher)

    if (!data) {
        return <div className="spinner"></div>
    } else if (error) {
        return <div>Something went wrong</div>
    }

    let lapangan = data['message']

    let searchArr = lapangan.filter((tblDat) => {
        if (searchTerm == "") {
            return tblDat
        } else if (tblDat.namaVenue.toLowerCase().includes(searchTerm.toLowerCase())) {
            return tblDat
        }
    })

    //Tambahan Pagination
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    //Fixed Pagintion CurrentPosts hapus filter di bawah
    let currentPosts = searchArr.slice(indexOfFirstPost, indexOfLastPost)
    //Fixed Pagination CurrentPosts
    const howManyPages = Math.ceil(searchArr.length / postsPerPage)
    //Tambahan Pagination Current Post Map

    const CariLokasi = (e) => {
        e.preventDefault();
        provinsi = document.getElementById('inProvinsi').value
        kabupaten = document.getElementById('inKabupaten').value
        kecamatan = document.getElementById('inKecamatan').value
        kategori = document.getElementById('inKategori').value
        Router.push({
            pathname: '/cari-lokasi-lapangan',
            query: {
                provinsi: provinsi, kabupaten: kabupaten, kecamatan: kecamatan, kategori: kategori
            }

        })


    }
    return (
        <>
            <div className='container my-4'>
                <h1>Hasil Pencarian Lapangan</h1>
            </div>
            <div>
                <div className="container my-4">
                    <div className="row d-flex justify-content-center align-items-center">
                        <div className="btn-group col-md-12">
                            <input type="text" className="form-control col-10 mt-2 col-md-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Cari Lapangan Disini" />
                            <Link href={{
                                pathname: '/cari-lapangan',
                                query: {
                                  
                                }

                            }}>
                                <button className="form-control col-2 mt-2 col-sm-2 btn shadow-sm" style={{ backgroundColor: '#ffbe2e' }}><i className="fa fa-search text-white"></i>
                                </button>
                            </Link>
                        </div>
                        <div className='row mb-4 mt-4'>
                            <a className='btn btn-fill text-white' data-bs-toggle="collapse" href="#deskripsiCollapse" style={{ color: "white", backgroundColor: '#ffbe2e', borderRadius: "5px" }}>
                                <span className='text-start'><icon className='fa fa-search'></icon> Cari Berdasarkan Lokasi</span>
                            </a>
                            <div>
                                <div className="row collapse multi-collapse text-start mt-4" id="deskripsiCollapse">
                                    <div className="col-md-12">
                                        <Carilokasi />
                                        <div className='col-md-12'>
                                            <label className="labels">Kategori</label>
                                            <select className='form-control form-select' id='inKategori'>
                                                <option value=''>--- Pilih Kategori ---</option>
                                                <option value='Futsal'>Futsal</option>
                                                <option value='Bulutangkis'>Bulutangkis</option>
                                                <option value='Voli'>Voli</option>
                                                <option value='Basket'>Basket</option>
                                            </select>
                                        </div>
                                        <div className='d-flex flex-row justify-content-center '>
                                            <a href='/lapangan' className='btn btn-fill text-white mt-4' onClick={CariLokasi}
                                                style={{ color: "white", backgroundColor: '#ffbe2e', borderRadius: "5px" }}>
                                                Cari</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="container my-4 text-black-50" >
                    <h4 style={{ color: 'black' }} className='fw-bold fst-italic'>{`Daftar Lapangan Berdasarkan Lokasi`}</h4>
                    <hr></hr>
                    <div className="row justify-content-center row-cols-1 row-cols-md-3">
                        {currentPosts.length === 0 ? (
                            <><h4>{`Tidak ada Data Lapangan ditemukan`}</h4></>
                        ) : (
                            <>

                                {currentPosts.map((data, i) => (
                                    <CardRekomendasi props={data} />
                                ))}
                            </>
                        )}
                        
                    </div>
                    <span>Memuat {currentPosts.length} data</span>
                </div>
            </div>
            <div className='container d-flex mt-4 text-center justify-content-center'>
                <Pagination pages={howManyPages} setCurrentPage={setCurrentPage} />
            </div>



        </>
    )
}
