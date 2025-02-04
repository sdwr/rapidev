import './style.css'
import javascriptLogo from './javascript.svg'
import witeLogo from '/wite.svg'
import { setupCounter } from './counter.js'

document.querySelector('#app').innerHTML = `
  <div>
    <a href="https://witejs.web.app" target="_blank">
      <img src="${witeLogo}" class="logo" alt="Wite logo" />
    </a>
    <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
      <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
    </a>
    <h1>Hello Wite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Wite logo to learn more
    </p>
  </div>
`

setupCounter(document.querySelector('#counter'))
