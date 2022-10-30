import './style/common.css';
import './style/iconmonstr-font.css';


function renderDomainInfo({ url, domainDetails }) {
  const i18n = messenger.i18n;
  const lang = i18n.getMessage('@@ui_locale');
  
  let iconClass;
  switch(domainDetails.type) {
    case 'trusted':
      iconClass = 'im-check-mark-circle';
      break;
    case 'suspicious':
      iconClass = 'im-warning-circle';
      break;
    case 'redirect':
      iconClass = 'im-flash';
      break;
    default:
      iconClass = 'im-question';
  }
  
  return `
    <div class="table-row">
      <div class="table-column py-1 pr-3 width-80px color-grey">URL</div>
        <div class="table-column py-1 truncate color-grey" title="${url}">${ url }</div>
      </div>
      <div class="table-row">
        <div class="table-column py-1 pr-3 width-80px">Domain</div>
        <div class="table-column py-1">
          <div class="flex space-between">
            <div class="flex-auto">
              <div class="color-${ domainDetails.type }">
                <b>${ domainDetails.secondLevelDomain }</b>.${ domainDetails.topLevelDomain }
              </div>
              <div class="small-text color-grey">
                ${ i18n.getMessage('type_' + domainDetails.type) }
              </div>
            </div>
            <div class="flex-none">
              <i class="im ${ iconClass } color-${ domainDetails.type }"></i>
            </div>
          </div>
        </div>
      </div>
      ${(() => {
        if (domainDetails.nm) {
          return `
            <div class="table-row">
              <div class="table-column py-1 pr-3 width-80px">${ i18n.getMessage('by') }</div>
              <div class="table-column py-1">
                <div>${ domainDetails.nm }</div>
                <div class="small-text color-grey">
                  ${ i18n.getMessage('sector_' + domainDetails.se) }, ${ domainDetails.co }
                </div>
              </div>
            </div>
          `
        }
        if (domainDetails.type === 'unknown') {
          return `
            <div class="table-row">
              <div class="table-column py-1 pr-3 width-80px"></div>
              <div class="table-column py-1">
                <a
                  class="color-primary"
                  href="https://github.com/jballmann/safelink/blob/master/docs/${lang}/domaincheck.md"
                >
                  ${ i18n.getMessage('checkDomain') } <i class="small-text im im-angle-right"></i>
                </a>
              </div>
            </div>
          `
        }
        return '';
      })()}
    </div>`;
}

let buttonClickHandler;

function renderOpenButton({ url, domainDetails }) {
  const i18n = messenger.i18n;
  
  const openButtonBox = document.querySelector('.safelink--open-button');
  openButtonBox.innerHTML = `
    <div class="px-5 pb-4">
      <a
        class="safelink--open-link block bg-${ domainDetails.type } color-white p-2 centered border-radius unstyled"
        href="${ url }"
      >
        ${ i18n.getMessage('openURL') }
        ${
          domainDetails.type === 'suspicious' ?
            '<i class="small-text space-left im im-warning"></i>':
            '<i class="small-text space-left im im-external-link"></i>'
        }
      </a>
    </div>`;
  const linkEl = document.querySelector('.safelink--open-link');
  buttonClickHandler = (event) => {
    hideLinkInfo();
  }
  linkEl.addEventListener('click', buttonClickHandler);
}

async function handleRedirectInfo(redirectUrl) {
  const i18n = messenger.i18n;
  
  const redirectDomain = await messenger.runtime.sendMessage({
    command: 'findRedirectDomain',
    payload: redirectUrl
  });
  const redirectInfoBox = document.querySelector('.safelink--redirect-info');
  if (redirectDomain.notFound) {
    redirectInfoBox.innerHTML = `${ i18n.getMessage('invalidRedirect') }`;
    return;
  }
  if (!redirectDomain || redirectDomain.url === redirectUrl) {
    redirectInfoBox.innerHTML = `${ i18n.getMessage('noRedirect') }`;
    return;
  }
  redirectInfoBox.innerHTML = `
    <div class="table table-fixed">
      ${ renderDomainInfo({ url: redirectDomain.url, domainDetails: redirectDomain }) }
    </div>`;
  renderOpenButton({ url: redirectUrl, domainDetails: redirectDomain });
}

