// ==========================================
// YASALMETRE.COM - ANA JAVASCRIPT DOSYASI
// ==========================================

// --- CORE YAPI & UTILS ---
const fmt = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });
const num = (val) => isNaN(parseFloat(val)) ? 0 : parseFloat(val);

// --- 1. KIDEM VE İHBAR TAZMİNATI ---
function calcTazminat() {
    const alan = document.getElementById('taz-sonuc-alan');
    try {
        const g = document.getElementById('taz-giris');
        const c = document.getElementById('taz-cikis');
        const m = document.getElementById('taz-maas');

        if (!g || !c || !m) return;
        if (!g.value || !c.value || !m.value) return alan.classList.add('hidden');

        const giris = new Date(g.value);
        const cikis = new Date(c.value);
        const maas = num(m.value);

        if (cikis <= giris || maas <= 0) return alan.classList.add('hidden');

        const diffDays = Math.floor((cikis - giris) / (1000 * 60 * 60 * 24));
        const years = diffDays / 365.25;
        const kidem = years >= 1 ? years * maas : 0;

        let ihbarHafta = diffDays < 180 ? 2 : (diffDays < 540 ? 4 : (diffDays < 1080 ? 6 : 8));
        const ihbar = (maas / 30) * (ihbarHafta * 7);

        document.getElementById('taz-kidem-val').innerText = fmt.format(kidem);
        document.getElementById('taz-ihbar-val').innerText = fmt.format(ihbar);

        document.getElementById('taz-explain').innerHTML = `
            <p>📅 <b>Çalışma Süresi:</b> ${Math.floor(years)} Yıl, ${diffDays % 365} Gün</p>
            <p>⚖️ <b>Kıdem Formülü:</b> ${years >= 1 ? `Çalışılan Yıl (${years.toFixed(2)}) × Brüt Maaş` : '1 Yılı doldurmadığı için hak kazanılmadı.'}</p>
            <p>⏳ <b>İhbar Süresi:</b> İş kanunu gereği ${ihbarHafta} Hafta üzerinden hesaplandı.</p>
        `;
        alan.classList.remove('hidden');
    } catch (e) {
        if (alan) alan.classList.add('hidden');
    }
}

// --- 2. MAAŞ ANALİZİ ---
function calcMaas() {
    const alan = document.getElementById('maas-sonuc-alan');
    try {
        const y = document.getElementById('maas-yon');
        const t = document.getElementById('maas-tutar');

        if (!y || !t) return;
        const tutar = num(t.value);
        if (tutar <= 0) return alan.classList.add('hidden');

        let brut = y.value === "bruttenNete" ? tutar : tutar / 0.72;
        let net = brut * 0.72;

        document.getElementById('maas-net-val').innerText = fmt.format(net);
        document.getElementById('maas-brut-val').innerText = fmt.format(brut);

        document.getElementById('maas-explain').innerHTML = `
            <p>🧮 <b>Matematiksel Model:</b> ${y.value === 'bruttenNete' ? 'Brütten Nete tahmini %28 kesinti' : 'Netten Brüte brütleştirme katsayısı'} kullanıldı.</p>
        `;
        alan.classList.remove('hidden');
    } catch (e) {
        if (alan) alan.classList.add('hidden');
    }
}

// --- 3. SMM MAKBUZU ---
function calcSmm() {
    const alan = document.getElementById('smm-sonuc-alan');
    try {
        const t = document.getElementById('smm-tutar');
        const y = document.getElementById('smm-yon');
        const s = document.getElementById('smm-stopaj');
        const k = document.getElementById('smm-kdv');

        if (!t || !y || !s || !k) return;
        const tutar = num(t.value);
        if (tutar <= 0) return alan.classList.add('hidden');

        const stopajOran = num(s.value) / 100;
        const kdvOran = num(k.value) / 100;
        let brut, net, stopaj, kdv;

        if (y.value === 'brut') {
            brut = tutar;
            stopaj = brut * stopajOran;
            kdv = brut * kdvOran;
            net = brut - stopaj + kdv;
        } else {
            brut = tutar / (1 - stopajOran + kdvOran);
            stopaj = brut * stopajOran;
            kdv = brut * kdvOran;
            net = tutar;
        }

        document.getElementById('smm-res-brut').innerText = fmt.format(brut);
        document.getElementById('smm-res-stopaj').innerText = "-" + fmt.format(stopaj);
        document.getElementById('smm-res-kdv').innerText = "+" + fmt.format(kdv);
        document.getElementById('smm-res-net').innerText = fmt.format(net);

        document.getElementById('smm-explain').innerHTML = `
            <p>📄 <b>Makbuz Yönü:</b> ${y.value === 'brut' ? 'Brüt tutar baz alınarak kesintiler uygulandı.' : 'Müşteriden tahsil edilecek net tutardan brüt ücrete çıkıldı.'}</p>
            <p>⚖️ <b>Kesinti:</b> Brüt ücret üzerinden %${stopajOran * 100} Stopaj (Gelir Vergisi) kaynağında kesildi.</p>
        `;
        alan.classList.remove('hidden');
    } catch (e) {
        if (alan) alan.classList.add('hidden');
    }
}

