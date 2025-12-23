
export interface Poem {
  id: string;
  title: string;
  author: string;
  dynasty: string;
  lines: string[];
  meaning: string;
  category: 'nature' | 'homesick' | 'friendship' | 'ambition' | 'reason' | 'festive';
  image: string;
  // Added optional image_url to support database schema where images might be stored under this key
  image_url?: string;
}

export const POEM_LIBRARY: Poem[] = [
  {
    id: 'p1', title: '静夜思', author: '李白', dynasty: '唐', category: 'homesick',
    lines: ['床前明月光', '疑是地上霜', '举头望明月', '低头思故乡'],
    meaning: '通过对月色的细腻描写，表达了诗人深夜浓烈的思乡之情。',
    image: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=800&q=80'
  },
  {
    id: 'p2', title: '咏鹅', author: '骆宾王', dynasty: '唐', category: 'nature',
    lines: ['鹅鹅鹅', '曲项向天歌', '白毛浮绿水', '红掌拨清波'],
    meaning: '生动地描绘了鹅戏水时的优美姿态，色彩对比鲜明，充满童趣。',
    image: 'https://images.unsplash.com/photo-1549114848-372070371424?w=800&q=80'
  },
  {
    id: 'p3', title: '登鹳雀楼', author: '王之涣', dynasty: '唐', category: 'reason',
    lines: ['白日依山尽', '黄河入海流', '欲穷千里目', '更上一层楼'],
    meaning: '通过登楼远眺，揭示了积极向上、追求更高境界的深刻人生哲理。',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80'
  },
  {
    id: 'p4', title: '春晓', author: '孟浩然', dynasty: '唐', category: 'nature',
    lines: ['春眠不觉晓', '处处闻啼鸟', '夜来风雨声', '花落知多少'],
    meaning: '描写了春天早晨绚丽的图景，流露出对春天的无限热爱。',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80'
  },
  {
    id: 'p5', title: '江雪', author: '柳宗元', dynasty: '唐', category: 'nature',
    lines: ['千山鸟飞绝', '万径人踪灭', '孤舟蓑笠翁', '独钓寒江雪'],
    meaning: '展现了诗人孤傲倔强的性格，也折射出清冷孤寂的心境。',
    image: 'https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=800&q=80'
  },
  {
    id: 'p6', title: '悯农', author: '李绅', dynasty: '唐', category: 'nature',
    lines: ['锄禾日当午', '汗滴禾下土', '谁知盘中餐', '粒粒皆辛苦'],
    meaning: '描写了烈日下农民劳作的艰辛，劝诫大家珍惜粮食。',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'
  },
  {
    id: 'p7', title: '绝句', author: '杜甫', dynasty: '唐', category: 'nature',
    lines: ['两个黄鹂鸣翠柳', '一行白鹭上青天', '窗含西岭千秋雪', '门泊东吴万里船'],
    meaning: '全诗对仗工整，色彩绚丽，展现了草堂开阔的胸怀。',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80'
  },
  {
    id: 'p8', title: '望庐山瀑布', author: '李白', dynasty: '唐', category: 'nature',
    lines: ['日照香炉生紫烟', '遥看瀑布挂前川', '飞流直下三千尺', '疑是银河落九天'],
    meaning: '李白的浪漫主义巅峰之作，气势磅礴，想象瑰丽。',
    image: 'https://images.unsplash.com/photo-1433086566608-bc85b63d692e?w=800&q=80'
  },
  {
    id: 'p9', title: '赠汪伦', author: '李白', dynasty: '唐', category: 'friendship',
    lines: ['李白乘舟将欲行', '忽闻岸上踏歌声', '桃花潭水深千尺', '不及汪伦送我情'],
    meaning: '描写了桃花潭边友人送别的场景，友情如潭水般深厚。',
    image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80'
  },
  {
    id: 'p10', title: '九月九日忆山东兄弟', author: '王维', dynasty: '唐', category: 'homesick',
    lines: ['独在异乡为异客', '每逢佳节倍思亲', '遥知兄弟登高处', '遍插茱萸少一人'],
    meaning: '重阳节思念家乡亲人的名篇，千古传诵。',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80'
  },
  {
    id: 'p11', title: '元日', author: '王安石', dynasty: '宋', category: 'festive',
    lines: ['爆竹声中一岁除', '春风送暖入屠苏', '千门万户曈曈日', '总把新桃换旧符'],
    meaning: '描写了春节放鞭炮、饮屠苏酒的热闹景象，象征万象更新。',
    image: 'https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?w=800&q=80'
  },
  {
    id: 'p12', title: '题西林壁', author: '苏轼', dynasty: '宋', category: 'reason',
    lines: ['横看成岭侧成峰', '远近高低各不同', '不识庐山真面目', '只缘身在此山中'],
    meaning: '阐述了当局者迷、旁观者清的哲理。',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80'
  },
  {
    id: 'p13', title: '游子吟', author: '孟郊', dynasty: '唐', category: 'homesick',
    lines: ['慈母手中线', '游子身上衣', '临行密密缝', '意恐迟迟归', '谁言寸草心', '报得三春晖'],
    meaning: '歌颂母爱的伟大与深沉，表达了子女难以报答父母恩情。',
    image: 'https://images.unsplash.com/photo-1494145904049-0dca59b4bbad?w=800&q=80'
  },
  {
    id: 'p14', title: '鹿柴', author: '王维', dynasty: '唐', category: 'nature',
    lines: ['空山不见人', '但闻人语响', '返景入深林', '复照青苔上'],
    meaning: '描绘了山林的幽静与光影的变换，达到“诗中有画”的境界。',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80'
  },
  {
    id: 'p15', title: '回乡偶书', author: '贺知章', dynasty: '唐', category: 'homesick',
    lines: ['少小离家老大回', '乡音无改鬓毛衰', '儿童相见不相识', '笑问客从何处来'],
    meaning: '感慨光阴流逝、物是人非，充满淡淡的忧伤。',
    image: 'https://images.unsplash.com/photo-1508197149814-0cc02e8b7f74?w=800&q=80'
  },
  {
    id: 'p16', title: '饮湖上初晴后雨', author: '苏轼', dynasty: '宋', category: 'nature',
    lines: ['水光潋滟晴方好', '山色空蒙雨亦奇', '欲把西湖比西子', '淡妆浓抹总相宜'],
    meaning: '赞美西湖无论晴雨都各具韵致。',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80'
  },
  {
    id: 'p17', title: '示儿', author: '陆游', dynasty: '宋', category: 'ambition',
    lines: ['死去元知万事空', '但悲不见九州同', '王师北定中原日', '家祭无忘告乃翁'],
    meaning: '陆游的绝笔，表达了强烈的爱国主义精神。',
    image: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80'
  },
  {
    id: 'p18', title: '枫桥夜泊', author: '张继', dynasty: '唐', category: 'homesick',
    lines: ['月落乌啼霜满天', '江枫渔火对愁眠', '姑苏城外寒山寺', '夜半钟声到客船'],
    meaning: '描绘了江南秋夜的幽静景色，寄托了旅途中的愁思。',
    image: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=800&q=80'
  },
  {
    id: 'p19', title: '清明', author: '杜牧', dynasty: '唐', category: 'festive',
    lines: ['清明时节雨纷纷', '路上行人欲断魂', '借问酒家何处有', '牧童遥指杏花村'],
    meaning: '生动再现了清明时节江南春雨连绵的情景。',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&q=80'
  },
  {
    id: 'p20', title: '竹石', author: '郑燮', dynasty: '清', category: 'ambition',
    lines: ['咬定青山不放松', '立根原在破岩中', '千磨万击还坚劲', '任尔东西南北风'],
    meaning: '赞美竹子坚韧不拔的品格，象征君子气节。',
    image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80'
  }
];
