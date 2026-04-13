import { useEffect, useRef, useState } from 'react'
import './App.css'

const API_BASE_URL = 'https://baby-app-api.onrender.com'

const SAMPLE_READING_TEXT = `大家好，今天我来读一段用于声音录制的示例文本。
请用自然、平稳、清楚的语速朗读，不要太快，也不要太慢。
清晨的阳光轻轻落在窗边，小鸟在树上安静地歌唱。
花园里的风很温柔，树叶慢慢摇晃，像在和我们打招呼。
一个小朋友抱着自己的小书包，慢慢走过开满花的小路。
他看到一只可爱的小兔子，正在草地上安静地晒太阳。
远处还有一条小河，河水轻轻流动，发出很轻很轻的声音。
天空很蓝，云朵很白，整个世界都显得安静又明亮。
如果你现在正在听这段话，请保持放松，用平常说话的感觉继续朗读。
这样录下来的声音，会更适合后面用来做自然的陪伴朗读。
谢谢你认真完成这段录音，接下来我们就可以继续下一步了。`

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
            保存宝宝档案、声音管理、故事记录与个性化设置
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

function HomePage({ goToProfile, goToGenerate, profile, currentUser }) {
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
              ? '今晚来一段舒缓胎教陪伴'
              : `${profile.nickname}的睡前故事时光`}
          </h2>
          <p>
            {profile.language}内容推荐 · 偏{profile.style}风格 · 默认使用
            {profile.voice || '未设置'}
          </p>
          <button onClick={goToGenerate}>立即生成</button>
        </div>
      </section>

      <section className="menu-grid">
        <div className="menu-card" onClick={goToGenerate}>
          <div className="icon">🌙</div>
          <h3>睡前故事</h3>
          <p>生成可直接朗读的故事</p>
        </div>

        <div className="menu-card" onClick={goToGenerate}>
          <div className="icon">🤰</div>
          <h3>胎教内容</h3>
          <p>按时长生成舒缓内容</p>
        </div>

        <div className="menu-card" onClick={goToProfile}>
          <div className="icon">🎤</div>
          <h3>声音管理</h3>
          <p>上传或录制声音样本</p>
        </div>

        <div className="menu-card" onClick={goToProfile}>
          <div className="icon">📚</div>
          <h3>生成记录</h3>
          <p>查看最近故事历史</p>
        </div>
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
  const [recordedBlob, setRecordedBlob] = useState(null)
  const [recording, setRecording] = useState(false)
  const [cloneLoading, setCloneLoading] = useState(false)
  const [cloneMessage, setCloneMessage] = useState('')
  const [recordSeconds, setRecordSeconds] = useState(0)

  const fileInputRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const resetSelectedAudio = () => {
    setAudioFile(null)
    setRecordedBlob(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const startRecording = async () => {
    try {
      setCloneMessage('')
      resetSelectedAudio()

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCloneMessage('当前浏览器不支持录音')
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)

      chunksRef.current = []
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })

        if (blob.size > 11 * 1024 * 1024) {
          setRecordedBlob(null)
          setCloneMessage('录音文件超过 11MB，请缩短录音时长后重试')
        } else {
          setRecordedBlob(blob)
          setCloneMessage('录音已完成，可直接用于克隆声音')
        }

        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setRecording(true)
      setRecordSeconds(0)

      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      setCloneMessage('录音启动失败，请检查麦克风权限')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null
    setRecordedBlob(null)

    if (file && file.size > 11 * 1024 * 1024) {
      setAudioFile(null)
      setCloneMessage('上传文件超过 11MB，请更换更小的音频文件')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setCloneMessage('')
    setAudioFile(file)
  }

  const handleCloneVoice = async () => {
    if (!voiceName.trim()) {
      setCloneMessage('请先输入声音名称')
      return
    }

    const selectedAudio = audioFile || recordedBlob

    if (!selectedAudio) {
      setCloneMessage('请先上传音频或录制音频')
      return
    }

    try {
      setCloneLoading(true)
      setCloneMessage('')

      const formData = new FormData()
      formData.append('voiceName', voiceName)
      formData.append('description', 'User uploaded clone voice')

      if (audioFile) {
        formData.append('audio', audioFile)
        formData.append('sourceType', 'upload')
      } else {
        formData.append(
          'audio',
          new File([recordedBlob], 'recorded-sample.webm', {
            type: 'audio/webm',
          })
        )
        formData.append('sourceType', 'record')
      }

      const response = await fetch(`${API_BASE_URL}/api/clone-voice`, {
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

      const nextVoices =
        voices.length >= 5 ? [newVoice, ...voices.slice(0, 4)] : [newVoice, ...voices]

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
      setRecordedBlob(null)
      setRecordSeconds(0)
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
          仅限上传本人或已获得明确授权的声音样本。免费 Web Service
          的音频建议控制在 11MB 以内。
        </p>

        <label>声音名称</label>
        <input
          type="text"
          value={voiceName}
          placeholder="例如：妈妈声音 / 爸爸声音"
          onChange={(e) => setVoiceName(e.target.value)}
        />

        <label>方式一：上传音频</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
        />

        <label>方式二：浏览器录音</label>
        <div className="record-actions">
          {!recording ? (
            <button className="history-view-btn" onClick={startRecording}>
              开始录音
            </button>
          ) : (
            <button className="history-delete-btn" onClick={stopRecording}>
              停止录音（已录 {recordSeconds} 秒）
            </button>
          )}
        </div>

        <div className="record-text-box">
          <p className="record-text-title">建议朗读文本（约 1 分钟）</p>
          <p className="record-text-content">{SAMPLE_READING_TEXT}</p>
        </div>

        <button className="generate-btn" onClick={handleCloneVoice}>
          {cloneLoading ? '克隆中...' : '保存并克隆声音'}
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

      const response = await fetch(`${API_BASE_URL}/api/generate-story`, {
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

  const handleGenerateClonedAudio = async () => {
    if (!result) return

    if (!profile.defaultVoiceId) {
      setErrorMessage('请先到“我的 → 声音管理”里设置默认声音')
      return
    }

    try {
      setLoadingAudio(true)
      setErrorMessage('')

      const response = await fetch(
        `${API_BASE_URL}/api/generate-cloned-audio`,
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
          <div className="profile-menu-item" onClick={goToVoices}>
            <span>🎤</span>
            <p>声音管理</p>
          </div>
          <div className="profile-menu-item" onClick={goToHistory}>
            <span>📚</span>
            <p>生成记录</p>
          </div>
          <div className="profile-menu-item">
            <span>⭐</span>
            <p>我的收藏</p>
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
            goToGenerate={() => setActiveTab('generate')}
            profile={profile}
            currentUser={currentUser}
          />
        )}

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
            className={`nav-item ${activeTab === 'generate' ? 'active' : ''}`}
            onClick={() => setActiveTab('generate')}
          >
            <span>➕</span>
            <p>生成</p>
          </div>

          <div
            className={`nav-item ${
              ['profile', 'voices', 'history', 'storyDetail'].includes(activeTab)
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