async function handleDomainInfo(url) {
  const domainDetails = await messenger.runtime.sendMessage({
    command: 'findDomain',
    payload: url
  });
  
  const i18n = messenger.i18n;
  
  const domainInfoBox = document.querySelector('.safelink--domain-info');
  domainInfoBox.innerHTML = `
    <div class="table table-fixed px-5 py-3">
      ${ renderDomainInfo({ url, domainDetails }) }
    </div>
    ${(() => {
      if (domainDetails.type === 'redirect') {
        return `
          <div class="safelink--redirect-info elevated border-radius-t px-5 pb-3 pt-4">
            <div class="flex flex-centered">
              <div class="loader space-right"></div> ${ i18n.getMessage('loading') }
            </div>
          </div>`
      }
      if (domainDetails.type === 'trusted') {
        return `
        <div class="centered px-5 pb-3">
          <label class="inline-flex flex-centered cursor-pointer medium-text">
            <input type="checkbox" class="safelink--checkbox-prevent space-right" />
            Fenster für diese Domain nicht mehr anzeigen
          </label>
        </div>
        `
      }
      if (domainDetails.type === 'unknown') {
        return `
        <div class="centered px-5 pb-3">
          <label class="inline-flex flex-centered cursor-pointer medium-text">
            <input type="checkbox" class="safelink--checkbox-trust space-right" />
            Dieser Domain vertrauen
          </label>
        </div>
        `
      }
      else {
        return '';
      }
    })()}`
    
  renderOpenButton({ url, domainDetails });
  if (domainDetails.type === 'redirect') {
    handleRedirectInfo(url);
  }
}

let wrapperClickHandler;

function hideLinkInfo() {
  const wrapper = document.querySelector('.safelink--inner');
  const background = document.querySelector('.safelink--outer');
  const linkEl = document.querySelector('.safelink--open-link');
  
  wrapper.removeEventListener('click', wrapperClickHandler);
  linkEl.removeEventListener('click', buttonClickHandler);
  document.body.removeChild(background);
  messenger.runtime.sendMessage({
    command: 'log',
    payload: 'close info'
  });
}

async function openLinkInfo(url) {
  const isPrevented = await messenger.runtime.sendMessage({
    command: 'getPrevention',
    payload: url
  });
  if (isPrevented) {
    return;
  }
  
  const background = document.createElement('div');
  background.classList.add('safelink--outer', 'fixed', 'full-window', 'backdrop', 'overflow-auto');
  
  const wrapper = document.createElement('div');
  wrapper.classList.add('safelink--inner', 'flex', 'flex-centered', 'p-5', 'min-full-height');
  
  const container = document.createElement('div');
  container.classList.add('safelink--container', 'bg-white', 'max-width-550px', 'border-radius');
  
  const i18n = messenger.i18n;
  
  container.innerHTML = `
    <div class="safelink--domain-info">
      <div class="table table-fixed px-5 py-3">
        <div class="table-row">
          <div class="table-column py-1 pr-3 width-80px color-grey">URL</div>
          <div class="table-column py-1 truncate color-grey" title="${url}">${ url }</div>
        </div>
      </div>
      <div class="flex flex-centered px-5 pb-3">
        <div class="loader space-right"></div> ${ i18n.getMessage('analyze') }
      </div>
    </div>
    <div class="safelink--open-button"></div>`;

  wrapperClickHandler = (event) => {
    if (event.target !== event.currentTarget) {
      return;
    }
    hideLinkInfo();
  }
  wrapper.addEventListener('click', wrapperClickHandler);
  
  wrapper.appendChild(container);
  background.appendChild(wrapper);
  document.body.appendChild(background);
  
  renderOpenButton({ url, domainDetails: { type: 'unknown' }});
  handleDomainInfo(url);
}

function handleLinkClicks() {
console.log('handleLinkClicks');	
  document.querySelectorAll('a').forEach((link) => {
	console.log(link, link.href);
    if (!link.href.startsWith('http://') && !link.href.startsWith('https://')) {
      return;
    }
    link.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openLinkInfo(link.href);
    });
  });
}
handleLinkClicks();
console.log('hello wolrd');