const RTR_PROFILE_IMAGE_KEY = "rtr_profile_image";
const RTR_LIBRARY_STORAGE_KEY = "rtrBibliotecaV9";

function getLocalLibraryName(){
  try {
    if (window.RTR_BIBLIO && typeof window.RTR_BIBLIO.getUserName === "function") {
      const apiName = String(window.RTR_BIBLIO.getUserName() || "").trim();
      if (apiName) return apiName;
    }
  } catch (_) {}

  try {
    const state = JSON.parse(localStorage.getItem(RTR_LIBRARY_STORAGE_KEY) || "null");
    const savedName = String((state && state.userName) || "").trim();
    if (savedName) return savedName;
  } catch (_) {}

  return "";
}

function updateLibraryNameInHeader(){
  const name = getLocalLibraryName();
  const title = document.getElementById("menuLibraryName");
  const subtitle = document.getElementById("menuLibrarySubtitle");
  const panelTitle = document.getElementById("profilePanelTitle");
  const panelSubtitle = document.getElementById("profilePanelSubtitle");
  if (title) title.textContent = name || "Mi biblioteca";
  if (subtitle) subtitle.textContent = 'Instrucciones en "!"';
  if (panelTitle) panelTitle.textContent = name || "Mi biblioteca";
  if (panelSubtitle) panelSubtitle.textContent = name
    ? "Tu foto se guarda localmente en este navegador."
    : "Guarda tu nombre desde Biblioteca para verlo aquí.";
}

function toggleMenu() {
  const menu = document.getElementById("menu");
  const overlay = document.getElementById("overlay");

  if (!menu || !overlay) return;

  updateLibraryNameInHeader();
  const isOpen = menu.classList.toggle("open");
  overlay.classList.toggle("active", isOpen);
  document.body.classList.toggle("no-scroll", isOpen);
  if (!isOpen) closeMenuInstructions();
}

function abrirBusqueda(){
  const bar = document.getElementById("searchBar");
  if (!bar) return;

  const menu = document.getElementById("menu");
  const overlay = document.getElementById("overlay");
  if (menu) menu.classList.remove("open");
  if (overlay) overlay.classList.remove("active");
  document.body.classList.remove("no-scroll");

  bar.classList.add("active");

  setTimeout(() => {
    const input = document.getElementById("searchInput");
    if (input) input.focus();
  }, 200);
}

function cerrarBusqueda(){
  const bar = document.getElementById("searchBar");
  if (bar) bar.classList.remove("active");
}

function toggleMenuInstructions(event){
  if (event) event.stopPropagation();
  const panel = document.getElementById("menuInstructionsPanel");
  const btn = document.getElementById("menuProfileHelp");
  if (!panel) return;

  const isOpen = panel.classList.toggle("active");
  panel.setAttribute("aria-hidden", isOpen ? "false" : "true");
  if (btn) btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
}

function closeMenuInstructions(){
  const panel = document.getElementById("menuInstructionsPanel");
  const btn = document.getElementById("menuProfileHelp");
  if (!panel) return;

  panel.classList.remove("active");
  panel.setAttribute("aria-hidden", "true");
  if (btn) btn.setAttribute("aria-expanded", "false");
}

function triggerProfileImagePicker(){
  const input = document.getElementById("profileImageInput");
  if (input) input.click();
}

function setProfileImage(src){
  const preview = document.getElementById("profilePreview");
  const previewImg = document.getElementById("profilePreviewImg");
  const panelPreview = document.getElementById("profilePanelPreview");
  const panelImg = document.getElementById("profilePanelImg");

  if (previewImg) previewImg.src = src;
  if (preview) preview.classList.add("has-image");

  if (panelImg) panelImg.src = src;
  if (panelPreview) panelPreview.classList.add("has-image");
}

function openProfilePanel(){
  updateLibraryNameInHeader();
  const panel = document.getElementById("profilePanel");
  if (!panel) return;

  panel.classList.add("active");
  panel.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}

function closeProfilePanel(){
  const panel = document.getElementById("profilePanel");
  if (!panel) return;

  panel.classList.remove("active");
  panel.setAttribute("aria-hidden", "true");

  const menu = document.getElementById("menu");
  if (!menu || !menu.classList.contains("open")) {
    document.body.classList.remove("no-scroll");
  }
}

function removeProfileImage(){
  localStorage.removeItem(RTR_PROFILE_IMAGE_KEY);

  const preview = document.getElementById("profilePreview");
  const previewImg = document.getElementById("profilePreviewImg");
  const panelPreview = document.getElementById("profilePanelPreview");
  const panelImg = document.getElementById("profilePanelImg");
  const input = document.getElementById("profileImageInput");

  if (previewImg) previewImg.removeAttribute("src");
  if (preview) preview.classList.remove("has-image");

  if (panelImg) panelImg.removeAttribute("src");
  if (panelPreview) panelPreview.classList.remove("has-image");

  if (input) input.value = "";
}

function handleProfileImageChange(event){
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Elige una imagen válida.");
    event.target.value = "";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    alert("La imagen es muy pesada. Usa una menor a 2 MB.");
    event.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = function(){
    const result = reader.result;
    try {
      localStorage.setItem(RTR_PROFILE_IMAGE_KEY, result);
      setProfileImage(result);
    } catch (error) {
      alert("No se pudo guardar la imagen. Prueba con una imagen más liviana.");
    }
  };
  reader.readAsDataURL(file);
}

