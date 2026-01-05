// FILE: routes/dream.js
import express from "express";
import axios from "axios";
import FormData from "form-data";
import Dream from "../models/Dream.js"; // 假设你有 Dream 模型（可选）

const router = express.Router();

// =======================
// 复用：将临时图片上传到 Cloudinary（持久化）
// =======================
async function persistImageToCloudinary(tempImageUrl) {
  if (!tempImageUrl) return "";

  const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    console.warn("⚠️ Cloudinary 未配置，无法持久化图片");
    return tempImageUrl;
  }

  try {
    const imageRes = await axios.get(tempImageUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
    });

    const formData = new FormData();
    formData.append("file", Buffer.from(imageRes.data), {
      filename: "dream.png",
      contentType: "image/png",
    });
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const uploadRes = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 60000,
      }
    );

    const permanentUrl = uploadRes.data.secure_url;
    console.log("✅ 梦境图片已持久化:", permanentUrl);
    return permanentUrl;
  } catch (err) {
    console.error("❌ 梦境图片持久化失败:", err.message || err);
    return tempImageUrl;
  }
}

// =======================
// 文本 → 梦境图片（核心逻辑）
// =======================
async function generateDreamImage(promptText, theme, style) {
  const apiKey = process.env.TYQW_API2_KEY;
  const baseUrl = (process.env.TYQW_BASE2_URL || "https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation").trim();

  if (!apiKey) {
    throw new Error("通义千问 API Key 未配置");
  }

  // 构建更精细的 prompt
  let stylePrompt = "";
  switch (style) {
    case "梦幻风格":
      stylePrompt = "梦幻、朦胧、柔焦、光晕、色彩流动、超现实感";
      break;
    case "写实风格":
      stylePrompt = "高度写实、细节丰富、摄影级质感、自然光影";
      break;
    case "卡通风格":
      stylePrompt = "可爱卡通、简洁线条、明亮色块、无复杂阴影";
      break;
    case "油画风格":
      stylePrompt = "厚涂油画笔触、颜料质感、古典艺术风格";
      break;
    case "水彩风格":
      stylePrompt = "透明水彩、柔和晕染、纸张纹理、清新淡雅";
      break;
    default:
      stylePrompt = "艺术感强、视觉震撼";
  }

  const fullPrompt = `请根据以下梦境描述，生成一幅高质量的图像：

梦境内容：${promptText}
梦境主题：${theme}
画面风格：${stylePrompt}

要求：
1. 图像必须紧扣“梦境”氛围，具有想象力和沉浸感
2. 避免出现文字、logo、人脸（除非必要）
3. 构图完整，色彩协调，富有艺术表现力
4. 不要生成恐怖、暴力或令人不适的内容`;

  // DashScope 支持的尺寸（qwen-image-plus）
  const supportedSizes = ["1328*1328", "1472*1140", "1140*1472"];

  for (const size of supportedSizes) {
    try {
      console.log(`🖼️ 生成梦境图，主题: ${theme} | 风格: ${style} | 尺寸: ${size}`);
      const resp = await axios.post(
        baseUrl,
        {
          model: "qwen-image-plus",
          input: {
            messages: [{ role: "user", content: [{ text: fullPrompt }] }]
          },
          parameters: {
            size: size,
            prompt_extend: true,
            watermark: false, // 梦境图建议无水印
            style: "<auto>"   // 让模型自动适配
          }
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          timeout: 90000
        }
      );

      const choice = resp.data?.output?.choices?.[0];
      const imageField = choice?.message?.content?.find?.((x) => x.image);
      const imageUrl = imageField?.image;

      if (imageUrl) {
        console.log(`✅ 梦境图生成成功`);
        return imageUrl;
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      console.error(`❌ 尺寸 ${size} 失败:`, errMsg);

      if (!errMsg?.includes?.('size') && !errMsg?.includes?.('InvalidParameter')) {
        throw new Error(`梦境生成失败: ${errMsg}`);
      }

      if (size === supportedSizes[supportedSizes.length - 1]) {
        throw new Error(`所有尺寸均失败: ${errMsg}`);
      }
    }
  }

  throw new Error("未能生成有效图像");
}

// =======================
// POST /api/dream/generate —— 主接口
// =======================
router.post("/generate", async (req, res) => {
  const { prompt, theme, style } = req.body;

  // 校验参数
  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
    return res.status(400).json({ success: false, error: "梦境描述至少需要3个字符" });
  }
  if (!theme || !["奇幻冒险", "未来科技", "自然奇观", "浪漫情缘", "神秘探索", "甜蜜温馨"].includes(theme)) {
    return res.status(400).json({ success: false, error: "无效的梦境主题" });
  }
  if (!style || !["梦幻风格", "写实风格", "卡通风格", "油画风格", "水彩风格", "简笔风格"].includes(style)) {
    return res.status(400).json({ success: false, error: "无效的画面风格" });
  }

  try {
    // 1. 调用 AI 生成临时图片
    const tempImageUrl = await generateDreamImage(prompt.trim(), theme, style);

    // 2. 持久化到 Cloudinary
    const permanentImageUrl = await persistImageToCloudinary(tempImageUrl);

    // 3. 保存到数据库（关键！）
    const dream = await Dream.create({
      prompt: prompt.trim(),
      theme,
      style,
      imageUrl: permanentImageUrl,
      deviceId: req.query.deviceId || req.headers['x-device-id'] || 'unknown',
      createdAt: new Date()
    });

    // 4. 返回结果（注意格式！）
    res.json({
      success: true,
      data: {
        imageUrl: permanentImageUrl,
        dreamId: dream._id
      }
    });
  } catch (err) {
    console.error("❌ 梦境生成主流程失败:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message || "服务器内部错误" 
    });
  }
});

// =======================
// GET /api/dream/list —— 获取指定设备ID的梦境列表
// =======================
router.get("/list", async (req, res) => {
  const { deviceId } = req.query;

  // 校验参数
  if (!deviceId) {
    return res.status(400).json({ success: false, error: "设备ID不能为空" });
  }

  try {
    // 查询数据库中所有属于该设备ID的梦境
    const dreams = await Dream.find({ deviceId }).sort({ createdAt: -1 });

    // 返回结果
    res.json({
      success: true,
      data: dreams.map(dream => ({
        dreamId: dream._id,
        imageUrl: dream.imageUrl,
        theme: dream.theme,
        style: dream.style,
        createdAt: dream.createdAt
      }))
    });
  } catch (err) {
    console.error("❌ 获取梦境列表失败:", err);
    res.status(500).json({ success: false, error: err.message || "服务器内部错误" });
  }
});

// =======================
// 测试接口（可选）
// =======================
router.get("/test", (req, res) => {
  res.json({ success: true, message: "梦境生成接口就绪 ✨" });
});

export default router;