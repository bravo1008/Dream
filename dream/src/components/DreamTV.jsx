// src/components/DreamTV.jsx
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import DreamGallery from './DreamGallery';

const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: '#1a1a1a',
  borderRadius: '16px',
  padding: '20px',
  marginBottom: '10px',
  border: '1px solid #2d2d2d',
}));

const ChannelButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#1e3a8a',
  color: 'white',
  border: '1px solid #007acc',
  borderRadius: '6px',
  padding: '8px 16px',
  fontSize: '14px',
  marginRight: '8px',
  marginBottom: '8px',
  '&:hover': {
    backgroundColor: '#1d4ed8',
    transform: 'scale(1.02)',
  },
  '&:active': {
    transform: 'scale(0.98)',
  },
}));

const ControlButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#333',
  color: '#ccc',
  borderRadius: '4px',
  padding: '6px 12px',
  fontSize: '12px',
  width: '50px',
  '&:hover': {
    backgroundColor: '#555',
  },
}));

const VolumeSlider = styled(Box)(({ theme }) => ({
  width: '200px',
  height: '10px',
  background: '#2d2d2d',
  borderRadius: '5px',
  position: 'relative',
  marginTop: '10px',
  overflow: 'hidden',
}));

const VolumeBar = styled(Box)(({ theme }) => ({
  width: '20px',
  height: '100%',
  background: '#00ff00',
  position: 'absolute',
  left: '0',
  top: '0',
  boxShadow: '0 0 5px #00ff00',
}));

// 睡眠知识内容
const sleepKnowledge = {
  insomnia: `
临床诊断标准：入睡困难≥30分钟，夜间觉醒≥3次，早醒后无法再次入睡，每周出现≥3次，持续≥1个月

认知行为疗法：
① 睡眠限制：只给床“排班”，躺床时间≈实际睡着的平均时间，效率>85%再逐步“扩编”。
② 刺激控制：床=睡觉专用场所；20 min 睡不着立刻离床，有睡意再回。
③ 放松+认知：渐进性肌肉放松 + 纠正常见“怕失眠→更失眠”灾难化思维。
④ 接纳承诺疗法（ACT）：允许“今晚睡不好”的念头存在，把注意力拉回当下呼吸，减少挣扎带来的二次唤醒。

药物治疗：
①让大脑“刹车”的药——γ-氨基丁酸（GABA）类
代表：艾司唑仑、右佐匹克隆、唑吡坦等
作用：像给大脑踩一脚刹车，30 分钟就能关灯。
注意：连续吃超过 2～4 周容易“刹车片磨损”——耐药、次日头晕；老人半夜上厕所易跌倒，孕妇慎用。

②关掉“清醒开关”的新药——食欲素受体拮抗剂
代表：雷生类
特点：不是全脑刹车，而是专门关掉“别睡，还有事”的清醒系统；第二天残留困倦少，长期吃也不易成瘾。
适合：怕头晕、第二天要开车开会的人；但严重阻塞性睡眠呼吸暂停（睡觉打呼+憋气）慎用。

③模拟“天黑信号”的药——褪黑素及类似物
特点：告诉大脑“天黑了，该休息了”，像自然入睡；老人、倒时差、轮班族首选。
注意：普通褪黑素剂量别贪多，0.5～2 mg 就够；吃多反而半夜醒。

别害怕药物，科学治疗才是关键。

其他非药物辅助治疗：
光照疗法调节生物钟，经颅磁刺激（TMS）调节大脑兴奋性、正念冥想改善睡眠质量等。
  `.trim(),
  hypersomnia: `
临床分型：发作性睡病(伴猝倒/不伴猝倒)、特发性嗜睡症、克莱恩-莱文综合征、睡眠不足综合征

发作性睡病的药物治疗：包括有促醒药物莫达非尼、哌甲酯、索利氨酯、替洛利生等，控制猝倒可用文拉法辛、或羟丁酸钠。均需处方，定期复诊，配合计划小睡可改善疾病症状。

行为干预：计划性小睡(20-30分钟)，规律作息时间，避免驾驶和操作危险机械
  `.trim(),
  treatment: `
睡眠医学专科评估：多导睡眠监测(PSG)、多次睡眠潜伏期测试(MSLT)、清醒维持试验(MWT)等客观检查

个体化治疗方案：根据病因(原发性/继发性)、严重程度、社会功能影响制定综合治疗计划

治疗监测与随访：定期评估治疗效果，调整药物剂量，监测副作用，建立长期管理档案

康复指导：睡眠卫生教育，压力管理，运动处方，饮食调整，心理支持等多维度康复措施
  `.trim(),
};

