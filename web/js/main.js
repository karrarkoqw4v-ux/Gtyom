// نقطة البداية: ربط الخريطة والواجهة والملاحة
import { on, emit } from './core/events.js';
import { state } from './core/state.js';
import { prefs } from './core/prefs.js';
import { map } from './map/map.js';
import { initRouteLayer, drawRoute, drawProgress, clearRoute, setDestination, drawManeuver, clearManeuver } from './map/route-layer.js';
import { follow, overview, flyTo, clearPadding, startIntro, stopIntro } from './map/camera.js';
import { clearPois, showPois } from './map/poi-markers.js';
import { initMarker } from './vehicle/marker.js';
import { vehicle } from './vehicle/vehicles.js';
import { initLandmarks } from './map/landmarks.js';
import { initMask } from './map/mask.js';
import { initBuildingCounter } from './map/buildings-counter.js';
import { startGps, pushPosition } from './location/gps.js';
import { requestLocation, keepScreenOn } from './permissions/permissions.js';
import { PERM_TEXT } from './permissions/messages.js';
import { getRoute, getRoutes, getRouteVia } from './routing/router.js';
import { Navigator } from './routing/navigator.js';
import { simulate, stopSimulation } from './routing/simulator.js';
import { speak, stopVoice } from './voice/voice.js';
import { category } from './places/categories.js';
import { fetchAround } from './places/around.js';
import { reverse } from './places/search.js';
import { detectProvince } from './provinces/detect.js';
import { dist } from './core/geo.js';
import { initAutoUpdate, forceUpdate } from './update.js';
import { initInstall, installApp } from './ui/install.js';
import { renderTopbar } from './ui/topbar.js';
import { renderFabs } from './ui/fabs.js';
import { showHome } from './ui/home-view.js';
import { showPlace } from './ui/place-view.js';
import { showNearby } from './ui/nearby-view.js';
import { showProvince } from './ui/province-view.js';
import { showProvinces } from './ui/provinces-list.js';
import { showRoute, showRouteLoading } from './ui/route-view.js';
import { showNav, updateNav, hideNav, showRecenter } from './ui/nav-view.js';
import { showOffline } from './ui/offline-view.js';
import { showSettings } from './ui/settings-view.js';
import { showAuth } from './ui/auth-view.js';
import { tripStart, tripUpdate, tripArrive, tripEnd } from './native/trip.js';
import { startPreview, stopPreview } from './vehicle/preview.js';
import { initGov } from './map/gov.js';
import { showAccount } from './ui/profile-view.js';
import { restoreSession } from './auth/auth.js';
import { showTrip } from './ui/trip-view.js';
import { showSearch, addRecent } from './ui/search-view.js';
import { showWeather } from './ui/weather-view.js';
import { initQuality } from './map/quality.js';
import { showKarbala } from './ui/karbala-view.js';
import { showShare } from './ui/share-view.js';
import { maybeShowGate } from './ui/gate.js';
import { initTraffic } from './traffic/sim.js';
import { initSignals } from './traffic/signals.js';
import { initRelief } from './map/relief.js';
import { initExtBuildings } from './map/buildings-ext.js';
import { initReports, addReport } from './map/reports.js';
import { initPlaces3D } from './map/places3d.js';
import { initBridges } from './map/bridges.js';
import { initSatellite, reapplySatellite } from './map/satellite.js';
import { initFacades } from './map/facades.js';
import { initHighlight, highlightAt, clearHighlight } from './map/highlight.js';
import { initNature } from './map/nature3d.js';
import { showLayers } from './ui/layers-view.js';
import { showReport, showAddStop } from './ui/nav-modals.js';
import { toast } from './ui/toast.js';
import { setMini } from './ui/sheet.js';

map.on('zoomend', e => {
  if (state.navigating || !e.originalEvent || document.body.classList.contains('wx')) return;
  const z = map.getZoom(), t = z <= 12.5 ? 0 : Math.min(58, (z - 12.5) / 2.5 * 58);
  if (Math.abs(map.getPitch() - t) > 6) map.easeTo({ pitch: t, duration: 600 });
});
let nav = null, following = true, lastReroute = 0, pickCb = null;

initAutoUpdate(); initInstall();
on('ui:install', installApp);
{ const go = new URLSearchParams(location.search).get('go'); if (go) setTimeout(() => emit(go === 'weather' ? 'ui:weather' : 'ui:search'), 1500); }
document.body.classList.toggle('no-anim', !prefs().anim);
renderTopbar(); renderFabs(); showHome(true); maybeShowGate();

