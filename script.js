const API_KEY = "961d669761aa579f97f0b0b2854997f4";

const input = document.querySelector("input");
const button = document.getElementById("ara-btn");
const sonuclar = document.getElementById("sonuclar");
let aktifFiltre = "hepsi";
let sonuclarHafiza = "";

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
    filtreUygula();
    kartlariDinle();
}

function kartlariDinle() {
    document.querySelectorAll(".film-kart").forEach(function(kart) {
        kart.addEventListener("click", function() {
            const filmId = kart.getAttribute("data-id");
            const tur = kart.getAttribute("data-tur");
            const endpoint = tur === "Film" ? "movie" : "tv";

            fetch("https://api.themoviedb.org/3/" + endpoint + "/" + filmId + "/watch/providers?api_key=" + API_KEY)
                .then(r => r.json())
                .then(function(data) {
                    const turkiye = data.results.TR;
                    if (turkiye) {
                        let platformHtml = "<h3>Platform Bilgisi</h3>";

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

                        platformHtml += "<button id='geri-don' type='button'>← Geri Dön</button>";
                        sonuclar.innerHTML = platformHtml;
                    } else {
                        sonuclar.innerHTML = "<h3>Platform Bilgisi</h3><p>Bu içerik Türkiye'de henüz hiçbir platformda mevcut değil.</p><button id='geri-don' type='button'>← Geri Dön</button>";
                    }

                    document.getElementById("geri-don").addEventListener("click", geriDon);
                });
        });
    });
}

button.addEventListener("click", function() {
    const aranan = input.value;

    const filmFetch = fetch("https://api.themoviedb.org/3/search/movie?api_key=" + API_KEY + "&query=" + aranan + "&language=tr-TR").then(r => r.json());
    const diziFetch = fetch("https://api.themoviedb.org/3/search/tv?api_key=" + API_KEY + "&query=" + aranan + "&language=tr-TR").then(r => r.json());

    Promise.all([filmFetch, diziFetch]).then(function(sonuc) {
        const filmler = sonuc[0].results.map(f => ({ ...f, tur: "Film" }));
        const diziler = sonuc[1].results.map(d => ({ ...d, tur: "Dizi", title: d.name, release_date: d.first_air_date }));
        const hepsi = [...filmler, ...diziler];

        aktifFiltre = "hepsi";
        document.getElementById("filtreler").style.display = "block";
        sonuclar.innerHTML = "";

        hepsi.forEach(function(film) {
            const poster = film.poster_path 
                ? "<img src='https://image.tmdb.org/t/p/w92" + film.poster_path + "'>" 
                : "";
            sonuclar.innerHTML += "<div class='film-kart' data-id='" + film.id + "' data-tur='" + film.tur + "'>" + poster + "<p>" + film.title + " (" + film.release_date + ") <span class='etiket'>" + film.tur + "</span></p></div>";
        });

        sonuclarHafiza = sonuclar.innerHTML;
        kartlariDinle();
    });
});

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
    document.querySelectorAll(".filtre-btn").forEach(b => b.classList.remove("aktif"));
    document.getElementById("filtreler").style.display = "none";
    input.focus();
});