export default function DreamTV() {
  const [dreamInput, setDreamInput] = useState('');
  const [theme, setTheme] = React.useState('');
  const [style, setStyle] = React.useState('梦幻风格');
  const [volume, setVolume] = React.useState(50);
  const [activeTab, setActiveTab] = React.useState('insomnia'); // 'insomnia' | 'hypersomnia' | 'treatment'
  const [isGenerating, setIsGenerating] = useState(false);
  const [userDreams, setUserDreams] = useState([]);
  const [loadingDreams, setLoadingDreams] = useState(true);

  // 获取设备ID（简单用 localStorage 模拟）
  const getDeviceId = () => {
    let id = localStorage.getItem('dream_device_id');
    if (!id) {
      id = 'device_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('dream_device_id', id);
    }
    return id;
  };

  const deviceId = getDeviceId();

  // 获取用户所有梦境
  // 获取用户所有梦境
const fetchUserDreams = async () => {
  try {
    setLoadingDreams(true);
    const res = await fetch(`https://dream-gjai.onrender.com/api/dream/list?deviceId=${deviceId}`);
    const result = await res.json();

    if (result.success && Array.isArray(result.data)) {
      setUserDreams(result.data); // ✅ 正确：取 result.data
    } else {
      console.warn('梦境列表返回格式异常:', result);
      setUserDreams([]);
    }
  } catch (err) {
    console.error('获取梦境失败:', err);
    setUserDreams([]);
  } finally {
    setLoadingDreams(false);
  }
};

  // 初始化加载
  useEffect(() => {
    fetchUserDreams();
  }, []);

  const handleGenerateDream = async () => {
  if (!dreamInput.trim()) {
    alert('请输入梦境描述');
    return;
  }
  if (!theme) {
    alert('请选择梦境主题');
    return;
  }
  console.log('当前设备ID:', deviceId);

  setIsGenerating(true);
  try {
    // ✅ 把 deviceId 放到 URL 的 query 参数中
    const url = `https://dream-gjai.onrender.com/api/dream/generate?deviceId=${encodeURIComponent(deviceId)}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: dreamInput.trim(),
        theme,
        style,
      }),
    });

    const result = await res.json();

    if (result.success && result.data?.imageUrl) {
      await fetchUserDreams(); // 刷新列表
      setDreamInput('');
    } else {
      alert('生成失败：' + (result.error || '未知错误'));
    }
  } catch (err) {
    console.error('生成请求失败:', err);
    alert('网络错误，请重试');
  } finally {
    setIsGenerating(false);
  }
};

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <Box sx={{ p: 2, maxWidth: 1200, margin: 'auto' }}>
      {/* 电视边框 */}
      <div className="crt-border">
        {/* 电视顶部 */}
        <Box sx={{ bgcolor: '#2d2d2d', p: 2, borderRadius: '16px', mb: 2 }}>
          <Typography variant="h5" align="center" sx={{ color: '#fff', fontWeight: 'bold' }}>
            白日做梦机
          </Typography>
          <Typography variant="subtitle2" align="center" sx={{ color: '#aaa' }}>
            Dream TV-2000
          </Typography>
        </Box>

        {/* 主屏幕 */}
        <div className="crt-screen">
          {/* 频道栏 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <div className="channel-indicator">
              <span>CH-01</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`channel-dot ${i < 4 ? 'on' : 'off'}`}
                    style={{ width: '6px', height: '6px' }}
                  />
                ))}
              </div>
            </div>
            <Typography variant="subtitle1" sx={{ color: '#00ffcc', fontWeight: 'bold' }}>
              梦境频道
            </Typography>
            <div className="status-light"></div>
          </Box>

          {/* 梦境输入 */}
          <StyledPaper>
            <Typography variant="h6" sx={{ color: '#00ffcc', mb: 2 }}>
              梦境输入
            </Typography>
            {/* ✅ 关键修复：绑定 value 和 onChange */}
            <TextField
              fullWidth
              multiline
              rows={3}
              value={dreamInput} // 👈 绑定状态
              onChange={(e) => setDreamInput(e.target.value)} // 👈 同步输入
              placeholder="请描述你想要的梦境或梦想..."
              sx={{
                bgcolor: '#121212',
                borderRadius: '6px',
                border: '1px solid #2d2d2d',
                color: '#fff',
                '& .MuiOutlinedInput-input': {
                  color: '#fff',
                  padding: '12px',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#2d2d2d',
                },
              }}
            />
          </StyledPaper>

          {/* 梦境主题 */}
          <StyledPaper>
            <Typography variant="h6" sx={{ color: '#00ffcc', mb: 2 }}>
              梦境主题
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <ChannelButton onClick={() => setTheme('奇幻冒险')}>奇幻冒险</ChannelButton>
              <ChannelButton onClick={() => setTheme('未来科技')}>未来科技</ChannelButton>
              <ChannelButton onClick={() => setTheme('自然奇观')}>自然奇观</ChannelButton>
              <ChannelButton onClick={() => setTheme('浪漫情缘')}>浪漫情缘</ChannelButton>
              <ChannelButton onClick={() => setTheme('神秘探索')}>神秘探索</ChannelButton>
              <ChannelButton onClick={() => setTheme('甜蜜温馨')}>甜蜜温馨</ChannelButton>
            </Box>
          </StyledPaper>

          {/* 画面风格 */}
          <StyledPaper>
            <Typography variant="h6" sx={{ color: '#00ffcc', mb: 2 }}>
              画面风格
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <ChannelButton onClick={() => setStyle('梦幻风格')} selected={style === '梦幻风格'}>
                梦幻风格
              </ChannelButton>
              <ChannelButton onClick={() => setStyle('写实风格')} selected={style === '写实风格'}>
                写实风格
              </ChannelButton>
              <ChannelButton onClick={() => setStyle('卡通风格')} selected={style === '卡通风格'}>
                卡通风格
              </ChannelButton>
              <ChannelButton onClick={() => setStyle('油画风格')} selected={style === '油画风格'}>
                油画风格
              </ChannelButton>
              <ChannelButton onClick={() => setStyle('水彩风格')} selected={style === '水彩风格'}>
                水彩风格
              </ChannelButton>
              <ChannelButton onClick={() => setStyle('简笔风格')} selected={style === '简笔风格'}>
                简笔风格
              </ChannelButton>
            </Box>
          </StyledPaper>

          {/* 睡眠知识 —— 可切换 */}
          <StyledPaper>
            <Typography variant="h6" sx={{ color: '#00ffcc', mb: 2 }}>
              睡眠知识
            </Typography>
            <Box sx={{ display: 'flex', gap: '8px', mb: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleTabClick('insomnia')}
                sx={{
                  color: activeTab === 'insomnia' ? '#00ffcc' : '#aaa',
                  borderColor: activeTab === 'insomnia' ? '#00ffcc' : '#444',
                }}
              >
                失眠症
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleTabClick('hypersomnia')}
                sx={{
                  color: activeTab === 'hypersomnia' ? '#00ffcc' : '#aaa',
                  borderColor: activeTab === 'hypersomnia' ? '#00ffcc' : '#444',
                }}
              >
                嗜睡症
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleTabClick('treatment')}
                sx={{
                  color: activeTab === 'treatment' ? '#00ffcc' : '#aaa',
                  borderColor: activeTab === 'treatment' ? '#00ffcc' : '#444',
                }}
              >
                科学治疗
              </Button>
            </Box>

            {/* 滚动容器：保留原滑动栏 */}
            <Box
              sx={{
                maxHeight: '200px',
                overflowY: 'auto',
                pr: 1, // 防止滚动条遮挡内容
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#1e1e1e',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#007acc',
                  borderRadius: '3px',
                },
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sleepKnowledge[activeTab]
                  .split('\n')
                  .map((line, index) => {
                    if (!line.trim()) return null;
                    return (
                      <Box
                        key={index}
                        sx={{
                          position: 'relative',
                          paddingLeft: '20px',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: '0',
                            top: '0',
                            bottom: '0',
                            width: '4px',
                            background: '#007acc',
                            borderRadius: '2px',
                          },
                        }}
                      >
                        <StyledPaper
                          sx={{
                            p: 2,
                            fontSize: '14px',
                            lineHeight: 1.6,
                            minHeight: '18px',
                            wordBreak: 'break-word',
                            border: '1px solid #2d2d2d',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            backgroundColor: '#1a1a1a',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              color: '#ccc',
                              fontWeight:
                                'normal',
                            }}
                          >
                            {line}
                          </Typography>
                        </StyledPaper>
                      </Box>
                    );
                  })}
              </Box>
            </Box>
          </StyledPaper>

          {/* 控制面板 */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Box sx={{ position: 'relative', width: '100%', height: '20px', mb: 2 }}>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '20px', height: '20px', background: 'red', borderRadius: '50%' }}></div>
            </Box>
             {/* 生成按钮 */}
            <Box sx={{ textAlign: 'center', mt: 2, mb: 3 }}>
              <Button
                variant="contained"
                disabled={isGenerating || !dreamInput.trim() || !theme}
                onClick={handleGenerateDream}
                sx={{
                  bgcolor: '#1e3a8a',
                  color: 'white',
                  border: '1px solid #007acc',
                  borderRadius: '6px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  '&:hover': { bgcolor: '#1d4ed8' },
                  '&:disabled': { bgcolor: '#333', color: '#888' },
                }}
              >
                {isGenerating ? '生成中...' : '生成梦境'}
              </Button>
            </Box>

            {/* 新增：梦境图廊 */}
            <Paper elevation={3} sx={{ p: 1, mb: 2 ,bgcolor: '#2d2d2d',border: '1px solid #444',
        borderRadius: '8px',}}>
              <Typography variant="h6" sx={{ color: '#00ffcc', mb: 1 }}>
                  我的梦境
                </Typography>
              <DreamGallery dreams={userDreams} loading={loadingDreams} />
            </Paper>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: '10px', mb: 2 }}>
              <ControlButton>CH+</ControlButton>
              <ControlButton>CH-</ControlButton>
            </Box>
            <VolumeSlider>
              <VolumeBar style={{ left: `${volume}%` }} />
            </VolumeSlider>
          </Box>
        </div>
      </div>
    </Box>
  );
}