// --- 4. KDV VE TEVKİFAT ---
function calcKdv() {
    const alan = document.getElementById('kdv-sonuc-alan');
    try {
        const t = document.getElementById('kdv-tutar');
        if (!t) return;
        const tutar = num(t.value);
        if (tutar <= 0) return alan.classList.add('hidden');

        const oran = num(document.getElementById('kdv-oran').value) / 100;
        const tevRate = num(document.getElementById('kdv-tev').value);

        let tip = 'haric';
        document.getElementsByName('kdvTipi').forEach(r => { if (r.checked) tip = r.value; });

        let kdvHaricBase = tip === 'haric' ? tutar : tutar / (1 + oran);
        let kdvMiktari = kdvHaricBase * oran;
        let kesinti = kdvMiktari * tevRate;
        let tahsilat = kdvHaricBase + (kdvMiktari - kesinti);
        let fTop = kdvHaricBase + kdvMiktari;

        document.getElementById('kdv-kdv-val').innerText = fmt.format(kdvMiktari);
        document.getElementById('kdv-tev-val').innerText = fmt.format(kesinti);
        document.getElementById('kdv-tahsil-val').innerText = fmt.format(tahsilat);
        document.getElementById('kdv-toplam-val').innerText = fmt.format(fTop);

        document.getElementById('kdv-explain').innerHTML = `
            <p>🧾 <b>Matrah (KDV Hariç):</b> ${fmt.format(kdvHaricBase)}</p>
            <p>✂️ <b>Tevkifat Tutarı:</b> Toplam KDV'nin ${tevRate * 10}/10'u stopaj olarak hesaplandı.</p>
        `;
        alan.classList.remove('hidden');
    } catch (e) {
        if (alan) alan.classList.add('hidden');
    }
}

// --- 5. E-TİCARET KÂR SİMÜLASYONU (İlerisi için hazırlandı) ---
function calcEco() {
    const alan = document.getElementById('eco-sonuc-alan');
    try {
        const sEl = document.getElementById('eco-satis');
        if (!sEl) return;
        const s = num(sEl.value);
        if (s <= 0) return alan.classList.add('hidden');
        
        const m = num(document.getElementById('eco-maliyet').value);
        const k = num(document.getElementById('eco-komisyon').value);
        const kg = num(document.getElementById('eco-kargo').value);

        const kom = s * (k / 100);
        const gider = m + kom + kg;
        const kar = s - gider;

        document.getElementById('eco-net-val').innerText = fmt.format(kar);
        alan.className = `mt-6 p-6 rounded-2xl text-center border transition-all ${kar < 0 ? 'bg-red-50 border-red-200 text-red-900' : 'bg-indigo-50 border-indigo-200 text-indigo-900'}`;

        document.getElementById('eco-explain').innerHTML = `
            <p>📦 Ürün Maliyeti: ${fmt.format(m)} | 🏷️ Komisyon: ${fmt.format(kom)} | 🚚 Kargo: ${fmt.format(kg)}</p>
            <p class="mt-2 font-bold ${kar < 0 ? 'text-red-600' : 'text-emerald-600'}">Kâr Marjı: %${((kar / s) * 100).toFixed(1)}</p>
        `;
        alan.classList.remove('hidden');
    } catch (e) {
        if (alan) alan.classList.add('hidden');
    }
}

