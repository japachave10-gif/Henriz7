/* A 360-day game calendar: twelve explicit 30-day financial cycles.
 * Stored under the existing player; no parallel wallet or replacement save. */
const CONTRACT_BRANDS = [
  {id:'brisa',name:'Brisa Play',tier:'Criador em ascensão',followers:0,monthly:900,months:2,posts:2,engagement:12,conversions:1,color:'#38bdf8'},
  {id:'aurora',name:'Aurora Club',tier:'Embaixador regional',followers:2000,monthly:4500,months:3,posts:3,engagement:120,conversions:6,color:'#a78bfa'},
  {id:'royal',name:'Royal Arena',tier:'Campanha nacional',followers:20000,monthly:18000,months:6,posts:4,engagement:1000,conversions:35,color:'#edbd61'}
];
const v8Button=(label,action,disabled=false,style='')=>`<button class="v8-button ${style}" data-action="v8:${action}" ${disabled?'disabled':''}>${label}</button>`;
function systems8Init(){
  S.calendar8||={day:S.age*360+(S.finance.closed||0)*30,elapsed:(S.finance.closed||0)*30,age:S.age};
  if(S.calendar8.age!==S.age){S.calendar8.age=S.age;S.calendar8.elapsed=(S.finance.closed||0)*30}
  S.contracts8||={active:null,history:[],next:1,cooldown:0};
  S.travels8||={history:[],next:1};
}
function contractEligible(brand){return S.alive&&S.age>=18&&S.world.prison===0&&S.world.followers>=brand.followers&&!S.contracts8.active&&S.calendar8.day>=S.contracts8.cooldown}
function signCasinoContract(id,mode){
  let b=CONTRACT_BRANDS.find(b=>b.id===id);if(!b||!['monthly','upfront'].includes(mode)||!contractEligible(b))return false;
  const c={id:S.contracts8.next++,brand:id,name:b.name,mode,monthly:b.monthly,months:b.months,completed:0,start:S.calendar8.day,due:S.calendar8.day+30,goals:{posts:b.posts,engagement:b.engagement,conversions:b.conversions},metrics:{posts:0,engagement:0,conversions:0},tracked:{},settlements:[],paid:0,status:'active'};
  S.contracts8.active=c;S.insta.affiliate.enabled=true;
  if(mode==='upfront'){c.paid=b.monthly*b.months;casinoPay(c.paid,'Contrato · adiantamento · '+b.name)}
  log('Assinei contrato de divulgação com '+b.name+'. Os recebimentos ficam no saldo do cassino.');
  gossip8('contract',{brand:b.name,mode},'contract-'+c.id);save();return true;
}
function trackCasinoPost(post){
  const c=S.contracts8.active;if(!c||post.casinoContract!==c.id)return;
  let tracked=c.tracked[post.id],campaign=S.insta.affiliate.campaigns.find(x=>x.post===post.id);
  if(!tracked){tracked=c.tracked[post.id]={likes:0,registrations:0};c.metrics.posts++}
  const likes=Math.max(0,post.likes||0),registrations=campaign?.registrations||0;
  c.metrics.engagement+=Math.max(0,likes-tracked.likes);c.metrics.conversions+=Math.max(0,registrations-tracked.registrations);
  tracked.likes=likes;tracked.registrations=registrations;
}
function contractPenalty(c){return cents(c.monthly*.2+(c.mode==='upfront'?c.monthly*(c.months-c.completed):0))}
function cancelCasinoContract(reason='Metas não atingidas'){
  const c=S.contracts8.active;if(!c)return false;
  const penalty=contractPenalty(c);c.penalty=penalty;c.status='cancelled';c.reason=reason;c.ended=S.calendar8.day;
  // A negative casino balance is a debt, never silently charged to a bank.
  S.casino.balance=cents(S.casino.balance-penalty);casinoRecord('Rescisão · '+c.name,-penalty);
  S.contracts8.cooldown=S.calendar8.day+30;S.contracts8.history.unshift(c);S.contracts8.history=S.contracts8.history.slice(0,40);S.contracts8.active=null;
  log('O contrato com '+c.name+' foi encerrado. Multa e eventual adiantamento não cumprido: '+brl(penalty)+', no cassino.');
  gossip8('controversy',{text:'O contrato com '+c.name+' terminou antes do previsto após '+reason.toLowerCase()+'.'},'cancel-'+c.id);save();return true;
}
function settleCasinoContracts(){
  let c=S.contracts8.active;
  while(c&&S.calendar8.day>=c.due){
    const met=Object.keys(c.goals).every(k=>c.metrics[k]>=c.goals[k]);
    c.settlements.push({day:c.due,metrics:{...c.metrics},met});
    if(!met){cancelCasinoContract('Metas não atingidas no ciclo de 30 dias');break}
    if(c.mode==='monthly'){casinoPay(c.monthly,'Contrato · mensalidade '+(c.completed+1)+' · '+c.name);c.paid+=c.monthly}
    c.completed++;c.due+=30;c.metrics={posts:0,engagement:0,conversions:0};
    if(c.completed===c.months){c.status='completed';c.ended=S.calendar8.day;S.contracts8.history.unshift(c);S.contracts8.history=S.contracts8.history.slice(0,40);S.contracts8.active=null;log('Concluí todas as metas do contrato com '+c.name+'.');break}
  }
}
function clock8AdvanceOnly(days){if(!Number.isInteger(days)||days<0||days>360-S.calendar8.elapsed)return false;const target=S.calendar8.day+days;while(S.contracts8.active&&S.contracts8.active.due<=target){let step=S.contracts8.active.due-S.calendar8.day;S.calendar8.day+=step;S.calendar8.elapsed+=step;settleCasinoContracts()}let remaining=target-S.calendar8.day;S.calendar8.day=target;S.calendar8.elapsed+=remaining;return true}
const previousCreditMonth8=closeCreditMonth;
closeCreditMonth=function(){systems8Init();const done=previousCreditMonth8();if(done)clock8AdvanceOnly(Math.max(0,S.finance.closed*30-S.calendar8.elapsed));return done};
function advanceGameDays8(days){
  if(!Number.isInteger(days)||days<1||days>360-S.calendar8.elapsed)return false;
  let remaining=days;while(remaining>0){let step=Math.min(remaining,30-S.calendar8.elapsed%30);clock8AdvanceOnly(step);remaining-=step;if(S.calendar8.elapsed%30===0&&S.finance.closed<S.calendar8.elapsed/30)closeCreditMonth()}
  save();return true;
}
function contractOffer8(id){const b=CONTRACT_BRANDS.find(b=>b.id===id);if(!b)return;modal(`<div class="v8-contract-offer"><span class="v8-eyebrow">PROPOSTA COMERCIAL · SIMULAÇÃO</span><h2>${b.name}</h2><div class="v8-contract-price">${brl(b.monthly)}<small>por ciclo · ${b.months} ciclos de 30 dias</small></div><p>Em cada ciclo: ${b.posts} publicações, ${b.engagement} curtidas nas campanhas e ${b.conversions} cadastros qualificados. Resultados dependem do público.</p><label>Como receber<select id="v8-contract-mode"><option value="monthly">Mensal · após cumprir as metas</option><option value="upfront">À vista · ${brl(b.monthly*b.months)} na assinatura</option></select></label><div class="v8-notice">Recebimentos e multas usam exclusivamente o saldo do cassino. Falhar ou rescindir cancela o contrato: multa de ${brl(b.monthly*.2)} e devolução dos ciclos adiantados não cumpridos. O saldo pode ficar negativo. Um novo contrato fica bloqueado por 30 dias após rescisão.</div>${v8Button('Assinar contrato','contractsign:'+id,!contractEligible(b),'primary')}<button class="v8-button" data-action="close">Voltar</button></div>`)}
function contractsPage8(){const state=S.contracts8,c=state.active;return `<section class="v8-contracts"><div class="v8-section-heading"><div><span class="v8-eyebrow">CENTRAL DO CRIADOR</span><h2>Contratos e resultados</h2></div><span class="v8-day">Dia ${Math.min(360,S.calendar8.elapsed+1)}/360</span></div><p class="v8-secondary">Um ciclo tem 30 dias do jogo. Viajar, fechar um mês ou avançar o ano move o mesmo calendário.</p>${c?`<article class="v8-contract-active"><div class="v8-section-heading"><h3>${c.name}</h3><span class="v8-pill">Ativo</span></div><p>Ciclo ${c.completed+1}/${c.months} · faltam ${Math.max(0,c.due-S.calendar8.day)} dias</p><strong>${brl(c.monthly)} <small>${c.mode==='upfront'?'por ciclo · já adiantado':'por ciclo cumprido'}</small></strong>${[['posts','Publicações'],['engagement','Curtidas nas campanhas'],['conversions','Cadastros qualificados']].map(([k,label])=>`<div class="v8-goal"><div><span>${label}</span><b>${c.metrics[k]} / ${c.goals[k]}</b></div><progress value="${Math.min(c.goals[k],c.metrics[k])}" max="${c.goals[k]}"></progress></div>`).join('')}<div class="v8-action-row"><button class="v8-button primary" data-action="n:affiliate">Criar divulgação no InstaLife</button>${v8Button('Avançar 1 dia','day:1',S.calendar8.elapsed>=360)}${v8Button('Avançar 7 dias','day:7',S.calendar8.elapsed>353)}${v8Button('Rescindir','contractcancel')}</div><p class="v8-secondary">Recebido: ${brl(c.paid)} no cassino. Comissão por cadastro é adicional. Só publicações vinculadas a este contrato contam.</p></article>`:`<div class="v8-notice">${S.calendar8.day<state.cooldown?'Nova negociação em '+(state.cooldown-S.calendar8.day)+' dias.':'Escolha uma proposta. Você pode manter um contrato ativo por vez.'}${v8Button('Avançar 1 dia','day:1',S.calendar8.elapsed>=360)}${v8Button('Avançar 7 dias','day:7',S.calendar8.elapsed>353)}</div>`}<div class="v8-offers">${CONTRACT_BRANDS.map(b=>`<article><span class="v8-brand-icon" style="--brand:${b.color}">${icon('star')}</span><small>${b.tier}</small><h3>${b.name}</h3><strong>${brl(b.monthly)}<small> / 30 dias</small></strong><p>${b.months} ciclos · ${b.followers.toLocaleString('pt-BR')} seguidores mínimos</p><p>${b.posts} posts · ${b.engagement} curtidas · ${b.conversions} conversões por ciclo</p>${v8Button('Ver proposta','contractoffer:'+b.id,!contractEligible(b))}</article>`).join('')}</div><h3>Histórico de contratos</h3>${state.history.map(c=>`<div class="v8-history"><div><b>${c.name}</b><small>${c.status==='completed'?'Concluído':'Rescindido'} · ${c.completed}/${c.months} ciclos cumpridos</small></div><span>${brl(c.paid)} recebido${c.penalty?'<small>'+brl(c.penalty)+' de rescisão</small>':''}</span></div>`).join('')||'<p class="v8-secondary">As propostas concluídas ou encerradas ficam aqui.</p>'}</section>`}
const affiliatePage8=clubAffiliate;clubAffiliate=function(){return contractsPage8()+affiliatePage8()};
const commitInsta8=igCommit;igCommit=function(post){let c=S.contracts8?.active;if(post.sponsored&&c)post={...post,casinoContract:c.id,casinoBrand:c.name};let result=commitInsta8(post);if(S.contracts8)trackCasinoPost(result);return result};
const traffic8=referralTraffic;referralTraffic=function(post,clicks){traffic8(post,clicks);if(S.contracts8)trackCasinoPost(post)};
const promotionDay8=adDay;adDay=function(id){let result=promotionDay8(id);let campaign=S.insta.promotions.find(a=>a.id===id),post=S.insta.posts.find(p=>p.id===campaign?.post);if(post)trackCasinoPost(post);return result};
