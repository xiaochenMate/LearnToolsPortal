
import { AppItem } from './types';

export const EDUCATION_ITEMS: AppItem[] = [
  {
    id: 'e1',
    title: '3D地球',
    author: '@通义',
    category: 'education',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    description: '交互式3D地球仪，探索地理知识与全球数据可视化。',
    tags: ['地理', '3D', '可视化']
  },
  {
    id: 'e2',
    title: '食物链排序',
    author: '@fc',
    category: 'education',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=800',
    description: '拖拽构建生态系统食物链，理解生物间的捕食关系。',
    tags: ['生物', '生态', '逻辑']
  },
  {
    id: 'e3',
    title: '波的叠加和干涉',
    author: '@fc',
    category: 'education',
    imageUrl: 'https://images.unsplash.com/photo-1453733190371-0a9deb61440b?auto=format&fit=crop&q=80&w=800',
    description: '动态演示物理波的干涉与叠加原理，直观展示物理现象。',
    tags: ['物理', '波', '模拟']
  },
  {
    id: 'e4',
    title: '偏旁拼字学习',
    author: '@通义',
    category: 'education',
    imageUrl: 'https://images.unsplash.com/photo-1508807526345-15e9b5f4ed42?auto=format&fit=crop&q=80&w=800',
    description: '趣味汉字结构学习，通过组合偏旁部首掌握生字。',
    tags: ['语文', '汉字', '启蒙']
  },
  {
    id: 'e6',
    title: '历史事件排序',
    author: '@岁月静好',
    category: 'education',
    imageUrl: 'https://images.unsplash.com/photo-1461360228754-6e81c478c882?auto=format&fit=crop&q=80&w=800',
    description: '将历史大事件按时间轴正确排序，构建清晰的历史观。',
    tags: ['历史', '时间轴', '综合']
  },
  {
    id: 'e7',
    title: '认识钟表时间',
    author: '@zb1992',
    category: 'education',
    imageUrl: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=800',
    description: '教儿童认识模拟时钟，掌握时、分、秒的概念。',
    tags: ['数学', '启蒙', '生活']
  }
];

export const ENTERTAINMENT_ITEMS: AppItem[] = [
  {
    id: 'ent5',
    title: '楚汉风云 - 中国象棋',
    author: '@GrandMaster',
    category: 'entertainment',
    imageUrl: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=800',
    description: '经典中国象棋对弈，支持人机挑战与博弈分析。',
    tags: ['传统', '博弈', 'AI']
  },
  {
    id: 'ent4',
    title: '博弈禅 - 五子棋',
    author: '@ZenMaster',
    category: 'entertainment',
    imageUrl: 'https://images.unsplash.com/photo-1586165368502-1bad197a6461?auto=format&fit=crop&q=80&w=800',
    description: '拟物化五子棋对弈，内置 Alpha-Beta 剪枝 AI 引擎。',
    tags: ['博弈', '策略', 'AI']
  },
  {
    id: 'ent3',
    title: '每日脑筋急转弯',
    author: '@BrainTease',
    category: 'entertainment',
    imageUrl: 'https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&q=80&w=800',
    description: '每天更新趣味谜题，活跃思维，轻松一刻。',
    tags: ['益智', '幽默', '休闲']
  },
  {
    id: 'ent1',
    title: '像素画生成器',
    author: '@PixelMaster',
    category: 'entertainment',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800',
    description: '轻松绘制可爱的8-bit像素风格画作，支持导出分享。',
    tags: ['绘画', '创意', '艺术']
  }
];

export const UTILITIES_ITEMS: AppItem[] = [
  {
    id: 'u1',
    title: 'ProArt - 专业绘画',
    author: '@CreativeMind',
    category: 'utilities',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800',
    description: '专业级 Web 绘图引擎，支持图层管理、无限撤销与多种笔刷工具。',
    tags: ['绘图', '图层', '工具']
  },
  {
    id: 'u2',
    title: 'LingoFlow - 单词流',
    author: '@EdTechSpecialist',
    category: 'utilities',
    imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800',
    description: '沉浸式词汇记忆系统，支持从小学到雅思多级难度，采用科学间隔复习算法。',
    tags: ['英语', '词汇', '效率']
  },
  {
    id: 'u3',
    title: '博学雅趣 - 成语大辞典',
    author: '@CultureExpert',
    category: 'utilities',
    imageUrl: 'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&q=80&w=800',
    description: '探索中华文化瑰宝，支持汉字、拼音及首字母快速检索，连接云端海量成语库。',
    tags: ['文化', '工具', '检索']
  }
];
