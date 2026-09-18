/* Integration boundary: one save, one renderer, existing phone stays mounted. */
APPS.push({id:'x',name:'X',icon:'x',color:'#000000',desc:'Posts, reposts e os assuntos da sua vida'});
const badgeBefore8=appBadge;appBadge=function(a,size=''){return a.id==='x'?`<span class="app-badge x-app-icon ${size}" style="--app:#000">${xIcon8('x')}</span>`:badgeBefore8(a,size)};
const phoneBefore8=phonePage;phonePage=function(){if(phoneScreen!=='x')return phoneBefore8();phoneScreen='settings';let html=phoneBefore8();phoneScreen='x';return html.replace('device ios-device promax ','device ios-device promax x-device ').replace('<h2>Ajustes</h2>','<h2>X</h2>').replace(/<div class="phone-content">[\s\S]*?<\/div><button class="home-indicator"/,`<div class="phone-content">${xPage8()}</div><button class="home-indicator"`)};
const settingsBefore8=phoneSettings;phoneSettings=function(){return settingsBefore8()+`<section class="v8-theme-settings"><h3>Aparência</h3><p>O tema acompanha a interface e os aplicativos.</p><div class="v8-action-row">${v8Button('Claro','theme:light',false,S.world.theme==='light'?'primary':'')}${v8Button('Escuro','theme:dark',false,S.world.theme==='dark'?'primary':'')}</div></section>`};
const financeChargeBefore8=financeCharge;financeCharge=function(n,label,...args){let success=financeChargeBefore8(n,label,...args);if(success&&n>=10000&&/^Compra/.test(label)&&S.x8)gossip8('purchase',{amount:n,label},'purchase-'+S.finance.receipts[0]?.id);return success};
const logBefore8=log;log=function(text){logBefore8(text);if(S.x8&&/polêmica|escândalo|fui condenado|fui detido|fraude.*descobert/i.test(text))gossip8('controversy',{text},'controversy-'+S.age+'-'+text)};
function action8(raw){let [action,id]=raw.split(':');if(action.startsWith('x'))return xAction8(action,id);if(action==='theme'){if(!['light','dark'].includes(id))return;S.world.theme=id;render();return}
if(!S.alive)return toast('Sua história terminou. Seus registros continuam disponíveis.');
if(action==='contractoffer')return contractOffer8(id);
if(action==='contractsign'){if(!$('#modal').open)return;let mode=$('#v8-contract-mode').value;if(!signCasinoContract(id,mode))return toast('Confira os requisitos e os contratos ativos.');$('#modal').close();toast('Contrato assinado. Acompanhe as metas no cassino.')}
else if(action==='contractcancel'){let c=S.contracts8.active;if(!c)return;modal(`<h2>Rescindir com ${c.name}?</h2><p>Será descontado ${brl(contractPenalty(c))} do saldo do cassino, incluindo multa e eventual adiantamento não cumprido.</p>${v8Button('Confirmar rescisão','contractcancelconfirm',false,'danger')}<button class="v8-button" data-action="close">Manter contrato</button>`);return}
else if(action==='contractcancelconfirm'){if(!$('#modal').open)return;cancelCasinoContract('Rescisão solicitada pelo criador');$('#modal').close()}
else if(action==='day'){if(!advanceGameDays8(+id))return toast('Avance o ano no diário para continuar o calendário.')}
else if(action==='destination'){if(!INTERNATIONAL8.some(d=>d.id===id))return;tripDraft8.destination=id}
else if(action==='hotel'){if(![0,1,2].includes(+id))return;tripDraft8.hotel=+id}
else if(action==='travelconfirm')return bookTrip8();
else return;
render()}
const actBefore8=act;act=function(action){if(action.startsWith('v8:'))return action8(action.slice(3));return actBefore8(action)};
const renderBefore8=render;render=function(){lifeInit();phoneInit();entertainmentInit();nlInit();financeInit();professionInit();relationshipsInit();systems8Init();xInit8();if(!S.phone.upgrade8){if(!S.phone.installed.includes('x'))S.phone.installed.push('x');S.phone.upgrade8=true}renderBefore8()};
render();
if(NEEDS_ONBOARDING)setupScreen(false);
