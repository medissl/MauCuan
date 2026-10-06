"""Build the reviewed, versioned question bank. No runtime AI or API fees."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
bank = []
def add(topic, question, right, wrong1, wrong2, explanation):
    i = len(bank)
    answers = [right, wrong1, wrong2]
    shift = i % 3
    answers = answers[-shift:] + answers[:-shift] if shift else answers
    bank.append(dict(id=f'q{i+1:03}', topic=topic, question=question, answers=answers, correct=shift, explanation=explanation))

intro = [
('Hari ini tidak belanja. Bagaimana tetap dapat XP?', 'Check-in tanpa belanja', 'Belanja dulu', 'Buat transaksi palsu', 'Check-in harian memberi reward yang sama, termasuk hari tanpa belanja.'),
('Memindahkan alokasi ke target tabungan termasuk…', 'Sisihan dari saldo yang sama', 'Pengeluaran baru', 'Pemasukan baru', 'Sisihan mengubah alokasi; total saldo tercatat tetap sama.'),
('Total barang di struk berbeda dari total akhir. Apa langkah berikutnya?', 'Review pajak dan diskon', 'Ambil angka terbesar', 'Abaikan struk', 'Pajak, diskon, atau barang yang belum terbaca bisa membuat angka berbeda. Review sebelum menyimpan.'),
('Melewatkan check-in sehari membuat Miko…', 'Tetap aman, bisa lanjut besok', 'Kehilangan level', 'Harus dibeli ulang', 'Tidak ada penalti atau penurunan level. Kebiasaan boleh dimulai lagi.'),
('Belanja lebih banyak membuat XP lebih cepat?', 'Tidak, XP dari check-in harian', 'Ya, semakin mahal semakin baik', 'Hanya kalau scan', 'Jumlah transaksi dan nominal belanja tidak menambah XP.')]
for row in intro: add('Kenalan', *row)

contexts = ['makan seminggu', 'ongkos kuliah', 'paket internet', 'bahan praktikum', 'belanja kos', 'perjalanan pulang', 'buku kuliah', 'servis kendaraan', 'perawatan laptop', 'kebutuhan rumah']
# Each situation changes the actual expense, consequence or decision being discussed.
families = [
('Prioritas', 'Dana untuk {c} sudah disiapkan. Barang lucu sedang diskon, tapi membelinya akan menghabiskan dana itu. Pilihan paling masuk akal?', 'Utamakan dana kebutuhan dulu', 'Diskon wajib diambil', 'Pakai dana itu, pikirkan nanti', 'Harga murah tetap pengeluaran. Kebutuhan yang sudah direncanakan perlu tetap punya tempat.'),
('Dana darurat', 'Ada biaya {c} mendadak dan penting. Dana darurat masih cukup. Bagaimana menggunakannya?', 'Pakai seperlunya, lalu rencanakan isi ulang', 'Jangan pernah dipakai sama sekali', 'Habiskan semuanya sekalian', 'Dana darurat membantu menghadapi kebutuhan mendesak. Setelah dipakai, isi kembali bertahap sesuai kemampuan.'),
('Anggaran', 'Biaya {c} naik minggu ini. Anggaran lama jadi kurang cocok. Apa yang bisa dilakukan?', 'Perbarui rencana dan cek pos lain', 'Tetap pakai angka lama apa pun terjadi', 'Berhenti mencatat semua biaya', 'Anggaran boleh menyesuaikan keadaan. Perubahan yang dicatat lebih mudah dipahami.'),
('Pendapatan berubah', 'Penghasilan bulan ini lebih kecil, sementara {c} tetap perlu dibayar. Mulai dari mana?', 'Susun ulang kebutuhan wajib dulu', 'Belanja seperti bulan lalu', 'Anggap pemasukan pasti segera naik', 'Rencana sebaiknya mengikuti uang yang benar-benar tersedia, bukan pemasukan yang belum pasti.'),
('Kebiasaan', 'Kamu lupa mencatat biaya {c} kemarin. Struknya masih ada. Langkah terbaik?', 'Catat dengan tanggal kejadian sebenarnya', 'Buat nominal asal agar cepat', 'Hapus semua catatan bulan ini', 'Catatan yang terlambat tetap berguna. Gunakan tanggal dan nominal yang bisa kamu cek.'),
('Pencatatan', 'Biaya {c} dibayar lewat dompet digital. Perlukah dicatat?', 'Ya, pengeluaran tetap terjadi', 'Tidak, karena bukan uang tunai', 'Hanya jika saldonya habis', 'Cara membayar tidak mengubah fakta bahwa uang digunakan untuk kebutuhan tersebut.'),
('Transfer sendiri', 'Kamu memindahkan dana {c} dari rekeningmu ke dompet digital milikmu. Bagaimana membaca perpindahan ini?', 'Perpindahan uang sendiri, bukan pendapatan baru', 'Pendapatan baru sebesar transfer', 'Keuntungan investasi', 'Transfer antar tempat penyimpanan milik sendiri tidak menciptakan uang tambahan. Hindari menghitung dua kali.'),
('Utang teman', 'Teman mengembalikan uang yang kamu pinjamkan untuk {c}. Bagaimana agar catatan tidak menyesatkan?', 'Hubungkan dengan piutang yang dikembalikan', 'Anggap gaji tambahan', 'Hapus pengeluaran lain agar cocok', 'Pengembalian piutang berbeda dari pendapatan hasil kerja. Catat konteksnya agar arus uang jelas.'),
('Belanja impulsif', 'Saat mencari {c}, kamu tertarik barang tambahan yang tidak direncanakan. Belum yakin perlu. Apa langkah yang membantu?', 'Tunda sebentar dan cek kebutuhan', 'Beli agar rasa penasaran hilang', 'Tambah cicilan tanpa menghitung', 'Jeda memberi waktu untuk membedakan kebutuhan, keinginan dan kemampuan membayar.'),
('Harga satuan', 'Dua paket untuk {c} punya ukuran berbeda. Cara membandingkan harga dengan adil?', 'Bandingkan harga per ukuran yang sama', 'Pilih kemasan paling besar saja', 'Pilih yang tulisan diskonnya besar', 'Harga per satuan membantu membandingkan paket. Tetap pertimbangkan apakah seluruh isi akan terpakai.'),
('Pembelian bersama', 'Biaya {c} dibagi dengan teman. Kamu membayar dulu semuanya. Apa yang perlu dipisahkan?', 'Bagianmu dan bagian yang akan diganti', 'Semua dianggap biaya pribadimu selamanya', 'Semua dianggap penghasilan', 'Pisahkan tanggungan pribadi dan penggantian teman supaya pengeluaranmu tidak tampak terlalu besar.'),
('Langganan', 'Ada layanan berbayar terkait {c} yang sudah jarang dipakai. Apa yang layak dicek?', 'Pemakaian dan tanggal perpanjangan', 'Warna logo layanan saja', 'Jumlah pengikut layanan', 'Langganan kecil bisa terus terpotong. Review manfaat dan perpanjangannya sebelum memutuskan lanjut.'),
('Promo minimum', 'Promo {c} meminta belanja tambahan yang tidak kamu butuhkan. Apa yang sebaiknya dibandingkan?', 'Total bayar dengan dan tanpa promo', 'Besarnya tulisan cashback saja', 'Jumlah produk dalam keranjang saja', 'Promo dapat menaikkan pengeluaran jika memaksa membeli lebih banyak. Bandingkan total akhirnya.'),
('Cashback', 'Cashback untuk {c} belum masuk dan masih punya syarat. Apakah sudah aman dianggap saldo tersedia?', 'Belum, tunggu benar-benar diterima', 'Ya, langsung habiskan lagi', 'Ya, tulis dua kali', 'Reward yang belum diterima belum bisa dipakai. Cek syarat dan tanggal masuknya.'),
('Cicilan', 'Ada tawaran cicilan untuk {c}. Sebelum setuju, apa yang perlu dilihat?', 'Total biaya dan kemampuan bayar tiap bulan', 'Angsuran pertama saja', 'Seberapa cepat proses persetujuannya', 'Angsuran, bunga dan biaya lain dapat menambah total pembayaran. Pastikan kewajiban bulanannya sesuai kemampuan.'),
('Batas kredit', 'Batas kreditmu cukup untuk {c}, tapi penghasilan bulan depan belum pasti. Apa arti batas kredit itu?', 'Batas pinjaman, bukan uang gratis', 'Tambahan tabungan pribadi', 'Jaminan kamu mampu membayar', 'Batas kredit adalah fasilitas utang. Kemampuan membayar perlu dihitung terpisah.'),
('Jatuh tempo', 'Tagihan {c} jatuh tempo sebentar lagi. Cara mengurangi risiko lupa?', 'Pasang pengingat dan siapkan dananya', 'Tunggu sampai ditagih berkali-kali', 'Hapus notifikasi tanpa membaca', 'Pengingat dan dana yang disiapkan membantu menghindari keterlambatan. Cek juga apakah pembayaran sudah tercatat.'),
('Biaya layanan', 'Harga awal {c} terlihat murah, tetapi ada biaya layanan saat bayar. Angka mana yang masuk anggaran?', 'Total akhir yang benar-benar dibayar', 'Harga awal saja', 'Nominal diskon saja', 'Anggaran dan catatan pengeluaran perlu memperhitungkan biaya yang benar-benar dibayar.'),
('Refund', 'Pembelian {c} dibatalkan dan pengembalian uang masih diproses. Apa yang sebaiknya dilakukan?', 'Pantau sampai dana kembali', 'Anggap uang sudah masuk', 'Catat pendapatan baru setiap hari', 'Permintaan refund berbeda dari dana yang sudah kembali. Simpan bukti dan cek saldo sebelum menandai selesai.'),
('Tujuan', 'Kamu ingin menabung untuk {c}. Target yang lebih mudah dijalankan biasanya seperti apa?', 'Ada nominal dan langkah yang realistis', 'Nominal tak terbatas tanpa rencana', 'Mengandalkan hadiah yang belum pasti', 'Target yang jelas membantu menentukan langkah kecil. Sesuaikan sisihan dengan kebutuhan utama dan kemampuanmu.'),
('Pengeluaran berkala', '{c} perlu dibayar beberapa bulan lagi. Bagaimana mengurangi kejutan saat waktunya tiba?', 'Sisihkan sedikit secara berkala', 'Lupakan sampai hari pembayaran', 'Gunakan seluruh dana cadangan sekarang', 'Biaya yang sudah bisa diperkirakan dapat dipersiapkan bertahap, berbeda dari keadaan darurat.'),
('Keamanan OTP', 'Seseorang mengaku bisa membantu pembayaran {c} dan meminta OTP-mu. Apa respons yang aman?', 'Jangan bagikan OTP', 'Kirim asal orangnya ramah', 'Unggah OTP agar cepat dibantu', 'OTP adalah kunci otorisasi akun. Jangan membagikannya, termasuk kepada orang yang mengaku petugas.'),
('Tautan mencurigakan', 'Pesan pembayaran {c} berisi tautan yang meminta login. Kamu tidak yakin pengirimnya. Apa yang lebih aman?', 'Cek lewat aplikasi atau kanal resmi', 'Masukkan kata sandi untuk mencoba', 'Teruskan ke semua teman', 'Buka layanan lewat kanal resmi yang kamu kenal. Pesan mendesak bisa dipakai untuk memancing data akun.'),
('Bukti pembayaran', 'Penjual {c} mengirim foto bukti transfer sebagai jaminan. Apa yang perlu diverifikasi?', 'Mutasi atau status pembayaran di akunmu', 'Kerapian font pada foto saja', 'Jumlah emoji dalam pesan', 'Gambar bukti transfer dapat dipalsukan. Pastikan dana benar-benar diterima di akun yang benar.'),
('Privasi struk', 'Kamu ingin membagikan foto struk {c} ke publik. Apa yang sebaiknya disembunyikan?', 'Data pribadi dan identitas pembayaran', 'Nama semua jenis barang saja', 'Nominal diskon saja', 'Struk bisa memuat nomor telepon, alamat atau informasi pembayaran. Lindungi data yang tidak perlu dibagikan.'),
('Investasi', 'Dana {c} akan dipakai dalam waktu dekat. Bagaimana menilai tawaran investasi yang bisa turun tajam?', 'Pertimbangkan waktu pakai dan risiko kehilangan', 'Pilih yang paling ramai dibahas saja', 'Anggap harga pasti naik', 'Uang untuk kebutuhan dekat perlu mempertimbangkan likuiditas dan risiko. Nilai investasi bisa turun.'),
('Janji untung', 'Seseorang menjanjikan untung besar pasti untuk membiayai {c}, tanpa risiko. Apa tanda yang perlu diwaspadai?', 'Janji pasti untung tanpa risiko', 'Ada dokumen yang bisa dipelajari', 'Ada penjelasan biaya', 'Janji keuntungan besar dan pasti perlu dicurigai. Jangan terburu-buru; periksa legalitas serta cara usahanya.'),
('Diversifikasi', 'Tabungan untuk {c} ingin diinvestasikan. Mengapa menaruh semuanya pada satu aset berisiko?', 'Semua dana terkena risiko aset yang sama', 'Risikonya otomatis hilang', 'Setiap aset pasti naik bersamaan', 'Membagi penempatan dapat mengurangi konsentrasi risiko, tetapi tidak menjamin bebas rugi.'),
('Banding sosial', 'Teman membeli versi mahal untuk {c}. Kamu sudah punya yang cukup. Sikap yang membantu keuanganmu?', 'Pilih sesuai kebutuhan dan anggaranmu', 'Ikuti agar terlihat sama', 'Berutang tanpa memeriksa biaya', 'Kebutuhan dan kemampuan setiap orang berbeda. Pilihan teman tidak harus menjadi kewajibanmu.'),
('Evaluasi bulanan', 'Pengeluaran {c} lebih tinggi dari rencana. Bagaimana memulai evaluasi?', 'Cari penyebab dan sesuaikan langkah berikutnya', 'Menyalahkan diri tanpa cek rincian', 'Mengubah nominal agar tampak bagus', 'Evaluasi membantu memahami pola. Catatan jujur lebih berguna daripada angka yang sengaja dibuat terlihat baik.')]
for topic, stem, right, w1, w2, explanation in families:
    for c in contexts: add(topic, stem.format(c=c), right, w1, w2, explanation)

def rp(n): return 'Rp ' + f'{n:,}'.replace(',', '.')
# 20 arithmetic families with ten distinct inputs; use only everyday whole-rupiah arithmetic.
for family in range(20):
    for n in range(10):
        a=(n+3)*10000; b=(n+1)*2000; c=contexts[n]
        if family==0: q=f'Saldo {rp(a)}. Kamu membayar {c} {rp(b)}. Sisa saldo?'; v=a-b; e='Saldo akhir = saldo awal dikurangi pengeluaran.'
        elif family==1: q=f'Tabungan {rp(a)} mendapat sisihan {rp(b)}. Berapa sekarang?'; v=a+b; e='Jumlah tabungan bertambah sebesar sisihan yang masuk.'
        elif family==2: q=f'{n+2} barang untuk {c} harganya {rp(3000)} per barang. Totalnya?'; v=(n+2)*3000; e='Kalikan jumlah barang dengan harga satu barang.'
        elif family==3: q=f'Dana {c} {rp(a)} dibagi rata untuk 5 hari. Jatah per hari?'; v=a//5; e='Bagi dana total dengan jumlah hari.'
        elif family==4: q=f'Harga {c} {rp(a)} mendapat diskon 10%, tanpa biaya lain. Total bayar?'; v=a*9//10; e='Diskon 10% berarti membayar 90% harga awal.'
        elif family==5: q=f'Harga {c} {rp(a)} ditambah biaya layanan {rp(b)}. Total bayar?'; v=a+b; e='Biaya layanan ikut masuk total pembayaran.'
        elif family==6: q=f'Target {c} {rp(a*10)}, sudah tersisih {rp(a*4)}. Kekurangannya?'; v=a*6; e='Kekurangan = target dikurangi dana yang sudah terkumpul.'
        elif family==7: q=f'Sisihan {rp(a)} setiap bulan selama 6 bulan, tanpa bunga. Terkumpul?'; v=a*6; e='Kalikan sisihan bulanan dengan enam bulan.'
        elif family==8: q=f'Biaya {c} {rp(a*3)} dibagi rata tiga orang. Bagianmu?'; v=a; e='Biaya total dibagi jumlah orang yang menanggung.'
        elif family==9: q=f'Langganan untuk {c} {rp(a)} per bulan selama 12 bulan. Total setahun?'; v=a*12; e='Biaya bulanan berulang dua belas kali dalam setahun.'
        elif family==10: q=f'{c.capitalize()} {rp(a)} plus ongkir {rp(b)}, lalu potongan {rp(2000)}. Total bayar?'; v=a+b-2000; e='Jumlahkan harga dan ongkir, lalu kurangi potongan.'
        elif family==11: q=f'Pemasukan {rp(a*10)}, pengeluaran {rp(a*6)} bulan ini. Selisihnya?'; v=a*4; e='Selisih pemasukan dan pengeluaran menunjukkan sisa arus uang bulan itu.'
        elif family==12: q=f'Dana tersedia {rp(a*5)}. Kamu mengalokasikan {rp(a*2)} untuk target. Dana yang belum dialokasikan?'; v=a*3; e='Sisihan mengurangi dana bebas, bukan total uang yang kamu miliki.'
        elif family==13: q=f'Uang tunai {rp(a)} dan saldo digital {rp(b)}. Total uang tercatat?'; v=a+b; e='Jumlahkan saldo dari tempat yang berbeda tanpa menghitung transfer dua kali.'
        elif family==14: q=f'Cicilan untuk {c} {rp(a)} selama 4 bulan plus biaya sekali {rp(b)}. Total bayar?'; v=a*4+b; e='Total cicilan adalah seluruh angsuran ditambah biaya tambahan.'
        elif family==15: q=f'Biaya {c} naik dari {rp(a)} ke {rp(a+b)}. Naiknya berapa rupiah?'; v=b; e='Kenaikan nominal = harga baru dikurangi harga lama.'
        elif family==16: q=f'Kamu membayar {c} {rp(a*3)} untuk tiga orang termasuk kamu. Dua teman mengganti bagiannya. Total penggantian?'; v=a*2; e='Masing-masing teman mengganti sepertiga biaya total.'
        elif family==17: q=f'Barang {c} berharga {rp(a)}. Kamu bayar tunai {rp(a+b)}. Kembalian?'; v=b; e='Kembalian adalah uang yang dibayar dikurangi harga barang.'
        elif family==18: q=f'Sisihkan 20% dari pemasukan {rp(a*10)}. Besarnya sisihan?'; v=a*2; e='20% adalah seperlima nominal. Persentase ini contoh hitungan, bukan aturan wajib.'
        else: q=f'Target {c} {rp(a*4)} dicapai dengan sisihan sama selama empat minggu. Sisihan tiap minggu?'; v=a; e='Bagi target dengan jumlah minggu yang direncanakan.'
        add('Hitung ringan',q,rp(v),rp(v+1000),rp(v+5000),e)

bank=bank[:500]
assert len(bank)==500 and len({x['question'] for x in bank})==500
(root/'src/lib/quiz-bank.json').write_text(json.dumps(bank,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f'Generated {len(bank)} questions, {len({x["topic"] for x in bank})} topics')
