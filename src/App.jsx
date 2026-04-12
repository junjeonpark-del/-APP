import { useEffect, useRef, useState } from 'react'
import './App.css'
const API_BASE_URL = 'https://baby-app-api.onrender.com'

function BackHeader({ tag, title, avatarText, onBack }) {
  return (
    <header className="top-bar">
      <div className="top-left-wrap">
        {onBack && (
          <button className="back-btn" onClick={onBack}>
            ←
          </button>
        )}
        <div>
          <p className="small-text">{tag}</p>
          <h1>{title}</h1>
        </div>
      </div>
      <div className="avatar">{avatarText}</div>
    </header>
  )
}

function AuthPage({ onLogin, onRegister }) {
  const [mode, setMode] = useState('login')
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [message, setMessage] = useState('')

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginForm({ ...loginForm, [name]: value })
  }

  const handleRegisterChange = (e) => {
    const { name, value } = e.target
    setRegisterForm({ ...registerForm, [name]: value })
  }

  const handleRegister = () => {
    if (
      !registerForm.name ||
      !registerForm.email ||
      !registerForm.password ||
      !registerForm.confirmPassword
    ) {
      setMessage('请先把注册信息填写完整')
      return
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setMessage('两次输入的密码不一致')
      return
    }

    const result = onRegister({
      name: registerForm.name,
      email: registerForm.email,
      password: registerForm.password,
    })

    if (!result.success) {
      setMessage(result.message)
      return
    }

    setMessage('注册成功，请登录')
    setMode('login')
    setLoginForm({ email: registerForm.email, password: '' })
    setRegisterForm({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    })
  }

  const handleLogin = () => {
    if (!loginForm.email || !loginForm.password) {
      setMessage('请输入邮箱和密码')
      return
    }

    const result = onLogin(loginForm)
    if (!result.success) {
      setMessage(result.message)
    } else {
      setMessage('')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <p className="auth-tag">AI母婴陪伴平台</p>
          <h1>{mode === 'login' ? '欢迎登录' : '创建账号'}</h1>
          <p className="auth-desc">
            保存宝宝档案、已克隆声音、故事记录与个性化设置
          </p>
        </div>

        <div className="auth-switch">
          <button
            className={mode === 'login' ? 'switch-btn active' : 'switch-btn'}
            onClick={() => {
              setMode('login')
              setMessage('')
            }}
          >
            登录
          </button>
          <button
            className={mode === 'register' ? 'switch-btn active' : 'switch-btn'}
            onClick={() => {
              setMode('register')
              setMessage('')
            }}
          >
            注册
          </button>
        </div>

        {mode === 'login' && (
          <div className="auth-form">
            <label>邮箱</label>
            <input
              type="email"
              name="email"
              placeholder="请输入邮箱"
              value={loginForm.email}
              onChange={handleLoginChange}
            />
            <label>密码</label>
            <input
              type="password"
              name="password"
              placeholder="请输入密码"
              value={loginForm.password}
              onChange={handleLoginChange}
            />
            {message && <p className="auth-message">{message}</p>}
            <button className="auth-main-btn" onClick={handleLogin}>
              登录进入
            </button>
          </div>
        )}

        {mode === 'register' && (
          <div className="auth-form">
            <label>昵称</label>
            <input
              type="text"
              name="name"
              placeholder="请输入昵称"
              value={registerForm.name}
              onChange={handleRegisterChange}
            />
            <label>邮箱</label>
            <input
              type="email"
              name="email"
              placeholder="请输入邮箱"
              value={registerForm.email}
              onChange={handleRegisterChange}
            />
            <label>密码</label>
            <input
              type="password"
              name="password"
              placeholder="请输入密码"
              value={registerForm.password}
              onChange={handleRegisterChange}
            />
            <label>确认密码</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="请再次输入密码"
              value={registerForm.confirmPassword}
              onChange={handleRegisterChange}
            />
            {message && <p className="auth-message">{message}</p>}
            <button className="auth-main-btn" onClick={handleRegister}>
              注册账号
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function HomePage({ goToProfile, profile, goToContent, currentUser }) {
  return (
    <>
      <header className="top-bar">
        <div>
          <p className="small-text">AI母婴陪伴</p>
          <h1>安心孕育，温柔陪伴</h1>
          <p className="welcome-user">欢迎你，{currentUser.name}</p>
        </div>
        <div className="avatar" onClick={goToProfile}>
          妈
        </div>
      </header>

      <section className="banner">
        <div className="banner-text">
          <p className="banner-tag">今日推荐</p>
          <h2>
            {profile.age === '孕期'
              ? '孕晚期舒缓胎教内容'
              : `${profile.nickname}的晚安陪伴内容`}
          </h2>
          <p>
            {profile.language}内容推荐 · 偏{profile.style}风格 · 默认使用
            {profile.voice}
          </p>
        </div>
      </section>

      <section className="menu-grid">
        <div className="menu-card" onClick={goToContent}>
          <div className="icon">🤰</div>
          <h3>胎教内容</h3>
          <p>按孕周生成</p>
        </div>
        <div className="menu-card" onClick={goToContent}>
          <div className="icon">🌙</div>
          <h3>睡前故事</h3>
          <p>温柔晚安故事</p>
        </div>
        <div className="menu-card" onClick={goToContent}>
          <div className="icon">🎨</div>
          <h3>故事配图</h3>
          <p>自动生成插图</p>
        </div>
        <div className="menu-card" onClick={goToProfile}>
          <div className="icon">🎤</div>
          <h3>声音管理</h3>
          <p>保存克隆声音</p>
        </div>
      </section>
    </>
  )
}

function ContentPage() {
  const contentList = [
    {
      title: '孕晚期舒缓胎教',
      desc: '适合晚上安静收听，帮助妈妈放松情绪',
      tag: '胎教内容',
      icon: '🤰',
    },
    {
      title: '小月亮晚安故事',
      desc: '适合 2-4 岁，温柔陪伴入睡',
      tag: '睡前故事',
      icon: '🌙',
    },
    {
      title: '森林小熊插图故事',
      desc: '故事配图模式，提升孩子想象体验',
      tag: '故事配图',
      icon: '🎨',
    },
  ]

  return (
    <>
      <BackHeader tag="内容中心" title="精选内容" avatarText="内" />
      <section className="content-tabs">
        <div className="content-tab active">全部</div>
        <div className="content-tab">胎教</div>
        <div className="content-tab">故事</div>
        <div className="content-tab">音频</div>
      </section>

      <section className="content-list">
        {contentList.map((item, index) => (
          <div className="content-item" key={index}>
            <div className="content-left">
              <div className="content-icon">{item.icon}</div>
              <div>
                <p className="content-tag">{item.tag}</p>
                <h3>{item.title}</h3>
                <p className="content-desc">{item.desc}</p>
              </div>
            </div>
            <button className="play-btn">播放</button>
          </div>
        ))}
      </section>
    </>
  )
}

function StoryHistoryPage({ storyHistory, onDeleteStory, onOpenStory, onBack }) {
  return (
    <>
      <BackHeader
        tag="生成记录"
        title="全部记录"
        avatarText="记"
        onBack={onBack}
      />

      <section className="history-page-scroll">
        <section className="history-list">
          {storyHistory.length === 0 ? (
            <div className="history-empty">还没有生成记录</div>
          ) : (
            storyHistory.map((item) => (
              <div className="history-card" key={item.id}>
                <div className="history-top">
                  <span className="history-label">{item.label}</span>
                  <span className="history-time">{item.createdAt}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.meta}</p>

                <div className="history-actions">
                  <button
                    className="history-view-btn"
                    onClick={() => onOpenStory(item)}
                  >
                    查看
                  </button>
                  <button
                    className="history-delete-btn"
                    onClick={() => onDeleteStory(item.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </section>
    </>
  )
}

function StoryDetailPage({ selectedStory, onBack }) {
  if (!selectedStory) return null

  return (
    <>
      <BackHeader
        tag="故事详情"
        title="完整内容"
        avatarText="详"
        onBack={onBack}
      />

      <section className="story-card">
        <div className="story-top">
          <span className="story-label">{selectedStory.label}</span>
          <span className="story-meta">{selectedStory.createdAt}</span>
        </div>

        <h3 className="story-title">{selectedStory.title}</h3>

        <div className="story-content">
          {selectedStory.content.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {selectedStory.imageUrls?.length > 0 && (
          <div className="images-grid">
            {selectedStory.imageUrls.map((url, index) => (
              <div className="image-result-box" key={index}>
                <img src={url} alt={`${selectedStory.title}-${index + 1}`} />
              </div>
            ))}
          </div>
        )}

        {selectedStory.audioUrl && (
          <audio controls className="audio-player" src={selectedStory.audioUrl}>
            您的浏览器不支持音频播放
          </audio>
        )}
      </section>
    </>
  )
}

function VoiceManagerPage({
  voices,
  profile,
  setProfile,
  onSaveVoices,
  onBack,
}) {
  const [voiceName, setVoiceName] = useState('')
  const [audioFile, setAudioFile] = useState(null)
  const [cloneLoading, setCloneLoading] = useState(false)
  const [cloneMessage, setCloneMessage] = useState('')
  const fileInputRef = useRef(null)

  const handleCloneVoice = async () => {
    if (!voiceName.trim()) {
      setCloneMessage('请先输入声音名称')
      return
    }

    if (!audioFile) {
      setCloneMessage('请先选择音频文件')
      return
    }

    try {
      setCloneLoading(true)
      setCloneMessage('')

      const formData = new FormData()
      formData.append('voiceName', voiceName)
      formData.append('description', 'User uploaded clone voice')
      formData.append('audio', audioFile)

      const response = await fetch('http://localhost:3001/api/clone-voice', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || '声音克隆失败')
      }

      const newVoice = {
        ...data.voice,
        isDefault: voices.length === 0,
      }

      const nextVoices = voices.length >= 5 ? [...voices.slice(0, 4), newVoice] : [newVoice, ...voices]
      onSaveVoices(nextVoices)

      if (voices.length === 0) {
        setProfile({
          ...profile,
          voice: newVoice.name,
          defaultVoiceId: newVoice.voiceId,
        })
      }

      setVoiceName('')
      setAudioFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setCloneMessage('声音克隆成功，已保存到声音管理')
    } catch (error) {
      setCloneMessage(error.message || '声音克隆失败')
    } finally {
      setCloneLoading(false)
    }
  }

  const handleDeleteVoice = (voiceId) => {
    const filtered = voices.filter((item) => item.voiceId !== voiceId)
    onSaveVoices(filtered)

    if (profile.defaultVoiceId === voiceId) {
      const nextDefault = filtered[0]
      setProfile({
        ...profile,
        voice: nextDefault ? nextDefault.name : '未设置',
        defaultVoiceId: nextDefault ? nextDefault.voiceId : '',
      })
    }
  }

  const handleSetDefaultVoice = (voice) => {
    const updated = voices.map((item) => ({
      ...item,
      isDefault: item.voiceId === voice.voiceId,
    }))
    onSaveVoices(updated)

    setProfile({
      ...profile,
      voice: voice.name,
      defaultVoiceId: voice.voiceId,
    })
  }

  return (
    <>
      <BackHeader
        tag="声音管理"
        title="我的声音"
        avatarText="音"
        onBack={onBack}
      />

      <section className="voice-form-card">
        <p className="voice-consent-text">
          仅限上传本人或已获得明确授权的声音样本。
        </p>

        <label>声音名称</label>
        <input
          type="text"
          value={voiceName}
          placeholder="例如：妈妈声音 / 爸爸声音"
          onChange={(e) => setVoiceName(e.target.value)}
        />

        <label>上传音频样本</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
        />

        <button className="generate-btn" onClick={handleCloneVoice}>
          {cloneLoading ? '克隆中...' : '上传并克隆声音'}
        </button>

        {cloneMessage && <p className="api-error-text">{cloneMessage}</p>}
      </section>

      <section className="profile-section">
        <div className="section-title">
          <h2>已保存声音</h2>
        </div>

        <div className="voice-list">
          {voices.length === 0 ? (
            <div className="history-empty">还没有保存的声音</div>
          ) : (
            voices.map((voice) => (
              <div className="voice-card" key={voice.voiceId}>
                <div className="voice-card-top">
                  <div>
                    <h3>{voice.name}</h3>
                    <p>{voice.createdAt}</p>
                  </div>
                  {profile.defaultVoiceId === voice.voiceId && (
                    <span className="default-badge">默认</span>
                  )}
                </div>

                <div className="voice-actions">
                  <button
                    className="history-view-btn"
                    onClick={() => handleSetDefaultVoice(voice)}
                  >
                    设为默认
                  </button>
                  <button
                    className="history-delete-btn"
                    onClick={() => handleDeleteVoice(voice.voiceId)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  )
}

function GeneratePage({ profile, onSaveStory }) {
  const [formData, setFormData] = useState({
    type: '睡前故事',
    style: profile.style,
    language: profile.language,
    topic: '',
    duration: '5',
  })

  const [result, setResult] = useState(null)
  const [loadingStory, setLoadingStory] = useState(false)
  const [loadingImages, setLoadingImages] = useState(false)
  const [loadingAudio, setLoadingAudio] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      style: profile.style,
      language: profile.language,
    }))
  }, [profile.style, profile.language])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleGenerateStory = async () => {
    try {
      setLoadingStory(true)
      setErrorMessage('')

      const response = await fetch('http://localhost:3001/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          profile,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || '故事生成失败')
      }

      setResult(data.story)
      onSaveStory(data.story)
    } catch (error) {
      setErrorMessage(error.message || '故事生成失败')
    } finally {
      setLoadingStory(false)
    }
  }

  const handleGenerateImages = async () => {
    if (!result) return

    try {
      setLoadingImages(true)
      setErrorMessage('')

      const response = await fetch(
        'http://localhost:3001/api/generate-images',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ story: result }),
        }
      )

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || '插画生成失败')
      }

      const updatedStory = {
        ...result,
        imageUrls: data.imageUrls,
      }

      setResult(updatedStory)
      onSaveStory(updatedStory)
    } catch (error) {
      setErrorMessage(error.message || '插画生成失败')
    } finally {
      setLoadingImages(false)
    }
  }

  const handleGenerateClonedAudio = async () => {
    if (!result) return

    if (!profile.defaultVoiceId) {
      setErrorMessage('请先到“我的→声音管理”里设置默认声音')
      return
    }

    try {
      setLoadingAudio(true)
      setErrorMessage('')

      const response = await fetch(
        'http://localhost:3001/api/generate-cloned-audio',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            voiceId: profile.defaultVoiceId,
            text: `${result.title}\n\n${result.content}`,
          }),
        }
      )

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || '克隆声音朗读失败')
      }

      const updatedStory = {
        ...result,
        audioUrl: data.audioUrl,
      }

      setResult(updatedStory)
      onSaveStory(updatedStory)
    } catch (error) {
      setErrorMessage(error.message || '克隆声音朗读失败')
    } finally {
      setLoadingAudio(false)
    }
  }

  return (
    <>
      <BackHeader tag="AI生成" title="内容生成" avatarText="生" />

      <section className="generate-card">
        <label>内容类型</label>
        <select name="type" value={formData.type} onChange={handleChange}>
          <option>睡前故事</option>
          <option>胎教内容</option>
          <option>声音陪伴</option>
          <option>故事配图</option>
        </select>

        <label>风格</label>
        <select name="style" value={formData.style} onChange={handleChange}>
          <option>温柔安抚</option>
          <option>童话幻想</option>
          <option>启蒙陪伴</option>
        </select>

        <label>语言</label>
        <select
          name="language"
          value={formData.language}
          onChange={handleChange}
        >
          <option>中文</option>
          <option>韩语</option>
          <option>英文</option>
        </select>

        <label>预计朗读时长</label>
        <select
          name="duration"
          value={formData.duration}
          onChange={handleChange}
        >
          <option value="3">3分钟</option>
          <option value="5">5分钟</option>
          <option value="8">8分钟</option>
          <option value="10">10分钟</option>
          <option value="15">15分钟</option>
        </select>

        <label>主题关键词</label>
        <input
          type="text"
          name="topic"
          placeholder="例如：月亮、森林、小熊、勇敢"
          value={formData.topic}
          onChange={handleChange}
        />

        <button className="generate-btn" onClick={handleGenerateStory}>
          {loadingStory ? '故事生成中...' : '生成故事'}
        </button>

        {errorMessage && <p className="api-error-text">{errorMessage}</p>}
      </section>

      {result && (
        <section className="generate-result">
          <div className="section-title">
            <h2>生成结果</h2>
          </div>

          <div className="story-card">
            <div className="story-top">
              <span className="story-label">{result.label}</span>
              <span className="story-meta">{result.meta}</span>
            </div>

            <h3 className="story-title">{result.title}</h3>

            <div className="story-content">
              {result.content.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {result.imageUrls?.length > 0 && (
              <div className="images-grid">
                {result.imageUrls.map((url, index) => (
                  <div className="image-result-box" key={index}>
                    <img src={url} alt={`${result.title}-${index + 1}`} />
                  </div>
                ))}
              </div>
            )}

            {result.audioUrl && (
              <audio controls className="audio-player" src={result.audioUrl}>
                您的浏览器不支持音频播放
              </audio>
            )}

            <div className="story-actions">
              <button className="story-main-btn" onClick={handleGenerateClonedAudio}>
                {loadingAudio ? '朗读生成中...' : '用默认声音朗读'}
              </button>
              <button className="story-sub-btn" onClick={handleGenerateStory}>
                重新生成故事
              </button>
              <button className="story-sub-btn" onClick={handleGenerateImages}>
                {loadingImages ? '插画生成中...' : '生成3张插画'}
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  )
}

function ProfilePage({
  profile,
  setProfile,
  currentUser,
  onLogout,
  storyHistory,
  goToHistory,
  onOpenStory,
  goToVoices,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(profile)

  useEffect(() => {
    setFormData(profile)
  }, [profile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSave = () => {
    setProfile(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData(profile)
    setIsEditing(false)
  }

  const recentStories = storyHistory.slice(0, 2)

  return (
    <>
      <header className="top-bar">
        <div>
          <p className="small-text">我的</p>
          <h1>宝宝档案</h1>
          <p className="welcome-user">{currentUser.email}</p>
        </div>
        <div className="avatar">宝</div>
      </header>

      <section className="profile-card">
        <div className="profile-header">
          <h2>基本信息</h2>
          {!isEditing ? (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              编辑档案
            </button>
          ) : (
            <div className="edit-actions">
              <button className="cancel-btn" onClick={handleCancel}>
                取消
              </button>
              <button className="save-btn" onClick={handleSave}>
                保存
              </button>
            </div>
          )}
        </div>

        {!isEditing ? (
          <>
            <div className="profile-row">
              <span>宝宝昵称</span>
              <strong>{profile.nickname}</strong>
            </div>
            <div className="profile-row">
              <span>年龄</span>
              <strong>{profile.age}</strong>
            </div>
            <div className="profile-row">
              <span>性别</span>
              <strong>{profile.gender}</strong>
            </div>
            <div className="profile-row">
              <span>常用语言</span>
              <strong>{profile.language}</strong>
            </div>
            <div className="profile-row">
              <span>喜欢风格</span>
              <strong>{profile.style}</strong>
            </div>
            <div className="profile-row">
              <span>默认声音</span>
              <strong>{profile.voice || '未设置'}</strong>
            </div>
          </>
        ) : (
          <div className="form-area">
            <label>宝宝昵称</label>
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={handleChange}
            />
            <label>年龄</label>
            <input
              type="text"
              name="age"
              value={formData.age}
              onChange={handleChange}
            />
            <label>性别</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option>女孩</option>
              <option>男孩</option>
              <option>未设置</option>
            </select>
            <label>常用语言</label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
            >
              <option>中文</option>
              <option>韩语</option>
              <option>英文</option>
            </select>
            <label>喜欢风格</label>
            <select
              name="style"
              value={formData.style}
              onChange={handleChange}
            >
              <option>温柔安抚</option>
              <option>童话幻想</option>
              <option>启蒙陪伴</option>
            </select>
          </div>
        )}
      </section>

      <section className="profile-section">
        <div className="section-title">
          <h2>最近生成</h2>
          <button className="view-all-btn" onClick={goToHistory}>
            查看全部
          </button>
        </div>

        <div className="history-list">
          {recentStories.length === 0 ? (
            <div className="history-empty">还没有生成记录</div>
          ) : (
            recentStories.map((item) => (
              <div
                className="history-card history-clickable"
                key={item.id}
                onClick={() => onOpenStory(item)}
              >
                <div className="history-top">
                  <span className="history-label">{item.label}</span>
                  <span className="history-time">{item.createdAt}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.meta}</p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="profile-section">
        <div className="section-title">
          <h2>常用功能</h2>
        </div>

        <div className="profile-menu">
          <div className="profile-menu-item">
            <span>🎵</span>
            <p>我的播放记录</p>
          </div>
          <div className="profile-menu-item">
            <span>⭐</span>
            <p>我的收藏</p>
          </div>
          <div className="profile-menu-item" onClick={goToVoices}>
            <span>🎤</span>
            <p>声音管理</p>
          </div>
          <div className="profile-menu-item">
            <span>⚙️</span>
            <p>系统设置</p>
          </div>
        </div>
      </section>

      <button className="logout-btn" onClick={onLogout}>
        退出登录
      </button>
    </>
  )
}

const DEFAULT_USERS = [
  {
    name: '测试用户',
    email: 'test@example.com',
    password: '123456',
  },
]

const DEFAULT_PROFILE = {
  nickname: '小月亮',
  age: '2岁',
  gender: '女孩',
  language: '中文',
  style: '温柔安抚',
  voice: '未设置',
  defaultVoiceId: '',
}

function App() {
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('baby_app_users')
    return savedUsers ? JSON.parse(savedUsers) : DEFAULT_USERS
  })

  const [currentUser, setCurrentUser] = useState(() => {
    const savedCurrentUser = localStorage.getItem('baby_app_current_user')
    return savedCurrentUser ? JSON.parse(savedCurrentUser) : null
  })

  const [activeTab, setActiveTab] = useState('home')
  const [selectedStory, setSelectedStory] = useState(null)

  const [profile, setProfile] = useState(() => {
    const savedCurrentUser = localStorage.getItem('baby_app_current_user')
    if (!savedCurrentUser) return DEFAULT_PROFILE
    const parsedUser = JSON.parse(savedCurrentUser)
    const savedProfile = localStorage.getItem(
      `baby_app_profile_${parsedUser.email}`
    )
    return savedProfile ? JSON.parse(savedProfile) : DEFAULT_PROFILE
  })

  const [storyHistory, setStoryHistory] = useState(() => {
    const savedCurrentUser = localStorage.getItem('baby_app_current_user')
    if (!savedCurrentUser) return []
    const parsedUser = JSON.parse(savedCurrentUser)
    const savedHistory = localStorage.getItem(
      `baby_app_history_${parsedUser.email}`
    )
    return savedHistory ? JSON.parse(savedHistory) : []
  })

  const [voices, setVoices] = useState(() => {
    const savedCurrentUser = localStorage.getItem('baby_app_current_user')
    if (!savedCurrentUser) return []
    const parsedUser = JSON.parse(savedCurrentUser)
    const savedVoices = localStorage.getItem(
      `baby_app_voices_${parsedUser.email}`
    )
    return savedVoices ? JSON.parse(savedVoices) : []
  })

  useEffect(() => {
    localStorage.setItem('baby_app_users', JSON.stringify(users))
  }, [users])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        'baby_app_current_user',
        JSON.stringify(currentUser)
      )
    } else {
      localStorage.removeItem('baby_app_current_user')
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        `baby_app_profile_${currentUser.email}`,
        JSON.stringify(profile)
      )
    }
  }, [profile, currentUser])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        `baby_app_history_${currentUser.email}`,
        JSON.stringify(storyHistory)
      )
    }
  }, [storyHistory, currentUser])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        `baby_app_voices_${currentUser.email}`,
        JSON.stringify(voices)
      )
    }
  }, [voices, currentUser])

  const handleRegister = (newUser) => {
    const exists = users.some((user) => user.email === newUser.email)
    if (exists) {
      return { success: false, message: '该邮箱已注册' }
    }

    setUsers([...users, newUser])
    localStorage.setItem(
      `baby_app_profile_${newUser.email}`,
      JSON.stringify(DEFAULT_PROFILE)
    )
    localStorage.setItem(
      `baby_app_history_${newUser.email}`,
      JSON.stringify([])
    )
    localStorage.setItem(
      `baby_app_voices_${newUser.email}`,
      JSON.stringify([])
    )

    return { success: true }
  }

  const handleLogin = (loginForm) => {
    const foundUser = users.find(
      (user) =>
        user.email === loginForm.email && user.password === loginForm.password
    )

    if (!foundUser) {
      return { success: false, message: '账号或密码错误' }
    }

    setCurrentUser(foundUser)
    setActiveTab('home')
    setSelectedStory(null)

    const savedProfile = localStorage.getItem(
      `baby_app_profile_${foundUser.email}`
    )
    const savedHistory = localStorage.getItem(
      `baby_app_history_${foundUser.email}`
    )
    const savedVoices = localStorage.getItem(
      `baby_app_voices_${foundUser.email}`
    )

    setProfile(savedProfile ? JSON.parse(savedProfile) : DEFAULT_PROFILE)
    setStoryHistory(savedHistory ? JSON.parse(savedHistory) : [])
    setVoices(savedVoices ? JSON.parse(savedVoices) : [])

    return { success: true }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setActiveTab('home')
    setProfile(DEFAULT_PROFILE)
    setStoryHistory([])
    setVoices([])
    setSelectedStory(null)
  }

  const handleSaveStory = (story) => {
    setStoryHistory((prev) => {
      const exists = prev.find((item) => item.id === story.id)
      if (exists) {
        return prev.map((item) => (item.id === story.id ? story : item))
      }
      return [story, ...prev].slice(0, 20)
    })
  }

  const handleDeleteStory = (storyId) => {
    setStoryHistory((prev) => prev.filter((item) => item.id !== storyId))
    if (selectedStory?.id === storyId) {
      setSelectedStory(null)
      setActiveTab('history')
    }
  }

  const handleOpenStory = (story) => {
    setSelectedStory(story)
    setActiveTab('storyDetail')
  }

  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />
  }

  return (
    <div className="page">
      <div className="phone-shell">
        {activeTab === 'home' && (
          <HomePage
            goToProfile={() => setActiveTab('profile')}
            goToContent={() => setActiveTab('content')}
            profile={profile}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'content' && <ContentPage />}

        {activeTab === 'generate' && (
          <GeneratePage profile={profile} onSaveStory={handleSaveStory} />
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            profile={profile}
            setProfile={setProfile}
            currentUser={currentUser}
            onLogout={handleLogout}
            storyHistory={storyHistory}
            goToHistory={() => setActiveTab('history')}
            onOpenStory={handleOpenStory}
            goToVoices={() => setActiveTab('voices')}
          />
        )}

        {activeTab === 'voices' && (
          <VoiceManagerPage
            voices={voices}
            profile={profile}
            setProfile={setProfile}
            onSaveVoices={setVoices}
            onBack={() => setActiveTab('profile')}
          />
        )}

        {activeTab === 'history' && (
          <StoryHistoryPage
            storyHistory={storyHistory}
            onDeleteStory={handleDeleteStory}
            onOpenStory={handleOpenStory}
            onBack={() => setActiveTab('profile')}
          />
        )}

        {activeTab === 'storyDetail' && (
          <StoryDetailPage
            selectedStory={selectedStory}
            onBack={() => setActiveTab('history')}
          />
        )}

        <nav className="bottom-nav">
          <div
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <span>🏠</span>
            <p>首页</p>
          </div>

          <div
            className={`nav-item ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <span>🎵</span>
            <p>内容</p>
          </div>

          <div
            className={`nav-item ${activeTab === 'generate' ? 'active' : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            <span>➕</span>
            <p>生成</p>
          </div>

          <div
            className={`nav-item ${
              ['profile', 'history', 'storyDetail', 'voices'].includes(activeTab)
                ? 'active'
                : ''
            }`}
            onClick={() => setActiveTab('profile')}
          >
            <span>👤</span>
            <p>我的</p>
          </div>
        </nav>
      </div>
    </div>
  )
}

export default App
