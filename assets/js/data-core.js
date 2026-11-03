/* ============================================================
   data-core.js · 年级 / 教材版本 / 难度等级
   ============================================================ */

const GRADES = [
  { id: 'c1', name: '初一', stage: '初中', desc: '数与式的启蒙，养成规范书写' },
  { id: 'c2', name: '初二', stage: '初中', desc: '函数入门与几何推理的关键期' },
  { id: 'c3', name: '初三', stage: '初中', desc: '二次函数与圆，冲刺中考' },
  { id: 'g1', name: '高一', stage: '高中', desc: '集合、函数、三角函数打地基' },
  { id: 'g2', name: '高二', stage: '高中', desc: '导数、数列、圆锥曲线' },
  { id: 'g3', name: '高三', stage: '高中', desc: '综合专题与应试策略' }
];

const VERSIONS = ['人教版', '北师大版', '苏教版', '沪教版'];

const LEVELS = [
  { id: 'basic', name: '基础', desc: '概念直接应用，1-2 步即可完成' },
  { id: 'advance', name: '提高', desc: '需要 2-3 步转化，综合一个小考点' },
  { id: 'challenge', name: '挑战', desc: '多知识点综合，含分类讨论与压轴思维' }
];

const LEVEL_NAME = { basic: '基础', advance: '提高', challenge: '挑战' };
const TYPE_NAME = { choice: '选择题', fill: '填空题', solve: '解答题' };

function gradeName(id) { const g = GRADES.find(x => x.id === id); return g ? g.name : '未知年级'; }