const vis = (l, v) => map.getLayer(l) && map.setLayoutProperty(l, 'visibility', v ? 'visible' : 'none');
on('map:ready', () => {
  initRelief(); initSatellite(); initRouteLayer(); initReports(); initTraffic(); initSignals(); initMarker(); initBuildingCounter(); initLandmarks(); initGov(); initMask(); initExtBuildings(); initPlaces3D(); initBridges(); initNature(); initHighlight(); initFacades(); initQuality(); reapplySatellite();
  try { if (map.setSky) map.setSky({ 'sky-color': '#a9d1f5', 'horizon-color': '#e8f2fb', 'fog-color': '#eef2f0', 'sky-horizon-blend': 0.6, 'horizon-fog-blend': 0.7, 'fog-ground-blend': 0.92, 'atmosphere-blend': 0 }); } catch {}
  const P = prefs(); vis('road-names', P.roadNames); vis('poi-names', P.poiNames); vis('places', P.placeNames);
});
let lastErr = '', loaded = false;
// الخريطة تدور بهدوء عند الفتح، وتوقف أول ما تلمسها
map.on('movestart', e => { if (e.originalEvent) stopIntro(); });
on('map:ready', () => { if (prefs().spin && !state.navigating && map.getZoom() < 7) startIntro(); });
const errBox = document.createElement('div'); errBox.id = 'maperr';
errBox.innerHTML = '<b>الخريطة ما اشتغلت بعد</b><span>تأكد من الإنترنت ثم حدّث التطبيق.</span><small></small><button class="btn primary" type="button">تحديث التطبيق</button>';
errBox.querySelector('button').onclick = () => forceUpdate();
document.body.append(errBox);
on('map:ready', () => {
  loaded = true; errBox.style.display = 'none';
  const q = new URLSearchParams(location.search), loc = q.get('loc');
  if (loc) { const [lng, lat] = loc.split(',').map(Number); if (isFinite(lng) && isFinite(lat)) setTimeout(() => emit('ui:place', { name: q.get('n') || 'موقع مشارك', lng, lat }), 700); }
});
setTimeout(() => { if (!loaded) { errBox.querySelector('small').textContent = lastErr; errBox.style.display = 'flex'; } }, 9000);
on('map:error', msg => { lastErr = String(msg); if (!navigator.onLine) toast('أنت بدون إنترنت، تظهر فقط المناطق المنزّلة'); else console.warn(msg); });

// الضغط على الخريطة: يطلع شي فقط إذا ضغطت على اسم (مكان، محل، سوق، مدينة، محافظة). الضغط على الفراغ ما يسوي علامة
const TAP_LAYERS = ['poi-dots', 'poi-names', 'places', 'places3d-labels', 'landmark-labels', 'gov-labels'];
on('map:click', async ({ lng, lat, zoom, point }) => {
  if (state.navigating || document.body.classList.contains('wx')) return;
  if (pickCb) {
    const cb = pickCb; pickCb = null; setMini(false);
    const p = { name: 'نقطة على الخريطة', lng, lat }; cb(p);
    reverse(lng, lat).then(r => { if (r?.display_name) { p.name = r.name || r.display_name.split(/[،,]/)[0]; cb(p); } }).catch(() => {});
    return;
  }
  const box = [[point.x - 16, point.y - 16], [point.x + 16, point.y + 16]];
  const hit = map.queryRenderedFeatures(box, { layers: TAP_LAYERS.filter(l => map.getLayer(l)) }).find(f => f.properties?.['name:ar'] || f.properties?.name);
  if (!hit) { setMini(true); return; }
  const pr = hit.properties, c = hit.geometry.type === 'Point' ? hit.geometry.coordinates : [lng, lat];
  if (hit.layer.id === 'places' && ['city', 'town'].includes(pr.class) && zoom < 11) { emit('ui:province', await detectProvince(c[0], c[1])); return; }
  const place = { name: pr['name:ar'] || pr.name, lng: c[0], lat: c[1] };
  if (hit.layer.id.startsWith('poi')) place.tags = { amenity: pr.class };
  const bld = map.queryRenderedFeatures(point, { layers: ['b3d', 'b3d-ext'].filter(l => map.getLayer(l)) })[0];
  if (bld) place.building = { height: Math.max(+bld.properties.render_height || +bld.properties.height || 0, 0) || null };
  emit('ui:place', place);
});
on('ui:share', showShare);
on('ui:pick', cb => { pickCb = cb; setMini(true); toast('اضغط على الخريطة لتحديد المكان', 3500); });

