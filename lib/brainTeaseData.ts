
export interface BrainTease {
  id: string;
  question: string;
  answer: string;
  hints: string[];
  category: 'WORDPLAY' | 'LOGIC' | 'HUMOR' | 'PARADOX';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export const BRAIN_TEASE_LIBRARY: BrainTease[] = [
  {
    id: 'BT_001',
    question: '什么东西早晨用四条腿走路，中午用两条腿走路，晚上用三条腿走路？',
    answer: '人（婴儿时期爬行，成年行走，老年拄拐）',
    hints: ['这是关于生命周期的隐喻', '腿的数量代表了支撑点的变化'],
    category: 'LOGIC',
    difficulty: 'MEDIUM'
  },
  {
    id: 'BT_002',
    question: '有一棵树，在半空中，不着地，不着天，这是什么树？',
    answer: '裤子（裤衩）',
    hints: ['这个“树”是穿在身上的', '左右各有两个分叉'],
    category: 'WORDPLAY',
    difficulty: 'EASY'
  },
  {
    id: 'BT_003',
    question: '什么东西你有，别人也有，但你用的少，别人用的多？',
    answer: '你的名字',
    hints: ['这是一个代号', '通常是别人在呼唤你时使用'],
    category: 'LOGIC',
    difficulty: 'EASY'
  },
  {
    id: 'BT_004',
    question: '为什么极地冰山里的水是淡的？',
    answer: '因为海水冻结成冰时会排出盐分',
    hints: ['这涉及到物理凝固过程', '盐分无法进入冰结晶结构'],
    category: 'LOGIC',
    difficulty: 'MEDIUM'
  },
  {
    id: 'BT_005',
    question: '什么路最窄？',
    answer: '冤家路窄',
    hints: ['这是一个成语', '形容仇人相见'],
    category: 'WORDPLAY',
    difficulty: 'EASY'
  },
  {
    id: 'BT_006',
    question: '冬瓜、黄瓜、西瓜、南瓜都能吃，什么瓜不能吃？',
    answer: '傻瓜',
    hints: ['这是一个形容词转化的名词', '形容不聪明的人'],
    category: 'HUMOR',
    difficulty: 'EASY'
  },
  {
    id: 'BT_007',
    question: '一个人在沙滩上行走，回头为什么看不见自己的脚印？',
    answer: '因为他在倒着走',
    hints: ['注意行走的方向', '脚印在他的前方'],
    category: 'LOGIC',
    difficulty: 'MEDIUM'
  },
  {
    id: 'BT_008',
    question: '什么时候，2等于10？',
    answer: '算错的时候',
    hints: ['不要想数学公式', '想一下人的状态'],
    category: 'HUMOR',
    difficulty: 'HARD'
  }
];
