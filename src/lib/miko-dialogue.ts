import { money, type Transaction, type Goal, type Contribution } from './finance.ts';
import { petTips, type PetRoom } from './pet.ts';
export interface MikoLine { text: string; action?: string; route?: string; kind: 'personal' | 'record'; }
// Miko is curious, playful and quietly supportive. She never shames a missed
// day, claims to see a bank account, or rewards spending or pet-care taps.
export const mikoPersonality = [
  'Aku tadi mencoba menghitung totolku. Ekor bergerak, hitungannya mulai lagi.',
  'Syal biruku sudah rapi. Sekarang aku siap menemani kamu.',
  'Tempat favoritku? Di dekat jendela, pas sinarnya hangat.',
  'Aku punya ide besar: tidur kecil dulu. Tapi kalau kamu mau ngobrol, aku di sini.',
  'Telingaku kelihatan serius. Padahal aku sedang mendengar suara bola menggelinding.',
  'Kamu boleh punya hari biasa saja. Aku juga tidak berpetualang setiap hari.',
  'Aku sedang berlatih tos. Jangan kaget kalau cakarku sedikit geli.',
  'Kalau benang bisa ngomong, pasti dia bilang: Miko, jangan kusutkan aku!',
  'Ada hal kecil yang bikin kamu senang hari ini? Simpan dulu dalam ingatan.',
  'Aku tidak jago pura-pura galak. Senyumku selalu keburu keluar.',
  'Aku suka warna biru. Rasanya seperti langit yang bisa dipakai jadi syal.',
  'Tidak perlu punya jawaban untuk semuanya hari ini.',
  'Satu langkah cukup. Langkah kecil juga meninggalkan jejak.',
  'Kalau kamu capek, duduk sebentar bersamaku.',
  'Aku tadi mengejar bayangan sendiri. Ternyata cepat juga dia.',
  'Ada yang ingin kamu pelajari? Aku juga masih belajar.',
  'Aku bisa menemani diam-diam. Kita tidak harus selalu sibuk.',
  'Minum air dulu kalau perlu. Aku tunggu di sini.',
  'Bahumu boleh turun sedikit. Tidak harus tegang terus.',
  'Bola itu bulat. Kenapa susah sekali berhenti tepat di kakiku?',
  'Aku penasaran, besok kamu akan cerita apa ya?',
  'Hariku lebih seru kalau ada teman menggelindingkan bola.',
  'Aku mencoba menyusun buku dari yang paling tinggi. Lalu tergoda membuka satu.',
  'Hari yang berantakan masih boleh diakhiri dengan istirahat.',
  'Aku tidak menghitung berapa lama kamu pergi. Senang kamu mampir.',
  'Totolku tidak perlu seragam. Tapi syalku wajib rapi.',
  'Kalau ada lomba menemukan tempat nyaman, aku mau daftar.',
  'Aku suka rencana. Aku juga suka kalau rencananya boleh berubah.',
  'Penasaran itu bagus. Bertanya juga bagian dari belajar.',
  'Kita bisa mulai lagi tanpa menyalahkan hari kemarin.',
  'Aku punya langkah kecil dan rasa ingin tahu yang besar.',
  'Kadang keberanian itu cuma mencoba sekali lagi dengan lebih pelan.',
  'Aku sedang membayangkan piknik. Bawa air, buku, dan tempat teduh.',
  'Kamu tidak perlu mengejar semua hal sekaligus.',
  'Kalau kamu sedang fokus, aku akan duduk manis. Mungkin.',
  'Aku menemukan sudut yang pas untuk meringkuk. Mau istirahat juga?',
  'Senyum kecil boleh. Menguap juga boleh.',
  'Aku bangga pada usahamu, bahkan yang tidak kelihatan di layar.',
  'Hari ini kita pilih langkah yang masuk akal, ya.',
  'Aku mau jadi teman yang membantu, bukan teman yang menambah tugas.',
  'Mengatur kamar itu seru. Tapi kita tidak harus punya semua koleksi.',
  'Aku suka kejutan kecil. Seperti bola yang tiba-tiba kembali ke sini.',
  'Buku favoritku belum selesai. Tidak apa-apa, besok masih bisa lanjut.',
  'Aku menunggu angin dari jendela. Syalku sepertinya juga penasaran.',
  'Kalau hari ini terasa panjang, kita ambil satu hal dulu.',
  'Aku tidak butuh kamu selalu sempurna. Aku senang kita bisa belajar bersama.',
  'Aku tadi hampir tertidur sambil duduk. Hampir. Jangan bilang bantalnya.',
  'Tos dulu? Sentuh aku sebentar. Kalau mau elus, tahan lalu usap.',
  'Aku mencoba melompat seperti awan. Ternyata awan tidak melompat.',
  'Cerita kecil juga layak didengar. Tidak harus pencapaian besar.',
  'Aku suka saat kamar terasa tenang dan kamu tidak terburu-buru.',
  'Kamu sudah melakukan banyak hal di luar aplikasi ini. Istirahat juga berarti.',
  'Kadang aku cuma ingin melihat langit berubah warna.',
  'Tidak ada tenggat untuk menjadi teman baik bagi diri sendiri.',
  'Aku tahu satu trik: berhenti sebentar sebelum menjawab terlalu cepat.',
  'Ayo simpan sedikit ruang hari ini untuk hal yang kamu suka.',
  'Aku sedang belajar menunggu. Bola itu melatih kesabaranku.',
  'Kamu punya caramu sendiri. Kita cari ritme yang nyaman.',
  'Aku kecil, tapi aku siap jadi teman untuk rencana besarmu.',
  'Terima kasih sudah mampir. Sekarang, apa yang ingin kita lakukan?',
];
export const mikoReactions = {
  pet: ['Miko senang! Elusanmu hangat sekali.', 'Miko senang! Aku boleh duduk dekat kamu sebentar?', 'Miko senang! Rasanya seperti menemukan tempat paling nyaman.', 'Miko senang! Syalku sedikit miring, tapi aku suka.', 'Miko senang! Terima kasih sudah menemani.'],
  touch: ['Pelan-pelan… Miko menikmati elusanmu.', 'Pelan-pelan… bagian atas kepalaku paling nyaman.', 'Pelan-pelan… aku bisa mengantuk kalau begini.'],
  highfive: ['Tos! Tim langkah kecil siap berangkat.', 'Tos berhasil. Cakarku pas dengan tanganmu!', 'Tos! Kita tidak perlu sempurna untuk jadi tim yang baik.', 'Tos hangat dari macan kecilmu.'],
  ball: ['Ketangkap! Bola ini lebih cepat daripada kelihatannya.', 'Bola kembali! Aku mulai paham cara mengarahkannya.', 'Hup! Hampir kena syal. Kita coba lagi kapan-kapan.', 'Aku suka main sebentar. Terima kasih sudah menemani.'],
};
export const bondDialogue = [
  ['Aku masih belajar jadi temanmu. Kamu boleh mengajariku ritme yang nyaman.', 'Aku sedikit penasaran dan sedikit malu. Senang bisa kenalan pelan-pelan.', 'Kita belum perlu cerita banyak. Tos kecil juga cukup untuk hari ini.', 'Aku sedang mencari tempat favorit di rumah baru kita.', 'Kamu boleh panggil aku dengan nama yang terasa seperti teman.', 'Aku belum tahu semua kebiasaanmu. Kita mulai dari yang sederhana.', 'Aku suka perkenalan yang tidak terburu-buru.', 'Kalau belum sempat banyak mencatat, tidak apa-apa. Kita belajar dulu.', 'Aku sedang membiasakan diri dengan suara bola di sini.', 'Terima kasih sudah memberi aku tempat di harimu.', 'Kita tidak perlu langsung dekat. Aku senang berjalan pelan.', 'Aku akan mencoba jadi teman yang tidak merepotkan.'],
  ['Aku mulai merasa nyaman di sini. Obrolan kecil kita jadi hal yang kusuka.', 'Tos kita makin lancar. Aku masih bisa geli sedikit.', 'Aku suka kita punya ritme, tanpa harus jadi rutinitas yang berat.', 'Ada banyak hari kecil di balik level kita. Aku suka itu.', 'Aku tidak ingin menambah tugasmu. Aku ingin menemani yang sudah ada.', 'Aku mulai punya sudut favorit. Tapi duduk dekat kamu tetap paling nyaman.', 'Aku senang kita belajar jujur pada catatan, bukan terlihat sempurna.', 'Kamu boleh datang dengan cerita baik atau hari yang melelahkan.', 'Rasanya rumah ini makin seperti milik kita.', 'Aku semakin santai kalau kamu mampir sebentar.', 'Kita sudah mencoba banyak langkah kecil. Tidak semuanya harus besar.', 'Aku ingin tetap penasaran seperti waktu pertama kenal kamu.'],
  ['Kita sudah cukup jauh untuk tahu: hari yang berat tidak menghapus kemajuan.', 'Aku tidak cuma menunggu catatan. Aku juga senang kamu memberi waktu untuk diri sendiri.', 'Tempat duduk di dekatku selalu ada, bahkan saat kamu lama sibuk.', 'Kita punya perjalanan sendiri. Tidak perlu dibandingkan dengan orang lain.', 'Aku makin suka cara kita memberi ruang untuk mulai lagi.', 'Kalau aku bisa menyimpan sesuatu, aku ingin menyimpan tos kecil kita.', 'Aku merasa seperti teman lama yang masih penasaran pada cerita baru.', 'Kamu boleh mengubah rencana. Aku tetap menemani kamu meninjaunya.', 'Kita sudah sering belajar sedikit demi sedikit. Aku ingin terus begitu.', 'Aku senang kamu punya hidup di luar layar ini. Mampir saat waktunya pas.', 'Rumah kita punya koleksi, tapi yang paling berarti tetap perjalanan kita.', 'Aku tidak butuh kunjungan sempurna. Aku senang kunjungan yang nyaman.'],
  ['Kita sudah melewati banyak musim kecil. Aku masih senang setiap kali kamu mampir.', 'Kadang rencana lama berubah. Persahabatan kecil kita bisa ikut tumbuh.', 'Aku ingin tetap jadi sudut yang tenang dalam harimu.', 'Lama berteman tidak berarti harus selalu bersama. Kamu boleh punya ruang.', 'Kita tidak perlu mengulang dari nol saat hidup berubah.', 'Aku sudah jadi bagian kecil dari perjalananmu. Terima kasih untuk ruang itu.', 'Aku masih suka bola jingga yang sama. Beberapa hal kecil tetap menyenangkan.', 'Kita bisa mengenang kemajuan tanpa memaksa hari ini sama dengan dulu.', 'Tidak semua musim terasa ringan. Kita beri diri sendiri waktu.', 'Aku suka kita masih punya hal baru untuk dipelajari bersama.', 'Berteman lama membuat obrolan sederhana terasa hangat.', 'Aku tetap macan kecil yang penasaran, dan tetap senang menemani kamu.'],
];
export const everydayDialogue = [
  'Aku ingin dengar satu hal baik dari harimu. Yang kecil pun boleh.', 'Kamu boleh duduk dulu sebelum memilih apa yang perlu dibereskan.', 'Aku baru sadar: meringkuk dan berpikir pelan itu cocok sekali.', 'Kalau harimu penuh, kita tidak harus memenuhi layar ini juga.', 'Aku mencoba memandang jendela seperti petualang. Tapi kursinya terlalu nyaman.', 'Kamu tidak harus produktif di setiap waktu kosong.', 'Aku akan jaga bola ini. Kamu bisa tarik napas dulu.', 'Terima kasih sudah meluangkan sebentar untuk kita.', 'Ada saatnya berencana, ada saatnya menutup buku dan istirahat.', 'Aku suka mendengar kabar kecil. Bahkan kalau kabarnya cuma sudah makan.', 'Kalau kamu sedang bingung, kita boleh memilih langkah paling sederhana.', 'Aku ingin jadi teman untuk hari baik dan hari biasa.', 'Hari yang sunyi juga punya tempat di sini.', 'Aku tadi berpikir ingin jadi macan besar. Lalu teringat bantal kecil ini pas sekali.', 'Kamu boleh bangga pada hal yang belum selesai, tapi sudah kamu mulai.', 'Aku tidak bisa mengerjakan semua hal untukmu. Tapi aku bisa menemani satu langkah.', 'Kamu tidak perlu berusaha terlihat baik-baik saja di setiap saat.', 'Aku akan menyambutmu dengan ritme yang tenang.', 'Aku menata syal seperti sedang bersiap untuk cerita penting. Cerita kecilmu juga penting.', 'Kalau kamu mau diam sebentar, aku ikut duduk manis.', 'Aku senang saat kita bermain tanpa menghitung hadiah.', 'Tidak apa-apa kalau rencana hari ini lebih kecil dari rencana kemarin.', 'Aku ingin kita punya kebiasaan yang muat dalam hidupmu.', 'Ada banyak cara merawat diri. Berhenti sebentar juga salah satunya.', 'Aku penasaran pada dunia, tapi sudut kecil kita punya tempat istimewa.', 'Boleh merasa lelah meskipun harimu terlihat biasa dari luar.', 'Aku suka saat kita tertawa pada hal kecil, seperti bola yang sulit ditangkap.', 'Kalau kamu sudah selesai hari ini, kita tidak perlu mencari tugas baru.', 'Aku tetap di sini meskipun jadwalmu berubah.', 'Kita bisa mencoba sesuatu yang baru tanpa harus meninggalkan semua yang lama.', 'Aku ingin pertemuan kecil kita terasa seperti pulang sebentar.', 'Kamu boleh membuat batas supaya harimu punya ruang untuk bernapas.', 'Aku suka langkahmu sendiri, bukan langkah yang dipaksa orang lain.', 'Aku akan menemani dengan telinga besar dan rasa ingin tahu yang sama.', 'Kita tidak harus mengejar hari yang sempurna. Hari yang cukup juga nyaman.', 'Aku kadang mengantuk di tengah rencana besar. Kita lanjut setelah istirahat, ya?',
];
export function reactionLine(kind: keyof typeof mikoReactions, index: number, name: string) { return mikoReactions[kind][index % mikoReactions[kind].length].replaceAll('Miko', name); }
export function mikoLines(context: { transactions: Transaction[]; goals: Goal[]; contributions: Contribution[]; available: number; day: string; checked: boolean; room: PetRoom; level: number; hour: number; name?: string; checkins?: number }): MikoLine[] {
  const { transactions, goals, contributions, available, day, checked, room, level, hour, name = 'Miko', checkins = (level - 1) * 10 } = context;
  const personal: MikoLine[] = mikoPersonality.map(text => ({ text, kind: 'personal' }));
  const bond = checkins >= 365 ? 3 : checkins >= 90 ? 2 : checkins >= 10 ? 1 : 0;
  personal.unshift(...bondDialogue[bond].map(text => ({ text, kind: 'personal' as const })));
  personal.push(...everydayDialogue.map(text => ({ text, kind: 'personal' as const })));
  personal.unshift({ text: `Aku ${name}. Namaku boleh kamu pilih; rasa ingin tahuku tetap besar.`, kind: 'personal' });
  if (checkins >= 10) personal.unshift({ text: `Sudah ${checkins} check-in kita kumpulkan. Tidak harus berurutan untuk berarti.`, kind: 'personal' });
  personal.unshift({ text: hour < 11 ? 'Pagi! Aku sudah merapikan syal. Kita mulai pelan-pelan?' : hour < 17 ? 'Hai! Aku sedang menjaga sudut paling nyaman untuk kita.' : hour < 21 ? 'Sore mulai tenang. Senang bisa menemani kamu sebentar.' : 'Sudah malam. Kamu boleh istirahat; aku tetap di sini besok.', kind: 'personal' });
  if (room.left === 'plant') personal.unshift({ text: 'Tanaman kecil kita kelihatan nyaman di sini. Aku janji tidak menjadikannya mainan.', kind: 'personal' });
  if (room.left === 'books') personal.unshift({ text: 'Rak buku ini bikin aku ingin belajar. Kamu mau mulai dari buku yang mana?', kind: 'personal' });
  if (room.toy === 'yarn') personal.unshift({ text: 'Benang biru itu menggoda sekali. Kita main pelan supaya tidak kusut.', kind: 'personal' });
  if (room.head) personal.unshift({ text: 'Penampilan baruku sudah pas? Aku merasa siap untuk petualangan kecil.', kind: 'personal' });
  if (level > 1) personal.unshift({ text: `Kita sudah level ${level}. Aku suka perjalanan kecil kita, bukan cuma angkanya.`, kind: 'personal' });
  // Returning users start at a different personal story each date rather than
  // hearing the same introduction whenever they open the room.
  if (checkins > 0) personal.push(...personal.splice(0, (Number(day.replaceAll('-', '')) + checkins * 7) % personal.length));
  const records: MikoLine[] = petTips(transactions, goals, contributions, available, day).map(t => ({ text: t.text, action: t.action, route: t.route, kind: 'record' }));
  const today = transactions.filter(t => t.occurred_on === day);
  if (today.length) records.unshift({ text: `Hari ini ada ${today.length} catatan. Kalau masih ada yang tertinggal, kita rapikan dulu; tidak perlu menambah belanja.`, action: 'Review catatan', route: 'records', kind: 'record' });
  if (available >= 0 && transactions.length) records.push({ text: `Dana bebas yang tercatat ${money(available)}. Itu angka dari catatan kita, bukan akses ke rekeningmu.`, action: 'Lihat rincian', route: 'balance', kind: 'record' });
  records.push({ text: checked ? 'Check-in hari ini sudah beres. Kita boleh main atau istirahat tanpa mengejar XP lagi.' : 'Kalau harimu sudah direview, kita bisa check-in. Hari tanpa belanja juga dihargai.', action: checked ? 'Lihat check-in' : 'Cek hari ini', route: 'checkin', kind: 'record' });
  for (const goal of goals.filter(g => g.target_amount > 0)) {
    const saved = contributions.filter(c => c.goal_id === goal.id).reduce((n, c) => n + Number(c.amount), 0);
    if (saved < goal.target_amount) records.push({ text: `Untuk ${goal.title}, masih ${money(goal.target_amount - saved)} dari target tercatat. Kita lanjut sesuai kemampuanmu, tanpa terburu-buru.`, action: 'Lihat target', route: 'goals', kind: 'record' });
  }
  // Interleave helpful facts with personality. Deterministic ordering makes the
  // next line different and testable; a session visits every line before repeat.
  const result: MikoLine[] = [];
  for (let i = 0; i < Math.max(personal.length, records.length); i++) {
    if (personal[i]) result.push(personal[i]);
    if (i % 2 === 0 && records[i / 2]) result.push(records[i / 2]);
  }
  if (records.length > Math.ceil(personal.length / 2)) result.push(...records.slice(Math.ceil(personal.length / 2)));
  if (available < 0) result.unshift({ text: 'Dana bebas tercatat sedang di bawah nol. Kita cek saldo awal dan catatan dulu, ya. Aku menemani, tanpa menyalahkanmu.', action: 'Review saldo', route: 'balance', kind: 'record' });
  return result.map(line => ({ ...line, text: line.text.replaceAll('Miko', name) }));
}
