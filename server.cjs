const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const multer = require('multer')
const OpenAI = require('openai')

dotenv.config()

const app = express()
const port = process.env.PORT || 3001
const upload = multer({ storage: multer.memoryStorage() })

app.use(cors())
app.use(express.json({ limit: '20mb' }))

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

function numberToChinese(num) {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']

  if (num < 10) return digits[num]
  if (num === 10) return '十'
  if (num < 20) return `十${digits[num % 10]}`
  if (num < 100) {
    const tens = Math.floor(num / 10)
    const ones = num % 10
    return ones === 0 ? `${digits[tens]}十` : `${digits[tens]}十${digits[ones]}`
  }

  return String(num)
    .split('')
    .map((d) => digits[Number(d)] || d)
    .join('')
}

function yearToChinese(yearStr) {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  return String(yearStr)
    .split('')
    .map((d) => digits[Number(d)] || d)
    .join('')
}

function normalizeChineseForSpeech(text) {
  if (!text) return ''

  let output = text

  output = output.replace(/\bAI\b/gi, 'A I')

  output = output.replace(/(\d{4})年/g, (_, year) => `${yearToChinese(year)}年`)

  output = output.replace(/(\d+)岁/g, (_, age) => {
    const num = Number(age)
    if (num === 2) return '两岁'
    return `${numberToChinese(num)}岁`
  })

  output = output.replace(/(\d+)分钟/g, (_, value) => {
    return `${numberToChinese(Number(value))}分钟`
  })

  output = output.replace(/(\d+)个/g, (_, value) => {
    const num = Number(value)
    if (num === 2) return '两个'
    return `${numberToChinese(num)}个`
  })

  output = output.replace(/(\d+)只/g, (_, value) => {
    const num = Number(value)
    if (num === 2) return '两只'
    return `${numberToChinese(num)}只`
  })

  output = output.replace(/(\d+)本/g, (_, value) => {
    const num = Number(value)
    if (num === 2) return '两本'
    return `${numberToChinese(num)}本`
  })

  output = output.replace(/(\d+)天/g, (_, value) => {
    const num = Number(value)
    if (num === 2) return '两天'
    return `${numberToChinese(num)}天`
  })

  output = output.replace(/(\d+)点(\d+)分/g, (_, h, m) => {
    return `${numberToChinese(Number(h))}点${numberToChinese(Number(m))}分`
  })

  return output
}

function getLengthRule(duration) {
  const minute = Number(duration) || 5

  if (minute <= 3) return '请生成适合约3分钟朗读的内容，中文约450到700字。'
  if (minute <= 5) return '请生成适合约5分钟朗读的内容，中文约800到1200字。'
  if (minute <= 8) return '请生成适合约8分钟朗读的内容，中文约1300到1800字。'
  if (minute <= 10) return '请生成适合约10分钟朗读的内容，中文约1800到2400字。'
  return '请生成适合约15分钟朗读的内容，中文约2600到3600字。'
}

function getVariationPrompt(type, topic) {
  const finalTopic = topic?.trim() || '月亮'

  return `
为了避免故事重复，请你在每次生成时，从下面维度中随机组合，不要总是使用同一套模式：

1. 场景变化：森林、月夜、小镇、花园、海边、云朵世界、星空列车、雨后山谷、安静卧室、童话村庄
2. 陪伴角色变化：小兔子、小熊、小鹿、小猫头鹰、小云朵、小月亮、小星星、小鲸鱼、小狐狸、会说话的风
3. 情节变化：寻找、等待、安慰、勇敢尝试、温柔陪伴、入睡前对话、夜晚散步、完成一个小心愿
4. 情绪变化：安心、好奇、温柔、放松、被陪伴、被理解、平静收尾
5. 结尾变化：自然入睡、轻轻闭眼、月光陪伴、梦境开启、晚安祝福、安静休息

额外要求：
- 不要每次都出现“月亮”“小云朵”“窗边”这种固定套路组合
- 不要机械重复相似句式
- 不要写成模板化鸡汤
- 主题关键词“${finalTopic}”必须自然融入，但不能强行堆砌
- 每次故事都要有明显的新鲜感和画面差异
`.trim()
}

