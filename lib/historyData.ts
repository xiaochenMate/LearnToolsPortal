
export interface HistoryEvent {
  id: string;
  name: string;
  year: number;
  period: 'Ancient' | 'Imperial' | 'Modern';
  description: string;
  significance: string;
}

export const GRAND_CHRONICLES: HistoryEvent[] = [
  // 上古与先秦 (Ancient)
  { id: 'xia', year: -2070, period: 'Ancient', name: '夏朝建立', description: '大禹之子启继位，标志着“公天下”变为“家天下”。', significance: '中国历史上第一个世袭制王朝的开端。' },
  { id: 'shang', year: -1600, period: 'Ancient', name: '商汤灭夏', description: '鸣条之战后，商汤建立商朝。', significance: '甲骨文与青铜文明的鼎盛时期。' },
  { id: 'zhou', year: -1046, period: 'Ancient', name: '武王伐纣', description: '牧野之战，周武王推翻商纣王。', significance: '确立了宗法制与分封制的基础。' },
  { id: 'qin', year: -221, period: 'Ancient', name: '秦灭六国', description: '秦王嬴政统一全国，自称“始皇帝”。', significance: '第一个大一统中央集权国家的诞生。' },
  
  // 帝制鼎盛 (Imperial)
  { id: 'han', year: -202, period: 'Imperial', name: '西汉建立', description: '刘邦击败项羽，定都长安。', significance: '汉民族文化的奠基期，丝绸之路开启。' },
  { id: 'three_kings', year: 220, period: 'Imperial', name: '三国鼎立', description: '曹丕篡汉，魏蜀吴三国对峙开启。', significance: '中国历史上著名的乱世英雄时代。' },
  { id: 'sui', year: 581, period: 'Imperial', name: '隋朝统一', description: '杨坚受禅代周，结束了魏晋南北朝的分裂。', significance: '开创科举制，开凿大运河。' },
  { id: 'tang', year: 618, period: 'Imperial', name: '唐朝建立', description: '李渊在长安称帝，开启大唐盛世。', significance: '中国封建社会的巅峰，万邦来仪。' },
  { id: 'song', year: 960, period: 'Imperial', name: '陈桥兵变', description: '赵匡胤黄袍加身，建立宋朝。', significance: '文化繁荣，科技进步，三大发明广泛应用。' },
  { id: 'yuan', year: 1271, period: 'Imperial', name: '元朝建立', description: '忽必烈定国号为大元。', significance: '首次由少数民族建立的大一统王朝。' },
  { id: 'ming', year: 1368, period: 'Imperial', name: '明朝建立', description: '朱元璋在南京称帝，驱逐鞑虏。', significance: '废丞相权归皇帝，航海探索达到顶峰。' },
  { id: 'qing_in', year: 1644, period: 'Imperial', name: '清军入关', description: '满洲八旗进入北京，开启清朝统治。', significance: '确立了现代中国版图的基本雏形。' },

  // 近现代 (Modern)
  { id: 'opium', year: 1840, period: 'Modern', name: '鸦片战争', description: '中英开战，清政府战败签署《南京条约》。', significance: '中国沦为半殖民地半封建社会的开始。' },
  { id: 'taiping', year: 1851, period: 'Modern', name: '太平天国', description: '金田起义爆发。', significance: '近代史上规模最大的农民起义。' },
  { id: 'jiawu', year: 1894, period: 'Modern', name: '甲午战争', description: '中日激战。', significance: '洋务运动破产，民族危机空前严重。' },
  { id: 'xinhai', year: 1911, period: 'Modern', name: '辛亥革命', description: '武昌起义，推翻清廷。', significance: '彻底废除两千多年的君主专制。' },
  { id: 'may4th', year: 1919, period: 'Modern', name: '五四运动', description: '北京学生爆发大规模游行。', significance: '新民主主义革命的伟大开端。' },
  { id: 'ccp', year: 1921, period: 'Modern', name: '中共成立', description: '中共一大在上海召开。', significance: '中国革命面貌焕然一新。' },
  { id: 'war_resistance', year: 1937, period: 'Modern', name: '全面抗战', description: '七七事变爆发。', significance: '中华民族全民族抗战的开始。' },
  { id: 'prc', year: 1949, period: 'Modern', name: '新中国成立', description: '开国大典。', significance: '中国人民从此站起来了。' },
];
