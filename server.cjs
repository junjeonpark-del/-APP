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

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY
const DASHSCOPE_BASE_URL = 'https://dashscope.aliyuncs.com/api/v1'
const QWEN_VC_TARGET_MODEL = 'qwen3-tts-vc-2026-01-22'

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

function getLengthRule(duration, type) {
  const minute = Number(duration) || 5

  if (type === '声音陪伴') {
    if (minute <= 3) return '请生成适合约3分钟朗读的内容，中文约300到500字。'
    if (minute <= 5) return '请生成适合约5分钟朗读的内容，中文约500到800字。'
    if (minute <= 8) return '请生成适合约8分钟朗读的内容，中文约800到1200字。'
    if (minute <= 10) return '请生成适合约10分钟朗读的内容，中文约1200到1600字。'
    return '请生成适合约15分钟朗读的内容，中文约1800到2500字。'
  }

  if (minute <= 3) return '请生成适合约3分钟朗读的内容，中文约450到700字。'
  if (minute <= 5) return '请生成适合约5分钟朗读的内容，中文约800到1200字。'
  if (minute <= 8) return '请生成适合约8分钟朗读的内容，中文约1300到1800字。'
  if (minute <= 10) return '请生成适合约10分钟朗读的内容，中文约1800到2400字。'
  return '请生成适合约15分钟朗读的内容，中文约2600到3600字。'
}

function getClassicReferenceRule(topic) {
  const finalTopic = topic?.trim() || ''

  return `
主题关键词可能是普通词，也可能是经典童话名称，例如：白雪公主、青蛙王子、灰姑娘、小红帽、睡美人等。

处理规则：
1. 如果关键词是经典童话名称，只能把它当作“灵感来源”或“童话气质参考”。
2. 不要直接复述原故事，不要照搬原情节，不要机械改写原著。
3. 要生成一个“受该童话氛围启发的原创内容”。
4. 可以借用气质元素，例如：
   - 白雪公主：森林、公主感、纯真、童话王国、善良温柔
   - 青蛙王子：湖边、王子、童话变身、夜晚陪伴、神秘又温柔
   - 灰姑娘：星光、晚会、温柔愿望、善良成长、梦幻童话
5. 最终内容必须是新的、原创的、适合本APP长期使用的文本。
6. 如果关键词不是经典童话，则自然融入该主题即可。

当前主题关键词：${finalTopic || '未提供'}
`.trim()
}

function getVariationRule(topic, type) {
  const finalTopic = topic?.trim() || '月亮'

  return `
为了避免内容重复，请在每次生成时随机组合不同元素，不要总是重复固定套路。

可变化维度：
1. 场景：森林、花园、云朵世界、安静卧室、月夜小镇、星空列车、湖边、雨后山谷、童话城堡、海边夜色
2. 陪伴对象：小兔子、小熊、小鹿、小鲸鱼、小狐狸、小猫头鹰、小云朵、小星星、月亮姐姐、风精灵
3. 情绪主线：被安慰、被陪伴、慢慢放松、夜晚小冒险、实现小愿望、安静等待、温柔对话、慢慢入睡
4. 结尾方式：自然闭眼、轻轻晚安、梦境开启、月光陪伴、被抱抱、安静休息

额外要求：
- 不要总是出现“窗边、月亮、小云朵”这一组固定搭配
- 不要每次都用相同开头和相同结尾
- 不要机械重复类似句子
- 主题“${finalTopic}”必须自然融入
- 内容类型为“${type}”时，必须体现出该类型自己的结构与语气
`.trim()
}

function getTypeRules(type) {
  if (type === '胎教内容') {
    return `
你现在生成的是：胎教内容

胎教内容的硬性规则：
1. 不要写成完整童话故事
2. 不要设置复杂剧情推进
3. 不要出现太多角色轮流出场
4. 重点放在安抚、呼吸、情绪放松、身体感受、温柔联结
5. 可以有轻微画面感，但不能像冒险故事
6. 语气要像妈妈与宝宝之间的温柔陪伴和舒缓引导
7. 适合闭眼安静聆听
8. 段落节奏要慢，句子不要太跳跃
9. 结尾要落在“安心、放松、温柔入睡或安静休息”上
`.trim()
  }

  if (type === '睡前故事') {
    return `
你现在生成的是：睡前故事

睡前故事的硬性规则：
1. 必须有明确主角
2. 必须有清晰场景
3. 必须有简洁但完整的小情节
4. 必须有开头、中间、结尾
5. 可以有童话感、想象力和轻微冒险，但不能惊吓、不压抑
6. 最终必须自然回到安静、温柔、适合入睡的状态
7. 它必须是一篇“故事”，不是安抚文案，不是胎教引导词
8. 要让人明显感觉这是可以给孩子听的原创童话内容
`.trim()
  }

  return `
你现在生成的是：声音陪伴

声音陪伴的硬性规则：
1. 不要写成完整故事
2. 不要有复杂剧情推进
3. 不要像童话冒险
4. 更像爸爸妈妈在床边轻声说话
5. 要有明显口语感、亲近感、安抚感
6. 可以有一点温柔画面，但主体是“说话陪伴”
7. 多用自然短句，不要太书面
8. 要让人一听就知道这是陪伴型语音，不是故事，不是胎教引导
9. 结尾要非常柔和，适合直接闭眼继续听
`.trim()
}