function initHeader(){
  const searchInput = document.getElementById("searchInput");
  const imageInput = document.getElementById("profileImageInput");
  const savedImage = localStorage.getItem(RTR_PROFILE_IMAGE_KEY);

  updateLibraryNameInHeader();
  if (savedImage) setProfileImage(savedImage);

  if (searchInput) {
    searchInput.addEventListener("keydown", function(e){
      if(e.key === "Enter"){
        const valor = this.value.trim();
        if(valor !== ""){
          window.location.href = "/catalogo?search=" + encodeURIComponent(valor);
        }
      }
    });
  }

  if (imageInput) {
    imageInput.addEventListener("change", handleProfileImageChange);
  }

  window.addEventListener("storage", function(e){
    if (e.key === RTR_LIBRARY_STORAGE_KEY) updateLibraryNameInHeader();
  });

  document.addEventListener("click", function(e){
    const panel = document.getElementById("menuInstructionsPanel");
    const btn = document.getElementById("menuProfileHelp");
    if (!panel || !panel.classList.contains("active")) return;
    if (panel.contains(e.target) || (btn && btn.contains(e.target))) return;
    closeMenuInstructions();
  });

  document.addEventListener("keydown", function(e){
    if (e.key === "Escape") {
      const menu = document.getElementById("menu");
      const overlay = document.getElementById("overlay");
      if (menu) menu.classList.remove("open");
      if (overlay) overlay.classList.remove("active");
      closeProfilePanel();
      closeMenuInstructions();
      document.body.classList.remove("no-scroll");
      cerrarBusqueda();
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeader);
} else {
  initHeader();
}






















const btn = document.getElementById("notifToggle");
const icon = document.getElementById("bellIcon");

const warning = document.getElementById("notifWarning");
const closeWarning = document.getElementById("closeWarning");

const toast = document.getElementById("notifToast");
const toastText = document.getElementById("toastText");
const closeToast = document.getElementById("closeToast");

let toastTimeout;
let syncInterval = null;

const CACHE_KEY = "notif_ui_state_v1";

// =========================
// UI
// =========================
function updateUI(state) {
  if (state) {
    icon.className = "fa fa-bell";
    btn.classList.add("active");
    btn.classList.remove("inactive");
  } else {
    icon.className = "fa fa-bell-slash";
    btn.classList.add("inactive");
    btn.classList.remove("active");
  }
}

function saveCachedState(state) {
  try {
    localStorage.setItem(CACHE_KEY, state ? "on" : "off");
  } catch (e) {}
}

function getCachedState() {
  try {
    return localStorage.getItem(CACHE_KEY);
  } catch (e) {
    return null;
  }
}

function applyCachedState() {
  const cached = getCachedState();

  if (cached === "on") {
    updateUI(true);
    return true;
  }

  if (cached === "off") {
    updateUI(false);
    return true;
  }

  // fallback rápido si no hay cache
  updateUI(Notification.permission === "granted");
  return false;
}

function showToast(text) {
  warning.style.display = "none";
  toastText.textContent = text;
  toast.style.display = "block";

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.style.display = "none";
  }, 2000);
}

// =========================
// PINTADO INSTANTÁNEO DESDE CACHE
// =========================
applyCachedState();

// =========================
// ONESIGNAL
// =========================
window.OneSignalDeferred = window.OneSignalDeferred || [];

OneSignalDeferred.push(async function (OneSignal) {
  async function sync(forceCheckPermission = false) {
    try {
      const permission = Notification.permission;

      if (permission === "denied") {
        updateUI(false);
        saveCachedState(false);
        return;
      }

      const opted = !!OneSignal.User.PushSubscription.optedIn;

      if (forceCheckPermission && permission !== "granted") {
        updateUI(false);
        saveCachedState(false);
        return;
      }

      updateUI(opted);
      saveCachedState(opted);
    } catch (err) {
      console.error("Error al sincronizar notificaciones:", err);
    }
  }

  function startSyncLoop() {
    if (syncInterval) clearInterval(syncInterval);
    syncInterval = setInterval(sync, 1000); // cada 1 segundo
  }

  // sincronización inicial rápida
  sync();
  setTimeout(sync, 150);
  setTimeout(sync, 500);

  // loop constante
  startSyncLoop();

  // cuando vuelves a la pestaña
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      sync(true);
    }
  });

  // cuando vuelves a enfocar la ventana
  window.addEventListener("focus", () => {
    sync(true);
  });

  // cuando la página vuelve desde cache del navegador
  window.addEventListener("pageshow", () => {
    sync(true);
  });

  // si OneSignal detecta un cambio real
  if (OneSignal.User && OneSignal.User.PushSubscription) {
    OneSignal.User.PushSubscription.addEventListener("change", function () {
      sync(true);
    });
  }

  btn.addEventListener("click", async function () {
    try {
      const permission = Notification.permission;

      if (permission === "denied") {
        toast.style.display = "none";
        warning.style.display = "block";
        return;
      }

      const opted = !!OneSignal.User.PushSubscription.optedIn;

      if (opted) {
        // cambio visual instantáneo
        updateUI(false);
        saveCachedState(false);

        await OneSignal.User.PushSubscription.optOut();
        await sync(true);
        showToast("🔕 Desactivaste las notificaciones");
      } else {
        if (permission === "default") {
          await OneSignal.Notifications.requestPermission();
        }

        if (Notification.permission === "granted") {
          // cambio visual instantáneo
          updateUI(true);
          saveCachedState(true);

          await OneSignal.User.PushSubscription.optIn();
          await sync(true);
          showToast("🔔 Activaste las notificaciones");
        } else {
          updateUI(false);
          saveCachedState(false);
          await sync(true);
        }
      }
    } catch (err) {
      console.error("Error al cambiar notificaciones:", err);
      await sync(true);
    }
  });

  closeWarning.onclick = () => {
    warning.style.display = "none";
  };

  closeToast.onclick = () => {
    toast.style.display = "none";
  };
});











