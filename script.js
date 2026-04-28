const API_KEY = "961d669761aa579f97f0b0b2854997f4";

const input = document.querySelector("input");
const button = document.getElementById("ara-btn");
const sonuclar = document.getElementById("sonuclar");
const gorunumToggle = document.getElementById("gorunum-toggle");
let aktifFiltre = "hepsi";
let sonuclarHafiza = "";
let aktifGorunum = "liste";

function gorunumUygula() {
    if (aktifGorunum === "grid") {
        sonuclar.classList.add("grid-mod");
    } else {
        sonuclar.classList.remove("grid-mod");
    }
}

function filtreUygula() {
    document.querySelectorAll(".film-kart").forEach(function(kart) {
        if (aktifFiltre === "hepsi" || kart.getAttribute("data-tur") === aktifFiltre) {
            kart.style.display = "flex";
        } else {
            kart.style.display = "none";
        }
    });
}

function geriDon() {
    sonuclar.innerHTML = sonuclarHafiza;
    gorunumToggle.style.display = "flex";
    gorunumUygula();
    filtreUygula();
    kartlariDinle();
}

function kartlariDinle() {
    document.querySelectorAll(".film-kart").forEach(function(kart) {
        kart.addEventListener("click", function() {
            const filmId = kart.getAttribute("data-id");
            const tur = kart.getAttribute("data-tur");
            const endpoint = tur === "Film" ? "movie" : "tv";

            const providerFetch = fetch("https://api.themoviedb.org/3/" + endpoint + "/" + filmId + "/watch/providers?api_key=" + API_KEY).then(r => r.json());
            const detayFetch = fetch("https://api.themoviedb.org/3/" + endpoint + "/" + filmId + "?api_key=" + API_KEY + "&language=tr-TR").then(r => r.json());

            Promise.all([providerFetch, detayFetch]).then(function(sonuc) {
                const data = sonuc[0];
                const detay = sonuc[1];
                const turkiye = data.results.TR;

                sonuclar.classList.remove("grid-mod");
                gorunumToggle.style.display = "none";

                const poster = detay.poster_path
                    ? "<img src='https://image.tmdb.org/t/p/w185" + detay.poster_path + "' class='detay-poster'>"
                    : "";

                const puan = detay.vote_average ? "⭐ " + detay.vote_average.toFixed(1) : "";
                const sure = detay.runtime ? "🕐 " + detay.runtime + " dk" : "";
                const sezon = detay.number_of_seasons ? "📺 " + detay.number_of_seasons + " sezon" : "";
                const genre = detay.genres && detay.genres.length > 0 ? "🎬 " + detay.genres.map(g => g.name).join(", ") : "";
                const yil = detay.release_date || detay.first_air_date || "";

                const detayBilgi = `
                    <div class='detay-ust'>
                        ${poster}
                        <div class='detay-bilgi'>
                            <h3>${detay.title || detay.name}</h3>
                            <p class='detay-yil'>${yil}</p>
                            <span class='etiket ${tur === "Film" ? "etiket-film" : "etiket-dizi"}'>${tur}</span>
                            ${puan ? "<p class='detay-meta'>" + puan + "</p>" : ""}
                            ${sure ? "<p class='detay-meta'>" + sure + "</p>" : ""}
                            ${sezon ? "<p class='detay-meta'>" + sezon + "</p>" : ""}
                            ${genre ? "<p class='detay-meta'>" + genre + "</p>" : ""}
                        </div>
                    </div>
                `;

                let platformHtml = detayBilgi + "<h3>Platform Bilgisi</h3>";

                if (turkiye) {
                    if (turkiye.flatrate) {
                        platformHtml += "<p><strong>Abonelik:</strong></p>";
                        turkiye.flatrate.forEach(function(p) {
                            platformHtml += "<div class='platform'><img src='https://image.tmdb.org/t/p/w45" + p.logo_path + "'><p>" + p.provider_name + "</p></div>";
                        });
                    }
                    if (turkiye.rent) {
                        platformHtml += "<p><strong>Kiralama:</strong></p>";
                        turkiye.rent.forEach(function(p) {
                            platformHtml += "<div class='platform'><img src='https://image.tmdb.org/t/p/w45" + p.logo_path + "'><p>" + p.provider_name + "</p></div>";
                        });
                    }
                    if (turkiye.buy) {
                        platformHtml += "<p><strong>Satın Al:</strong></p>";
                        turkiye.buy.forEach(function(p) {
                            platformHtml += "<div class='platform'><img src='https://image.tmdb.org/t/p/w45" + p.logo_path + "'><p>" + p.provider_name + "</p></div>";
                        });
                    }
                } else {
                    platformHtml += "<p style='padding:8px 12px;color:#6b6860;font-size:14px;'>Bu içerik Türkiye'de henüz hiçbir platformda mevcut değil.</p>";
                }

                platformHtml += "<button id='geri-don' type='button'>← Geri Dön</button>";
                sonuclar.innerHTML = platformHtml;
                document.getElementById("geri-don").addEventListener("click", geriDon);
            });
        });
    });
}

