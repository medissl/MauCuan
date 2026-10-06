import type { Transaction, Goal, Contribution } from './finance';
export type PetSlot = 'head' | 'face' | 'wall' | 'floor' | 'left' | 'right' | 'toy';
export type PetItem = { id: string; name: string; slot: PetSlot; cost: number; level: number; description: string };
export const petCatalog: PetItem[] = [
  { id: 'explorer_hat', name: 'Topi petualang', slot: 'head', cost: 80, level: 1, description: 'Siap menjelajah hari baru.' },
  { id: 'beret', name: 'Baret teal', slot: 'head', cost: 60, level: 1, description: 'Santai dan sedikit artistik.' },
  { id: 'sun_hat', name: 'Topi piknik', slot: 'head', cost: 90, level: 2, description: 'Hari cerah di rumah temanmu.' },
  { id: 'party_hat', name: 'Topi perayaan', slot: 'head', cost: 100, level: 3, description: 'Rayakan konsistensi kecilmu.' },
  { id: 'crown', name: 'Mahkota konsisten', slot: 'head', cost: 0, level: 5, description: 'Hadiah mencapai level 5.' },
  { id: 'round_glasses', name: 'Kacamata bulat', slot: 'face', cost: 60, level: 1, description: 'Teman review yang teliti.' },
  { id: 'star_glasses', name: 'Kacamata bintang', slot: 'face', cost: 120, level: 4, description: 'Sedikit ceria untuk koleksimu.' },
  { id: 'wall_sky', name: 'Dinding langit', slot: 'wall', cost: 50, level: 1, description: 'Biru lembut, nyaman dipandang.' },
  { id: 'wall_peach', name: 'Dinding persik', slot: 'wall', cost: 50, level: 1, description: 'Hangat seperti warna macanmu.' },
  { id: 'wall_night', name: 'Malam berbintang', slot: 'wall', cost: 0, level: 3, description: 'Hadiah mencapai level 3.' },
  { id: 'rug_teal', name: 'Karpet teal', slot: 'floor', cost: 40, level: 1, description: 'Tempat nyaman untuk duduk.' },
  { id: 'rug_sun', name: 'Karpet matahari', slot: 'floor', cost: 75, level: 2, description: 'Motif lingkaran dalam warna jingga.' },
  { id: 'rug_cloud', name: 'Karpet awan', slot: 'floor', cost: 0, level: 2, description: 'Hadiah pertama di level 2.' },
  { id: 'plant', name: 'Tanaman kecil', slot: 'left', cost: 40, level: 1, description: 'Tumbuh bersama kebiasaan baik.' },
  { id: 'books', name: 'Rak buku', slot: 'left', cost: 80, level: 2, description: 'Sudut kecil untuk belajar.' },
  { id: 'lamp', name: 'Lampu baca', slot: 'left', cost: 90, level: 3, description: 'Sudut hangat di sore hari.' },
  { id: 'savings_jar', name: 'Celengan impian', slot: 'right', cost: 60, level: 1, description: 'Pengingat targetmu, tanpa uang nyata.' },
  { id: 'flower', name: 'Vas bunga', slot: 'right', cost: 70, level: 2, description: 'Warna ceria di sudut kamar.' },
  { id: 'trophy', name: 'Piala kebiasaan', slot: 'right', cost: 0, level: 4, description: 'Hadiah mencapai level 4.' },
  { id: 'ball', name: 'Bola jingga', slot: 'toy', cost: 30, level: 1, description: 'Mainan kecil dekat kaki macanmu.' },
  { id: 'yarn', name: 'Gulungan benang', slot: 'toy', cost: 50, level: 2, description: 'Teman bermain berwarna teal.' },
  { id: 'cushion', name: 'Bantal nyaman', slot: 'toy', cost: 80, level: 3, description: 'Untuk istirahat yang tenang.' },
  { id: 'wall_dawn', name: 'Pagi yang hangat', slot: 'wall', cost: 55, level: 1, description: 'Cahaya jingga dan bukit biru di jendela.' },
  { id: 'wall_rain', name: 'Hari hujan', slot: 'wall', cost: 65, level: 2, description: 'Tetes hujan di luar, tetap nyaman di dalam.' },
  { id: 'wall_library', name: 'Sudut perpustakaan', slot: 'wall', cost: 100, level: 3, description: 'Rak melengkung untuk macan yang penasaran.' },
  { id: 'wall_ocean', name: 'Jendela laut', slot: 'wall', cost: 110, level: 4, description: 'Ombak biru dan layar kecil di kejauhan.' },
  { id: 'rug_checker', name: 'Karpet kotak', slot: 'floor', cost: 45, level: 1, description: 'Pola krem dan teal yang rapi.' },
  { id: 'rug_flower', name: 'Karpet kelopak', slot: 'floor', cost: 60, level: 2, description: 'Kelopak jingga mengelilingi tempat duduk.' },
  { id: 'rug_moon', name: 'Karpet bulan', slot: 'floor', cost: 90, level: 3, description: 'Bulan sabit untuk sudut malam.' },
  { id: 'cactus', name: 'Kaktus mini', slot: 'left', cost: 35, level: 1, description: 'Tanaman mungil di pot bergaris.' },
  { id: 'monstera', name: 'Daun lebar', slot: 'left', cost: 65, level: 2, description: 'Daun berlubang khas dalam pot krem.' },
  { id: 'mushroom_lamp', name: 'Lampu jamur', slot: 'left', cost: 85, level: 3, description: 'Bentuk bulat dan cahaya hangat.' },
  { id: 'side_table', name: 'Meja baca', slot: 'left', cost: 75, level: 2, description: 'Buku terbuka di meja kecil.' },
  { id: 'globe', name: 'Bola dunia', slot: 'right', cost: 80, level: 2, description: 'Untuk membayangkan perjalanan berikutnya.' },
  { id: 'clock', name: 'Jam meja', slot: 'right', cost: 50, level: 1, description: 'Pengingat untuk istirahat juga.' },
  { id: 'photo_frame', name: 'Bingkai kenangan', slot: 'right', cost: 40, level: 1, description: 'Jejak kaki mungil di bingkai jingga.' },
  { id: 'tea_set', name: 'Sudut teh', slot: 'right', cost: 70, level: 2, description: 'Cangkir kecil untuk suasana santai.' },
  { id: 'paper_plane', name: 'Pesawat kertas', slot: 'toy', cost: 25, level: 1, description: 'Petualangan kecil dari selembar kertas.' },
  { id: 'toy_fish', name: 'Ikan kain', slot: 'toy', cost: 45, level: 2, description: 'Mainan teal dengan jahitan jingga.' },
  { id: 'star_pillow', name: 'Bantal bintang', slot: 'toy', cost: 65, level: 3, description: 'Bintang lembut untuk teman istirahat.' },
  { id: 'captain_hat', name: 'Topi kapten', slot: 'head', cost: 140, level: 8, description: 'Eksklusif level 8. Siap menavigasi hari baru.' },
  { id: 'headphones', name: 'Headphone santai', slot: 'head', cost: 180, level: 12, description: 'Eksklusif level 12. Ruang kecil untuk fokus.' },
  { id: 'wizard_hat', name: 'Topi penjelajah bintang', slot: 'head', cost: 240, level: 18, description: 'Eksklusif level 18. Totol kecil, imajinasi besar.' },
  { id: 'laurel', name: 'Mahkota daun', slot: 'head', cost: 0, level: 20, description: 'Hadiah 190 check-in. Kemajuanmu tidak hilang saat istirahat.' },
  { id: 'moon_glasses', name: 'Kacamata bulan', slot: 'face', cost: 300, level: 26, description: 'Eksklusif level 26. Bingkai teal dengan bulan mungil.' },
  { id: 'royal_crown', name: 'Mahkota sahabat', slot: 'head', cost: 400, level: 36, description: 'Eksklusif level 36. Hampir setahun bertumbuh bersama.' },
  { id: 'wall_garden', name: 'Taman dalam rumah', slot: 'wall', cost: 0, level: 10, description: 'Hadiah 90 check-in. Jendela lengkung dan taman kecil.' },
  { id: 'aquarium', name: 'Akuarium kecil', slot: 'right', cost: 200, level: 15, description: 'Eksklusif level 15. Dua ikan tenang di antara gelembung.' },
  { id: 'wall_aurora', name: 'Rumah aurora', slot: 'wall', cost: 260, level: 20, description: 'Eksklusif level 20. Pita cahaya biru di langit malam.' },
  { id: 'music_box', name: 'Kotak musik', slot: 'left', cost: 280, level: 24, description: 'Eksklusif level 24. Kotak kecil dengan macan mini.' },
  { id: 'wall_observatory', name: 'Observatorium sahabat', slot: 'wall', cost: 0, level: 30, description: 'Hadiah 290 check-in. Peta bintang untuk teman penasaran.' },
  { id: 'wall_studio', name: 'Studio kenangan', slot: 'wall', cost: 0, level: 40, description: 'Hadiah 390 check-in. Sudut berkarya yang penuh kenangan.' },
  {"id":"telescope","name":"Teleskop kecil","slot":"right","cost":450,"level":45,"description":"Lihat langit dari sudut rumah."},
  {"id":"wall_greenhouse","name":"Rumah kaca","slot":"wall","cost":0,"level":50,"description":"Hadiah 490 check-in. Taman yang kamu rawat bersama."},
  {"id":"pilot_hat","name":"Topi penerbang","slot":"head","cost":500,"level":55,"description":"Untuk perjalanan imajinasi berikutnya."},
  {"id":"rug_orbit","name":"Karpet orbit","slot":"floor","cost":400,"level":60,"description":"Lingkaran planet mengelilingi tempat duduk."},
  {"id":"record_player","name":"Pemutar piringan","slot":"left","cost":550,"level":65,"description":"Sudut musik untuk sore yang tenang."},
  {"id":"wall_treehouse","name":"Rumah pohon","slot":"wall","cost":0,"level":70,"description":"Hadiah 690 check-in. Tempat singgah di atas pepohonan."},
  {"id":"astronaut_helmet","name":"Helm astronaut","slot":"head","cost":600,"level":75,"description":"Bingkai terbuka agar wajah temanmu tetap terlihat."},
  {"id":"rocking_horse","name":"Kuda goyang","slot":"toy","cost":450,"level":80,"description":"Mainan kayu untuk kamar kecil kita."},
  {"id":"bonsai","name":"Bonsai sahabat","slot":"right","cost":600,"level":85,"description":"Tumbuh pelan, tetap berarti."},
  {"id":"wall_skyhouse","name":"Rumah di awan","slot":"wall","cost":0,"level":90,"description":"Hadiah 890 check-in. Jendela yang menghadap awan."},
  {"id":"rug_paw","name":"Karpet jejak kaki","slot":"floor","cost":500,"level":95,"description":"Jejak kecil sepanjang perjalananmu."},
  {"id":"memory_chest","name":"Peti kenangan","slot":"left","cost":650,"level":100,"description":"Tempat untuk kenangan, bukan uang nyata."},
  {"id":"comet_crown","name":"Mahkota komet","slot":"head","cost":700,"level":105,"description":"Untuk sahabat yang terus kembali."},
  {"id":"wall_lighthouse","name":"Rumah mercusuar","slot":"wall","cost":0,"level":110,"description":"Hadiah 1090 check-in. Cahaya pulang di tepi laut."},
  {"id":"anniversary_mobile","name":"Gantungan perjalanan","slot":"right","cost":750,"level":115,"description":"Bulan, daun, dan bintang dalam satu rangkaian."},
  {"id":"heart_crown","name":"Mahkota pulang","slot":"head","cost":0,"level":120,"description":"Hadiah 1190 check-in. Lebih dari tiga tahun bersama, tanpa harus berturut-turut."},
];
export type PetRoom = Partial<Record<PetSlot, string>>;
export const levelNames = ['Teman baru', 'Teman dekat', 'Penjelajah', 'Penjaga impian', 'Sahabat konsisten'];
export function levelName(level: number) {
  if (level >= 120) return 'Rumah untuk satu sama lain';
  if (level >= 110) return 'Sahabat tiga tahun';
  if (level >= 90) return 'Teman lintas musim';
  if (level >= 70) return 'Sahabat perjalanan panjang';
  if (level >= 50) return 'Teman yang selalu pulang';
  if (level >= 40) return 'Sahabat seumur perjalanan';
  if (level >= 30) return 'Penjelajah bintang';
  if (level >= 20) return 'Teman segala musim';
  if (level >= 10) return 'Penjaga kebiasaan';
  return levelNames[Math.max(0, Math.min(4, level - 1))];
}
export function petTips(transactions: Transaction[], goals: Goal[], contributions: Contribution[], available: number, day: string) {
  const tips: { title: string; text: string; action: string; route: string }[] = [];
  const monthly = transactions.filter(t => t.occurred_on.startsWith(day.slice(0, 7)));
  const income = monthly.filter(t => t.kind === 'income').reduce((n, t) => n + Number(t.amount), 0);
  const expense = monthly.filter(t => t.kind === 'expense').reduce((n, t) => n + Number(t.amount), 0);
  if (available < 0) tips.push({ title: 'Cek saldo tercatatmu', text: 'Dana bebas tercatat di bawah nol. Review saldo awal, transaksi, dan sisihan sebelum membuat alokasi baru.', action: 'Review saldo', route: 'balance' });
  if (income > 0 && expense > income) tips.push({ title: 'Arus bulan ini', text: 'Pengeluaran tercatat bulan ini melebihi pemasukan tercatat. Cek catatan yang belum lengkap dan kebutuhanmu berikutnya.', action: 'Lihat pola', route: 'insights' });
  const dayTime = new Date(`${day}T12:00:00Z`).getTime();
  const weekStart = new Date(dayTime - 6 * 86400000).toISOString().slice(0, 10);
  const previousStart = new Date(dayTime - 13 * 86400000).toISOString().slice(0, 10);
  const recent = transactions.filter(t => t.kind === 'expense' && t.occurred_on >= weekStart && t.occurred_on <= day).reduce((n, t) => n + Number(t.amount), 0);
  const previous = transactions.filter(t => t.kind === 'expense' && t.occurred_on >= previousStart && t.occurred_on < weekStart).reduce((n, t) => n + Number(t.amount), 0);
  if (previous > 0 && recent > previous) tips.push({ title: 'Cek perubahan mingguan', text: `Pengeluaran tercatat tujuh hari terakhir ${Math.round((recent / previous - 1) * 100)}% lebih besar dari tujuh hari sebelumnya. Lihat apakah ada kebutuhan khusus atau catatan yang berbeda.`, action: 'Review catatan', route: 'records' });
  const categories = new Map<string, number>();
  for (const t of monthly.filter(t => t.kind === 'expense')) categories.set(t.category, (categories.get(t.category) || 0) + Number(t.amount));
  const largest = [...categories].sort((a, b) => b[1] - a[1])[0];
  if (largest && expense > 0) tips.push({ title: 'Kenali kategori terbesarmu', text: `${largest[0]} menyumbang ${Math.round(largest[1] / expense * 100)}% dari pengeluaran yang tercatat bulan ini. Review apakah pembagiannya sesuai kebutuhanmu.`, action: 'Lihat insight', route: 'insights' });
  for (const goal of goals) {
    const saved = contributions.filter(c => c.goal_id === goal.id).reduce((n, c) => n + Number(c.amount), 0);
    if (saved >= goal.target_amount) tips.push({ title: 'Satu impian tercapai', text: `Target ${goal.title} sudah terpenuhi dari catatan sisihanmu. Rayakan tanpa perlu belanja.`, action: 'Lihat target', route: 'goals' });
    else if (goal.target_date && goal.target_date <= day) tips.push({ title: 'Rencanamu boleh berubah', text: `Tanggal target ${goal.title} sudah tiba. Review kemajuan dan kemampuanmu; tidak ada penalti.`, action: 'Review target', route: 'goals' });
    else if (saved >= goal.target_amount * .75) tips.push({ title: 'Impianmu semakin dekat', text: `Target ${goal.title} sudah ${Math.round(saved / goal.target_amount * 100)}% terisi dari catatan sisihan. Lanjut sesuai kemampuanmu.`, action: 'Lihat kemajuan', route: 'goals' });
  }
  if (!goals.length) tips.push({ title: 'Beri tempat untuk impian', text: 'Mulai dari satu target kecil yang realistis. Menentukan target belum memindahkan uangmu.', action: 'Buat target', route: 'newgoal' });
  if (!transactions.some(t => t.occurred_on === day && t.kind === 'expense')) tips.push({ title: 'Hari tanpa belanja tetap berarti', text: 'Jika memang tidak ada pengeluaran hari ini, pilih Tanpa belanja saat check-in. Reward-nya sama.', action: 'Cek hari ini', route: 'checkin' });
  tips.push({ title: 'Catatan yang jujur lebih berguna', text: 'Review pemasukan dan pengeluaran yang sudah terjadi. Jangan belanja demi XP; check-in harian sudah cukup.', action: 'Review catatan', route: 'records' });
  return tips;
}
export const moneyQuiz = [
  { question: 'Hari ini tidak belanja. Bagaimana tetap dapat XP?', answers: ['Belanja dulu', 'Check-in tanpa belanja', 'Buat transaksi palsu'], correct: 1, explanation: 'Check-in harian memberi reward yang sama, termasuk hari tanpa belanja.' },
  { question: 'Memindahkan alokasi ke target tabungan termasuk…', answers: ['Pengeluaran baru', 'Pemasukan baru', 'Sisihan dari saldo yang sama'], correct: 2, explanation: 'Sisihan mengubah alokasi; total saldo tercatat tetap sama.' },
  { question: 'Total barang di struk berbeda dari total akhir. Apa langkah berikutnya?', answers: ['Review pajak dan diskon', 'Ambil angka terbesar', 'Abaikan struk'], correct: 0, explanation: 'Pajak, diskon, atau barang yang belum terbaca bisa membuat angka berbeda. Review sebelum menyimpan.' },
  { question: 'Melewatkan check-in sehari membuat Miko…', answers: ['Kehilangan level', 'Tetap aman, bisa lanjut besok', 'Harus dibeli ulang'], correct: 1, explanation: 'Tidak ada penalti atau penurunan level. Kebiasaan boleh dimulai lagi.' },
  { question: 'Belanja lebih banyak membuat XP lebih cepat?', answers: ['Ya, semakin mahal semakin baik', 'Hanya kalau scan', 'Tidak, XP dari check-in harian'], correct: 2, explanation: 'Jumlah transaksi dan nominal belanja tidak menambah XP.' },
];
