import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Section, useLang } from '../components/ui'
import { useAuth } from '../lib/auth'
import { insert, list, remove, update, type Row } from '../lib/store'
import { fmtDate } from '../lib/content'
import type { Post } from './Forum'

interface Reply extends Row {
  post_id: string
  user_id: string
  author_name: string
  body: string
  hidden?: boolean
}

export default function ForumPost() {
  const { id } = useParams()
  const { t } = useTranslation()
  const lang = useLang()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [votes, setVotes] = useState<Row[]>([])
  const [body, setBody] = useState('')
  const [notice, setNotice] = useState('')

  async function load() {
    if (!id) return
    const [ps, rs, vs] = await Promise.all([
      list<Post>('forum_posts', { eq: { id } }),
      list<Reply>('forum_replies', { eq: { post_id: id }, order: 'created_at', ascending: true }),
      list('forum_votes', { eq: { post_id: id } }),
    ])
    setPost(ps[0] ?? null)
    setReplies(rs)
    setVotes(vs)
  }
  useEffect(() => {
    void load().catch(() => undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (!post) {
    return (
      <Section>
        <Link to="/forum" className="underline">
          ← {t('forum.title')}
        </Link>
      </Section>
    )
  }

  const myVote = votes.find((v) => v.user_id === user?.id)
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  async function report(type: string, targetId: string) {
    await insert('reports', { target_type: type, target_id: targetId, user_id: user?.id ?? null, status: 'new' })
    setNotice(t('forum.reported'))
  }

  return (
    <Section>
      <Link to="/forum" className="underline underline-offset-4 no-print">
        ← {t('forum.title')}
      </Link>
      {notice && <p className="mt-4 rounded-lg bg-orange-pale p-3 font-semibold">{notice}</p>}
      <article className="card p-6 mt-4 border-l-8 !border-l-orange">
        <p className="text-sm font-semibold text-orange-deep">{t(`forum.topics.${post.topic}`)}</p>
        <h1 className="text-3xl font-bold mt-1 normal-case">{post.title}</h1>
        <p className="text-sm text-coal/60 mt-1">
          {post.author_name} · {post.created_at ? fmtDate(post.created_at, lang) : ''}
        </p>
        {post.hidden ? <p className="mt-4 italic">{t('forum.hidden')}</p> : <p className="mt-4 text-lg whitespace-pre-wrap">{post.body}</p>}
        <div className="mt-4 flex flex-wrap gap-2 no-print">
          <button
            type="button"
            className={`btn ${myVote ? 'btn-primary' : 'btn-outline'}`}
            disabled={!user}
            onClick={async () => {
              if (!user) return
              if (myVote) await remove('forum_votes', myVote.id)
              else await insert('forum_votes', { post_id: post.id, user_id: user.id })
              await load()
            }}
          >
            👍 {t('forum.upvote')} ({votes.length})
          </button>
          <button type="button" className="btn btn-outline" onClick={() => void report('post', post.id)}>
            ⚑ {t('forum.report')}
          </button>
          <a className="btn btn-outline" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">
            Facebook
          </a>
          <a className="btn btn-outline" href={`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + shareUrl)}`} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          {user?.isAdmin && (
            <button
              type="button"
              className="btn btn-dark"
              onClick={async () => {
                await update('forum_posts', post.id, { hidden: !post.hidden })
                await load()
              }}
            >
              {post.hidden ? '👁' : '🚫'}
            </button>
          )}
        </div>
      </article>

      <h2 className="text-2xl font-bold mt-8 mb-3">
        {replies.length} {t('forum.replies')}
      </h2>
      <ul className="space-y-3">
        {replies
          .filter((r) => !r.hidden || user?.isAdmin)
          .map((r) => (
            <li key={r.id} className={`card p-4 ${r.hidden ? 'opacity-50' : ''}`}>
              <p className="text-sm text-coal/60">
                {r.author_name} · {r.created_at ? fmtDate(r.created_at, lang) : ''}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{r.hidden ? t('forum.hidden') : r.body}</p>
              <div className="mt-2 flex gap-3 text-sm no-print">
                <button type="button" className="underline" onClick={() => void report('reply', r.id)}>
                  {t('forum.report')}
                </button>
                {user?.isAdmin && (
                  <button
                    type="button"
                    className="underline"
                    onClick={async () => {
                      await update('forum_replies', r.id, { hidden: !r.hidden })
                      await load()
                    }}
                  >
                    {r.hidden ? t('admin.show') : t('admin.hide')}
                  </button>
                )}
              </div>
            </li>
          ))}
      </ul>

      {user ? (
        <form
          className="card p-5 mt-6 space-y-3 no-print"
          onSubmit={async (e) => {
            e.preventDefault()
            await insert('forum_replies', { post_id: post.id, user_id: user.id, author_name: user.name, body, hidden: false })
            setBody('')
            await load()
          }}
        >
          <label className="block">
            <span className="label">{t('forum.reply')}</span>
            <textarea required maxLength={5000} className="field min-h-28" value={body} onChange={(e) => setBody(e.target.value)} />
          </label>
          <button className="btn btn-primary">{t('forum.reply')}</button>
        </form>
      ) : (
        <Link to="/account" className="btn btn-outline mt-6">
          {t('forum.loginToPost')}
        </Link>
      )}
    </Section>
  )
}
