/* ImmigrationOpportunity.com AI Widget JS */
(function(){

  var AFFILIATE_TAG = 'latestfotocom-20';
  var PROXY_URL = 'https://script.google.com/macros/s/AKfycbwX5TIkIg55a0aM5cDv7ESS20xlBiC6qPc0ZEVuifSLVm6BnlkKuf0jo-JPIflccPCY/exec';

  /* ============================================================
     STEP 1 - Read page context
  ============================================================ */
  function getPageContext(){
    var title = '';
    var titleEl = document.querySelector('.post-title') ||
                  document.querySelector('h1.entry-title') ||
                  document.querySelector('h3.post-title') ||
                  document.querySelector('h1') ||
                  document.querySelector('title');
    if(titleEl){ title = titleEl.textContent.trim(); }

    var labelEls = document.querySelectorAll('.post-labels a, .labels a, a[rel="tag"]');
    var labels = [];
    for(var i = 0; i < labelEls.length; i++){
      labels.push(labelEls[i].textContent.trim().toLowerCase());
    }

    var bodyText = '';
    var bodyEl = document.querySelector('.post-body') ||
                 document.querySelector('.entry-content') ||
                 document.querySelector('article');
    if(bodyEl){ bodyText = bodyEl.textContent.replace(/\s+/g,' ').trim().substring(0, 600); }

    return {
      title: title,
      titleLower: title.toLowerCase(),
      labels: labels,
      body: bodyText.toLowerCase()
    };
  }

  /* ============================================================
     STEP 2 - Detect immigration topic from page
  ============================================================ */
  function detectTopic(ctx){
    var topics = [
      // Specific countries
      { name:'canada',      keywords:['canada','canadian','express entry','ielts canada','crs score','provincial nominee','pnp','lmia','ircc','pr canada','canada visa'] },
      { name:'usa',         keywords:['usa','united states','h1b','green card','eb1','eb2','eb3','uscis','i-140','i-485','daca','opt','cpt','f1 visa','us visa','america'] },
      { name:'uk',          keywords:['uk','united kingdom','skilled worker visa','tier 2','british','ilr','settlement uk','home office','ukvi','england','britain'] },
      { name:'australia',   keywords:['australia','australian','subclass','skilled migration','189','190','491','immi','department of home affairs','auzzie'] },
      { name:'germany',     keywords:['germany','german','blue card','aufenthaltserlaubnis','jobseeker visa','germany work','bundesagentur'] },
      { name:'canada_study',keywords:['study canada','student visa canada','pgwp','post graduation','study permit canada'] },
      { name:'usa_study',   keywords:['study usa','f1','student visa usa','i-20','sevis','opt','cpt','stem opt'] },
      { name:'uk_study',    keywords:['study uk','student visa uk','tier 4','ucas','student route uk'] },
      { name:'schengen',    keywords:['schengen','europe visa','european union','eu visa','germany visa','france visa','spain visa','italy visa','netherlands visa'] },

      // Visa types
      { name:'visa',        keywords:['visa','visa application','visa process','visa requirements','visa interview','visa rejection','visa approval','tourist visa','visitor visa'] },
      { name:'work_permit', keywords:['work permit','work visa','employment visa','job visa','skilled worker','lmia','sponsorship','h1b','tier 2','employer sponsor'] },
      { name:'study_abroad',keywords:['study abroad','student visa','university abroad','college abroad','scholarship abroad','ielts','toefl','gre','gmat','sat'] },
      { name:'pr',          keywords:['permanent residence','permanent resident','pr','citizenship','naturalization','green card','indefinite leave','ilr','settlement'] },
      { name:'family_visa', keywords:['family visa','spouse visa','dependent visa','family reunification','partner visa','marriage visa','fiance visa'] },
      { name:'refugee',     keywords:['refugee','asylum','asylum seeker','protection','humanitarian'] },
      { name:'business_visa',keywords:['business visa','investor visa','entrepreneur visa','startup visa','business immigration','eb5','tier 1'] },

      // Immigration processes
      { name:'ielts',       keywords:['ielts','english test','band score','ielts preparation','ielts tips','pte','toefl','language test'] },
      { name:'job_search',  keywords:['job abroad','find job','job search','resume','cv','interview','linkedin','job offer','employment abroad'] },
      { name:'cost',        keywords:['cost','fee','price','how much','expensive','cheap','afford','budget','savings','financial'] },
      { name:'documents',   keywords:['documents','document','certificate','apostille','attestation','police clearance','medical exam','biometrics'] },
      { name:'processing',  keywords:['processing time','timeline','waiting','how long','status','application status','track','queue'] },
      { name:'news',        keywords:['news','update','change','new rule','policy','announcement','2024','2025','latest'] }
    ];

    // Title first - highest priority
    for(var t = 0; t < topics.length; t++){
      for(var k = 0; k < topics[t].keywords.length; k++){
        if(ctx.titleLower.indexOf(topics[t].keywords[k]) !== -1){ return topics[t].name; }
      }
    }

    // Body text second
    for(var t2 = 0; t2 < topics.length; t2++){
      for(var k2 = 0; k2 < topics[t2].keywords.length; k2++){
        if(ctx.body.indexOf(topics[t2].keywords[k2]) !== -1){ return topics[t2].name; }
      }
    }

    // Labels last
    var labelStr = ctx.labels.join(' ');
    for(var t3 = 0; t3 < topics.length; t3++){
      for(var k3 = 0; k3 < topics[t3].keywords.length; k3++){
        if(labelStr.indexOf(topics[t3].keywords[k3]) !== -1){ return topics[t3].name; }
      }
    }

    return 'immigration';
  }

  /* ============================================================
     STEP 3 - Dynamic questions by topic
  ============================================================ */
  var questionsByTopic = {
    canada: [
      'What is the minimum CRS score for Express Entry?',
      'How long does Express Entry take in 2025?',
      'Which province is easiest to get PR in Canada?',
      'What documents are needed for Express Entry?',
      'Can I apply for Canada PR without a job offer?',
      'What is the difference between FSW and CEC?'
    ],
    usa: [
      'What is the H1B visa lottery process?',
      'How long does a green card take in 2025?',
      'What is the difference between EB1 EB2 and EB3?',
      'Can I switch jobs on an H1B visa?',
      'How do I apply for an OPT extension?',
      'What is the priority date for green card?'
    ],
    uk: [
      'What is the minimum salary for UK skilled worker visa?',
      'How long does UK settlement ILR take?',
      'Can I bring my family on a UK work visa?',
      'What is the points based immigration system UK?',
      'How do I switch from student to work visa in UK?',
      'What is the life in the UK test?'
    ],
    australia: [
      'What is the minimum points score for Australia PR?',
      'What is the difference between subclass 189 and 190?',
      'How long does Australia skilled visa take?',
      'Which occupations are in demand in Australia?',
      'What is state nomination in Australia?',
      'How do I get an Australian skills assessment?'
    ],
    germany: [
      'What is the Germany Blue Card requirements?',
      'How do I get a Germany job seeker visa?',
      'What is the minimum salary for Germany Blue Card?',
      'Can I bring my family to Germany on a work visa?',
      'How long does Germany PR take?',
      'Do I need German language for a work visa?'
    ],
    visa: [
      'What are the most common reasons for visa rejection?',
      'How do I write a strong visa cover letter?',
      'What should I bring to a visa interview?',
      'How early should I apply for a visa?',
      'Can I appeal a visa rejection?',
      'What is the difference between single and multiple entry visa?'
    ],
    work_permit: [
      'How do I find a job abroad with visa sponsorship?',
      'What countries are easiest to get a work permit?',
      'Can I switch employers on a work visa?',
      'What documents does my employer need for sponsorship?',
      'How long does a work permit take to process?',
      'Can I bring my family on a work permit?'
    ],
    study_abroad: [
      'What are the best countries to study abroad?',
      'How do I apply for a student visa?',
      'What IELTS score do I need for a student visa?',
      'Can I work while studying abroad?',
      'How do I get a scholarship to study abroad?',
      'Can I stay after graduation on a student visa?'
    ],
    pr: [
      'What is the fastest path to permanent residence?',
      'How many years until I can apply for citizenship?',
      'Can I lose my permanent residence status?',
      'What is the difference between PR and citizenship?',
      'Can my family get PR through me?',
      'What are the PR renewal requirements?'
    ],
    ielts: [
      'What IELTS band score do I need for immigration?',
      'How do I improve my IELTS speaking score?',
      'What is the difference between IELTS Academic and General?',
      'How many times can I take IELTS?',
      'Is PTE accepted instead of IELTS?',
      'What are the best IELTS preparation books?'
    ],
    job_search: [
      'How do I find jobs abroad with visa sponsorship?',
      'How do I write a CV for international jobs?',
      'Which job boards are best for finding overseas jobs?',
      'How do I prepare for an international job interview?',
      'What skills are most in demand internationally?',
      'How do I get my qualifications recognized abroad?'
    ],
    documents: [
      'What documents are needed for immigration?',
      'How do I get documents apostilled?',
      'How long is a police clearance certificate valid?',
      'Do I need to translate my documents?',
      'What is document attestation?',
      'How do I get my degree verified for immigration?'
    ],
    schengen: [
      'How do I apply for a Schengen visa?',
      'How long can I stay in Europe on a Schengen visa?',
      'Which country is easiest for a Schengen visa?',
      'Can I work in Europe on a Schengen visa?',
      'What documents do I need for a Schengen visa?',
      'Can I extend my Schengen visa?'
    ],
    cost: [
      'How much does immigration cost in total?',
      'What are the government fees for a visa application?',
      'Do I need to show proof of funds for immigration?',
      'How much savings do I need before moving abroad?',
      'Are immigration consultants worth the cost?',
      'What hidden costs should I know about?'
    ],
    processing: [
      'How do I check my visa application status?',
      'Why is my application taking so long?',
      'What happens after biometrics are taken?',
      'Can I travel while my application is processing?',
      'How do I contact the immigration office?',
      'What does application received mean?'
    ],
    family_visa: [
      'Can I sponsor my spouse for a visa?',
      'How long does a spouse visa take?',
      'What income do I need to sponsor family?',
      'Can my children come with me on my visa?',
      'What is family reunification visa?',
      'How do I prove my relationship for a spouse visa?'
    ],
    news: [
      'What are the latest immigration changes in 2025?',
      'Which countries increased immigration quotas?',
      'Are visa fees increasing?',
      'What new immigration pathways are available?',
      'How do elections affect immigration policy?',
      'What countries are easiest to immigrate to in 2025?'
    ],
    immigration: [
      'Which country is easiest to immigrate to in 2025?',
      'What is the fastest immigration pathway?',
      'Do I need an immigration consultant or lawyer?',
      'How do I start my immigration journey?',
      'What are the best countries for skilled workers?',
      'How long does immigration take from start to finish?'
    ]
  };

  function getDynamicQuestions(topic, ctx){
    var base = questionsByTopic[topic] || questionsByTopic['immigration'];
    var combined = ctx.titleLower + ' ' + ctx.labels.join(' ') + ' ' + ctx.body;
    var matched = [];
    var seen = {};

    for(var i = 0; i < base.length; i++){
      var q = base[i];
      var words = q.toLowerCase().replace(/[^a-z0-9 ]/g,'').split(' ');
      var hits = 0;
      for(var w = 0; w < words.length; w++){
        if(words[w].length > 4 && combined.indexOf(words[w]) !== -1){ hits++; }
      }
      if(hits > 0 && !seen[q]){
        seen[q] = true;
        matched.push({q:q, hits:hits});
      }
    }

    matched.sort(function(a,b){ return b.hits - a.hits; });
    var result = [];
    for(var m = 0; m < matched.length; m++){ result.push(matched[m].q); }

    for(var b = 0; b < base.length && result.length < 6; b++){
      if(!seen[base[b]]){ result.push(base[b]); seen[base[b]] = true; }
    }

    return result.slice(0, 6);
  }

  /* ============================================================
     STEP 4 - Build widget HTML
  ============================================================ */
  function buildWidget(){
    var ctx = getPageContext();
    var topic = detectTopic(ctx);
    var questions = getDynamicQuestions(topic, ctx);

    var pillsHtml = '';
    for(var i = 0; i < questions.length; i++){
      pillsHtml += '<span class="io-sug-pill">' + questions[i] + '</span>';
    }

    var topicHint = ctx.title ? ' about "' + ctx.title + '"' : '';

    var wrap = document.getElementById('ioAiWidget');
    if(!wrap){ return; }

    wrap.innerHTML =
      '<div class="io-ai-header">' +
        '<div class="io-ai-avatar">&#9992;</div>' +
        '<div class="io-ai-header-text">' +
          '<h3>Ask Immigration AI Assistant</h3>' +
          '<p>Your free immigration guide &amp; advisor</p>' +
        '</div>' +
        '<div class="io-ai-status"><div class="io-ai-dot"></div> Online</div>' +
      '</div>' +
      '<div class="io-suggestions">' +
        '<span class="io-sug-label">&#128161; Questions about this article</span>' +
        '<div class="io-sug-pills" id="ioSugPills">' + pillsHtml + '</div>' +
      '</div>' +
      '<div class="io-chat-area" id="ioChatArea">' +
        '<div class="io-msg ai">' +
          '<div class="io-msg-avatar">&#9992;</div>' +
          '<div class="io-msg-bubble">' +
            '&#128075; <strong>Hello! I am your Immigration AI Assistant.</strong><br/><br/>' +
            'I have read the article' + topicHint + '. Ask me anything about visas, work permits, study abroad, PR, or immigration processes. I will also suggest helpful books and resources! &#127760;' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="io-input-wrap">' +
        '<div class="io-input-row">' +
          '<textarea class="io-input" id="ioInput" placeholder="Ask about visas, immigration, work permits..." rows="1"></textarea>' +
          '<button class="io-send-btn" id="ioSendBtn" title="Send">&#10148;</button>' +
        '</div>' +
      '</div>' +
      '<p class="io-disclaimer">&#9888; This AI provides general information only. Always verify with official government sources or a licensed immigration consultant.</p>';
  }

  /* ============================================================
     STEP 5 - Amazon books and resources by topic
  ============================================================ */
  function amazonUrl(keyword){
    return 'https://www.amazon.com/s?k=' + encodeURIComponent(keyword.trim()) + '&tag=' + AFFILIATE_TAG;
  }

  function extractProductKeywords(aiText, userQuestion, topic){
    var topicBooks = {
      canada:       ['Canada immigration guide book','Express Entry Canada book','Canada PR guide 2025'],
      usa:          ['USA immigration guide','green card application book','H1B visa guide'],
      uk:           ['UK visa guide book','UK immigration handbook','life in UK test book'],
      australia:    ['Australia immigration guide','Australia skilled visa book','Australia PR guide'],
      germany:      ['Germany immigration guide','German language learning book','Germany work visa guide'],
      visa:         ['visa application guide book','immigration forms guide','visa interview preparation'],
      work_permit:  ['work abroad guide book','international job search book','global career guide'],
      study_abroad: ['study abroad guide book','IELTS preparation book','international student guide'],
      pr:           ['permanent residence guide','citizenship application book','immigration law guide'],
      ielts:        ['IELTS preparation book','IELTS academic book Cambridge','IELTS speaking writing guide'],
      job_search:   ['international job search book','global resume writing guide','working abroad guide'],
      documents:    ['immigration document checklist','apostille guide','immigration paperwork guide'],
      schengen:     ['Europe travel visa guide','Schengen visa application book','Europe immigration guide'],
      family_visa:  ['spouse visa application guide','family immigration book','dependent visa guide'],
      cost:         ['moving abroad budget guide','expat financial planning book','cost of living abroad'],
      immigration:  ['immigration guide 2025','how to immigrate book','best countries to live book']
    };

    var defaults = topicBooks[topic] || topicBooks['immigration'];

    // Check if AI mentioned specific countries or topics
    var combined = (aiText + ' ' + userQuestion).toLowerCase();
    var keywords = [];

    if(combined.indexOf('ielts') !== -1){ keywords.push('IELTS preparation book 2025'); }
    if(combined.indexOf('resume') !== -1 || combined.indexOf('cv') !== -1){ keywords.push('international resume writing guide'); }
    if(combined.indexOf('language') !== -1){ keywords.push('language learning book immigration'); }
    if(combined.indexOf('lawyer') !== -1 || combined.indexOf('consultant') !== -1){ keywords.push('immigration law self help guide'); }

    if(keywords.length === 0){
      keywords.push(defaults[0]);
      if(defaults[1]){ keywords.push(defaults[1]); }
    }

    return keywords.slice(0, 2);
  }

  function buildProductCards(keywords){
    if(!keywords || keywords.length === 0){ return ''; }
    var html = '<div class="io-products">';
    for(var i = 0; i < keywords.length; i++){
      var kw = keywords[i];
      var displayName = kw.replace(/\b\w/g, function(c){ return c.toUpperCase(); });
      html += '<a href="' + amazonUrl(kw) + '" target="_blank" rel="noopener" class="io-product-card">';
      html += '<span class="io-product-icon">&#128218;</span>';
      html += '<div class="io-product-info"><span class="io-product-name">' + displayName + '</span>';
      html += '</div>';
      html += '<span class="io-product-cta">View &rarr;</span></a>';
    }
    html += '</div>';
    return html;
  }

  /* ============================================================
     STEP 6 - Chat logic
  ============================================================ */
  function addMsg(role, html){
    var area = document.getElementById('ioChatArea');
    var div = document.createElement('div');
    div.className = 'io-msg ' + role;
    var icon = (role === 'ai') ? '&#9992;' : '&#128100;';
    div.innerHTML = '<div class="io-msg-avatar">' + icon + '</div><div class="io-msg-bubble">' + html + '</div>';
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
    return div;
  }

  function showTyping(){
    var area = document.getElementById('ioChatArea');
    var div = document.createElement('div');
    div.className = 'io-msg ai io-typing';
    div.id = 'ioTyping';
    div.innerHTML = '<div class="io-msg-avatar">&#9992;</div><div class="io-msg-bubble"><div class="io-typing-dots"><span></span><span></span><span></span></div></div>';
    area.appendChild(div);
    area.scrollTop = area.scrollHeight;
  }

  function removeTyping(){
    var t = document.getElementById('ioTyping');
    if(t){ t.parentNode.removeChild(t); }
  }

  function callAI(userMessage){
    var ctx = getPageContext();
    var topic = detectTopic(ctx);

    var systemPrompt =
      'You are the Immigration Opportunity AI Assistant on immigrationopportunity.com. ' +
      'You are a friendly and knowledgeable immigration advisor. ' +
      'The visitor is reading an article titled: "' + ctx.title + '". ' +
      'Article topic: ' + topic + '. ' +
      'Labels: ' + (ctx.labels.length ? ctx.labels.join(', ') : 'immigration') + '. ' +
      'Answer questions about visas, work permits, study abroad, permanent residence, citizenship, immigration processes, country-specific immigration, IELTS, job search abroad, document requirements, processing times, and immigration costs. ' +
      'Be warm, accurate and conversational. Keep answers to 4-5 sentences. ' +
      'Always mention specific visa names, programs, or official websites when relevant. ' +
      'Always end with: For the most accurate and up to date information, please check the official government immigration website or consult a licensed immigration consultant. ' +
      'Do not use markdown headers. Be AdSense-safe always.';

    return fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
        origin: window.location.hostname
      })
    }).then(function(r){ return r.json(); })
    .then(function(data){
      if(data && data.content && data.content[0]){ return data.content[0].text; }
      return 'I could not process that right now. Please try again!';
    });
  }

  function sendMessage(text){
    if(!text || !text.trim()){ return; }
    var btn = document.getElementById('ioSendBtn');
    var input = document.getElementById('ioInput');
    var ctx = getPageContext();
    var topic = detectTopic(ctx);

    addMsg('user', text);
    input.value = '';
    input.style.height = 'auto';
    btn.disabled = true;
    showTyping();

    callAI(text).then(function(aiText){
      removeTyping();
      var keywords = extractProductKeywords(aiText, text, topic);
      var formatted = aiText.replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');
      addMsg('ai', formatted + buildProductCards(keywords));
      btn.disabled = false;
      input.focus();
    }).catch(function(){
      removeTyping();
      addMsg('ai','&#128533; Sorry, something went wrong. Please try again!');
      btn.disabled = false;
      input.focus();
    });
  }

  /* ============================================================
     STEP 7 - Init
  ============================================================ */
  function init(){
    buildWidget();

    document.getElementById('ioSendBtn').addEventListener('click', function(){
      sendMessage(document.getElementById('ioInput').value.trim());
    });

    document.getElementById('ioInput').addEventListener('keydown', function(e){
      if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(this.value.trim()); }
    });

    document.getElementById('ioInput').addEventListener('input', function(){
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    document.getElementById('ioSugPills').addEventListener('click', function(e){
      if(e.target.className.indexOf('io-sug-pill') !== -1){ sendMessage(e.target.textContent); }
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
