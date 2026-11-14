import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Field, PageHeader, Section, useLang } from '../components/ui'
import { useAuth } from '../lib/auth'
import { insert, list, type Row } from '../lib/store'
import { fmtDate } from '../lib/content'

export const TOPICS = ['leaving', 'pension', 'crossborder', 'retraining', 'business', 'family', 'town'] as const

export interface Post extends Row {
  user_id: string
  author_name: string
  topic: string
  title: string
  body: string
  hidden?: boolean
}

export default function Forum() {
  const { t } = useTranslation()
  const lang = useLang()
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [counts, setCounts] = useState<Record<string, { replies: number; votes: number }>>({})
  const [topic, setTopic] = useState('')
  const [writing, setWriting] = useState(false)
  const [f, setF] = useState({ topic: 'leaving', title: '', body: '' })

  async function load() {
    const [ps, rs, vs] = await Promise.all([
      list<Post>('forum_posts', { order: 'created_at' }),
      list('forum_replies'),
      list('forum_votes'),
    ])
    setPosts(ps)
    const c: Record<string, { replies: number; votes: number }> = {}
    for (const p of ps) c[p.id] = { replies: 0, votes: 0 }
    for (const r of rs) if (c[r.post_id as string]) c[r.post_id as string].replies++
    for (const v of vs) if (c[v.post_id as string]) c[v.post_id as string].votes++
    setCounts(c)
  }
  useEffect(() => {
    void load().catch(() => undefined)
  }, [])

  const shown = posts.filter((p) => !p.hidden || user?.isAdmin).filter((p) => !topic || p.topic === topic)

  return (
    <>
      <PageHeader title={t('forum.title')} intro={t('forum.intro')} />
      <Section>
        <div className="flex flex-wrap gap-2 mb-6">
          <button type="button" onClick={() => setTopic('')} className={`rounded-full px-4 py-2 font-semibold border-2 ${!topic ? 'bg-orange border-orange' : 'border-coal/20 bg-white'}`}>
            {t('common.all')}
          </button>
          {TOPICS.map((x) => (
            <button key={x} type="button" onClick={() => setTopic(x)} className={`rounded-full px-4 py-2 font-semibold border-2 ${topic === x ? 'bg-orange border-orange' : 'border-coal/20 bg-white'}`}>
              {t(`forum.topics.${x}`)}
            </button>
          ))}
        </div>

        {user ? (
          writing ? (
            <form
              className="card p-5 space-y-4 mb-6 border-2 !border-orange"
              onSubmit={async (e) => {
                e.preventDefault()
                await insert('forum_posts', { user_id: user.id, author_name: user.name, topic: f.topic, title: f.title, body: f.body, hidden: false, lang })
                setF({ topic: 'leaving', title: '', body: '' })
                setWriting(false)
                await load()
              }}
            >
              <Field label={t('forum.topic')}>
                <select className="field" value={f.topic} onChange={(e) => setF({ ...f, topic: e.target.value })}>
                  {TOPICS.map((x) => (
                    <option key={x} value={x}>
                      {t(`forum.topics.${x}`)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('forum.postTitle')}>
                <input required maxLength={140} className="field" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
              </Field>
              <Field label={t('forum.postBody')}>
                <textarea required maxLength={5000} className="field min-h-36" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
              </Field>
              <div className="flex gap-3">
                <button className="btn btn-primary">{t('forum.publish')}</button>
                <button type="button" className="btn btn-outline" onClick={() => setWriting(false)}>
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          ) : (
            <button type="button" className="btn btn-primary mb-6" onClick={() => setWriting(true)}>
              + {t('forum.newPost')}
            </button>
          )
        ) : (
          <p className="mb-6">
            <Link to="/account" className="btn btn-outline">
              {t('forum.loginToPost')}
            </Link>
          </p>
        )}

        {shown.length === 0 ? (
          <p className="card p-6 text-lg">{t('forum.empty')}</p>
        ) : (
          <ul className="space-y-3">
            {shown.map((p) => (
              <li key={p.id} className={`card p-5 ${p.hidden ? 'opacity-50' : ''}`}>
                <p className="text-sm font-semibold text-orange-deep">{t(`forum.topics.${p.topic}`)}</p>
                <Link to={`/forum/${p.id}`} className="text-xl font-bold hover:underline underline-offset-4">
                  {p.title}
                </Link>
                <p className="mt-1 text-coal/70 line-clamp-2">{p.body}</p>
                <p className="mt-2 text-sm text-coal/60">
                  {p.author_name} · {p.created_at ? fmtDate(p.created_at, lang) : ''} · 💬 {counts[p.id]?.replies ?? 0} {t('forum.replies')} · 👍{' '}
                  {counts[p.id]?.votes ?? 0}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  )
}