function buildStoryPrompt({ type, style, language, topic, duration, profile }) {
  const nickname = profile?.nickname || '宝宝'
  const age = profile?.baby_age || '2岁'
  const voice = profile?.voice || '默认声音'
  const finalTopic = topic?.trim() || '月亮'
  const lengthRule = getLengthRule(duration, type)
  const typeRules = getTypeRules(type)
  const classicReferenceRule = getClassicReferenceRule(topic)
  const variationRule = getVariationRule(topic, type)

  return `
你是一名专业的母婴与亲子内容创作助手，请为儿童陪伴类APP生成高质量、适合朗读的中文内容。

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

内容总要求：
1. 正文必须分成4到6段
2. 必须适合中文自然朗读，句子不要太硬，不要太书面
3. 不要输出说教口吻，不要写成模板作文
4. 不要输出任何 JSON 以外的文字
5. 内容必须有温度、有新鲜感、可长期使用
6. 不要反复复用同一套套路
7. 不要像机器批量生成的套话

内容类型规则：
${typeRules}

主题关键词规则：
${classicReferenceRule}

多样性规则：
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

function getAudioMimeType(file) {
  const mime = file?.mimetype || ''
  const name = file?.originalname?.toLowerCase() || ''

  if (mime.includes('mpeg') || mime.includes('mp3') || name.endsWith('.mp3')) {
    return 'audio/mpeg'
  }
  if (mime.includes('wav') || name.endsWith('.wav')) {
    return 'audio/wav'
  }
  if (mime.includes('m4a') || mime.includes('mp4') || name.endsWith('.m4a')) {
    return 'audio/mp4'
  }
  if (mime.includes('webm') || name.endsWith('.webm')) {
    return 'audio/webm'
  }

  return 'application/octet-stream'
}

function fileBufferToDataUri(file) {
  const mimeType = getAudioMimeType(file)
  const base64 = Buffer.from(file.buffer).toString('base64')
  return `data:${mimeType};base64,${base64}`
}

async function fetchArrayBufferFromUrl(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`下载音频失败：${response.status}`)
  }
  return await response.arrayBuffer()
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
    if (!DASHSCOPE_API_KEY) {
      return res.status(500).json({
        success: false,
        message: '缺少 DASHSCOPE_API_KEY',
      })
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传音频文件',
      })
    }

    const voiceNameRaw = req.body.voiceName?.trim() || `voice_${Date.now()}`
    const voiceName = voiceNameRaw.replace(/[^\w]/g, '_').slice(0, 16) || `voice_${Date.now()}`
    const dataUri = fileBufferToDataUri(req.file)

    const response = await fetch(
      `${DASHSCOPE_BASE_URL}/services/audio/tts/customization`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen-voice-enrollment',
          input: {
            action: 'create',
            target_model: QWEN_VC_TARGET_MODEL,
            preferred_name: voiceName,
            audio: {
              data: dataUri,
            },
            language: 'zh',
          },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data?.message || '千问声音克隆失败',
        raw: data,
      })
    }

    const clonedVoice = data?.output?.voice

    if (!clonedVoice) {
      return res.status(500).json({
        success: false,
        message: '未获取到千问返回的音色ID',
        raw: data,
      })
    }

    res.json({
      success: true,
      voice: {
        id: Date.now().toString(),
        name: req.body.voiceName?.trim() || voiceName,
        voiceId: clonedVoice,
        createdAt: new Date().toLocaleString(),
        sourceType: req.body.sourceType || 'upload',
      },
    })
  } catch (error) {
    console.error('qwen clone-voice error:', error)
    res.status(500).json({
      success: false,
      message: '千问声音克隆失败',
      error: error?.message || 'unknown error',
    })
  }
})

app.post('/api/generate-cloned-audio', async (req, res) => {
  try {
    if (!DASHSCOPE_API_KEY) {
      return res.status(500).json({
        success: false,
        message: '缺少 DASHSCOPE_API_KEY',
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
      `${DASHSCOPE_BASE_URL}/services/aigc/multimodal-generation/generation`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: QWEN_VC_TARGET_MODEL,
          input: {
            text: normalizedText,
            voice: voiceId,
            language_type: 'Chinese',
          },
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data?.message || '千问朗读失败',
        raw: data,
      })
    }

    const audioUrl = data?.output?.audio?.url

    if (!audioUrl) {
      return res.status(500).json({
        success: false,
        message: '未获取到千问返回的音频 URL',
        raw: data,
      })
    }

    const arrayBuffer = await fetchArrayBufferFromUrl(audioUrl)
    const base64Audio = Buffer.from(arrayBuffer).toString('base64')

    res.json({
      success: true,
      audioUrl: `data:audio/wav;base64,${base64Audio}`,
    })
  } catch (error) {
    console.error('qwen generate-cloned-audio error:', error)
    res.status(500).json({
      success: false,
      message: '千问朗读失败',
      error: error?.message || 'unknown error',
    })
  }
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