on('ui:locate', async () => {
  const r = await requestLocation();
  if (!r.ok) { toast(PERM_TEXT[r.reason], 4500); return; }
  pushPosition({ lng: r.coords.longitude, lat: r.coords.latitude, heading: r.coords.heading || 0, speed: 0, acc: r.coords.accuracy });
  flyTo(r.coords.longitude, r.coords.latitude, 16.5, 55); startGps();
  emit('ui:place', { name: 'موقعي الحالي', lng: r.coords.longitude, lat: r.coords.latitude, acc: r.coords.accuracy, mine: true });
});

// بطاقة المكان + الأماكن القريبة منه تظهر فوق الخريطة
on('ui:place', p => {
  if (!p.mine) { setDestination(p); flyTo(p.lng, p.lat, Math.max(map.getZoom(), 16), 58); highlightAt(p.lng, p.lat); }
  showPlace(p);
  if (prefs().autoAround && !p.cat && !p.mine) emit('ui:around', p);
});
on('ui:around', async p => {
  try {
    const list = await fetchAround(p.lng, p.lat, 900);
    if (list.length) showPois(list, q => emit('ui:place', q), { labels: false });
  } catch (e) { if (e.name !== 'AbortError') console.warn(e); }
});
on('ui:around-clear', () => { clearPois(); clearHighlight(); });
on('ui:start-from', p => { state.start = p; toast(`نقطة البداية: ${p.name}`); });
on('ui:nearby', ({ cat, at }) => {
  const c = category(cat);
  const from = at || (state.pos ? { lng: state.pos.lng, lat: state.pos.lat } : { lng: map.getCenter().lng, lat: map.getCenter().lat });
  if (!at && !state.pos) toast('نبحث حول وسط الخريطة. اضغط زر موقعي حتى نبحث حولك');
  showNearby(c, from);
});
on('ui:province', p => showProvince(p));
on('ui:provinces', showProvinces);
on('ui:offline', p => showOffline(p));
on('ui:settings', showSettings);
on('ui:auth', showAuth);
// أزرار التطبيق: زر الرجوع يسكّر شاشة الدخول، وزر «إنهاء» بالإشعار ينهي الرحلة، ورسالة نقص الصوت العربي
window.__back = () => { const a = document.getElementById('auth'); if (a && !a.hidden) { a.hidden = true; a.replaceChildren(); return true; } return false; };
window.__endTrip = () => emit('ui:endnav');
window.__ttsMissing = () => toast('ما لقينا صوت عربي بجهازك. من إعدادات الجهاز ← اللغة ← تحويل النص إلى كلام ← نزّل العربية، حتى تسمع الاتجاهات', 9000);
on('ui:account', showAccount);
restoreSession();
on('ui:trip', showTrip);
on('ui:karbala', showKarbala);
on('ui:trip-go', ({ from, to }) => { state.start = from ? { name: from.name, lng: from.lng, lat: from.lat } : null; emit('ui:route', to); });

// حساب الطريق
on('ui:route', async dest => {
  let from = state.start;
  if (!from) {
    if (!state.pos) {
      const r = await requestLocation();
      if (r.ok) { pushPosition({ lng: r.coords.longitude, lat: r.coords.latitude, heading: 0, speed: 0 }); startGps(); }
    }
    from = state.pos ? { name: 'موقعي', lng: state.pos.lng, lat: state.pos.lat } : null;
  }
  if (!from) { toast('ما قدرنا نحدد موقعك. حدد نقطة البداية من «إنشاء رحلة»', 4500); return; }
  clearPois(); showRouteLoading(dest);
  try {
    const routes = await getRoutes(from, dest);
    const prof = k => vehicle(k).profile;
    if (!routes[prof(state.vehicle)]) state.vehicle = ['car', 'moto', 'bike', 'walk'].find(k => routes[prof(k)]);
    const route = routes[prof(state.vehicle)];
    state.route = route; state.dest = dest;
    drawRoute(route.coords); setDestination(dest);
    overview(route.coords, Math.round(innerHeight * 0.62));
    showRoute(routes, from, dest); startPreview(route, state.vehicle);
  } catch (e) { toast(e.message || 'تعذّر حساب الطريق'); showHome(true); }
});
on('ui:route-chosen', ({ route, key }) => {
  state.route = route; drawRoute(route.coords); startPreview(route, key);
  overview(route.coords, Math.round(innerHeight * 0.62));
});