function buildStoryPrompt({ type, style, language, topic, duration, profile }) {
  const nickname = profile?.nickname || '宝宝'
  const age = profile?.age || '2岁'
  const voice = profile?.voice || '默认声音'
  const finalTopic = topic?.trim() || '月亮'
  const lengthRule = getLengthRule(duration)
  const variationRule = getVariationPrompt(type, topic)

  return `
你是一名专业的母婴与亲子故事创作助手，请为儿童陪伴类APP生成高质量、适合朗读的中文内容。

基础信息：
1. 内容类型：${type}
2. 风格：${style}
3. 输出语言：${language}
4. 主题关键词：${finalTopic}
5. 宝宝昵称：${nickname}
6. 宝宝年龄：${age}
7. 默认陪伴声音：${voice}
8. 预计朗读时长：${duration}分钟

长度要求：
${lengthRule}

内容要求：
1. 正文必须分成4到6段
2. 要有完整结构：开头引入、中间发展、温柔收束结尾
3. 必须适合中文自然朗读，句子不要太硬，不要太书面
4. 睡前故事必须温暖、安静、治愈，结尾适合入睡
5. 胎教内容必须舒缓、轻柔、有安抚感
6. 不要输出说教口吻，不要像模板作文
7. 不要输出标题党，不要浮夸
8. 不要使用重复的开头和结尾套路
9. 不要输出任何 JSON 以外的文字

多样性要求：
${variationRule}

请严格返回 JSON，格式如下：
{
  "label": "内容类型",
  "title": "标题",
  "meta": "语言 + 风格 + 默认声音 + 预计时长",
  "content": "正文"
}
`.trim()
}

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'server is running' })
})

app.post('/api/generate-story', async (req, res) => {
  try {
    const { type, style, language, topic, duration, profile } = req.body || {}

    const prompt = buildStoryPrompt({
      type,
      style,
      language,
      topic,
      duration,
      profile,
    })

    const response = await openai.responses.create({
      model: 'gpt-5.4',
      input: prompt,
      text: {
        format: {
          type: 'json_schema',
          name: 'storybook_output',
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              label: { type: 'string' },
              title: { type: 'string' },
              meta: { type: 'string' },
              content: { type: 'string' },
            },
            required: ['label', 'title', 'meta', 'content'],
          },
        },
      },
    })

    const story = JSON.parse(response.output_text)

    res.json({
      success: true,
      story: {
        ...story,
        id: Date.now().toString(),
        createdAt: new Date().toLocaleString(),
      },
    })
  } catch (error) {
    console.error('generate-story error:', error)
    res.status(500).json({
      success: false,
      message: '故事生成失败',
      error: error?.message || 'unknown error',
    })
  }
})

app.post('/api/clone-voice', upload.single('audio'), async (req, res) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: '缺少 ELEVENLABS_API_KEY',
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传音频文件',
      })
    }

    const voiceName = req.body.voiceName?.trim() || `我的声音-${Date.now()}`
    const description =
      req.body.description?.trim() || 'Uploaded from AI baby app'

    const formData = new FormData()
    const blob = new Blob([req.file.buffer], {
      type: req.file.mimetype || 'audio/webm',
    })

    formData.append('name', voiceName)
    formData.append('description', description)
    formData.append('files', blob, req.file.originalname)

    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data?.detail?.message || data?.message || '声音克隆失败',
        raw: data,
      })
    }

    res.json({
      success: true,
      voice: {
        id: Date.now().toString(),
        name: voiceName,
        voiceId: data.voice_id,
        createdAt: new Date().toLocaleString(),
        sourceType: req.body.sourceType || 'upload',
        requiresVerification: !!data.requires_verification,
      },
    })
  } catch (error) {
    console.error('clone-voice error:', error)
    res.status(500).json({
      success: false,
      message: '声音克隆失败',
      error: error?.message || 'unknown error',
    })
  }
})

app.post('/api/generate-cloned-audio', async (req, res) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: '缺少 ELEVENLABS_API_KEY',
      })
    }

    const { voiceId, text } = req.body || {}

    if (!voiceId || !text) {
      return res.status(400).json({
        success: false,
        message: '缺少 voiceId 或 text',
      })
    }

    const normalizedText = normalizeChineseForSpeech(text)

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify({
          text: normalizedText,
          model_id: 'eleven_multilingual_v2',
          language_code: 'zh',
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      return res.status(response.status).json({
        success: false,
        message: '克隆声音朗读失败',
        error: errorText,
      })
    }

    const arrayBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(arrayBuffer).toString('base64')

    res.json({
      success: true,
      audioUrl: `data:audio/mpeg;base64,${base64Audio}`,
    })
  } catch (error) {
    console.error('generate-cloned-audio error:', error)
    res.status(500).json({
      success: false,
      message: '克隆声音朗读失败',
      error: error?.message || 'unknown error',
    })
  }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
