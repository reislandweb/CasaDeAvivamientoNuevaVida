/*CONFIGURACIÓN PRINCIPAL*/

/*
 * 👉 FB_PAGE_ID:
 * Aquí debes poner el ID numérico de la página de Facebook de la iglesia.
 */
const FB_PAGE_ID = "AQUÍ_EL_ID_DE_LA_PÁGINA";

/*
 * 👉 FB_ACCESS_TOKEN:
 * Aquí debes poner el token de acceso generado en Facebook Developers.
 */
const FB_ACCESS_TOKEN = "AQUÍ_EL_ACCESS_TOKEN";


/*FUNCIÓN PRINCIPAL: DETECTAR DIRECTO Y VIDEOS RECIENTES*/
async function checkFacebookLive() {
  const container = document.getElementById("liveContainer");
  const recentContainer = document.getElementById("recentVideos");
  if (!container || !recentContainer) return;

  // Si faltan datos, mostramos aviso
  if (!FB_PAGE_ID || !FB_ACCESS_TOKEN) {
    container.innerHTML = `
      <p><strong>⚠️ Falta configuración de Facebook Live.</strong></p>
      <p>Debes añadir el <strong>PAGE_ID</strong> y el <strong>ACCESS_TOKEN</strong> en el archivo <code>facebook-live.js</code>.</p>
    `;
    return;
  }

  try {
    /*COMPROBAR SI HAY DIRECTO*/

    const liveUrl = `https://graph.facebook.com/${FB_PAGE_ID}/live_videos?status=LIVE_NOW&access_token=${FB_ACCESS_TOKEN}`;
    const liveRes = await fetch(liveUrl);
    const liveData = await liveRes.json();

    const isLive = Array.isArray(liveData.data) && liveData.data.length > 0;

    if (isLive) {
      const live = liveData.data[0];
      const liveId = live.id;

      container.innerHTML = `
        <div class="live-banner">
          <span class="live-banner-dot"></span>
          <span>En vivo ahora</span>
        </div>

        <div class="live-video-wrapper">
          <iframe
            src="https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/${FB_PAGE_ID}/videos/${liveId}&show_text=false&autoplay=true"
            allow="autoplay; encrypted-media"
            allowfullscreen="true">
          </iframe>
        </div>
      `;
    } else {
      container.innerHTML = `
        <p><strong>No hay transmisión en vivo en este momento.</strong></p>
        <p>Cuando la iglesia inicie un directo en Facebook, aparecerá automáticamente aquí.</p>
      `;
    }

    /*OBTENER LAS 2 ÚLTIMAS PREDICACIONES*/

    const videosUrl = `https://graph.facebook.com/${FB_PAGE_ID}/videos?fields=description,created_time,permalink_url,thumbnails&limit=2&access_token=${FB_ACCESS_TOKEN}`;
    const videosRes = await fetch(videosUrl);
    const videosData = await videosRes.json();

    if (Array.isArray(videosData.data) && videosData.data.length > 0) {
      recentContainer.innerHTML = videosData.data
        .map(video => {
          const thumb = video.thumbnails?.data?.[0]?.uri || "";
          const date = new Date(video.created_time).toLocaleDateString("es-ES");

          return `
            <div class="recent-video-card">
              <img src="${thumb}" alt="Miniatura de predicación">
              <div class="recent-video-info">
                <p><strong>${date}</strong></p>
                <p>${video.description || "Predicación reciente"}</p>
                <a href="${video.permalink_url}" target="_blank" class="btn-secondary">Ver predicación</a>
              </div>
            </div>
          `;
        })
        .join("");
    } else {
      recentContainer.innerHTML = `
        <p>No se encontraron predicaciones recientes.</p>
      `;
    }

  } catch (err) {
    console.error(err);

    container.innerHTML = `
      <p><strong>⚠️ No se pudo comprobar el estado en vivo de Facebook.</strong></p>
      <p>Revisa el token o genera uno nuevo.</p>
    `;
  }
}

document.addEventListener("DOMContentLoaded", checkFacebookLive);