// بدء الملاحة
const camPitch = () => state.vehicle === 'walk' ? Math.max(prefs().tilt, 68) : prefs().tilt + 2;
const camZoom = () => vehicle(state.vehicle).zoom + (state.vehicle === 'walk' ? 0.4 : 0);
on('ui:start', ({ sim }) => {
  if (!state.route) return;
  stopPreview();
  const c0 = state.route.coords[0];
  // إذا انت مو عند نقطة البداية نمشّي الرحلة تجريبياً
  if (!sim && (!state.pos || dist([state.pos.lng, state.pos.lat], c0) > 150)) { sim = true; toast('أنت مو عند نقطة البداية، رح يتحرك السهم تلقائياً على الطريق بالاتجاهات الصحيحة', 4200); }
  state.navigating = true; following = true;
  nav = new Navigator(state.route, state.vehicle);
  showNav(); keepScreenOn(true); tripStart(state.dest.name, state.route);
  speak(`لنبدأ. ${state.dest.name}`, true);
  if (sim) simulate(state.route);
  else {
    startGps(); if (state.pos) nav.update(state.pos);
    // إذا ما في حركة حقيقية بعد 10 ثواني نحرّك السهم تلقائياً حتى تشوف الاتجاهات
    const p0 = state.pos && [state.pos.lng, state.pos.lat];
    setTimeout(() => { if (state.navigating && !state.simulating && prefs().autoMove && (!state.pos || (p0 && dist([state.pos.lng, state.pos.lat], p0) < 8))) { toast('ما حسينا بحركة، فعّلنا التحريك التلقائي', 3500); simulate(state.route); } }, 10000);
  }
  const s = sim ? { lng: c0[0], lat: c0[1], heading: 0 } : (state.pos || { lng: c0[0], lat: c0[1], heading: 0 });
  follow({ ...s, heading: s.heading || 0 }, camZoom(), 1400, camPitch());
});
on('position', pos => {
  if (!state.navigating || !nav) return;
  nav.update(pos);
  if (following) follow(pos, camZoom(), state.simulating ? 260 : 900, camPitch());
});
on('nav:progress', p => {
  tripUpdate(p);
  updateNav(p); drawProgress(state.route.coords, p.index, p.point);
  const n = p.next;
  if (n && p.toNext < 260 && n.type !== 'arrive' && n.type !== 'depart' && !(n.type === 'continue' && n.modifier === 'straight')) drawManeuver(state.route.coords, p.cum, p.along + p.toNext);
  else clearManeuver();
});
on('ui:search', showSearch); on('ui:weather', showWeather); on('ui:layers', showLayers); on('ui:shrines', showKarbala);
on('ui:report', () => showReport(t => {
  const pos = state.pos; if (!pos) return toast('ما نعرف موقعك حتى نسجل البلاغ');
  addReport(t.id, pos); toast('شكراً، تم تسجيل البلاغ: ' + t.name, 3000);
}));
on('ui:add-stop', () => showAddStop(async place => {
  try {
    const c0 = state.route.coords[0], from = state.pos ? { lng: state.pos.lng, lat: state.pos.lat } : { lng: c0[0], lat: c0[1] };
    const route = await getRouteVia(from, [place], state.dest, state.vehicle);
    state.route = route; nav = new Navigator(route, state.vehicle); drawRoute(route.coords);
    toast('أضفنا محطة: ' + place.name, 3000);
  } catch (e) { toast(e.message || 'ما قدرنا نضيف المحطة'); }
}));
on('nav:offroute', async pos => {
  if (state.simulating || Date.now() - lastReroute < 10000) return;
  lastReroute = Date.now(); speak('جاري إعادة حساب الطريق', true);
  try { const route = await getRoute(pos, state.dest, state.vehicle); state.route = route; nav = new Navigator(route, state.vehicle); drawRoute(route.coords); }
  catch { toast('ما قدرنا نعيد حساب الطريق'); }
});
on('nav:arrive', () => { tripArrive(); toast('وصلت إلى وجهتك', 4000); setTimeout(() => emit('ui:endnav'), 3500); });
on('ui:nav-overview', () => { following = false; showRecenter(true); overview(state.route.coords, 140); });
on('ui:recenter', () => { following = true; showRecenter(false); if (state.pos) follow(state.pos, camZoom(), 900, camPitch()); });
map.on('dragstart', () => {
  if (state.navigating) { following = false; showRecenter(true); }
  else setMini(true);
});
on('ui:endnav', () => {
  stopSimulation(); stopVoice();
  state.navigating = false; nav = null; state.start = null;
  hideNav(); clearRoute(); clearPadding(); keepScreenOn(false); tripEnd();
  map.easeTo({ pitch: 45, bearing: 0, duration: 800 });
  showHome(true);
});
