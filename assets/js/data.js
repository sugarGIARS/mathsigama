/* ============================================================
   data.js · 数据整合与查询 API
   ============================================================ */

const KNOWLEDGE = [].concat(KP_PART1, KP_PART2, typeof KP_PART3 === 'undefined' ? [] : KP_PART3);
const QUESTIONS = [].concat(Q_PART1, Q_PART2, Q_PART3, Q_PART4, typeof Q_PART5 === 'undefined' ? [] : Q_PART5);

/* ---- 查询工具 ---- */
function getKp(id) { return KNOWLEDGE.find(k => k.id === id) || null; }

function kpOfGrade(gradeId, version) {
  return KNOWLEDGE.filter(k => k.grade === gradeId && (!version || k.versions.indexOf(version) >= 0));
}

function questionsOf(kpId, level) {
  return QUESTIONS.filter(q => q.kp === kpId && (!level || q.level === level));
}

function getQuestion(id) { return QUESTIONS.find(q => q.id === id) || null; }

function countOf(kpId, level) { return questionsOf(kpId, level).length; }

/* ---- 答案判分 ---- */
function normalize(s) {
  if (s === null || s === undefined) return '';
  return String(s)
    .replace(/\s+/g, '')
    .replace(/[（）()]/g, '')
    .replace(/[，,]/g, ',')
    .replace(/[。．.]/g, '')
    .replace(/[＋+]/g, '+')
    .replace(/[－—–\-]/g, '-')
    .replace(/[×＊*]/g, '*')
    .replace(/[／÷]/g, '/')
    .replace(/［|］|\[|\]/g, '')
    .toLowerCase();
}

/* 判分：choice 比较选项字母；fill 比对可接受答案；solve 采用关键词命中 */
function judge(q, userAnswer) {
  if (q.type === 'choice') {
    const ua = String(userAnswer || '').trim().toUpperCase().slice(0, 1);
    return { correct: ua === q.answer, standard: q.answer };
  }
  const ua = normalize(userAnswer);
  if (!ua) return { correct: false, standard: q.accept ? q.accept[0] : (q.answer || '') };
  if (q.accept && q.accept.length) {
    for (const a of q.accept) {
      if (normalize(a) === ua) return { correct: true, standard: a };
    }
  }
  if (q.keywords && q.keywords.length) {
    const hit = q.keywords.filter(k => ua.indexOf(normalize(k)) >= 0);
    if (hit.length >= Math.max(1, Math.ceil(q.keywords.length * 0.6))) {
      return { correct: true, standard: q.keywords.join(' 或 ') };
    }
  }
  return { correct: false, standard: q.accept ? q.accept[0] : (q.keywords ? q.keywords.join(' 或 ') : q.answer) };
}
