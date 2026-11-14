import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { PageHeader, Section, useLang } from '../components/ui'
import { displayName, fmtDate, t3, useEvents, usePlaces, useProgrammes } from '../lib/content'
import type { Place } from '../data/places'

function pin(bg: string, fg: string, glyph: string, ring = '#0D0D0D') {
  return L.divIcon({
    className: '',
    html: `<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${bg};border:3px solid ${ring};display:grid;place-items:center;box-shadow:0 2px 6px rgba(0,0,0,.4)"><span style="transform:rotate(45deg);color:${fg};font-weight:700;font-size:15px">${glyph}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -30],
  })
}
const ICONS = {
  help: pin('#F47B20', '#0D0D0D', 'i'),
  mineActive: pin('#0D0D0D', '#F47B20', '⛏', '#F47B20'),
  mineClosing: pin('#C85A12', '#fff', '⛏'),
  mineClosed: pin('#8A8A8A', '#fff', '⛏'),
  event: pin('#fff', '#0D0D0D', '★'),
}

function mineIcon(p: Place) {
  return p.mineState === 'active' ? ICONS.mineActive : p.mineState === 'closing' ? ICONS.mineClosing : ICONS.mineClosed
}

export default function MapPage() {
  const { t } = useTranslation()
  const lang = useLang()
  const places = usePlaces()
  const events = useEvents()
  const { programmes } = useProgrammes()
  const [params] = useSearchParams()
  const focus = places.find((p) => p.id === params.get('focus'))
  const [layers, setLayers] = useState({ help: true, mine: true, event: true })
  const today = new Date().toISOString().slice(0, 10)
  const eventsWithPlace = useMemo(() => events.filter((e) => e.lat && e.lng && e.date >= today), [events, today])
  const shown = places.filter((p) => (p.kind === 'help' ? layers.help : layers.mine))
  const progName = (id: string) => {
    const p = programmes.find((x) => x.id === id)
    return p ? displayName(p, lang) : id
  }

  return (
    <>
      <PageHeader title={t('map.title')} intro={t('map.intro')} />
      <Section>
        <div className="mb-4 flex flex-wrap gap-3">
          {(
            [
              ['help', t('map.help'), 'bg-orange'],
              ['mine', t('map.mines'), 'bg-coal'],
              ['event', t('map.events'), 'bg-white border-2 border-coal'],
            ] as const
          ).map(([k, label, dot]) => (
            <label key={k} className="flex items-center gap-2 rounded-full border-2 border-coal/20 bg-white px-4 py-2 text-lg font-semibold cursor-pointer">
              <input type="checkbox" className="h-5 w-5 accent-[#F47B20]" checked={layers[k]} onChange={(e) => setLayers({ ...layers, [k]: e.target.checked })} />
              <span className={`inline-block h-4 w-4 rounded-full ${dot}`} aria-hidden="true" />
              {label}
            </label>
          ))}
          <span className="flex items-center gap-3 text-sm text-coal/70">
            <span>⛏ {t('map.active')}</span>
            <span className="text-orange-deep">⛏ {t('map.closing')}</span>
            <span className="text-stone">⛏ {t('map.closed')}</span>
          </span>
        </div>
        <div className="h-[65vh] min-h-[420px] overflow-hidden rounded-2xl border-4 border-coal">
          <MapContainer
            center={focus ? [focus.lat, focus.lng] : [49.98, 18.75]}
            zoom={focus ? 13 : 9}
            scrollWheelZoom
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {shown.map((p) => (
              <Marker key={p.id} position={[p.lat, p.lng]} icon={p.kind === 'help' ? ICONS.help : mineIcon(p)}>
                <Popup>
                  <strong>{p.name}</strong>
                  {p.address && <div>{p.address}</div>}
                  {p.phone && <div>☎ {p.phone}</div>}
                  {p.email && <div>{p.email}</div>}
                  {p.note && <div style={{ marginTop: 6 }}>{t3(p.note, lang)}</div>}
                  {p.programmeIds?.length ? (
                    <div style={{ marginTop: 6 }}>
                      {p.programmeIds.map((id) => (
                        <div key={id}>
                          <Link to={`/programmes/${id}`}>{progName(id)}</Link>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {p.approx && <div style={{ marginTop: 6, color: '#666', fontSize: 12 }}>{t('common.approx')}</div>}
                </Popup>
              </Marker>
            ))}
            {layers.event &&
              eventsWithPlace.map((e) => (
                <Marker key={e.id} position={[e.lat!, e.lng!]} icon={ICONS.event}>
                  <Popup>
                    <strong>{e.dateLabel ? t3(e.dateLabel, lang) : fmtDate(e.date, lang)}</strong>
                    <div>{t3(e.title, lang)}</div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>
      </Section>
      <Section title={t('map.list')}>
        <div className="grid gap-3 md:grid-cols-2">
          {shown.map((p) => (
            <div key={p.id} id={p.id} className={`card p-4 ${focus?.id === p.id ? 'border-4 !border-orange' : ''}`}>
              <p className="font-bold">
                {p.kind === 'help' ? 'ⓘ' : '⛏'} {p.name}
              </p>
              {p.address && <p>{p.address}</p>}
              {p.phone && <p>☎ {p.phone}</p>}
              {p.note && <p className="text-coal/80">{t3(p.note, lang)}</p>}
            </div>
          ))}
        </div>
      </Section>
    </>
  )
}
