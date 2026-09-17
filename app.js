const state = JSON.parse(localStorage.getItem('english-adventure') || '{"stars":0,"streak":0,"lastDay":""}');
const now = new Date();
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
const todayKey = today.toISOString().slice(0, 10);
const lessons = [
  {emoji:'🍎',japanese:'りんごが ほしいな',phrase:'I want an apple!',reading:'アイ ワント アン アップル！',quiz:{emoji:'🍎',answer:'Apple',choices:['Apple','Dog','Book']},talk:'What do you want?',prompt:'I want an apple!',reply:'That sounds yummy!'},
  {emoji:'☀️',japanese:'おはよう！',phrase:'Good morning!',reading:'グッド モーニング！',quiz:{emoji:'☀️',answer:'Sun',choices:['Moon','Sun','Star']},talk:'How are you today?',prompt:'I am happy!',reply:'I am happy too!'},
  {emoji:'🐶',japanese:'いぬが みえるよ',phrase:'I see a dog!',reading:'アイ シー ア ドッグ！',quiz:{emoji:'🐶',answer:'Dog',choices:['Cat','Dog','Bird']},talk:'What do you see?',prompt:'I see a dog!',reply:'Yes! What a cute dog!'},
  {emoji:'💧',japanese:'お水を ください',phrase:'Can I have water?',reading:'キャン アイ ハヴ ウォーター？',quiz:{emoji:'💧',answer:'Water',choices:['Milk','Water','Juice']},talk:'What would you like?',prompt:'Can I have water?',reply:'Of course. Here you are!'},
  {emoji:'📚',japanese:'わたしは 本が すき',phrase:'I like books!',reading:'アイ ライク ブックス！',quiz:{emoji:'📚',answer:'Book',choices:['Book','Ball','Car']},talk:'What do you like?',prompt:'I like books!',reply:'Books are wonderful!'},
  {emoji:'🎈',japanese:'いっしょに あそぼう！',phrase:'Let’s play!',reading:'レッツ プレイ！',quiz:{emoji:'⚽',answer:'Ball',choices:['Ball','Apple','Shoe']},talk:'What shall we do?',prompt:'Let’s play!',reply:'Great idea! Let’s play!'},
  {emoji:'🙏',japanese:'ありがとう！',phrase:'Thank you!',reading:'サンキュー！',quiz:{emoji:'🎁',answer:'Gift',choices:['Gift','Tree','Fish']},talk:'Here is a present for you.',prompt:'Thank you!',reply:'You are welcome!'}
];
const lesson = lessons[Math.floor(today.getTime() / 86400000) % lessons.length];
const $ = (s) => document.querySelector(s);
if (state.lastDay !== todayKey) { state.streak += 1; state.lastDay = todayKey; }
function save(){ localStorage.setItem('english-adventure', JSON.stringify(state)); render(); }
function render(){
  $('#streak').textContent=state.streak;
  $('#stars').textContent='★ '.repeat(Math.min(state.stars,5))+'☆ '.repeat(Math.max(0,5-state.stars));
  $('#rewardLeft').textContent=Math.max(0,3-(state.stars%3));
  $('#rewardBar').style.width=(((state.stars%3)/3)*100)+'%';
}
function setDailyLesson(){
  $('#phraseScene').textContent=lesson.emoji; $('#phraseJapanese').textContent=lesson.japanese;
  $('#phraseEnglish').textContent=lesson.phrase; $('#phraseReading').textContent=lesson.reading;
  $('#listenPhrase').dataset.say=lesson.phrase; $('#quizArt').textContent=lesson.quiz.emoji; $('#talkArt').textContent=lesson.emoji;
}
setDailyLesson(); render();
function americanFemaleVoice(){
  const voices = speechSynthesis.getVoices();
  const preferred = ['Samantha','Ava','Jenny','Zira','Joanna','Karen','Allison'];
  return preferred.map(name => voices.find(voice => voice.name.includes(name) && /^en-US/i.test(voice.lang))).find(Boolean) || voices.find(voice => /^en-US/i.test(voice.lang));
}
function speak(text){
  if('speechSynthesis' in window){
    speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.lang='en-US'; u.rate=.78; u.pitch=1.08;
    const voice=americanFemaleVoice(); if(voice) u.voice=voice; speechSynthesis.speak(u);
  }
}
document.querySelectorAll('.speak').forEach(b=>b.onclick=()=>speak(b.dataset.say));
function show(html){ $('#modalContent').innerHTML=html; $('#modal').hidden=false; }
function close(){ $('#modal').hidden=true; }
$('#closeModal').onclick=close; $('#modal').onclick=e=>{if(e.target.id==='modal')close()};
function earn(message){ state.stars += 1; save(); show('<div class="modal-art">🎉</div><h2>すごい！</h2><p>'+message+'</p><p class="hint">ほしを 1こ もらったよ！</p><button class="modal-primary" id="again">もういちど</button>'); $('#again').onclick=close; }
$('#speakPhrase').onclick=()=>{
  speak(lesson.phrase); $('#speechNote').textContent='お手本を聞いたら、マイクで言ってみよう！';
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Recognition){ setTimeout(()=>earn('声に出して言えたかな？ Great job!'),700); return; }
  const r=new Recognition(); r.lang='en-US'; r.interimResults=false;
  r.onstart=()=>$('#speechNote').textContent='きいているよ… '+lesson.phrase;
  r.onresult=e=>{const said=e.results[0][0].transcript; $('#speechNote').textContent='「'+said+'」って聞こえたよ！'; earn('英語で言えたね！');};
  r.onerror=()=>{ $('#speechNote').textContent='もう一度、ゆっくり言ってみよう。'; }; r.start();
};
$('#startQuiz').onclick=()=>{
  const buttons=lesson.quiz.choices.map(choice=>'<button data-a="'+choice+'">'+choice+'</button>').join('');
  show('<div class="modal-art">'+lesson.quiz.emoji+'</div><h2>What is this?</h2><p>これ、なんていう？</p><div class="answer-row">'+buttons+'</div><p class="hint" id="quizHint">えらんでみよう！</p>');
};
document.addEventListener('click',e=>{if(e.target.dataset.a){if(e.target.dataset.a===lesson.quiz.answer)earn(lesson.quiz.answer+'! せいかい！');else $('#quizHint').textContent='おしい！もう一度考えてみよう。';}});
$('#startTalk').onclick=()=>{
  speak(lesson.talk);
  show('<div class="modal-art">🦊</div><h2>おしゃべりタイム</h2><div class="talk-bubble">'+lesson.talk+'</div><p>「'+lesson.prompt+'」って言ってみよう。</p><button class="modal-primary" id="talkDone">いえた！</button>');
  $('#talkDone').onclick=()=>earn(lesson.reply+' とってもじょうず！');
};
$('#parentOpen').onclick=()=>show('<div class="modal-art">🌱</div><h2>おうちの人へ</h2><p>今日の小さな積み重ね</p><div class="parent-stats"><div><strong>'+state.streak+'</strong><small>れんぞく日数</small></div><div><strong>'+state.stars+'</strong><small>ほし</small></div><div><strong>1</strong><small>今日のことば</small></div></div><div class="talk-bubble">今日のフレーズ<br><strong>'+lesson.phrase+'</strong></div><p class="hint">日常で一度だけ「今日の英語、使えるかな？」と声をかけてあげてください。</p>');
$('#navPlay').onclick=()=>$('#startQuiz').click();
$('#navBook').onclick=()=>show('<div class="modal-art">📚</div><h2>ことばのずかん</h2><p>'+lesson.quiz.answer+' '+lesson.quiz.emoji+'　'+lesson.phrase+'</p><p class="hint">明日は別のことばが出てくるよ。</p>');
$('#navReward').onclick=()=>show('<div class="modal-art">🎁</div><h2>ごほうび</h2><p>ほしを3こ集めると、たからばこが開くよ！</p><p class="hint">いま '+(state.stars%3)+' / 3 こ</p>');