button.addEventListener("click", function() {
    const aranan = input.value.trim();
    if (!aranan) return;

    const filmFetch = fetch("https://api.themoviedb.org/3/search/movie?api_key=" + API_KEY + "&query=" + encodeURIComponent(aranan) + "&language=tr-TR").then(r => r.json());
    const diziFetch = fetch("https://api.themoviedb.org/3/search/tv?api_key=" + API_KEY + "&query=" + encodeURIComponent(aranan) + "&language=tr-TR").then(r => r.json());

    Promise.all([filmFetch, diziFetch]).then(function(sonuc) {
        const filmler = sonuc[0].results.map(f => ({ ...f, tur: "Film" }));
        const diziler = sonuc[1].results.map(d => ({ ...d, tur: "Dizi", title: d.name, release_date: d.first_air_date }));
        const hepsi = [...filmler, ...diziler];

        aktifFiltre = "hepsi";
        document.getElementById("filtreler").style.display = "flex";
        gorunumToggle.style.display = "flex";
        sonuclar.innerHTML = "";

        hepsi.forEach(function(film) {
            const poster = film.poster_path
                ? "<img src='https://image.tmdb.org/t/p/w92" + film.poster_path + "'>"
                : "";
            const yil = film.release_date ? film.release_date.slice(0, 4) : "?";
            sonuclar.innerHTML += "<div class='film-kart' data-id='" + film.id + "' data-tur='" + film.tur + "'>" + poster + "<p>" + film.title + " (" + yil + ") <span class='etiket'>" + film.tur + "</span></p></div>";
        });

        sonuclarHafiza = sonuclar.innerHTML;
        gorunumUygula();
        kartlariDinle();
    });
});

// Görünüm toggle
document.getElementById("btn-liste").addEventListener("click", function() {
    aktifGorunum = "liste";
    document.getElementById("btn-liste").classList.add("aktif");
    document.getElementById("btn-grid").classList.remove("aktif");
    gorunumUygula();
});

document.getElementById("btn-grid").addEventListener("click", function() {
    aktifGorunum = "grid";
    document.getElementById("btn-grid").classList.add("aktif");
    document.getElementById("btn-liste").classList.remove("aktif");
    gorunumUygula();
});

// Filtre butonları
document.querySelectorAll(".filtre-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
        const secilen = btn.getAttribute("data-filtre");
        aktifFiltre = (aktifFiltre === secilen && secilen !== "hepsi") ? "hepsi" : secilen;
        document.querySelectorAll(".filtre-btn").forEach(b => b.classList.remove("aktif"));
        if (aktifFiltre !== "hepsi" || secilen === "hepsi") {
            btn.classList.add("aktif");
        } else {
            document.querySelector("[data-filtre='hepsi']").classList.add("aktif");
        }
        if (sonuclar.innerHTML !== sonuclarHafiza) {
            geriDon();
        } else {
            filtreUygula();
        }
    });
});

input.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        button.click();
    }
});

input.focus();

document.getElementById("logo").addEventListener("click", function() {
    sonuclar.innerHTML = "";
    input.value = "";
    aktifFiltre = "hepsi";
    aktifGorunum = "liste";
    document.querySelectorAll(".filtre-btn").forEach(b => b.classList.remove("aktif"));
    document.getElementById("filtreler").style.display = "none";
    gorunumToggle.style.display = "none";
    document.getElementById("btn-liste").classList.add("aktif");
    document.getElementById("btn-grid").classList.remove("aktif");
    input.focus();
});