// --- 6. ŞİRKET VERGİSİ (İlerisi için hazırlandı) ---
function calcVergi() {
    const alan = document.getElementById('vergi-sonuc-alan');
    try {
        const gelEl = document.getElementById('vergi-gelir');
        if (!gelEl) return;
        const gel = num(gelEl.value);
        if (gel <= 0) return alan.classList.add('hidden');

        let matrah = Math.max(0, gel - num(document.getElementById('vergi-gider').value));
        if (document.getElementById('vergi-genc').checked) matrah = Math.max(0, matrah - 300000);

        let vergi = 0;
        let calcMatrah = matrah;

        if (calcMatrah > 580000) { vergi += (calcMatrah - 580000) * 0.35; calcMatrah = 580000; }
        if (calcMatrah > 230000) { vergi += (calcMatrah - 230000) * 0.27; calcMatrah = 230000; }
        if (calcMatrah > 110000) { vergi += (calcMatrah - 110000) * 0.20; calcMatrah = 110000; }
        if (calcMatrah > 0) { vergi += calcMatrah * 0.15; }

        document.getElementById('vergi-val').innerText = fmt.format(vergi);

        document.getElementById('vergi-explain').innerHTML = `
            <p>📊 <b>Safi Ticari Kazanç (Matrah):</b> ${fmt.format(matrah)}</p>
            <p>📈 <b>Vergilendirme Yöntemi:</b> Artan oranlı (Progressive) vergi dilimleri (%15, %20, %27, %35) kullanıldı.</p>
        `;
        alan.classList.remove('hidden');
    } catch (e) {
        if (alan) alan.classList.add('hidden');
    }
}

// --- 7. LGS PUAN HESAPLAMA (İlerisi için hazırlandı) ---
const dersler = [
    { id: 'tr', ad: 'Türkçe', k: 4 }, { id: 'mat', ad: 'Matematik', k: 4 }, { id: 'fen', ad: 'Fen Bil.', k: 4 },
    { id: 'ink', ad: 'İnkılap', k: 1 }, { id: 'din', ad: 'Din K.', k: 1 }, { id: 'ing', ad: 'İngilizce', k: 1 }
];

function initLGS() {
    const c = document.getElementById('lgs-dersler-container');
    if (!c) return; 

    if(c.innerHTML.trim() === '') {
        c.innerHTML = dersler.map(d => `
            <div class="grid grid-cols-4 gap-2 items-center bg-slate-50 p-2 rounded-xl border mt-2">
                <span class="text-xs font-bold text-slate-700">${d.ad} (x${d.k})</span>
                <input type="number" id="${d.id}D" class="w-full border rounded p-1 text-center text-sm react-input" placeholder="0">
                <input type="number" id="${d.id}Y" class="w-full border rounded p-1 text-center text-sm react-input" placeholder="0">
                <span id="${d.id}N" class="text-center font-black text-blue-600">0.0</span>
            </div>
        `).join('');
        
        const inputs = c.querySelectorAll('.react-input');
        inputs.forEach(input => {
            input.addEventListener('input', calcLGS);
        });
    }
}

function calcLGS() {
    const alan = document.getElementById('lgs-sonuc-alan');
    try {
        let totalPuan = 194.7;
        let isAnyFilled = false;

        dersler.forEach(d => {
            const dogruEl = document.getElementById(`${d.id}D`);
            const yanlisEl = document.getElementById(`${d.id}Y`);
            if(!dogruEl || !yanlisEl) return;
            
            const dogru = num(dogruEl.value);
            const yanlis = num(yanlisEl.value);
            if (dogru > 0 || yanlis > 0) isAnyFilled = true;

            const net = Math.max(0, dogru - (yanlis / 3));
            document.getElementById(`${d.id}N`).innerText = net.toFixed(2);
            totalPuan += (net * d.k * 1.05);
        });

        if (!isAnyFilled) return alan.classList.add('hidden');

        document.getElementById('lgs-val').innerText = Math.min(500, totalPuan).toFixed(3);
        document.getElementById('lgs-explain').innerHTML = `<p>🧠 Toplam Netlere göre <b>Taban Puan + Katsayı Skoru</b> formülü ile öngörülmüştür.</p>`;
        alan.classList.remove('hidden');
    } catch (e) {
        if (alan) alan.classList.add('hidden');
    }
}

// ==========================================
// KÖPRÜ (GLOBAL EVENT LISTENER)
// Hangi sayfada olduğumuzu anlayıp ilgili 
// hesaplamayı anında tetikler.
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // LGS sayfası açıksa ders girişlerini DOM'a yazdır
    initLGS();

    // Sayfadaki tüm dinamik inputları bul
    const inputs = document.querySelectorAll('.react-input');
    
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            if (document.getElementById('taz-giris')) calcTazminat();
            if (document.getElementById('maas-tutar')) calcMaas();
            if (document.getElementById('smm-tutar')) calcSmm();
            if (document.getElementById('kdv-tutar')) calcKdv();
            if (document.getElementById('eco-satis')) calcEco();
            if (document.getElementById('vergi-gelir')) calcVergi();
            if (document.getElementById('lgs-dersler-container')) calcLGS();
        });
    });
});