// import { html, render } from 'https://unpkg.com/htm/preact/standalone.module.js'
// import { Router } from 'https://unpkg.com/preact-router@3.2.1/dist/preact-router.js';
// import { htm } from 'https://unpkg.com/htm@3.1.0/preact/index.js';

const { html, render, Component }  = window.htmPreact;
const { createRef } = window.preact;
const Router = window.preactRouter;

class Home extends Component {
  constructor(props) {
    super(props);
    this.joinInputRef = createRef(null);
    this.joinButtonRef = createRef(null);
    this.lastKnownLength = 0;
  }

  render() {
    return html`<div className='container'>
      <h1>Bug Bash Call Bell</h1>
      <h2>How it Works</h2>
      <p>
        <ul className='list-group list-group-numbered'>
          <li className='list-group-item'> Create a room</li>
          <li className='list-group-item'> Share screen and audio in the meeting</li>
          <li className='list-group-item'> Others join</li>
          <li className='list-group-item'> Everyone can trigger the bell</li>
        </ul>
      </p>
      <p>
        <button className='bn632-hover'>
          Create Room
        </button>
      </p>
      <p className='text-center mv2'>
        or
        <hr className='hr-or'/>
      </p>
      <h2 className='mb2'>Join Room</h2>
      <p>
        <input ref=${this.joinInputRef} type="text" id="roomcode" maxlength="6" className="form-control" placeholder='123456' onkeyup=${this.onJoinKeyup.bind(this)} />
      </p>
      <p>
        <button className='bn632-hover' ref=${this.joinButtonRef}>
          Join Room
        </button>
      </p>
    </div>`;
  }

  onJoinKeyup() {
    if (this.joinInputRef.current && this.joinButtonRef.current) {
      if (this.lastKnownLength === 5 && this.joinInputRef.current.value.length === 6) {
        this.joinButtonRef.current.focus();
      }
      this.lastKnownLength = this.joinInputRef.current.value.length;
    }
  }
}

const Room = function(props) {
  console.log(props);
  const roomid = props.room
  return html`<p>Join Room ${roomid}</p>`;
}

const AppRoot = function() {
  return html`
  <div>
  <${Router}>
    <${Home} path="/" />
    <${Room} path="/host/:roomid" />
    <${Room} path="/room/:roomid" />
  </${Router}>
  </div>
  `;
}

render(html`<${AppRoot} />`, document.getElementById('root'));
